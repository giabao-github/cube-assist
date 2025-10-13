import { JSX, useState } from "react";

import { Button } from "@/components/ui/button";
import { ResponsiveDialog } from "@/components/utils/responsive-dialog";

import { cn } from "@/lib/utils";

export const useConfirm = (
  title: string,
  description: string,
  action?: string,
  danger?: boolean,
): [() => JSX.Element, () => Promise<boolean>] => {
  const [promise, setPromise] = useState<{
    resolve: (value: boolean) => void;
  } | null>(null);

  const confirm = () => {
    return new Promise<boolean>((resolve) => {
      setPromise({ resolve });
    });
  };

  const handleClose = () => {
    promise?.resolve(false);
    setPromise(null);
  };

  const handleConfirm = () => {
    promise?.resolve(true);
    handleClose();
  };

  const handleCancel = () => {
    promise?.resolve(false);
    handleClose();
  };

  const ConfirmationDialog = () => (
    <ResponsiveDialog
      open={promise !== null}
      onOpenChange={handleClose}
      title={title}
      description={description}
    >
      <div className="flex flex-col-reverse items-center justify-end w-full pt-4 gap-y-2 lg:flex-row gap-x-2">
        <Button
          onClick={handleCancel}
          variant="outline"
          className="w-full lg:w-auto"
        >
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          className={cn(
            "w-full lg:w-auto",
            danger && "bg-rose-500 hover:bg-rose-600 active:bg-rose-700",
          )}
        >
          {action || "Confirm"}
        </Button>
      </div>
    </ResponsiveDialog>
  );

  return [ConfirmationDialog, confirm];
};
