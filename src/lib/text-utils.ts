export const sanitizeInputOnBlur = (
  input: string,
  type?: "email" | "phone",
): string => {
  if (type === "email" || type === "phone") {
    return input.replace(/\s+/g, "");
  }
  return input.trim().replace(/\s+/g, " ");
};
