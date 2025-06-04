import { headers } from "next/headers";
import { type RedirectType, redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { DashboardView } from "@/modules/dashboard/ui/views/dashboard-view";

const DashboardPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/", "replace" as RedirectType);
  }

  return <DashboardView />;
};

export default DashboardPage;
