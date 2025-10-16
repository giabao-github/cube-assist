import { ReactNode } from "react";

interface CallLayoutProps {
  children: ReactNode;
}

const CallLayout = ({ children }: CallLayoutProps) => {
  return <div className="min-h-[100dvh] h-screen bg-black">{children}</div>;
};

export default CallLayout;
