import { ClientOptions, InferUserFromClient } from "better-auth";

import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { GeneratedAvatar } from "@/components/utils/generated-avatar";

export const UserAvatar = ({
  user,
}: {
  user: InferUserFromClient<ClientOptions>;
}) =>
  user.image ? (
    <Avatar className="select-none">
      <AvatarImage src={user.image} alt={user.name || "Anonymous User"} />
    </Avatar>
  ) : (
    <GeneratedAvatar
      seed={user.name || user.email || "Anonymous User"}
      variant="initials"
      className="select-none size-10"
    />
  );
