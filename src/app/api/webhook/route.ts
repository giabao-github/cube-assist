import { CallSessionStartedEvent } from "@stream-io/node-sdk";
import { CallSessionParticipantLeftEvent } from "@stream-io/video-react-sdk";
import { and, eq, not } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import { streamVideo } from "@/lib/stream-video";

import { db } from "@/db";
import { agents, meetings } from "@/db/schema";

function verifySignatureWithSDK(body: string, signature: string): boolean {
  return streamVideo.verifyWebhook(body, signature);
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

    const openAiKey = process.env.OPENAI_API_KEY as string;

    let realtimeClient;
    try {
      const call = streamVideo.video.call("default", meetingId);
      realtimeClient = await streamVideo.video.connectOpenAi({
        call,
        openAiApiKey: openAiKey,
        agentUserId: existingAgent.id,
      });

      realtimeClient.updateSession({
        instructions: existingAgent.instructions,
      });
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
    }
  } else if (eventType === "call.session_participant_left") {
    const event = payload as CallSessionParticipantLeftEvent;
    const meetingId = event.call_cid.split(":")[1]; // call_cid format: "{type}:{id}"

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
    await call.end();
  }

  return NextResponse.json({
    success: true,
    message: "Webhook processed successfully",
  });
}
