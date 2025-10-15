import { botttsNeutral, initials } from "@dicebear/collection";
import { createAvatar } from "@dicebear/core";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { removeDiacritics } from "@/lib/helper/text-utils";
import { cn } from "@/lib/helper/utils";

interface GeneratedAvatarProps {
  seed: string;
  className?: string;
  variant: "botttsNeutral" | "initials";
}

const gradients = [
  "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  "linear-gradient(135deg, #28c76f 0%, #00bfa5 100%)",
  "linear-gradient(135deg, #f86aa0 0%, #fbc531 100%)",
  "linear-gradient(135deg, #ff6b6b 0%, #ffa726 100%)",
  "linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)",
  "linear-gradient(135deg, #00c896 0%, #00aa88 100%)",
  "linear-gradient(135deg, #ff8a80 0%, #ea4c89 100%)",
  "linear-gradient(135deg, #4a90e2 0%, #8ac926 100%)",
  "linear-gradient(135deg, #ffc371 0%, #ff6f61 100%)",
  "linear-gradient(135deg, #fd79a8 0%, #fdcb6e 100%)",
  "linear-gradient(135deg, #00b894 0%, #00cec9 100%)",
  "linear-gradient(135deg, #e17055 0%, #fdcb6e 100%)",
  "linear-gradient(135deg, #a29bfe 0%, #fd79a8 100%)",
  "linear-gradient(135deg, #00c3ff 0%, #4481eb 100%)",
  "linear-gradient(135deg, #ff7675 0%, #74b9ff 100%)",
];

export const GeneratedAvatar = ({
  seed,
  className,
  variant,
}: GeneratedAvatarProps) => {
  let avatar;

  try {
    const cleanSeed = removeDiacritics(seed);
    if (variant === "botttsNeutral") {
      avatar = createAvatar(botttsNeutral, {
        seed: cleanSeed,
      });
    } else {
      avatar = createAvatar(initials, {
        seed: cleanSeed,
        fontWeight: 600,
        fontSize: 42,
        backgroundColor: ["transparent"],
      });
    }
  } catch (error) {
    console.warn("Failed to generate avatar:", error);
    toast.warning("Failed to fetch user avatar");
  }

  // Select gradient based on seed
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
      <AvatarImage src={avatar?.toDataUri()} alt="User avatar" />
      <AvatarFallback>{seed.charAt(0).toUpperCase()}</AvatarFallback>
    </Avatar>
  );
};
