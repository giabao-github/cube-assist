import { Dispatch, SetStateAction } from "react";

import {
  CommandInput,
  CommandItem,
  CommandList,
  ResponsiveCommandDialog,
} from "@/components/ui/command";

interface DashboardCommandProps {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}
export const DashboardCommand = ({ open, setOpen }: DashboardCommandProps) => {
  return (
    <ResponsiveCommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Find a meeting or agent" />
      <CommandList>
        <CommandItem>Test</CommandItem>
      </CommandList>
    </ResponsiveCommandDialog>
  );
};
