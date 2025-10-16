"use client";

import { BsRobot } from "react-icons/bs";

import { LucideLayoutDashboard, StarIcon, VideoIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import { lexend } from "@/config/fonts";

import { cn } from "@/lib/helper/utils";

import { DashboardUserButton } from "@/modules/dashboard/ui/components/dashboard-user-button";

const firstSection = [
  {
    icon: LucideLayoutDashboard,
    label: "Dashboard",
    href: "/dashboard",
  },
  {
    icon: VideoIcon,
    label: "Meetings",
    href: "/dashboard/meetings",
  },
  {
    icon: BsRobot,
    label: "Agents",
    href: "/dashboard/agents",
  },
];

const secondSection = [
  {
    icon: StarIcon,
    label: "Upgrade",
    href: "/dashboard/upgrade",
  },
];

export const DashboardSidebar = () => {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader
        className={cn("text-sidebar-accent-foreground", lexend.className)}
      >
        <Link
          href="/"
          className="flex gap-3 items-center px-2 mt-4 select-none w-fit focus-visible:outline-none"
        >
          <Image src="/logo.svg" alt="Cube Assist" height={32} width={32} />
          <p className="text-xl font-semibold">Cube Assist</p>
        </Link>
      </SidebarHeader>
      <div className="p-4">
        <Separator className="opacity-20" />
      </div>
      <SidebarContent className={lexend.className}>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2 select-none">
              {firstSection.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    size="lg"
                    className={cn(
                      "h-10 hover:bg-linear-to-r/oklch border border-transparent hover:border-custom-700 from-sidebar-accent from-20% via-sidebar/20 via-50% to-sidebar/50",
                      pathname === item.href &&
                        "bg-linear-to-r/oklch border-custom-700",
                    )}
                    isActive={item.href === pathname}
                  >
                    <Link className="space-x-1" href={item.href}>
                      <item.icon />
                      <span className="text-base font-medium">
                        {item.label}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <div className="p-4">
          <Separator className="opacity-20" />
        </div>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2 select-none">
              {secondSection.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    size="lg"
                    className={cn(
                      "h-10 hover:bg-linear-to-r/oklch border border-transparent hover:border-custom-700 from-sidebar-accent from-20% via-sidebar/20 via-50% to-sidebar/50",
                      pathname === item.href &&
                        "bg-linear-to-r/oklch border-custom-700",
                    )}
                    isActive={item.href === pathname}
                  >
                    <Link className="space-x-1" href={item.href}>
                      <item.icon />
                      <span className="text-base font-medium">
                        {item.label}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="text-white">
        <DashboardUserButton />
      </SidebarFooter>
    </Sidebar>
  );
};
