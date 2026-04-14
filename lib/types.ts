export type MembershipRole = "admin" | "student" | "teacher";
export type ClubRole = "club_president" | "vice_president" | "club_member";
export type RegistrationStatus = "pending" | "approved" | "rejected";

export type School = {
  id: string;
  school_id: string;
  name: string;
  slug: string;
  city: string;
  state: string | null;
  country: string;
  description: string | null;
  website?: string | null;
  instagram?: string | null;
  public_email?: string | null;
  created_at: string;
  updated_at: string;
};

export type AppUser = {
  id: string;
  school_id: string | null;
  email: string;
  full_name: string | null;
  display_name: string | null;
  headline: string | null;
  avatar_url: string | null;
  website?: string | null;
  instagram?: string | null;
  public_email?: string | null;
  created_at: string;
  updated_at: string;
};

export type Membership = {
  id: string;
  school_id: string;
  user_id: string;
  roles: MembershipRole[];
  status: "active" | "inactive";
  created_at: string;
  updated_at: string;
};

export type Club = {
  id: string;
  school_id: string;
  name: string;
  slug: string;
  category: string;
  description: string | null;
  contact_email: string | null;
  logo_url: string | null;
  website?: string | null;
  instagram?: string | null;
  public_email?: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type ClubMember = {
  id: string;
  school_id: string;
  club_id: string;
  user_id: string;
  role: ClubRole;
  created_at: string;
  updated_at: string;
  users?: Pick<AppUser, "id" | "full_name" | "display_name" | "email"> | null;
};

export type CompetitionEvent = {
  id: string;
  school_id: string;
  club_id: string | null;
  organizer_id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  city: string;
  venue: string;
  poster_url: string | null;
  registration_deadline: string;
  starts_at: string;
  ends_at: string | null;
  capacity: number | null;
  status: "draft" | "published" | "closed";
  visibility: "public" | "school_only" | "club_only";
  allows_cross_school: boolean;
  created_at: string;
  updated_at: string;
  schools?: Pick<School, "id" | "name" | "city" | "country"> | null;
  clubs?: Pick<Club, "id" | "name"> | null;
  organizer?: Pick<AppUser, "id" | "full_name" | "display_name"> | null;
  registrations_count?: number;
};

export type Registration = {
  id: string;
  school_id: string;
  event_id: string;
  user_id: string;
  participant_school_id: string | null;
  status: RegistrationStatus;
  notes: string | null;
  certificate_path: string | null;
  certificate_url: string | null;
  created_at: string;
  updated_at: string;
  events?: Pick<CompetitionEvent, "id" | "title" | "starts_at" | "venue"> | null;
  users?: Pick<AppUser, "id" | "full_name" | "display_name" | "email"> | null;
};

export type DashboardData = {
  clubs: Club[];
  events: CompetitionEvent[];
  registrations: Registration[];
  certificates: Registration[];
};
