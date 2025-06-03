import { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode; 
}

/* 
  Error codes:
    INVALID_EMAIL
    PASSWORD_TOO_SHORT
    USER_ALREADY_EXISTS
    INVALID_EMAIL_OR_PASSWORD
    PROVIDER_NOT_FOUND
*/

const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-3xl">
        {children}
      </div>
    </div>
  );
}

export default AuthLayout;