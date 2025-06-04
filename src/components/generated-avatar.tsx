import { botttsNeutral, initials } from "@dicebear/collection";
import { createAvatar } from "@dicebear/core";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { cn } from "@/lib/utils";

interface GeneratedAvatarProps {
  seed: string;
  className?: string;
  variant: "botttsNeutral" | "initials";
}

const gradients = [
  "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
  "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
  "linear-gradient(135deg, #ff6b6b 0%, #ffa726 100%)",
  "linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)",
  "linear-gradient(135deg, #a8e6cf 0%, #88d8c0 100%)",
  "linear-gradient(135deg, #ff8a80 0%, #ea4c89 100%)",
  "linear-gradient(135deg, #64b3f4 0%, #c2e59c 100%)",
  "linear-gradient(135deg, #ffeaa7 0%, #fab1a0 100%)",
  "linear-gradient(135deg, #fd79a8 0%, #fdcb6e 100%)",
  "linear-gradient(135deg, #00b894 0%, #00cec9 100%)",
  "linear-gradient(135deg, #e17055 0%, #fdcb6e 100%)",
  "linear-gradient(135deg, #a29bfe 0%, #fd79a8 100%)",
  "linear-gradient(135deg, #55a3ff 0%, #003d82 100%)",
  "linear-gradient(135deg, #ff7675 0%, #74b9ff 100%)",
];

export const GeneratedAvatar = ({
  seed,
  className,
  variant,
}: GeneratedAvatarProps) => {
  let avatar;

  if (variant === "botttsNeutral") {
    avatar = createAvatar(botttsNeutral, {
      seed,
    });
  } else {
    // Use transparent background for initials variant
    avatar = createAvatar(initials, {
      seed,
      fontWeight: 600,
      fontSize: 42,
      backgroundColor: ["transparent"],
    });
  }

  // Create a simple hash function to consistently select gradient based on seed
  const hashCode = (str: string): number => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash &= hash;
    }
    return Math.abs(hash);
  };

  const selectedGradient = gradients[hashCode(seed) % gradients.length];

  return (
    <Avatar
      className={cn(className)}
      style={variant === "initials" ? { background: selectedGradient } : {}}
    >
      <AvatarImage src={avatar.toDataUri()} alt="User avatar" />
      <AvatarFallback
        className={cn(
          "bg-transparent text-white font-bold flex items-center justify-center",
        )}
      >
        {seed.charAt(0).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  );
};
