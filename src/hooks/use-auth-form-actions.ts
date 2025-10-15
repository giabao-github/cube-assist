import { useCallback, useState } from "react";

import { toast } from "sonner";

import { DESCRIPTIONS, ERROR_TEXTS } from "@/constants/texts";

import { authClient } from "@/lib/auth/auth-client";

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
            const errorMessage = `${provider.charAt(0).toUpperCase() + provider.slice(1)} login failed`;
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
    switch (errorCode) {
      case "USER_ALREADY_EXISTS":
        toast.error(ERROR_TEXTS.emailExists, {
          description: DESCRIPTIONS.useAnotherEmail,
        });
        break;
      case "INVALID_EMAIL_OR_PASSWORD":
        toast.error(ERROR_TEXTS.invalidCredentials, {
          description: DESCRIPTIONS.checkCredentials,
        });
        break;
      case "NETWORK_ERROR":
        toast.error(ERROR_TEXTS.networkError, {
          description: DESCRIPTIONS.networkError,
        });
        break;
      case "SERVER_ERROR":
        toast.error(ERROR_TEXTS.serverError, {
          description: DESCRIPTIONS.serverError,
        });
        break;
      default:
        toast.error(ERROR_TEXTS.unknown, {
          description: DESCRIPTIONS.unknown,
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
