import type { Metadata } from "next";

import { LoginView } from "@/modules/auth/ui/views/login-view";

export const metadata: Metadata = {
  title: "Sign in - Cube Assist",
};

const LoginPage = () => {
  return <LoginView />;
};

export default LoginPage;
