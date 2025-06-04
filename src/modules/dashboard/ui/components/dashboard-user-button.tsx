import { ChevronDownIcon, CreditCardIcon, LogOutIcon } from "lucide-react";
import { Lexend_Deca } from "next/font/google";
import { useRouter } from "next/navigation";

import { GeneratedAvatar } from "@/components/generated-avatar";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { authClient } from "@/lib/auth-client";

const lexend = Lexend_Deca({
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin", "latin-ext", "vietnamese"],
});

export const DashboardUserButton = () => {
  const router = useRouter();
  const { data, isPending } = authClient.useSession();

  const onLogout = () => {
    authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/login");
        },
      },
    });
  };

  if (isPending || !data?.user) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="rounded-lg border border-border/10 py-3 px-2 w-full flex items-center justify-between bg-white/10 hover:bg-white/20 overflow-hidden space-x-2">
        {data.user.image ? (
          <Avatar className="select-none">
            <AvatarImage
              src={data.user.image}
              alt={data.user.name || "User avatar"}
            />
          </Avatar>
        ) : (
          <GeneratedAvatar
            seed={data.user.name || data.user.email || "Anonymous User"}
            variant="initials"
            className="size-10 mr-3 select-none"
          />
        )}
        <div className="flex flex-col gap-0.5 text-left overflow-hidden flex-1 min-w-0">
          <p className="text-sm font-medium truncate w-full">
            {data.user.name}
          </p>
          <p className="text-xs truncate w-full">{data.user.email}</p>
        </div>
        <ChevronDownIcon strokeWidth={3} className="size-5 shrink-0" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        side="right"
        className={`w-72 ${lexend.className}`}
      >
        <DropdownMenuLabel>
          <div className="flex flex-col gap-1">
            <span className="font-medium truncate">{data.user.name}</span>
            <span className="text-xs text-muted-foreground truncate">
              {data.user.email}
            </span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="flex items-center justify-between cursor-pointer">
          Billing
          <CreditCardIcon className="size-4" />
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={onLogout}
          className="flex items-center justify-between cursor-pointer"
        >
          Log out
          <LogOutIcon className="size-4" />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
