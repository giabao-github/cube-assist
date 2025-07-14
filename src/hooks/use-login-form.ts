import { UseFormReturn } from "react-hook-form";

import { BUTTON_TEXTS, ERROR_TEXTS } from "@/constants/texts";

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
    buttonText: BUTTON_TEXTS.login,
    pendingText: BUTTON_TEXTS.pendingLogin,
    emptyFieldText: ERROR_TEXTS.emptyFields,
    multipleErrorText: ERROR_TEXTS.multipleErrors,
    singleErrorFallback: ERROR_TEXTS.singleErrorFallback,
  });
};
