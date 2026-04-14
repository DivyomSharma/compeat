"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle, Plus } from "lucide-react";
import { useActionState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { FormMessage } from "@/components/shared/form-message";
import { Button } from "@/components/ui/button";
import { initialActionState } from "@/lib/action-state";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createClubAction } from "@/features/clubs/actions";

const formSchema = z.object({
  name: z.string().min(2, "Club name must be at least 2 characters."),
  category: z.string().min(2, "Enter a category."),
  description: z.string().min(12, "Share a quick club description."),
  contactEmail: z.string().email("Enter a valid club email."),
});

type FormValues = z.infer<typeof formSchema>;

export function CreateClubDialog() {
  const [state, formAction] = useActionState(createClubAction, initialActionState);
  const [isPending, startTransition] = useTransition();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      category: "",
      description: "",
      contactEmail: "",
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    const data = new FormData();
    Object.entries(values).forEach(([key, value]) => data.set(key, value));
    startTransition(() => formAction(data));
  });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <Plus />
          Create club
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a club</DialogTitle>
          <DialogDescription>
            Set up a new campus club with its own members, roles, and events.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Club name
            </label>
            <Input placeholder="Code Forge" {...form.register("name")} />
          </div>
          <div className="space-y-2">
            <label className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Category
            </label>
            <Input placeholder="Technology" {...form.register("category")} />
          </div>
          <div className="space-y-2">
            <label className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Contact email
            </label>
            <Input
              placeholder="club@campus.edu"
              {...form.register("contactEmail")}
            />
          </div>
          <div className="space-y-2">
            <label className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Description
            </label>
            <Textarea
              placeholder="What does this club run, and why should members join?"
              {...form.register("description")}
            />
          </div>
          <FormMessage message={state.message} success={state.success} />
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? <LoaderCircle className="animate-spin" /> : <Plus />}
            Publish club
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
