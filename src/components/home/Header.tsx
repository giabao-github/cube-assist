"use client";

import { FC, useEffect, useMemo } from "react";
import { RxDividerVertical } from "react-icons/rx";

import { Menu, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";

import ActionButton from "@/components/home/action-button";
import Logo from "@/components/home/logo";
import NavLink from "@/components/home/nav-link";
import { Button } from "@/components/ui/button";

import { lexend } from "@/config/fonts";

import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

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
    <header className="sticky top-0 z-30 border-b border-gray-200 shadow-sm backdrop-blur-md bg-neutral-50">
      <div className="container px-4 py-1 mx-auto sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Logo />

          {/* Desktop Navigation */}
          <nav className="hidden items-center space-x-28 md:flex">
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
          {session ? (
            <div
              className={cn(
                "hidden items-center md:flex space-x-3",
                lexend.className,
              )}
            >
              <div className="flex flex-row gap-x-2 tracking-tight">
                <p>Hello,</p>
                <p className="font-medium">{session.user.name}</p>
              </div>
              <RxDividerVertical strokeWidth={1} />
              <Button
                variant="link"
                className="px-0 text-base tracking-wide"
                onClick={async () => {
                  try {
                    await authClient.signOut();
                  } catch (error) {
                    console.error("Sign out failed:", error);
                    toast.error("Sign out failed", {
                      description: "Please try again or reload the page",
                    });
                  }
                }}
              >
                Sign out
              </Button>
            </div>
          ) : (
            <div className="hidden items-center space-x-4 tracking-wide md:flex">
              <ActionButton
                variant="secondary"
                onClick={() => router.push("/login")}
                className="px-6 py-5 text-base"
              >
                Log in
              </ActionButton>
              <ActionButton
                variant="primary"
                onClick={() => router.push("/register")}
                className="px-6 py-5 text-base"
              >
                Sign up
              </ActionButton>
            </div>
          )}

          {/* Mobile Menu Button */}
          <Button
            type="button"
            className="p-2 rounded-lg transition-colors md:hidden hover:bg-custom-900 active:bg-custom-900"
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
          isMenuOpen ? "opacity-100 max-h-[400px]" : "max-h-0 opacity-0"
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
