import { botttsNeutral, initials } from "@dicebear/collection";
import { createAvatar } from "@dicebear/core";

import { DEFAULT_AVATAR } from "@/constants/media";

import { removeDiacritics } from "@/lib/helper/text-utils";
import { rToast } from "@/lib/toast-utils";

interface AvatarProps {
  seed: string;
  variant: "botttsNeutral" | "initials";
}

export const generateAvatarUri = ({ seed, variant }: AvatarProps): string => {
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

    const generatedUri = avatar.toDataUri();
    return generatedUri || DEFAULT_AVATAR;
  } catch (error) {
    console.warn("Failed to generate avatar:", error);
    rToast.warning("Failed to generate avatar");
    return DEFAULT_AVATAR;
  }
};
