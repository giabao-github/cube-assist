import { AlertTriangle, CheckCircle, Shield } from "lucide-react";

export const SOCIAL_BUTTON_CLASSES = {
  google:
    "flex gap-3 justify-center items-center w-full h-10 text-black bg-white border-2 border-white transition-all duration-300 md:bg-transparent hover:bg-white/20 hover:border-white/30 md:border-gray-200 md:hover:bg-blue-50 md:hover:border-blue-400 md:hover:text-black",
  github:
    "flex gap-3 justify-center items-center w-full h-10 text-black bg-white border-2 border-white transition-all duration-300 hover:bg-white/20 hover:border-white/30 md:bg-transparent md:border-gray-200 md:text-black md:hover:bg-gray-50 md:hover:border-gray-400 md:hover:text-black",
};

export const STRENGTH_LEVELS = [
  {
    label: "Very Weak",
    color: "bg-gradient-to-r from-red-500 to-red-600",
    textColor: "text-red-700",
    bgColor: "bg-red-50 border-red-200",
    icon: AlertTriangle,
    ringColor: "ring-red-200",
  },
  {
    label: "Weak",
    color: "bg-gradient-to-r from-orange-500 to-orange-600",
    textColor: "text-orange-700",
    bgColor: "bg-orange-50 border-orange-200",
    icon: AlertTriangle,
    ringColor: "ring-orange-200",
  },
  {
    label: "Fair",
    color: "bg-gradient-to-r from-yellow-500 to-yellow-600",
    textColor: "text-yellow-700",
    bgColor: "bg-yellow-50 border-yellow-200",
    icon: Shield,
    ringColor: "ring-yellow-200",
  },
  {
    label: "Good",
    color: "bg-gradient-to-r from-blue-500 to-blue-600",
    textColor: "text-blue-700",
    bgColor: "bg-blue-50 border-blue-200",
    icon: Shield,
    ringColor: "ring-blue-200",
  },
  {
    label: "Strong",
    color: "bg-gradient-to-r from-green-500 to-green-600",
    textColor: "text-green-700",
    bgColor: "bg-green-50 border-green-200",
    icon: CheckCircle,
    ringColor: "ring-green-200",
  },
];
