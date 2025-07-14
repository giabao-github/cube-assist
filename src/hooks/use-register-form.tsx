import { useEffect } from "react";
import { UseFormReturn } from "react-hook-form";

import { BUTTON_TEXTS, ERROR_TEXTS } from "@/constants/texts";

import { useGenericForm } from "@/hooks/use-generic-form";

type RegisterForm = UseFormReturn<{
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}>;

export const useRegisterForm = (form: RegisterForm, pending: boolean) => {
  const fieldNames = ["name", "email", "password", "confirmPassword"] as const;

  const { submitButtonText, isButtonDisabled, watchedValues } = useGenericForm({
    form,
    pending,
    fieldNames,
    buttonText: BUTTON_TEXTS.register,
    pendingText: BUTTON_TEXTS.pendingRegister,
    emptyFieldText: ERROR_TEXTS.emptyFields,
    multipleErrorText: ERROR_TEXTS.multipleErrors,
    singleErrorFallback: ERROR_TEXTS.singleErrorFallback,
  });

  // Cross-field validation
  useEffect(() => {
    if (watchedValues.confirmPassword) {
      form.trigger("confirmPassword");
    }
  }, [watchedValues.password, watchedValues.confirmPassword, form]);

  return { submitButtonText, isButtonDisabled };
};
