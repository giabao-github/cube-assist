"use client";

import { FC } from "react";

import Image from "next/image";
import { useRouter } from "next/navigation";

interface LogoProps {
  className?: string;
  isWhite?: boolean;
  isUppercase?: boolean;
}

const Logo: FC<LogoProps> = ({
  className = "",
  isWhite = false,
  isUppercase = false,
}) => {
  const router = useRouter();

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <div
        onClick={() => router.push("/")}
        className="flex items-center justify-center w-10 h-10 cursor-pointer select-none bg-gradient-to-br from-custom-500 to-custom-900 rounded-xl focus-visible:outline-none"
      >
        <Image
          src={isWhite ? "/white-logo.svg" : "/logo.svg"}
          alt="Logo"
          width={32}
          height={32}
          priority
          className="h-7 w-7"
        />
      </div>
      <div
        className={`text-xl font-extrabold tracking-[0.01em] select-none focus-visible:outline-none ${isWhite ? "text-white" : "text-custom-900"} ${isUppercase ? "uppercase" : ""}`}
      >
        Cube Assist
      </div>
    </div>
  );
};

export default Logo;
