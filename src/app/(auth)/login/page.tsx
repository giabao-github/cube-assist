import type { Metadata } from "next";
import { headers } from "next/headers";
import { RedirectType, redirect } from "next/navigation";

import { auth } from "@/lib/auth/auth";

import { LoginView } from "@/modules/auth/ui/views/login-view";

export const metadata: Metadata = {
  title: "Sign in - Cube Assist",
};

export const dynamic = "force-dynamic";

const LoginPage = async () => {
  let session;

  try {
    session = await auth.api.getSession({
      headers: await headers(),
    });
  } catch (error) {
    console.error("Session retrieval failed:", error);
    return <LoginView />;
  }

  if (session) {
    redirect("/dashboard", "replace" as RedirectType);
  }

  return <LoginView />;
};

export default LoginPage;
