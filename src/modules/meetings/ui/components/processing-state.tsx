import { EmptyState } from "@/components/states/empty-state";

export const ProcessingState = () => {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-5 bg-white rounded-lg gap-y-8">
      <EmptyState
        imageSrc="/processing.svg"
        title="This meeting has been completed"
        description="A summary of this meeting will appear soon"
      />
    </div>
  );
};
