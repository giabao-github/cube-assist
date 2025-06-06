"use client";

import { useEffect, useState } from "react";

import { PanelLeftCloseIcon, PanelLeftOpenIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { SearchBar } from "@/components/utils/search-bar";

import { DashboardCommand } from "@/modules/dashboard/ui/components/dashboard-command";

export const DashboardNavbar = () => {
  const { state, toggleSidebar, isMobile } = useSidebar();
  const [commandOpen, setCommandOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCommandOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <>
      <DashboardCommand open={commandOpen} setOpen={setCommandOpen} />
      <nav className="flex items-center px-4 py-3 border-b gap-x-2 md:gap-x-4 bg-background">
        <Button className="size-9" variant="outline" onClick={toggleSidebar}>
          {state === "collapsed" || isMobile ? (
            <PanelLeftOpenIcon className="size-4" />
          ) : (
            <PanelLeftCloseIcon className="size-4" />
          )}
        </Button>
        {/* <Button
          onClick={() => setCommandOpen((open) => !open)}
          variant="outline"
          size="sm"
          className="justify-start w-4/5 space-x-1 font-normal h-9 md:w-96 text-muted-foreground hover:text-muted-foreground"
        >
          <SearchIcon />
          <span>Search</span>
          <kbd className="inline-flex items-center h-5 gap-1 ml-auto border rounded pointer-events-none select-none bg-muted px-1.5 text-[12px] font-medium text-muted-foreground">
            <span className="text-xs">&#8984;</span>K
          </kbd>
        </Button> */}
        <SearchBar />
      </nav>
    </>
  );
};
