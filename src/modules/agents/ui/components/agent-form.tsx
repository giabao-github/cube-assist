import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { GeneratedAvatar } from "@/components/utils/generated-avatar";

import { normalizeInput } from "@/lib/helper/utils";
import { rToast } from "@/lib/toast-utils";

import { AgentGetOne } from "@/modules/agents/types";
import { agentsInsertSchema } from "@/modules/agents/zod-schema";

import { useTRPC } from "@/trpc/client";

interface AgentFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  initialValues?: AgentGetOne;
}

export const AgentForm = ({
  onSuccess,
  onCancel,
  initialValues,
}: AgentFormProps) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { data } = useSuspenseQuery(trpc.agents.getMany.queryOptions({}));

  const createAgentFormSchema = (
    existingAgents: typeof data,
    editingAgentId?: string,
  ) => {
    return agentsInsertSchema.refine(
      (values) => {
        // Skip validation if we're editing the same agent
        if (editingAgentId && existingAgents) {
          const editingAgent = existingAgents.items.find(
            (agent) => agent.id === editingAgentId,
          );
          if (editingAgent && editingAgent.name === values.name) {
            return true;
          }
        }

        const nameExists = existingAgents?.items.some(
          (agent) => agent.name === values.name,
        );
        return !nameExists;
      },
      {
        message: "An agent with this name already exists",
        path: ["name"],
      },
    );
  };

  const createAgent = useMutation(
    trpc.agents.create.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(
          trpc.agents.getMany.queryOptions({}),
        );

        // TODO: invalidate free tier usage

        onSuccess?.();
      },
      onError: (error) => {
        rToast.error(error.message);
        // TODO: Check if error code is "FORBIDDEN", redirect to "/upgrade"
      },
    }),
  );

  const updateAgent = useMutation(
    trpc.agents.update.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(
          trpc.agents.getMany.queryOptions({}),
        );

        if (initialValues?.id) {
          await queryClient.invalidateQueries(
            trpc.agents.getOne.queryOptions({ id: initialValues.id }),
          );
        }

        onSuccess?.();
      },
      onError: (error) => {
        rToast.error(error.message);
        // TODO: Check if error code is "FORBIDDEN", redirect to "/upgrade"
      },
    }),
  );

  const form = useForm<z.infer<typeof agentsInsertSchema>>({
    resolver: zodResolver(createAgentFormSchema(data, initialValues?.id)),
    defaultValues: {
      name: initialValues?.name ?? "",
      instructions: initialValues?.instructions ?? "",
    },
  });

  const isEdit = Boolean(initialValues?.id);
  const isPending = createAgent.isPending || updateAgent.isPending;

  const handleRightArrowKeyPress = (
    event: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>,
    placeholder: string,
    fieldName: keyof z.infer<typeof agentsInsertSchema>,
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

  const onSubmit = (values: z.infer<typeof agentsInsertSchema>) => {
    if (isEdit && initialValues?.id) {
      updateAgent.mutate({ ...values, id: initialValues.id });
    } else {
      createAgent.mutate(values);
    }
  };

  return (
    <Form {...form}>
      <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
        <GeneratedAvatar
          seed={form.watch("name")}
          variant="botttsNeutral"
          className="border size-16"
        />
        <div className="block text-xs text-muted-foreground">
          Tip: Press → (Right Arrow) in an empty field to autofill the
          placeholder.
        </div>
        <FormField
          name="name"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="mb-1 text-sm md:text-base">Name</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Coding assistant"
                  className="text-sm"
                  onKeyDown={(e) =>
                    handleRightArrowKeyPress(e, "Coding assistant", "name")
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
          name="instructions"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="mb-1 text-sm md:text-base">
                Instructions
              </FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="You are a senior coding assistant that can answers technology questions, helps resolving bugs, or generate implementation ideas"
                  className="text-sm"
                  onKeyDown={(e) =>
                    handleRightArrowKeyPress(
                      e,
                      "You are a senior coding assistant that can answers technology questions, helps resolving bugs, or generate implementation ideas",
                      "instructions",
                    )
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
  );
};
