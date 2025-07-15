import { useCallback, useState } from "react";

import { toast } from "sonner";

import { DESCRIPTIONS, ERROR_TEXTS } from "@/constants/texts";

import { authClient } from "@/lib/auth-client";

// Types for provider
export type SocialProvider = "github" | "google";

interface UseAuthFormActionsOptions {
  onSocialSuccess?: () => void;
}

export const useAuthFormActions = (options?: UseAuthFormActionsOptions) => {
  const [pending, setPending] = useState(false);

  // Social login handler
  const handleSocialLogin = useCallback(
    (provider: SocialProvider) => {
      setPending(true);
      authClient.signIn.social(
        {
          provider,
          callbackURL: "/",
        },
        {
          onSuccess: () => {
            setPending(false);
            options?.onSocialSuccess?.();
          },
          onError: () => {
            setPending(false);
            const errorMessage = `${provider[0].toUpperCase() + provider.slice(1)} login failed`;
            toast.error(errorMessage, {
              description: "Please try again or use email login",
            });
          },
        },
      );
    },
    [options],
  );

  // Toast error handler
  const handleToastMessage = useCallback((errorCode: string) => {
    if (errorCode === "USER_ALREADY_EXISTS") {
      toast.error(ERROR_TEXTS.emailExists, {
        description: DESCRIPTIONS.useAnotherEmail,
      });
    } else if (errorCode === "INVALID_EMAIL_OR_PASSWORD") {
      toast.error(ERROR_TEXTS.invalidCredentials, {
        description: DESCRIPTIONS.checkCredentials,
      });
    } else if (errorCode === "NETWORK_ERROR") {
      toast.error("Network error", {
        description: "Please check your connection and try again",
      });
    } else if (errorCode === "SERVER_ERROR") {
      toast.error("Server connection issue", {
        description: "Something went wrong. Please try again later",
      });
    }
  }, []);

  return {
    pending,
    setPending,
    handleSocialLogin,
    handleToastMessage,
  };
};
