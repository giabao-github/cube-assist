import { ReactNode } from "react";

interface RegisterLayoutProps {
  children: ReactNode;
}

const RegisterLayout = ({ children }: RegisterLayoutProps) => {
  return (
    <div className="flex justify-center items-center py-12 md:py-0 bg-radial from-custom-800 via-custom-700 to-custom-700 md:bg-none min-h-svh md:flex-col md:p-9">
      <div className="w-full max-w-sm md:max-w-[1200px]">{children}</div>
    </div>
  );
};

export default RegisterLayout;
