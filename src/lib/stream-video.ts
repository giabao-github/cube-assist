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

const apiKey = process.env.NEXT_PUBLIC_STREAM_VIDEO_API_KEY as string;
const secret = process.env.STREAM_VIDEO_SECRET_KEY as string;
export const streamVideo = new StreamClient(apiKey, secret);
