"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { type ActionState } from "@/lib/action-state";
import { getSiteUrl, isSupabaseConfigured } from "@/lib/config";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const emailSchema = z.object({
  email: z.string().email("Enter a valid institutional email address."),
  next: z.string().optional(),
});

export async function sendMagicLinkAction(
  _previousState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = emailSchema.safeParse({
    email: formData.get("email"),
    next: formData.get("next") || undefined,
  });

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Enter a valid email.",
    };
  }

  if (!isSupabaseConfigured()) {
    return {
      success: false,
      message: "Add your Supabase environment variables before using auth.",
    };
  }

  const supabase = await createServerSupabaseClient();
  const headerStore = await headers();
  const origin = headerStore.get("origin") ?? getSiteUrl();

  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: {
      shouldCreateUser: true,
      // Magic link — Supabase sends a clickable link, NOT a 6-digit code
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    return {
      success: false,
      message: error.message,
    };
  }

  const destination = new URLSearchParams({ email: parsed.data.email });
  if (parsed.data.next) destination.set("next", parsed.data.next);

  redirect(`/auth/verify?${destination.toString()}`);
}

export async function signOutAction() {
  if (isSupabaseConfigured()) {
    const supabase = await createServerSupabaseClient();
    await supabase.auth.signOut();
  }

  redirect("/");
}
