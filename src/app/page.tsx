import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { DashboardView } from "@/modules/dashboard/ui/views/dashboard-view";
import HomeView from "@/modules/home/ui/views/home-view";

const HomePage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return <HomeView />;
  }

  return <DashboardView />;
};

export default HomePage;
