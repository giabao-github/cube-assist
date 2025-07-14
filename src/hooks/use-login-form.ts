import { UseFormReturn } from "react-hook-form";

import { useGenericForm } from "@/hooks/use-generic-form";

type LoginForm = UseFormReturn<{
  email: string;
  password: string;
}>;

export const useLoginForm = (form: LoginForm, pending: boolean) => {
  const fieldNames = ["email", "password"] as const;

  return useGenericForm({
    form,
    pending,
    fieldNames,
    buttonText: "Sign in",
    pendingText: "Signing in",
    emptyFieldText: "Please fill out all required fields",
    multipleErrorText: "Please correct all form errors",
    singleErrorFallback: "A form error occurred",
  });
};
