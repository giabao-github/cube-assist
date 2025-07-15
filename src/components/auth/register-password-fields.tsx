import { UseFormReturn } from "react-hook-form";

import { EyeIcon, EyeOffIcon, LockIcon } from "lucide-react";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { LABELS, PLACEHOLDERS } from "@/constants/texts";

import { getInputClassName } from "@/lib/class-names";

interface RegisterPasswordFieldsProps {
  form: UseFormReturn<{
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
  }>;
  showPassword: boolean;
  showConfirmPassword: boolean;
  setShowPassword: (show: boolean) => void;
  setShowConfirmPassword: (show: boolean) => void;
}

export const RegisterPasswordFields = ({
  form,
  showPassword,
  showConfirmPassword,
  setShowPassword,
  setShowConfirmPassword,
}: RegisterPasswordFieldsProps) => {
  return (
    <>
      <FormField
        control={form.control}
        name="password"
        render={({ field, fieldState }) => (
          <FormItem className="space-y-1">
            <FormLabel className="text-[15px] md:text-sm font-semibold text-secondary/90 md:text-gray-700">
              {LABELS.password}
            </FormLabel>
            <FormControl>
              <div className="relative group">
                <LockIcon className="absolute left-3 top-1/2 w-4 h-4 transition-colors transform -translate-y-1/2 text-secondary/50 md:text-gray-400 group-focus-within:text-secondary md:group-focus-within:text-primary" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder={PLACEHOLDERS.registerPassword}
                  {...field}
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
      <FormField
        control={form.control}
        name="confirmPassword"
        render={({ field, fieldState }) => (
          <FormItem className="space-y-1">
            <FormLabel className="text-[15px] md:text-sm font-semibold text-secondary/90 md:text-gray-700">
              {LABELS.confirmPassword}
            </FormLabel>
            <FormControl>
              <div className="relative group">
                <LockIcon className="absolute left-3 top-1/2 w-4 h-4 transition-colors transform -translate-y-1/2 text-secondary/50 md:text-gray-400 group-focus-within:text-secondary md:group-focus-within:text-primary" />
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder={PLACEHOLDERS.confirmPassword}
                  {...field}
                  className={getInputClassName(!!fieldState.error)}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transition-all duration-200 transform -translate-y-1/2 text-secondary/50 md:text-gray-400 hover:text-secondary/80 md:hover:text-gray-600 hover:scale-110 active:scale-95"
                >
                  {showConfirmPassword ? (
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
    </>
  );
};
