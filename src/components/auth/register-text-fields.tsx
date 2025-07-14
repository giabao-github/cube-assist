import { UseFormReturn } from "react-hook-form";

import { MailIcon, UserIcon } from "lucide-react";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { LABELS, PLACEHOLDERS } from "@/constants/texts";

import { sanitizeInputOnBlur } from "@/lib/text-utils";
import { cn } from "@/lib/utils";

interface RTFProps {
  form: UseFormReturn<{
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
  }>;
  inputKey: number;
  setInputKey: React.Dispatch<React.SetStateAction<number>>;
}

export const RegisterTextFields = ({
  form,
  inputKey,
  setInputKey,
}: RTFProps) => {
  return (
    <>
      <FormField
        control={form.control}
        name="name"
        render={({ field, fieldState }) => (
          <FormItem className="space-y-1">
            <FormLabel className="text-[15px] md:text-sm font-semibold text-secondary/90 md:text-gray-700">
              {LABELS.username}
            </FormLabel>
            <FormControl>
              <div className="relative group">
                <UserIcon className="absolute left-3 top-1/2 w-4 h-4 transition-colors transform -translate-y-1/2 text-secondary/50 md:text-gray-400 group-focus-within:text-secondary md:group-focus-within:text-primary" />
                <Input
                  type="text"
                  placeholder={PLACEHOLDERS.username}
                  className={cn(
                    "pl-10 h-10 border-2 transition-all duration-300 font-medium text-sm placeholder:text-secondary/50 md:placeholder:text-gray-400 bg-white/5 border-white/20 text-secondary focus:shadow-primary/10 md:bg-transparent md:text-gray-900",
                    fieldState.error
                      ? "border-red-400/50 focus:border-red-400 md:focus:border-red-500 md:shadow-red-100"
                      : "focus:border-white/50 hover:border-white/30 md:border-gray-300 md:hover:border-gray-400/70 md:focus:border-primary/50",
                  )}
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                  onBlur={() => {
                    const sanitized = sanitizeInputOnBlur(field.value);
                    if (sanitized !== field.value) {
                      field.onChange(sanitized);
                    }
                    field.onBlur();
                  }}
                />
              </div>
            </FormControl>
            <div className="leading-tight min-h-4">
              {fieldState.error && (
                <p className="text-xs text-red-400/90 md:text-red-600">
                  {fieldState.error.message}
                </p>
              )}
            </div>
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="email"
        render={({ field, fieldState }) => (
          <FormItem className="space-y-1">
            <FormLabel className="text-[15px] md:text-sm font-semibold text-secondary/90 md:text-gray-700">
              {LABELS.email}
            </FormLabel>
            <FormControl>
              <div className="relative group">
                <MailIcon className="absolute left-3 top-1/2 w-4 h-4 transition-colors transform -translate-y-1/2 text-secondary/50 md:text-gray-400 group-focus-within:text-secondary md:group-focus-within:text-primary" />
                <Input
                  key={`${inputKey}-email`}
                  type="email"
                  placeholder={PLACEHOLDERS.email}
                  className={cn(
                    "pl-10 h-10 border-2 transition-all duration-300 font-medium text-sm placeholder:text-secondary/50 md:placeholder:text-gray-400 bg-white/5 border-white/20 text-secondary focus:shadow-primary/10 md:bg-transparent md:text-gray-900",
                    fieldState.error
                      ? "border-red-400/50 focus:border-red-400 md:focus:border-red-500 md:shadow-red-100"
                      : "focus:border-white/50 hover:border-white/30 md:border-gray-300 md:hover:border-gray-400/70 md:focus:border-primary/50",
                  )}
                  value={field.value}
                  onChange={(e) => {
                    form.clearErrors("email");
                    field.onChange(e.target.value);
                  }}
                  onBlur={() => {
                    const sanitized = sanitizeInputOnBlur(field.value, "email");
                    if (sanitized !== field.value) {
                      field.onChange(sanitized);
                    }
                    setInputKey((prev) => prev + 1);
                    field.onBlur();
                  }}
                />
              </div>
            </FormControl>
            <div className="leading-tight min-h-4">
              {fieldState.error && (
                <p className="text-xs text-red-400/90 md:text-red-600">
                  {fieldState.error.message}
                </p>
              )}
            </div>
          </FormItem>
        )}
      />
    </>
  );
};
