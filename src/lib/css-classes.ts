import { cn } from "@/lib/utils";

export const getInputClassName = (hasError: boolean) => {
  const baseClasses =
    "pl-10 h-10 border-2 transition-all duration-300 font-medium text-sm placeholder:text-secondary/50 md:placeholder:text-gray-400 bg-white/5 border-white/20 text-secondary focus:shadow-primary/10 md:bg-transparent md:text-gray-900";
  const errorClasses =
    "border-red-400/50 focus:border-red-400 md:focus:border-red-500 md:shadow-red-100";
  const normalClasses =
    "focus:border-white/50 hover:border-white/30 md:border-gray-300 md:hover:border-gray-400/70 md:focus:border-primary/50";

  return cn(baseClasses, hasError ? errorClasses : normalClasses);
};
