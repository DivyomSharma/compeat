"use client";

import { LoaderCircle, Save } from "lucide-react";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import { FormMessage } from "@/components/shared/form-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateProfileAction } from "@/features/users/actions";
import type { AppUser } from "@/lib/types";

const formSchema = z.object({
  display_name: z.string().min(2, "Name must be at least 2 characters."),
  headline: z.string().max(100).optional(),
  public_email: z.union([z.string().email("Enter a valid email."), z.literal("")]).optional(),
  website: z.union([z.string().url("Enter a valid URL."), z.literal("")]).optional(),
  instagram: z.string().max(30).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function EditProfileForm({ profile }: { profile: Partial<AppUser> }) {
  const [isPending, startTransition] = useTransition();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      display_name: profile.display_name || profile.full_name || "",
      headline: profile.headline || "",
      public_email: (profile as any).public_email || "",
      website: (profile as any).website || "",
      instagram: (profile as any).instagram || "",
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    const data = new FormData();
    data.set("display_name", values.display_name);
    if (values.headline) data.set("headline", values.headline);
    if (values.public_email) data.set("public_email", values.public_email);
    if (values.website) data.set("website", values.website);
    if (values.instagram) data.set("instagram", values.instagram);

    startTransition(async () => {
      const result = await updateProfileAction({ success: false, message: "" }, data);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    });
  });

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <label className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Display name
          </label>
          <Input placeholder="Your display name" {...form.register("display_name")} />
          {form.formState.errors.display_name && (
            <p className="text-sm text-destructive">{form.formState.errors.display_name.message}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <label className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Headline (Bio)
          </label>
          <Input placeholder="Computer Science '27" {...form.register("headline")} />
          {form.formState.errors.headline && (
            <p className="text-sm text-destructive">{form.formState.errors.headline.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Public Email
          </label>
          <Input placeholder="hello@example.com" type="email" {...form.register("public_email")} />
          {form.formState.errors.public_email && (
            <p className="text-sm text-destructive">{form.formState.errors.public_email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Website URL
          </label>
          <Input placeholder="https://myportfolio.com" type="url" {...form.register("website")} />
          {form.formState.errors.website && (
            <p className="text-sm text-destructive">{form.formState.errors.website.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Instagram Handle
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">@</span>
            <Input placeholder="username" className="pl-8" {...form.register("instagram")} />
          </div>
          {form.formState.errors.instagram && (
            <p className="text-sm text-destructive">{form.formState.errors.instagram.message}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t-[3px] border-border">
        <Button type="submit" disabled={isPending}>
          {isPending ? <LoaderCircle className="animate-spin" /> : <Save className="size-4" />}
          Save profile
        </Button>
      </div>
    </form>
  );
}
