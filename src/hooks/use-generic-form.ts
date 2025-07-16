import { useMemo } from "react";
import { Path, UseFormReturn, useWatch } from "react-hook-form";

interface UseGenericFormOptions<T extends Record<string, unknown>> {
  form: UseFormReturn<T>;
  pending: boolean;
  fieldNames: readonly Path<T>[];
  isSuccess?: boolean;
  buttonText: string;
  pendingText: string;
  successText?: string;
  emptyFieldText: string;
  multipleErrorText: string;
  singleErrorFallback: string;
}

export const useGenericForm = <T extends Record<string, unknown>>({
  form,
  pending,
  fieldNames,
  isSuccess = false,
  buttonText,
  pendingText,
  successText,
  emptyFieldText,
  multipleErrorText,
  singleErrorFallback,
}: UseGenericFormOptions<T>) => {
  const watchedValuesArr = useWatch({
    control: form.control,
    name: fieldNames,
  });

  const watchedValues = useMemo(
    () =>
      fieldNames.reduce(
        (acc, field, idx) => {
          acc[field] = watchedValuesArr[idx];
          return acc;
        },
        {} as Record<Path<T>, unknown>,
      ),
    [fieldNames, watchedValuesArr],
  );

  const watchedErrors = form.formState.errors;
  const emptyFields = fieldNames.filter((f) => {
    const value = watchedValues[f];
    return value === undefined || value === null || value === "";
  });
  const errorFields = fieldNames.filter((f) => watchedErrors[f]);
  const isButtonDisabled =
    pending || errorFields.length > 0 || emptyFields.length > 0 || isSuccess;

  let submitButtonText = buttonText;

  if (pending) {
    submitButtonText = pendingText;
  } else if (isSuccess && successText) {
    submitButtonText = successText;
  } else if (!isButtonDisabled) {
    submitButtonText = buttonText;
  } else if (errorFields.length > 1) {
    submitButtonText = multipleErrorText;
  } else if (errorFields.length === 1) {
    const field = errorFields[0];
    const error = watchedErrors[field];
    const errorMsg =
      error && typeof error === "object" ? error.message : undefined;
    submitButtonText =
      typeof errorMsg === "string" && errorMsg.length > 0
        ? errorMsg
        : singleErrorFallback;
  } else if (emptyFields.length > 0) {
    submitButtonText = emptyFieldText;
  }

  if (
    submitButtonText.includes(
      "This password has appeared in public data breaches",
    )
  ) {
    submitButtonText = "Password found in data breaches";
  }

  return { submitButtonText, isButtonDisabled, watchedValues, watchedErrors };
};
