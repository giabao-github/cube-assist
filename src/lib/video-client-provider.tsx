"use client";

import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { StreamVideoClient } from "@stream-io/video-react-sdk";

interface VideoClientContextType {
  client: StreamVideoClient | undefined;
  isLoading: boolean;
}

const VideoClientContext = createContext<VideoClientContextType | undefined>(
  undefined,
);

interface VideoClientProviderProps {
  children: ReactNode;
  userId: string;
  userName: string;
  userImage: string | undefined;
  tokenProvider: () => Promise<string>;
}

export const VideoClientProvider = ({
  children,
  userId,
  userName,
  userImage,
  tokenProvider,
}: VideoClientProviderProps) => {
  const [client, setClient] = useState<StreamVideoClient>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setClient(undefined);
      setIsLoading(false);
      return;
    }

    let _client: StreamVideoClient;

    const initClient = async () => {
      try {
        _client = StreamVideoClient.getOrCreateInstance({
          apiKey: process.env.NEXT_PUBLIC_STREAM_VIDEO_API_KEY || "",
          user: {
            id: userId,
            name: userName,
            image: userImage,
          },
          tokenProvider,
        });

        setClient(_client);
      } catch (error) {
        console.error("Failed to initialize video client:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (!process.env.NEXT_PUBLIC_STREAM_VIDEO_API_KEY) {
      console.warn("Missing NEXT_PUBLIC_STREAM_VIDEO_API_KEY");
    }

    initClient();

    return () => {
      if (_client === client) {
        _client.disconnectUser().catch(console.error);
      }
    };
  }, [userId, userName, userImage, tokenProvider, client]);

  return (
    <VideoClientContext.Provider value={{ client, isLoading }}>
      {children}
    </VideoClientContext.Provider>
  );
};

export const useVideoClient = () => {
  const context = useContext(VideoClientContext);
  if (!context) {
    throw new Error("useVideoClient must be used within VideoClientProvider");
  }
  return context;
};
