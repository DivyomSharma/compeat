import { clsx, type ClassValue } from "clsx";
import { format } from "date-fns";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function toSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function formatDateTime(value: string | null | undefined) {
  if (!value) {
    return "TBD";
  }

  return format(new Date(value), "dd MMM yyyy, hh:mm a");
}

export function formatDateOnly(value: string | null | undefined) {
  if (!value) {
    return "TBD";
  }

  return format(new Date(value), "dd MMM yyyy");
}

export function formatRoleLabel(value: string) {
  return value.replace(/_/g, " ");
}
