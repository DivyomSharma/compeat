"use server";

import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { type ActionState } from "@/lib/action-state";
import { requireActiveSchool } from "@/lib/auth";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { toSlug } from "@/lib/utils";

const createEventSchema = z.object({
  title: z.string().min(3, "Event title must be at least 3 characters."),
  description: z.string().min(24, "Add a clear event description."),
  category: z.string().min(2, "Choose a category."),
  venue: z.string().min(2, "Enter the venue."),
  city: z.string().min(2, "Enter the city."),
  registrationDeadline: z.string().min(1, "Add a registration deadline."),
  startsAt: z.string().min(1, "Add the event start time."),
  endsAt: z.string().optional(),
  capacity: z.coerce.number().int().positive().optional(),
  visibility: z.enum(["public", "school_only", "club_only"]),
  clubId: z.string().uuid().optional().or(z.literal("")),
  allowsCrossSchool: z
    .union([z.literal("on"), z.literal("true"), z.literal("false"), z.undefined()])
    .transform((value) => value === "on" || value === "true"),
});

const registerSchema = z.object({
  eventId: z.string().uuid(),
  notes: z.string().max(140).optional(),
});

const reviewSchema = z.object({
  registrationId: z.string().uuid(),
  eventId: z.string().uuid(),
  status: z.enum(["pending", "approved", "rejected"]),
});

export async function createEventAction(
  _previousState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = createEventSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    category: formData.get("category"),
    venue: formData.get("venue"),
    city: formData.get("city"),
    registrationDeadline: formData.get("registrationDeadline"),
    startsAt: formData.get("startsAt"),
    endsAt: formData.get("endsAt") || undefined,
    capacity: formData.get("capacity") || undefined,
    visibility: formData.get("visibility"),
    clubId: formData.get("clubId") || undefined,
    allowsCrossSchool: formData.get("allowsCrossSchool") || undefined,
  });

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Review the event form.",
    };
  }

  const viewer = await requireActiveSchool();
  const supabase = await createServerSupabaseClient();

  if (parsed.data.clubId) {
    const { data: clubLead } = await supabase
      .from("club_members")
      .select("role")
      .eq("club_id", parsed.data.clubId)
      .eq("user_id", viewer.authUserId)
      .maybeSingle();

    if (
      !viewer.roles.includes("admin") &&
      clubLead?.role !== "club_president" &&
      clubLead?.role !== "vice_president"
    ) {
      return {
        success: false,
        message: "Only club leads or admins can create events.",
      };
    }
  } else if (!viewer.roles.includes("admin")) {
    return {
      success: false,
      message: "Attach the event to a club lead workflow or use an admin account.",
    };
  }

  let posterUrl: string | null = null;
  const poster = formData.get("poster");

  if (poster instanceof File && poster.size > 0) {
    const admin = createAdminSupabaseClient();
    const filePath = `posters/${viewer.activeSchoolId}/${Date.now()}-${poster.name}`;
    const buffer = Buffer.from(await poster.arrayBuffer());

    const { error: uploadError } = await admin.storage
      .from("event-assets")
      .upload(filePath, buffer, {
        contentType: poster.type || "application/octet-stream",
        upsert: true,
      });

    if (uploadError) {
      return {
        success: false,
        message: uploadError.message,
      };
    }

    posterUrl = admin.storage.from("event-assets").getPublicUrl(filePath).data.publicUrl;
  }

  const { error } = await supabase.from("events").insert({
    school_id: viewer.activeSchoolId,
    club_id: parsed.data.clubId || null,
    organizer_id: viewer.authUserId,
    title: parsed.data.title,
    slug: toSlug(parsed.data.title),
    description: parsed.data.description,
    category: parsed.data.category,
    city: parsed.data.city,
    venue: parsed.data.venue,
    poster_url: posterUrl,
    registration_deadline: parsed.data.registrationDeadline,
    starts_at: parsed.data.startsAt,
    ends_at: parsed.data.endsAt || null,
    capacity: parsed.data.capacity || null,
    visibility: parsed.data.visibility,
    status: "published",
    allows_cross_school: parsed.data.allowsCrossSchool,
  });

  if (error) {
    return {
      success: false,
      message: error.message,
    };
  }

  revalidatePath("/events");

  return {
    success: true,
    message: "Event published.",
  };
}

export async function registerForEventAction(
  _previousState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = registerSchema.safeParse({
    eventId: formData.get("eventId"),
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Check the registration form.",
    };
  }

  const viewer = await requireActiveSchool();
  const supabase = await createServerSupabaseClient();
  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("*")
    .eq("id", parsed.data.eventId)
    .maybeSingle();

  if (eventError || !event) {
    return {
      success: false,
      message: "We couldn't load this event right now.",
    };
  }

  const { error } = await supabase.from("registrations").upsert(
    {
      school_id: event.school_id,
      event_id: event.id,
      user_id: viewer.authUserId,
      participant_school_id: viewer.activeSchoolId,
      notes: parsed.data.notes ?? null,
      status: "pending",
    },
    { onConflict: "event_id,user_id" }
  );

  if (error) {
    return {
      success: false,
      message: error.message,
    };
  }

  revalidatePath(`/events/${parsed.data.eventId}`);
  revalidatePath("/dashboard");

  return {
    success: true,
    message: "Registration submitted.",
  };
}

export async function reviewRegistrationAction(formData: FormData) {
  const parsed = reviewSchema.safeParse({
    registrationId: formData.get("registrationId"),
    eventId: formData.get("eventId"),
    status: formData.get("status"),
  });

  if (!parsed.success) {
    return;
  }

  const viewer = await requireActiveSchool();
  const supabase = await createServerSupabaseClient();
  const { data: event } = await supabase
    .from("events")
    .select("organizer_id, school_id")
    .eq("id", parsed.data.eventId)
    .maybeSingle();

  if (
    !event ||
    (event.organizer_id !== viewer.authUserId && !viewer.roles.includes("admin"))
  ) {
    return;
  }

  await supabase
    .from("registrations")
    .update({ status: parsed.data.status })
    .eq("id", parsed.data.registrationId);

  revalidatePath(`/events/${parsed.data.eventId}/manage`);
}

export async function generateCertificateAction(registrationId: string, eventId: string) {
  const viewer = await requireActiveSchool();
  const supabase = await createServerSupabaseClient();

  const { data: registration } = await supabase
    .from("registrations")
    .select(
      "*, events(id, title, organizer_id, starts_at, venue), users(id, full_name, display_name, email)"
    )
    .eq("id", registrationId)
    .maybeSingle();

  if (
    !registration?.events ||
    (registration.events.organizer_id !== viewer.authUserId &&
      !viewer.roles.includes("admin"))
  ) {
    return;
  }

  if (registration.status !== "approved") {
    return;
  }

  const pdf = await PDFDocument.create();
  const page = pdf.addPage([842, 595]);
  const headingFont = await pdf.embedFont(StandardFonts.HelveticaBold);
  const bodyFont = await pdf.embedFont(StandardFonts.Helvetica);

  page.drawRectangle({
    x: 28,
    y: 28,
    width: 786,
    height: 539,
    borderColor: rgb(0, 0, 0),
    borderWidth: 3,
    color: rgb(0.972, 0.972, 0.972),
  });

  page.drawRectangle({
    x: 54,
    y: 470,
    width: 220,
    height: 48,
    borderColor: rgb(0, 0, 0),
    borderWidth: 3,
    color: rgb(1, 0.302, 0),
  });

  page.drawText("Compeat Certificate", {
    x: 68,
    y: 486,
    size: 22,
    font: headingFont,
    color: rgb(0, 0, 0),
  });

  page.drawText("Powered by PlotArmour Studio", {
    x: 56,
    y: 440,
    size: 12,
    font: bodyFont,
    color: rgb(0, 0, 0),
  });

  page.drawText("Awarded to", {
    x: 56,
    y: 360,
    size: 18,
    font: bodyFont,
    color: rgb(0.2, 0.2, 0.2),
  });

  page.drawText(
    registration.users?.display_name ||
      registration.users?.full_name ||
      registration.users?.email ||
      "Participant",
    {
      x: 56,
      y: 315,
      size: 34,
      font: headingFont,
      color: rgb(0, 0, 0),
    }
  );

  page.drawText(
    `for successfully participating in ${registration.events.title} at ${registration.events.venue}.`,
    {
      x: 56,
      y: 270,
      size: 16,
      font: bodyFont,
      color: rgb(0, 0, 0),
      maxWidth: 680,
    }
  );

  page.drawText("Issued on Compeat", {
    x: 56,
    y: 104,
    size: 14,
    font: bodyFont,
    color: rgb(0, 0, 0),
  });

  const bytes = await pdf.save();
  const path = `certificates/${registration.user_id}/${registration.id}.pdf`;
  const admin = createAdminSupabaseClient();

  await admin.storage.from("certificates").upload(path, Buffer.from(bytes), {
    contentType: "application/pdf",
    upsert: true,
  });

  await supabase
    .from("registrations")
    .update({
      certificate_path: path,
    })
    .eq("id", registrationId);

  revalidatePath(`/events/${eventId}/manage`);
  revalidatePath("/dashboard");
}
