import { Metadata } from "next";
import { headers } from "next/headers";
import { RedirectType, redirect } from "next/navigation";

import { auth } from "@/lib/auth/auth";

import { DashboardView } from "@/modules/dashboard/ui/views/dashboard-view";

export const metadata: Metadata = {
  title: "Dashboard - Cube Assist",
};

const DashboardPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login", RedirectType.replace);
  }

  return <DashboardView />;
};

export default DashboardPage;
