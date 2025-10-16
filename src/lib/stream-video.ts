import { StreamClient } from "@stream-io/node-sdk";
import "server-only";

if (!process.env.NEXT_PUBLIC_STREAM_VIDEO_API_KEY) {
  throw new Error(
    "Missing NEXT_PUBLIC_STREAM_VIDEO_API_KEY environment variable",
  );
}

if (!process.env.STREAM_VIDEO_SECRET_KEY) {
  throw new Error("Missing STREAM_VIDEO_SECRET_KEY environment variable");
}

export const streamVideo = new StreamClient(
  process.env.NEXT_PUBLIC_STREAM_VIDEO_API_KEY,
  process.env.STREAM_VIDEO_SECRET_KEY,
);
