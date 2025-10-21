// TODO: handle race condition using database atomic insert or Redis SET NX EX
import type {
  CallSessionParticipantLeftEvent,
  CallSessionStartedEvent,
} from "@stream-io/node-sdk";
import { and, eq, lt, not } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import { streamVideo } from "@/lib/stream-video";

import { db } from "@/db";
import { agents, meetings, processedWebhooks } from "@/db/schema";

const CALL_TYPE = "default";

function verifySignatureWithSDK(body: string, signature: string): boolean {
  return streamVideo.verifyWebhook(body, signature);
}

function extractWebhookId(headers: Headers): string | null {
  const headerId = headers.get("x-webhook-id");
  return headerId || null;
}

async function isWebhookProcessed(webhookId: string): Promise<boolean> {
  const [existing] = await db
    .select()
    .from(processedWebhooks)
    .where(eq(processedWebhooks.id, webhookId))
    .limit(1);

  return !!existing;
}

async function markWebhookProcessed(
  webhookId: string,
  eventType: string,
): Promise<void> {
  await db
    .insert(processedWebhooks)
    .values({
      id: webhookId,
      eventType,
    })
    .onConflictDoNothing();
}

export async function cleanupOldWebhooks() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  await db
    .delete(processedWebhooks)
    .where(lt(processedWebhooks.processedAt, thirtyDaysAgo));
}

export async function POST(req: NextRequest) {
  const signature = req.headers.get("x-signature");
  const apiKey = req.headers.get("x-api-key");

  if (!signature || !apiKey) {
    return NextResponse.json(
      {
        error: "Missing signature or API key",
      },
      { status: 400 },
    );
  }

  const body = await req.text();

  if (!verifySignatureWithSDK(body, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = JSON.parse(body) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const eventType = (payload as Record<string, unknown>)?.type;
  if (!eventType || typeof eventType !== "string") {
    return NextResponse.json({ error: "Missing event type" }, { status: 400 });
  }

  // Replay protection
  const webhookId = extractWebhookId(req.headers);

  if (!webhookId) {
    console.error(
      "Missing X-WEBHOOK-ID header - webhook cannot be deduplicated",
      {
        eventType,
      },
    );
  } else {
    if (await isWebhookProcessed(webhookId)) {
      console.info("Duplicate webhook detected and ignored", {
        webhookId,
        eventType,
      });

      return NextResponse.json({
        success: true,
        message: "Webhook already processed (duplicate)",
      });
    }
  }

  if (eventType === "call.session_started") {
    const event = payload as CallSessionStartedEvent;
    const meetingId = event.call.custom?.meetingId;

    if (!meetingId) {
      return NextResponse.json(
        { error: "Missing meeting ID" },
        { status: 400 },
      );
    }

    const [existingMeeting] = await db
      .update(meetings)
      .set({
        status: "active",
        startedAt: new Date(),
      })
      .where(
        and(
          eq(meetings.id, meetingId),
          not(eq(meetings.status, "completed")),
          not(eq(meetings.status, "active")),
          not(eq(meetings.status, "cancelled")),
          not(eq(meetings.status, "processing")),
        ),
      )
      .returning();

    if (!existingMeeting) {
      return NextResponse.json(
        { error: "Meeting not found or already in terminal state" },
        { status: 404 },
      );
    }

    const [existingAgent] = await db
      .select()
      .from(agents)
      .where(eq(agents.id, existingMeeting.agentId));

    if (!existingAgent) {
      return NextResponse.json(
        { error: "Agent is not found" },
        { status: 404 },
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "Server configuration error: missing OpenAI API key" },
        { status: 500 },
      );
    }

    let realtimeClient;
    try {
      const call = streamVideo.video.call(CALL_TYPE, meetingId);
      realtimeClient = await streamVideo.video.connectOpenAi({
        call,
        openAiApiKey: process.env.OPENAI_API_KEY,
        agentUserId: existingAgent.id,
      });

      await realtimeClient.updateSession({
        instructions: existingAgent.instructions,
      });

      if (webhookId) {
        await markWebhookProcessed(webhookId, eventType as string);
      }
    } catch (error) {
      if (realtimeClient) {
        try {
          await realtimeClient.disconnect?.();
        } catch (disconnectError) {
          console.error(
            "Failed to disconnect OpenAI client during cleanup:",
            disconnectError,
          );
        }
      }

      await db
        .update(meetings)
        .set({
          status: "upcoming",
          startedAt: null,
        })
        .where(eq(meetings.id, existingMeeting.id));

      console.error("Failed to initialize AI agent:", error);
      return NextResponse.json(
        { error: "Failed to initialize AI agent" },
        { status: 500 },
      );
    }
  } else if (eventType === "call.session_participant_left") {
    const event = payload as CallSessionParticipantLeftEvent;
    const parts = event.call_cid.split(":");
    const meetingId = parts.length === 2 ? parts[1] : undefined;

    if (!meetingId) {
      return NextResponse.json(
        { error: "Missing meeting ID" },
        { status: 400 },
      );
    }

    const [existingMeeting] = await db
      .select()
      .from(meetings)
      .where(eq(meetings.id, meetingId));

    if (!existingMeeting) {
      return NextResponse.json(
        { error: "Meeting is not found" },
        { status: 404 },
      );
    }

    try {
      const call = streamVideo.video.call(CALL_TYPE, meetingId);

      const response = await call.queryCallParticipants();

      if (response.total_participants === 0) {
        await call.end();

        await db
          .update(meetings)
          .set({
            status: "processing",
            endedAt: new Date(),
          })
          .where(eq(meetings.id, meetingId));

        if (webhookId) {
          await markWebhookProcessed(webhookId, eventType as string);
        }
      }
    } catch (error) {
      console.error("Failed to end call:", error);
      return NextResponse.json(
        { error: "Failed to end call" },
        { status: 500 },
      );
    }
  }

  if (webhookId) {
    await markWebhookProcessed(webhookId, eventType as string);
  }

  return NextResponse.json({
    success: true,
    message: "Webhook processed successfully",
  });
}
