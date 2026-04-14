"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Building2, LoaderCircle, Search } from "lucide-react";
import { useActionState, useMemo, useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { FormMessage } from "@/components/shared/form-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { initialActionState } from "@/lib/action-state";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { onboardSchoolAction } from "@/features/onboarding/actions";
import type { School } from "@/lib/types";

const formSchema = z.object({
  mode: z.enum(["create", "join"]),
  schoolId: z.string().optional(),
  schoolName: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function OnboardingForm({ schools }: { schools: School[] }) {
  const [state, formAction] = useActionState(
    onboardSchoolAction,
    initialActionState
  );
  const [isPending, startTransition] = useTransition();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      mode: "join",
      schoolId: schools[0]?.id,
      schoolName: "",
      city: "",
      country: "India",
      description: "",
    },
  });

  const mode = useWatch({ control: form.control, name: "mode" });
  const schoolOptions = useMemo(() => schools, [schools]);

  const onSubmit = form.handleSubmit((values) => {
    const data = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      if (value) {
        data.set(key, value);
      }
    });

    startTransition(() => formAction(data));
  });

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid gap-3 md:grid-cols-2">
        <button
          type="button"
          className={`rounded-md border-[3px] p-4 text-left ${
            mode === "join"
              ? "border-border bg-primary text-primary-foreground shadow-[6px_6px_0_0_var(--border)]"
              : "border-border bg-card shadow-[6px_6px_0_0_var(--border)]"
          }`}
          onClick={() => form.setValue("mode", "join")}
        >
          <Search className="mb-3 size-5" />
          <div className="font-heading text-xl font-black uppercase">
            Join existing
          </div>
          <p className="mt-2 text-sm opacity-80">
            Choose a campus already using Compeat and continue as a student
            member.
          </p>
        </button>

        <button
          type="button"
          className={`rounded-md border-[3px] p-4 text-left ${
            mode === "create"
              ? "border-border bg-secondary text-secondary-foreground shadow-[6px_6px_0_0_var(--border)]"
              : "border-border bg-card shadow-[6px_6px_0_0_var(--border)]"
          }`}
          onClick={() => form.setValue("mode", "create")}
        >
          <Building2 className="mb-3 size-5" />
          <div className="font-heading text-xl font-black uppercase">
            Create campus
          </div>
          <p className="mt-2 text-sm opacity-80">
            Onboard a new school or college and start with admin access.
          </p>
        </button>
      </div>

      {mode === "join" ? (
        <div className="space-y-2">
          <label className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
            School
          </label>
          <Select
            defaultValue={form.getValues("schoolId")}
            onValueChange={(value) => form.setValue("schoolId", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select your institution" />
            </SelectTrigger>
            <SelectContent>
              {schoolOptions.map((school) => (
                <SelectItem key={school.id} value={school.id}>
                  {school.name} · {school.city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <label className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Institution name
            </label>
            <Input
              placeholder="Comet Engineering College"
              {...form.register("schoolName")}
            />
          </div>
          <div className="space-y-2">
            <label className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
              City
            </label>
            <Input placeholder="Hyderabad" {...form.register("city")} />
          </div>
          <div className="space-y-2">
            <label className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Country
            </label>
            <Input placeholder="India" {...form.register("country")} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Short description
            </label>
            <Textarea
              placeholder="Tell students what makes this campus event community special."
              {...form.register("description")}
            />
          </div>
        </div>
      )}

      <FormMessage message={state.message} success={state.success} />

      <Button type="submit" className="w-full md:w-auto" disabled={isPending}>
        {isPending ? <LoaderCircle className="animate-spin" /> : <ArrowRight />}
        Continue to Compeat
      </Button>
    </form>
  );
}
