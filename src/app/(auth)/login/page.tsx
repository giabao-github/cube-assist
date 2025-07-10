import type { Metadata } from "next";
import { headers } from "next/headers";
import { RedirectType, redirect } from "next/navigation";

import { auth } from "@/lib/auth";

import { LoginView } from "@/modules/auth/ui/views/login-view";

export const metadata: Metadata = {
  title: "Sign in - Cube Assist",
};

const LoginPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) {
    redirect("/dashboard", "replace" as RedirectType);
  }

  return <LoginView />;
};

export default LoginPage;
