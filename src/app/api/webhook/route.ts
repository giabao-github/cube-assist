import {
  CallSessionParticipantLeftEvent,
  CallSessionStartedEvent,
} from "@stream-io/node-sdk";
import { Redis } from "@upstash/redis";
import { and, eq, not } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import { streamVideo } from "@/lib/stream-video";

import { db } from "@/db";
import { agents, meetings } from "@/db/schema";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

function verifySignatureWithSDK(body: string, signature: string): boolean {
  return streamVideo.verifyWebhook(body, signature);
}

function extractWebhookId(payload: Record<string, unknown>): string | null {
  const eventId = payload.event_id as string | undefined;
  const createdAt = payload.created_at as string | undefined;
  const callCid = payload.call_cid as string | undefined;

  if (eventId) return eventId;
  if (createdAt && callCid) return `${callCid}-${createdAt}`;

  return null;
}

async function isWebhookProcessed(webhookId: string): Promise<boolean> {
  try {
    const result = await redis.get(`webhook:${webhookId}`);
    return result !== null;
  } catch (error) {
    console.error("Redis error checking webhook:", error);
    return false;
  }
}

const CALL_TYPE = "default";
const WEBHOOK_TTL_SECONDS = 7 * 24 * 60 * 60;

async function markWebhookProcessed(webhookId: string): Promise<void> {
  try {
    await redis.setex(
      `webhook:${webhookId}`,
      WEBHOOK_TTL_SECONDS,
      Date.now().toString(),
    );
  } catch (error) {
    console.error("Redis error marking webhook:", error);
  }
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

  // Replay protection
  const webhookId = extractWebhookId(payload as Record<string, unknown>);

  if (!webhookId) {
    console.warn("Could not extract webhook ID from payload", { eventType });
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

      realtimeClient.updateSession({
        instructions: existingAgent.instructions,
      });

      if (webhookId) {
        await markWebhookProcessed(webhookId);
      }
    } catch (error) {
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
    } finally {
      if (realtimeClient) {
        await realtimeClient.disconnect();
      }
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

    const call = streamVideo.video.call("default", meetingId);
    try {
      await call.end();

      await db
        .update(meetings)
        .set({
          status: "processing",
          endedAt: new Date(),
        })
        .where(eq(meetings.id, meetingId));
    } catch (error) {
      console.error("Failed to end call:", error);
      return NextResponse.json(
        { error: "Failed to end call" },
        { status: 500 },
      );
    }

    if (webhookId) {
      await markWebhookProcessed(webhookId);
    }
  }

  return NextResponse.json({
    success: true,
    message: "Webhook processed successfully",
  });
}
