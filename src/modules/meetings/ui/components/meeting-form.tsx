import { useState } from "react";
import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  useMutation,
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { CommandSelect } from "@/components/utils/command-select";
import { GeneratedAvatar } from "@/components/utils/generated-avatar";

import { normalizeInput } from "@/lib/utils";

import { NewAgentDialog } from "@/modules/agents/ui/components/new-agent-dialog";
import { MeetingGetOne } from "@/modules/meetings/types";
import { meetingsInsertSchema } from "@/modules/meetings/zod-schema";

import { useTRPC } from "@/trpc/client";

interface MeetingFormProps {
  onSuccess?: (id?: string) => void;
  onCancel?: () => void;
  initialValues?: MeetingGetOne;
}

export const MeetingForm = ({
  onSuccess,
  onCancel,
  initialValues,
}: MeetingFormProps) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const [openNewAgentDialog, setOpenNewAgentDialog] = useState(false);
  const [agentSearch, setAgentSearch] = useState("");

  const { data } = useSuspenseQuery(trpc.meetings.getMany.queryOptions({}));
  const agents = useQuery(
    trpc.agents.getMany.queryOptions({
      pageSize: 100,
      search: agentSearch,
    }),
  );

  const createMeetingFormSchema = (
    existingMeetings: typeof data,
    editingMeetingId?: string,
  ) => {
    return meetingsInsertSchema.refine(
      (values) => {
        // Skip validation if we're editing the same meeting
        if (editingMeetingId && existingMeetings) {
          const editingMeeting = existingMeetings.items.find(
            (meeting) => meeting.id === editingMeetingId,
          );
          if (editingMeeting && editingMeeting.name === values.name) {
            return true;
          }
        }

        const nameExists = existingMeetings?.items.some(
          (meeting) => meeting.name === values.name,
        );
        return !nameExists;
      },
      {
        message: "A meeting with this name already exists",
        path: ["name"],
      },
    );
  };

  const createMeeting = useMutation(
    trpc.meetings.create.mutationOptions({
      onSuccess: async (data) => {
        await queryClient.invalidateQueries(
          trpc.meetings.getMany.queryOptions({}),
        );

        // TODO: invalidate free tier usage

        onSuccess?.(data.id);
      },
      onError: (error) => {
        toast.error(error.message);
        // TODO: Check if error code is "FORBIDDEN", redirect to "/upgrade"
      },
    }),
  );

  const updateMeeting = useMutation(
    trpc.meetings.update.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(
          trpc.meetings.getMany.queryOptions({}),
        );

        if (initialValues?.id) {
          await queryClient.invalidateQueries(
            trpc.meetings.getOne.queryOptions({ id: initialValues.id }),
          );
        }

        onSuccess?.();
      },
      onError: (error) => {
        toast.error(error.message);
        // TODO: Check if error code is "FORBIDDEN", redirect to "/upgrade"
      },
    }),
  );

  const form = useForm<z.infer<typeof meetingsInsertSchema>>({
    resolver: zodResolver(createMeetingFormSchema(data, initialValues?.id)),
    defaultValues: {
      name: initialValues?.name ?? "",
      agentId: initialValues?.agentId ?? "",
    },
  });

  const isEdit = Boolean(initialValues?.id);
  const isPending = createMeeting.isPending || updateMeeting.isPending;

  const handleRightArrowKeyPress = (
    event: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>,
    placeholder: string,
    fieldName: keyof z.infer<typeof meetingsInsertSchema>,
  ) => {
    const currentValue = form.getValues(fieldName);
    if (
      (currentValue === "" || currentValue.trim() === "") &&
      event.key === "ArrowRight"
    ) {
      event.preventDefault();
      form.setValue(fieldName, placeholder);
    }
  };

  const onSubmit = (values: z.infer<typeof meetingsInsertSchema>) => {
    if (isEdit && initialValues?.id) {
      updateMeeting.mutate({ ...values, id: initialValues.id });
    } else {
      createMeeting.mutate(values);
    }
  };

  return (
    <>
      <NewAgentDialog
        open={openNewAgentDialog}
        onOpenChange={setOpenNewAgentDialog}
      />
      <Form {...form}>
        <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="block text-xs text-muted-foreground">
            Tip: Press → (Right Arrow) in an empty field to autofill the
            placeholder.
          </div>
          <FormField
            name="name"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="mb-1 text-sm md:text-base">
                  Name
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Car Workshop"
                    className="text-sm"
                    onKeyDown={(e) =>
                      handleRightArrowKeyPress(e, "Car Workshop", "name")
                    }
                    onBlur={() =>
                      form.setValue(field.name, normalizeInput(field.value))
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="agentId"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="mb-1 text-sm md:text-base">
                  Agent
                </FormLabel>
                <FormControl>
                  <CommandSelect
                    options={(agents.data?.items ?? []).map((agent) => ({
                      id: agent.id,
                      value: agent.id,
                      children: (
                        <div className="flex items-center gap-x-2">
                          <GeneratedAvatar
                            seed={agent.name}
                            variant="botttsNeutral"
                            className="border size-6"
                          />
                          <span>{agent.name}</span>
                        </div>
                      ),
                    }))}
                    onSelect={field.onChange}
                    onSearch={setAgentSearch}
                    value={field.value}
                    placeholder="Select an agent"
                    label="agents"
                  />
                </FormControl>
                <FormDescription className="p-1">
                  Do not see any suitable agents?{" "}
                  <button
                    title="Create a new agent"
                    type="button"
                    className="text-custom-600 hover:underline"
                    onClick={() => setOpenNewAgentDialog(true)}
                  >
                    Create a new agent
                  </button>
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-between gap-x-2">
            {onCancel && (
              <Button
                variant="outline"
                disabled={isPending}
                type="button"
                onClick={onCancel}
              >
                Cancel
              </Button>
            )}
            <Button disabled={isPending} type="submit">
              {isEdit ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
};
