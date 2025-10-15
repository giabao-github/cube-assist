import { botttsNeutral, initials } from "@dicebear/collection";
import { createAvatar } from "@dicebear/core";
import { toast } from "sonner";

import { removeDiacritics } from "@/lib/helper/text-utils";

interface AvatarProps {
  seed: string;
  variant: "botttsNeutral" | "initials";
}

export const generateAvatarUri = ({ seed, variant }: AvatarProps) => {
  let avatar;
  const cleanSeed = removeDiacritics(seed);

  try {
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

    return avatar.toDataUri();
  } catch (error) {
    console.warn("Failed to generate avatar:", error);
    toast.warning("Failed to generate avatar");
  }
};
