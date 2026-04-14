import { formatISO } from "date-fns";

import { demoClubs, demoDashboardData, demoEvents, demoRegistrations, demoSchools } from "@/lib/demo-data";
import { isSupabaseConfigured } from "@/lib/config";
import type {
  Club,
  ClubMember,
  CompetitionEvent,
  DashboardData,
  Registration,
  School,
} from "@/lib/types";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type EventFilters = {
  category?: string;
  city?: string;
  schoolId?: string;
  includePublicNetwork?: boolean;
};

export async function getOnboardingSchools() {
  if (!isSupabaseConfigured()) {
    return demoSchools;
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("schools")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    return demoSchools;
  }

  return (data ?? []) as School[];
}

export async function getPublicEventFeed(filters: EventFilters = {}) {
  if (!isSupabaseConfigured()) {
    return demoEvents.filter((event) => {
      const categoryMatch = filters.category
        ? event.category === filters.category
        : true;
      const cityMatch = filters.city
        ? event.city.toLowerCase().includes(filters.city.toLowerCase())
        : true;

      return categoryMatch && cityMatch;
    });
  }

  const supabase = await createServerSupabaseClient();
  let query = supabase
    .from("events")
    .select(
      "*, schools(id, name, city, country), clubs(id, name), users!events_organizer_id_fkey(id, full_name, display_name)"
    )
    .eq("status", "published")
    .eq("visibility", "public")
    .order("starts_at", { ascending: true });

  if (filters.category) {
    query = query.eq("category", filters.category);
  }

  if (filters.city) {
    query = query.ilike("city", `%${filters.city}%`);
  }

  if (filters.schoolId) {
    query = query.eq("school_id", filters.schoolId);
  }

  const { data, error } = await query;

  if (error) {
    return demoEvents;
  }

  return (data ?? []) as CompetitionEvent[];
}

export async function getDashboardDataForUser(
  userId: string,
  schoolId: string
): Promise<DashboardData> {
  if (!isSupabaseConfigured()) {
    return demoDashboardData;
  }

  const supabase = await createServerSupabaseClient();

  const [clubMemberships, upcomingEvents, registrationsResponse] =
    await Promise.all([
      supabase
        .from("club_members")
        .select("clubs(*)")
        .eq("user_id", userId)
        .eq("school_id", schoolId),
      supabase
        .from("events")
        .select("*, schools(id, name, city, country), clubs(id, name)")
        .eq("school_id", schoolId)
        .gte("starts_at", formatISO(new Date()))
        .order("starts_at", { ascending: true })
        .limit(6),
      supabase
        .from("registrations")
        .select("*, events(id, title, starts_at, venue)")
        .eq("user_id", userId)
        .order("created_at", { ascending: false }),
    ]);

  const clubs =
    (clubMemberships.data ?? [])
      .flatMap((row) => (Array.isArray(row.clubs) ? row.clubs : [row.clubs]))
      .filter(Boolean) as unknown as Club[];
  const events = (upcomingEvents.data ?? []) as CompetitionEvent[];
  const registrations = (registrationsResponse.data ?? []) as Registration[];

  return {
    clubs,
    events,
    registrations,
    certificates: registrations.filter((registration) => registration.certificate_path),
  };
}

export async function getClubsForSchool(
  schoolId: string,
  options?: { showAll?: boolean; userId?: string }
) {
  if (!isSupabaseConfigured()) {
    return demoClubs.filter((club) => club.school_id === schoolId);
  }

  const supabase = await createServerSupabaseClient();

  if (options?.showAll) {
    const { data, error } = await supabase
      .from("clubs")
      .select("*")
      .eq("school_id", schoolId)
      .order("created_at", { ascending: false });

    if (error) {
      return [];
    }

    return data as Club[];
  }

  const { data, error } = await supabase
    .from("club_members")
    .select("clubs(*)")
    .eq("school_id", schoolId)
    .eq("user_id", options?.userId ?? "");

  if (error) {
    return [];
  }

  return (data ?? [])
    .flatMap((membership) =>
      Array.isArray(membership.clubs) ? membership.clubs : [membership.clubs]
    )
    .filter(Boolean) as unknown as Club[];
}

export async function getClubDetails(clubId: string) {
  if (!isSupabaseConfigured()) {
    return {
      club: demoClubs[0],
      members: [],
      events: demoEvents.filter((event) => event.club_id === demoClubs[0]?.id),
    };
  }

  const supabase = await createServerSupabaseClient();
  const [{ data: club }, { data: members }, { data: events }] = await Promise.all([
    supabase.from("clubs").select("*").eq("id", clubId).maybeSingle(),
    supabase
      .from("club_members")
      .select("*, users(id, full_name, display_name, email)")
      .eq("club_id", clubId)
      .order("created_at", { ascending: true }),
    supabase
      .from("events")
      .select("*, schools(id, name, city, country)")
      .eq("club_id", clubId)
      .order("starts_at", { ascending: false }),
  ]);

  return {
    club: (club ?? null) as Club | null,
    members: (members ?? []) as ClubMember[],
    events: (events ?? []) as CompetitionEvent[],
  };
}

export async function getEventsForExplorer(filters: EventFilters = {}) {
  if (!isSupabaseConfigured()) {
    return demoEvents;
  }

  const supabase = await createServerSupabaseClient();
  let query = supabase
    .from("events")
    .select("*, schools(id, name, city, country), clubs(id, name)")
    .order("starts_at", { ascending: true });

  if (!filters.includePublicNetwork && filters.schoolId) {
    query = query.eq("school_id", filters.schoolId);
  }

  if (filters.includePublicNetwork) {
    query = query.or(
      `school_id.eq.${filters.schoolId},and(visibility.eq.public,allows_cross_school.eq.true)`
    );
  }

  if (filters.category) {
    query = query.eq("category", filters.category);
  }

  if (filters.city) {
    query = query.ilike("city", `%${filters.city}%`);
  }

  const { data, error } = await query;

  if (error) {
    return demoEvents;
  }

  return (data ?? []) as CompetitionEvent[];
}

export async function getEventDetails(eventId: string, userId?: string) {
  if (!isSupabaseConfigured()) {
    return {
      event: demoEvents[0],
      registration:
        demoRegistrations.find((registration) => registration.user_id === userId) ?? null,
      relatedEvents: demoEvents.slice(0, 2),
    };
  }

  const supabase = await createServerSupabaseClient();

  const [{ data: event }, { data: registration }, { data: relatedEvents }] =
    await Promise.all([
      supabase
        .from("events")
        .select(
          "*, schools(id, name, city, country), clubs(id, name), users!events_organizer_id_fkey(id, full_name, display_name)"
        )
        .eq("id", eventId)
        .maybeSingle(),
      userId
        ? supabase
            .from("registrations")
            .select("*")
            .eq("event_id", eventId)
            .eq("user_id", userId)
            .maybeSingle()
        : Promise.resolve({ data: null }),
      supabase
        .from("events")
        .select("*, schools(id, name, city, country)")
        .neq("id", eventId)
        .gte("starts_at", formatISO(new Date()))
        .order("starts_at", { ascending: true })
        .limit(3),
    ]);

  return {
    event: (event ?? null) as CompetitionEvent | null,
    registration: (registration ?? null) as Registration | null,
    relatedEvents: (relatedEvents ?? []) as CompetitionEvent[],
  };
}

export async function getEventManagementDetails(eventId: string) {
  if (!isSupabaseConfigured()) {
    return {
      event: demoEvents[0],
      registrations: demoRegistrations,
      stats: {
        total: demoRegistrations.length,
        approved: 1,
        pending: 1,
        rejected: 0,
      },
    };
  }

  const supabase = await createServerSupabaseClient();
  const [{ data: event }, { data: registrations }] = await Promise.all([
    supabase
      .from("events")
      .select("*, schools(id, name, city, country), clubs(id, name)")
      .eq("id", eventId)
      .maybeSingle(),
    supabase
      .from("registrations")
      .select("*, users(id, full_name, display_name, email)")
      .eq("event_id", eventId)
      .order("created_at", { ascending: false }),
  ]);

  const rows = (registrations ?? []) as Registration[];

  return {
    event: (event ?? null) as CompetitionEvent | null,
    registrations: rows,
    stats: {
      total: rows.length,
      approved: rows.filter((row) => row.status === "approved").length,
      pending: rows.filter((row) => row.status === "pending").length,
      rejected: rows.filter((row) => row.status === "rejected").length,
    },
  };
}

export async function getSignedCertificateUrl(path: string | null) {
  if (!path || !isSupabaseConfigured()) {
    return null;
  }

  const admin = createAdminSupabaseClient();
  const { data } = await admin.storage
    .from("certificates")
    .createSignedUrl(path, 60 * 60);

  return data?.signedUrl ?? null;
}
