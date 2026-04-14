"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound, LoaderCircle } from "lucide-react";
import { useActionState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { FormMessage } from "@/components/shared/form-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { initialActionState } from "@/lib/action-state";
import { verifyOtpAction } from "@/features/auth/actions";

const formSchema = z.object({
  token: z.string().min(6, "Enter the 6-digit OTP code."),
});

type FormValues = z.infer<typeof formSchema>;

export function VerifyOtpForm({
  email,
  next,
}: {
  email: string;
  next?: string;
}) {
  const [state, formAction] = useActionState(verifyOtpAction, initialActionState);
  const [isPending, startTransition] = useTransition();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      token: "",
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    const data = new FormData();
    data.set("email", email);
    data.set("token", values.token);

    if (next) {
      data.set("next", next);
    }

    startTransition(() => formAction(data));
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <label
          htmlFor="token"
          className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground"
        >
          One-time password
        </label>
        <div className="relative">
          <KeyRound className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="token"
            inputMode="numeric"
            maxLength={6}
            placeholder="123456"
            className="pl-10 text-lg tracking-[0.4em]"
            {...form.register("token")}
          />
        </div>
        {form.formState.errors.token ? (
          <p className="text-sm text-destructive">
            {form.formState.errors.token.message}
          </p>
        ) : null}
      </div>

      <FormMessage message={state.message} success={state.success} />

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? <LoaderCircle className="animate-spin" /> : null}
        Verify and continue
      </Button>
    </form>
  );
}
