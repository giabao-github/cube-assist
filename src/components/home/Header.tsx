"use client";

import { FC, useEffect, useMemo } from "react";

import { Menu, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

import ActionButton from "@/components/home/ActionButton";
import Logo from "@/components/home/Logo";
import NavLink from "@/components/home/NavLink";
import { Button } from "@/components/ui/button";

import { authClient } from "@/lib/auth-client";

interface HeaderProps {
  isMenuOpen?: boolean;
  setIsMenuOpen?: (isMenuOpen: boolean) => void;
}
const Header: FC<HeaderProps> = ({ isMenuOpen, setIsMenuOpen }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = authClient.useSession();
  const dashboardLink = useMemo(() => {
    if (session) {
      return "/dashboard";
    } else {
      return "/login";
    }
  }, [session]);

  useEffect(() => {
    if (!session && pathname.includes("/dashboard")) {
      window.location.replace("/");
    }
  }, [pathname, session]);

  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 shadow-sm bg-neutral-50 backdrop-blur-md">
      <div className="container px-4 py-1 mx-auto sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Logo />

          {/* Desktop Navigation */}
          <nav className="items-center hidden space-x-28 md:flex">
            {["Dashboard", "Pricing", "FAQ", "Contact"].map((item) => (
              <NavLink
                key={item}
                href={`${item.toLowerCase() === "dashboard" ? dashboardLink : `#${item.toLowerCase()}`}`}
              >
                {item}
              </NavLink>
            ))}
          </nav>

          {/* Auth Buttons */}
          <div className="items-center hidden space-x-4 tracking-wide md:flex">
            <ActionButton
              variant="secondary"
              onClick={() => router.push("/login")}
              className="text-base px-6 py-5"
            >
              Log in
            </ActionButton>
            <ActionButton
              variant="primary"
              onClick={() => router.push("/register")}
              className="text-base px-6 py-5"
            >
              Sign up
            </ActionButton>
          </div>

          {/* Mobile Menu Button */}
          <Button
            type="button"
            className="p-2 transition-colors rounded-lg cursor-pointer md:hidden hover:bg-custom-900 active:bg-custom-900"
            onClick={() => setIsMenuOpen && setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X
                strokeWidth={3}
                className="w-6 h-6 text-current hover:text-white active:text-white"
              />
            ) : (
              <Menu className="w-6 h-6 text-current hover:text-white active:text-white" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`bg-gradient-to-b from-custom-100/60 via-custom-100/40 to-white rounded-b-2xl overflow-hidden transition-all duration-300 ease-in-out ${
          isMenuOpen ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="border-t border-gray-200 shadow-lg md:hidden">
          <div className="container px-4 py-6 mx-auto space-y-6">
            <nav className="flex flex-col space-y-4">
              {["Dashboard", "Pricing", "FAQ", "Contact"].map((item) => (
                <NavLink
                  key={item}
                  href={`${item.toLowerCase() === "dashboard" ? dashboardLink : `#${item.toLowerCase()}`}`}
                  className="py-2"
                  onClick={() => setIsMenuOpen && setIsMenuOpen(false)}
                >
                  {item}
                </NavLink>
              ))}
            </nav>
            <div className="flex flex-col pt-4 space-y-6 tracking-wide border-t border-gray-200">
              <ActionButton
                variant="secondary"
                onClick={() => router.push("/login")}
                className="w-full"
              >
                Log in
              </ActionButton>
              <ActionButton
                variant="primary"
                onClick={() => router.push("/register")}
                className="w-full"
              >
                Sign up
              </ActionButton>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
