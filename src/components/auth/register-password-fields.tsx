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

import { cn } from "@/lib/utils";

interface RPFProps {
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
}: RPFProps) => {
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
                  className={cn(
                    "pl-10 h-10 border-2 transition-all duration-300 font-medium text-sm placeholder:text-secondary/50 md:placeholder:text-gray-400 bg-white/5 border-white/20 text-secondary focus:shadow-primary/10 md:bg-transparent md:text-gray-900",
                    fieldState.error
                      ? "border-red-400/50 focus:border-red-400 md:focus:border-red-500 md:shadow-red-100"
                      : "focus:border-white/50 hover:border-white/30 md:border-gray-300 md:hover:border-gray-400/70 md:focus:border-primary/50",
                  )}
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
                  className={cn(
                    "pl-10 h-10 border-2 transition-all duration-300 font-medium text-sm placeholder:text-secondary/50 md:placeholder:text-gray-400 bg-white/5 border-white/20 text-secondary focus:shadow-primary/10 md:bg-transparent md:text-gray-900",
                    fieldState.error
                      ? "border-red-400/50 focus:border-red-400 md:focus:border-red-500 md:shadow-red-100"
                      : "focus:border-white/50 hover:border-white/30 md:border-gray-300 md:hover:border-gray-400/70 md:focus:border-primary/50",
                  )}
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
