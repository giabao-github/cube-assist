import { ReactNode } from "react";

import { Lexend_Deca } from "next/font/google";

import { SidebarProvider } from "@/components/ui/sidebar";

import { DashboardSidebar } from "@/modules/dashboard/ui/components/dashboard-sidebar";

const lexend = Lexend_Deca({
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin", "latin-ext", "vietnamese"],
});

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <SidebarProvider className={lexend.className}>
      <DashboardSidebar />
      <main className="flex flex-col h-screen w-screen bg-muted">
        {children}
      </main>
    </SidebarProvider>
  );
};

export default DashboardLayout;
