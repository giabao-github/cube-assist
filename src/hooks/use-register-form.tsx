import { useEffect } from "react";
import { UseFormReturn } from "react-hook-form";

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
    buttonText: "Sign up",
    pendingText: "Creating your account",
    emptyFieldText: "Please fill out all required fields",
    multipleErrorText: "Please correct all form errors",
    singleErrorFallback: "A form error occurred",
  });

  // Cross-field validation
  useEffect(() => {
    if (watchedValues.confirmPassword) {
      form.trigger("confirmPassword");
    }
  }, [watchedValues.password, watchedValues.confirmPassword, form]);

  return { submitButtonText, isButtonDisabled };
};
