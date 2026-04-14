"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle, UserPlus } from "lucide-react";
import { useActionState, useTransition } from "react";
import { useForm } from "react-hook-form";
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
import {
  addClubMemberAction,
} from "@/features/clubs/actions";

const formSchema = z.object({
  email: z.string().email("Enter the member's email."),
  role: z.enum(["club_president", "vice_president", "club_member"]),
});

type FormValues = z.infer<typeof formSchema>;

export function AddClubMemberForm({ clubId }: { clubId: string }) {
  const [state, formAction] = useActionState(
    addClubMemberAction,
    initialActionState
  );
  const [isPending, startTransition] = useTransition();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      role: "club_member",
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    const data = new FormData();
    data.set("clubId", clubId);
    data.set("email", values.email);
    data.set("role", values.role);
    startTransition(() => formAction(data));
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-[1fr_220px]">
        <div className="space-y-2">
          <label className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Member email
          </label>
          <Input placeholder="student@college.edu" {...form.register("email")} />
        </div>
        <div className="space-y-2">
          <label className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Role
          </label>
          <Select
            defaultValue={form.getValues("role")}
            onValueChange={(value) =>
              form.setValue(
                "role",
                value as "club_president" | "vice_president" | "club_member"
              )
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Choose role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="club_president">Club president</SelectItem>
              <SelectItem value="vice_president">Vice president</SelectItem>
              <SelectItem value="club_member">Club member</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <FormMessage message={state.message} success={state.success} />

      <Button type="submit" disabled={isPending}>
        {isPending ? <LoaderCircle className="animate-spin" /> : <UserPlus />}
        Add member
      </Button>
    </form>
  );
}
