import { Metadata } from "next";
import { headers } from "next/headers";
import { RedirectType, redirect } from "next/navigation";

import { auth } from "@/lib/auth";

import { RegisterView } from "@/modules/auth/ui/views/register-view";

export const metadata: Metadata = {
  title: "Sign up - Cube Assist",
};

const RegisterPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) {
    redirect("/dashboard", "replace" as RedirectType);
  }

  return <RegisterView />;
};

export default RegisterPage;
