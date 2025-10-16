import { Metadata } from "next";
import { headers } from "next/headers";
import { RedirectType, redirect } from "next/navigation";

import { auth } from "@/lib/auth/auth";

import { RegisterView } from "@/modules/auth/ui/views/register-view";

export const metadata: Metadata = {
  title: "Sign up - Cube Assist",
};

export const dynamic = "force-dynamic";

const RegisterPage = async () => {
  let session;

  try {
    session = await auth.api.getSession({
      headers: await headers(),
    });
  } catch (error) {
    console.error("Session retrieval failed:", error);
    return <RegisterView />;
  }

  if (session) {
    redirect("/dashboard", "replace" as RedirectType);
  }

  return <RegisterView />;
};

export default RegisterPage;
