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

const verifySchema = z.object({
  email: z.string().email(),
  token: z.string().min(6, "Enter the 6-digit OTP code."),
  next: z.string().optional(),
});

export async function requestOtpAction(
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
  const nextUrl = headerStore.get("origin") ?? getSiteUrl();

  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: {
      shouldCreateUser: true,
      emailRedirectTo: `${nextUrl}/auth/callback`,
    },
  });

  if (error) {
    return {
      success: false,
      message: error.message,
    };
  }

  const destination = new URLSearchParams({
    email: parsed.data.email,
  });

  if (parsed.data.next) {
    destination.set("next", parsed.data.next);
  }

  redirect(`/auth/verify?${destination.toString()}`);
}

export async function verifyOtpAction(
  _previousState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = verifySchema.safeParse({
    email: formData.get("email"),
    token: formData.get("token"),
    next: formData.get("next") || undefined,
  });

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Enter a valid OTP code.",
    };
  }

  if (!isSupabaseConfigured()) {
    return {
      success: false,
      message: "Add your Supabase environment variables before using auth.",
    };
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.verifyOtp({
    email: parsed.data.email,
    token: parsed.data.token,
    type: "email",
  });

  if (error) {
    return {
      success: false,
      message: error.message,
    };
  }

  redirect(parsed.data.next || "/dashboard");
}

export async function signOutAction() {
  if (isSupabaseConfigured()) {
    const supabase = await createServerSupabaseClient();
    await supabase.auth.signOut();
  }

  redirect("/");
}
