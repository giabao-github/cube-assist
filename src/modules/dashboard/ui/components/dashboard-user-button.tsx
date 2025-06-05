import { ChevronDownIcon, CreditCardIcon, LogOutIcon } from "lucide-react";
import { Lexend_Deca } from "next/font/google";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useIsMobile } from "@/hooks/use-mobile";

import { authClient } from "@/lib/auth-client";
import { UserAvatar } from "@/modules/dashboard/ui/components/dashboard-user-avatar";
import { DUBSkeleton } from "@/modules/dashboard/ui/components/dub-skeleton";

const lexend = Lexend_Deca({
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin", "latin-ext", "vietnamese"],
});

export const DashboardUserButton = () => {
  const router = useRouter();
  const isMobile = useIsMobile();
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
    return <DUBSkeleton />;
  }

  if (isMobile) {
    return (
      <Drawer>
        <DrawerTrigger className="flex items-center justify-between w-full px-2 py-3 space-x-2 overflow-hidden border rounded-lg cursor-pointer border-border/10 bg-white/10 hover:bg-white/20">
          <UserAvatar user={data.user} />
          <div className="flex flex-col gap-0.5 text-left overflow-hidden flex-1 min-w-0">
            <p className="w-full text-sm font-medium truncate">
              {data.user.name}
            </p>
            <p className="w-full text-xs truncate">{data.user.email}</p>
          </div>
          <ChevronDownIcon strokeWidth={3} className="size-5 shrink-0" />
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{data.user.name}</DrawerTitle>
            <DrawerDescription>{data.user.email}</DrawerDescription>
          </DrawerHeader>
          <DrawerFooter>
            <Button variant="outline" onClick={() => {}}>
              <CreditCardIcon className="text-black size-4" />
              Billing
            </Button>
            <Button variant="outline" onClick={onLogout}>
              <LogOutIcon className="text-black size-4" />
              Log out
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center justify-between w-full px-2 py-3 space-x-2 overflow-hidden border rounded-lg cursor-pointer border-border/10 bg-white/10 hover:bg-white/20">
        <UserAvatar user={data.user} />
        <div className="flex flex-col gap-0.5 text-left overflow-hidden flex-1 min-w-0">
          <p className="w-full text-sm font-medium truncate h-fit">
            {data.user.name}
          </p>
          <p className="w-full text-xs truncate h-fit">{data.user.email}</p>
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
            <span className="text-xs truncate text-muted-foreground">
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
