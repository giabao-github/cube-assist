import { EmptyState } from "@/components/states/empty-state";

export const CancelledState = () => {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-5 bg-white rounded-lg gap-y-8">
      <EmptyState
        imageSrc="/cancelled.svg"
        title="This meeting has been cancelled"
        description="You cannot join this meeting"
      />
    </div>
  );
};
