import { useEffect } from "react";
import { UseFormReturn } from "react-hook-form";

import { EyeIcon, EyeOffIcon, LockIcon, MailIcon } from "lucide-react";
import Link from "next/link";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { LABELS, PLACEHOLDERS } from "@/constants/texts";

import { getInputClassName } from "@/lib/class-names";
import { sanitizeInputOnBlur } from "@/lib/text-utils";

interface LoginFieldsProps {
  form: UseFormReturn<{
    email: string;
    password: string;
  }>;
  showPassword: boolean;
  inputKey: number;
  changeCount: number;
  hasSubmitted: boolean;
  setShowPassword: (show: boolean) => void;
  setInputKey: React.Dispatch<React.SetStateAction<number>>;
  setChangeCount: React.Dispatch<React.SetStateAction<number>>;
}

export const LoginFields = ({
  form,
  showPassword,
  inputKey,
  changeCount,
  hasSubmitted,
  setShowPassword,
  setInputKey,
  setChangeCount,
}: LoginFieldsProps) => {
  useEffect(() => {
    if (changeCount > 0 && hasSubmitted) {
      form.clearErrors("email");
      form.clearErrors("password");
    }
  }, [changeCount, form, hasSubmitted]);

  return (
    <div className="grid gap-y-4">
      {/* Email field */}
      <FormField
        name="email"
        control={form.control}
        render={({ field, fieldState }) => (
          <FormItem className="space-y-1">
            <FormLabel className="text-[15px] md:text-sm font-semibold text-secondary/90 md:text-gray-700">
              {LABELS.email}
            </FormLabel>
            <FormControl>
              <div className="relative group">
                <MailIcon className="absolute left-3 top-1/2 w-4 h-4 transition-colors transform -translate-y-1/2 text-secondary/50 md:text-gray-400 group-focus-within:text-secondary md:group-focus-within:text-primary" />
                <Input
                  key={inputKey}
                  type="email"
                  placeholder={PLACEHOLDERS.email}
                  value={field.value}
                  onChange={(e) => {
                    field.onChange(e.target.value);
                    setChangeCount((prev) => prev + 1);
                  }}
                  className={getInputClassName(!!fieldState.error)}
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

      {/* Password field */}
      <FormField
        control={form.control}
        name="password"
        render={({ field, fieldState }) => (
          <FormItem className="space-y-1">
            <div className="flex justify-between items-center">
              <FormLabel className="text-[15px] md:text-sm font-semibold text-secondary/90 md:text-gray-700">
                {LABELS.password}
              </FormLabel>
              <FormLabel className="text-xs text-center text-secondary/80 md:text-gray-600">
                <Link
                  href="/password-recovery"
                  className="font-semibold transition-all duration-200 text-secondary md:text-primary hover:text-secondary/80 md:hover:text-primary/80 hover:underline"
                >
                  {LABELS.forgotPassword}
                </Link>
              </FormLabel>
            </div>
            <FormControl>
              <div className="relative group">
                <LockIcon className="absolute left-3 top-1/2 w-4 h-4 transition-colors transform -translate-y-1/2 text-secondary/50 md:text-gray-400 group-focus-within:text-secondary md:group-focus-within:text-primary" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder={PLACEHOLDERS.loginPassword}
                  {...field}
                  onChange={(e) => {
                    field.onChange(e.target.value);
                    setChangeCount((prev) => prev + 1);
                  }}
                  className={getInputClassName(!!fieldState.error)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transition-all duration-200 transform -translate-y-1/2 text-secondary/50 md:text-gray-400 hover:text-secondary/80 md:hover:text-gray-600 hover:scale-110 active:scale-95"
                >
                  {showPassword ? (
                    <EyeOffIcon className="w-4 h-4" />
                  ) : (
                    <EyeIcon className="w-4 h-4" />
                  )}
                </button>
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
    </div>
  );
};
