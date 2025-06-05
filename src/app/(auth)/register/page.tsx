import { Metadata } from "next";

import { RegisterView } from "@/modules/auth/ui/views/register-view";

export const metadata: Metadata = {
  title: "Sign up - Cube Assist",
};

const RegisterPage = () => {
  return <RegisterView />;
};

export default RegisterPage;
