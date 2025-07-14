"use client";

import { FC, useEffect, useMemo, useRef } from "react";
import { flushSync } from "react-dom";

import { Menu, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

import ActionButton from "@/components/home/action-button";
import Logo from "@/components/home/logo";
import NavLink from "@/components/home/nav-link";
import { Button } from "@/components/ui/button";

import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

import { DashboardUserButton } from "@/modules/dashboard/ui/components/dashboard-user-button";

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

  const dropdownRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }
    const handleClickOutside = (event: PointerEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        menuButtonRef.current &&
        !menuButtonRef.current.contains(event.target as Node)
      ) {
        if (setIsMenuOpen) {
          setIsMenuOpen(false);
        }
      }
    };
    document.addEventListener("pointerdown", handleClickOutside, true);
    return () => {
      document.removeEventListener("pointerdown", handleClickOutside, true);
    };
  }, [isMenuOpen, setIsMenuOpen]);

  return (
    <header className="fixed top-0 z-30 w-screen border-b border-gray-200 shadow-sm backdrop-blur-md bg-neutral-50">
      <div className="container px-4 py-1 mx-auto md:py-3 md:px-6 lg:px-8">
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
            <div className="hidden text-white rounded-lg md:flex bg-custom-700">
              <DashboardUserButton />
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
            ref={menuButtonRef}
            type="button"
            className="p-2 rounded-lg transition-colors md:hidden hover:bg-custom-900 active:bg-custom-900"
            onClick={() => {
              if (setIsMenuOpen) {
                flushSync(() => {
                  setIsMenuOpen(!isMenuOpen);
                });
              }
            }}
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
        ref={dropdownRef}
        className={cn(
          "overflow-hidden bg-gradient-to-b to-white rounded-b-2xl transition-all duration-200 ease-in-out from-custom-100/60 via-custom-100/40",
          isMenuOpen
            ? "opacity-100 translate-y-0 max-h-[400px]"
            : "max-h-0 opacity-0 -translate-y-2 pointer-events-none",
        )}
        style={{
          transform: isMenuOpen
            ? "translateY(0) translateZ(0)"
            : "translateY(-8px) translateZ(0)",
          willChange: "transform, opacity, max-height",
        }}
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
            {session ? (
              <div className="text-white rounded-lg bg-custom-700">
                <DashboardUserButton />
              </div>
            ) : (
              <div className="flex flex-row gap-x-6 justify-center pt-4 tracking-wide border-t border-gray-200">
                <ActionButton
                  variant="secondary"
                  onClick={() => router.push("/login")}
                  className="w-2/5"
                >
                  Log in
                </ActionButton>
                <ActionButton
                  variant="primary"
                  onClick={() => router.push("/register")}
                  className="w-2/5"
                >
                  Sign up
                </ActionButton>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
