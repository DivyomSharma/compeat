"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle, Plus } from "lucide-react";
import { useActionState, useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  createEventAction,
} from "@/features/events/actions";
import { getDefaultEventDates } from "@/lib/event-defaults";
import type { Club } from "@/lib/types";

const defaults = getDefaultEventDates();

const formSchema = z.object({
  title: z.string().min(3, "Event title must be at least 3 characters."),
  description: z.string().min(24, "Describe the event clearly."),
  category: z.string().min(2, "Add an event category."),
  venue: z.string().min(2, "Enter the venue."),
  city: z.string().min(2, "Enter the city."),
  registrationDeadline: z.string().min(1, "Choose a deadline."),
  startsAt: z.string().min(1, "Choose a start date."),
  endsAt: z.string().optional(),
  capacity: z.string().optional(),
  visibility: z.enum(["public", "school_only", "club_only"]),
  clubId: z.string().optional(),
  allowsCrossSchool: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

export function CreateEventDialog({ clubs }: { clubs: Club[] }) {
  const [state, formAction] = useActionState(createEventAction, initialActionState);
  const [isPending, startTransition] = useTransition();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      venue: "",
      city: "",
      registrationDeadline: defaults.registrationDeadline.slice(0, 16),
      startsAt: defaults.startsAt.slice(0, 16),
      endsAt: defaults.endsAt.slice(0, 16),
      capacity: "",
      visibility: "public",
      clubId: clubs[0]?.id || "",
      allowsCrossSchool: true,
    },
  });
  const allowsCrossSchool = useWatch({
    control: form.control,
    name: "allowsCrossSchool",
  });

  const onSubmit = form.handleSubmit((values, event) => {
    const data = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      if (typeof value === "boolean") {
        data.set(key, String(value));
      } else if (value) {
        data.set(key, value);
      }
    });

    const fileInput = (event?.target as HTMLFormElement | undefined)?.querySelector(
      'input[name="poster"]'
    ) as HTMLInputElement | null;

    const file = fileInput?.files?.[0];

    if (file) {
      data.set("poster", file);
    }

    startTransition(() => formAction(data));
  });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary">
          <Plus />
          Create event
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create an event</DialogTitle>
          <DialogDescription>
            Publish a competition or campus event and immediately open
            registrations.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <label className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Title
              </label>
              <Input
                placeholder="Compeat Campus Hackathon"
                {...form.register("title")}
              />
            </div>
            <div className="space-y-2">
              <label className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Category
              </label>
              <Input placeholder="Hackathon" {...form.register("category")} />
            </div>
            <div className="space-y-2">
              <label className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Host club
              </label>
              <Select
                defaultValue={form.getValues("clubId")}
                onValueChange={(value) => form.setValue("clubId", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a club" />
                </SelectTrigger>
                <SelectContent>
                  {clubs.map((club) => (
                    <SelectItem key={club.id} value={club.id}>
                      {club.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Venue
              </label>
              <Input placeholder="Innovation Hall" {...form.register("venue")} />
            </div>
            <div className="space-y-2">
              <label className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
                City
              </label>
              <Input placeholder="Bengaluru" {...form.register("city")} />
            </div>
            <div className="space-y-2">
              <label className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Registration deadline
              </label>
              <Input type="datetime-local" {...form.register("registrationDeadline")} />
            </div>
            <div className="space-y-2">
              <label className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Starts at
              </label>
              <Input type="datetime-local" {...form.register("startsAt")} />
            </div>
            <div className="space-y-2">
              <label className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Ends at
              </label>
              <Input type="datetime-local" {...form.register("endsAt")} />
            </div>
            <div className="space-y-2">
              <label className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Capacity
              </label>
              <Input type="number" placeholder="200" {...form.register("capacity")} />
            </div>
            <div className="space-y-2">
              <label className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Visibility
              </label>
              <Select
                defaultValue={form.getValues("visibility")}
                onValueChange={(value) =>
                  form.setValue("visibility", value as FormValues["visibility"])
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose visibility" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public feed</SelectItem>
                  <SelectItem value="school_only">School only</SelectItem>
                  <SelectItem value="club_only">Club only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Poster
              </label>
              <Input type="file" name="poster" accept="image/*" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Description
              </label>
              <Textarea
                placeholder="Outline the format, who should apply, and what students can expect."
                {...form.register("description")}
              />
            </div>
          </div>

          <label className="flex items-center gap-3 rounded-sm border-[3px] border-border bg-muted px-4 py-3 text-sm">
            <input
              type="checkbox"
              className="size-4 accent-black"
              checked={allowsCrossSchool}
              onChange={(event) =>
                form.setValue("allowsCrossSchool", event.target.checked)
              }
            />
            Allow registrations from other institutions
          </label>

          <FormMessage message={state.message} success={state.success} />

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? <LoaderCircle className="animate-spin" /> : <Plus />}
            Publish event
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
