"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle, Send } from "lucide-react";
import { useActionState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { FormMessage } from "@/components/shared/form-message";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { initialActionState } from "@/lib/action-state";
import {
  registerForEventAction,
} from "@/features/events/actions";
import type { Registration } from "@/lib/types";

const formSchema = z.object({
  notes: z.string().max(140, "Keep the notes short.").optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function EventRegistrationForm({
  eventId,
  registration,
}: {
  eventId: string;
  registration: Registration | null;
}) {
  const [state, formAction] = useActionState(
    registerForEventAction,
    initialActionState
  );
  const [isPending, startTransition] = useTransition();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      notes: registration?.notes || "",
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    const data = new FormData();
    data.set("eventId", eventId);
    data.set("notes", values.notes || "");
    startTransition(() => formAction(data));
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Team note or context
        </label>
        <Textarea
          placeholder="Optional: team name, participation note, or accessibility requests."
          {...form.register("notes")}
        />
      </div>
      <FormMessage
        message={
          state.message ||
          (registration ? `Current status: ${registration.status}` : "")
        }
        success={Boolean(registration) || state.success}
      />
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? <LoaderCircle className="animate-spin" /> : <Send />}
        {registration ? "Update registration" : "Register now"}
      </Button>
    </form>
  );
}
