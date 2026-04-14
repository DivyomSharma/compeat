"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle, Mail, User } from "lucide-react";
import { useActionState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { FormMessage } from "@/components/shared/form-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { initialActionState } from "@/lib/action-state";
import { sendMagicLinkAction } from "@/features/auth/actions";

const formSchema = z.object({
  name: z.string().min(2, "Please enter your full name."),
  email: z.string().email("Enter a valid institutional email address."),
});

type FormValues = z.infer<typeof formSchema>;

export function MagicLinkForm({ next }: { next?: string }) {
  const [state, formAction] = useActionState(sendMagicLinkAction, initialActionState);
  const [isPending, startTransition] = useTransition();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", email: "" },
  });

  const onSubmit = form.handleSubmit((values) => {
    const data = new FormData();
    data.set("name", values.name);
    data.set("email", values.email);
    if (next) data.set("next", next);
    startTransition(() => formAction(data));
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <label
          htmlFor="name"
          className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground"
        >
          Full name
        </label>
        <div className="relative">
          <User className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="name"
            type="text"
            autoComplete="name"
            placeholder="Jane Doe"
            className="pl-10"
            {...form.register("name")}
          />
        </div>
        {form.formState.errors.name ? (
          <p className="text-sm text-destructive">
            {form.formState.errors.name.message}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label
          htmlFor="email"
          className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground"
        >
          Campus email
        </label>
        <div className="relative">
          <Mail className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@college.edu"
            className="pl-10"
            {...form.register("email")}
          />
        </div>
        {form.formState.errors.email ? (
          <p className="text-sm text-destructive">
            {form.formState.errors.email.message}
          </p>
        ) : null}
      </div>

      <FormMessage message={state.message} success={state.success} />

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? <LoaderCircle className="animate-spin" /> : <Mail />}
        Send magic link
      </Button>
    </form>
  );
}
