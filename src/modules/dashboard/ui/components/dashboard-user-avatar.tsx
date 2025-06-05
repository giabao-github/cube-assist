import { ClientOptions, InferUserFromClient } from "better-auth";

import { GeneratedAvatar } from "@/components/generated-avatar";
import { Avatar, AvatarImage } from "@/components/ui/avatar";

export const UserAvatar = ({
  user,
}: {
  user: InferUserFromClient<ClientOptions>;
}) =>
  user.image ? (
    <Avatar className="select-none">
      <AvatarImage src={user.image} alt={user.name || "User avatar"} />
    </Avatar>
  ) : (
    <GeneratedAvatar
      seed={user.name || user.email || "Anonymous User"}
      variant="initials"
      className="select-none size-10"
    />
  );
