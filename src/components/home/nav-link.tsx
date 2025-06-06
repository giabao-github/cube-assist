import { FC, ReactNode } from "react";

import Link from "next/link";

interface NavLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

const NavLink: FC<NavLinkProps> = ({
  href,
  children,
  className = "",
  onClick,
}) => (
  <Link
    href={href}
    onClick={onClick}
    className={`text-custom-600 hover:text-custom-900 active:text-custom-700 text-base md:text-xl font-bold transition-colors select-none ${className}`}
  >
    {children}
  </Link>
);

export default NavLink;
