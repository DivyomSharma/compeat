create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.schools (
  id uuid primary key default gen_random_uuid(),
  school_id uuid generated always as (id) stored unique,
  name text not null,
  slug text not null unique,
  city text not null,
  state text,
  country text not null,
  description text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  school_id uuid references public.schools (id) on delete set null,
  email text not null unique,
  full_name text,
  display_name text,
  headline text,
  avatar_url text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.memberships (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools (id) on delete cascade,
  user_id uuid not null references public.users (id) on delete cascade,
  roles text[] not null default array['student']::text[],
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (school_id, user_id)
);

create table if not exists public.clubs (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools (id) on delete cascade,
  name text not null,
  slug text not null,
  category text not null,
  description text,
  contact_email text,
  logo_url text,
  created_by uuid not null references public.users (id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (school_id, slug)
);

create table if not exists public.club_members (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools (id) on delete cascade,
  club_id uuid not null references public.clubs (id) on delete cascade,
  user_id uuid not null references public.users (id) on delete cascade,
  role text not null check (role in ('club_president', 'vice_president', 'club_member')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (club_id, user_id)
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools (id) on delete cascade,
  club_id uuid references public.clubs (id) on delete set null,
  organizer_id uuid not null references public.users (id) on delete cascade,
  title text not null,
  slug text not null,
  description text not null,
  category text not null,
  city text not null,
  venue text not null,
  poster_url text,
  registration_deadline timestamptz not null,
  starts_at timestamptz not null,
  ends_at timestamptz,
  capacity integer check (capacity is null or capacity > 0),
  status text not null default 'draft' check (status in ('draft', 'published', 'closed')),
  visibility text not null default 'school_only' check (visibility in ('public', 'school_only', 'club_only')),
  allows_cross_school boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (school_id, slug)
);

create table if not exists public.registrations (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools (id) on delete cascade,
  event_id uuid not null references public.events (id) on delete cascade,
  user_id uuid not null references public.users (id) on delete cascade,
  participant_school_id uuid references public.schools (id) on delete set null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  notes text,
  certificate_path text,
  certificate_url text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (event_id, user_id)
);

create index if not exists idx_users_school_id on public.users (school_id);
create index if not exists idx_memberships_school_id on public.memberships (school_id);
create index if not exists idx_memberships_user_id on public.memberships (user_id);
create index if not exists idx_memberships_roles on public.memberships using gin (roles);
create index if not exists idx_clubs_school_id on public.clubs (school_id);
create index if not exists idx_club_members_school_id on public.club_members (school_id);
create index if not exists idx_club_members_user_id on public.club_members (user_id);
create index if not exists idx_club_members_club_id on public.club_members (club_id);
create index if not exists idx_events_school_id on public.events (school_id);
create index if not exists idx_events_club_id on public.events (club_id);
create index if not exists idx_events_organizer_id on public.events (organizer_id);
create index if not exists idx_events_starts_at on public.events (starts_at);
create index if not exists idx_registrations_school_id on public.registrations (school_id);
create index if not exists idx_registrations_event_id on public.registrations (event_id);
create index if not exists idx_registrations_user_id on public.registrations (user_id);

drop trigger if exists schools_set_updated_at on public.schools;
create trigger schools_set_updated_at
before update on public.schools
for each row
execute function public.set_updated_at();

drop trigger if exists users_set_updated_at on public.users;
create trigger users_set_updated_at
before update on public.users
for each row
execute function public.set_updated_at();

drop trigger if exists memberships_set_updated_at on public.memberships;
create trigger memberships_set_updated_at
before update on public.memberships
for each row
execute function public.set_updated_at();

drop trigger if exists clubs_set_updated_at on public.clubs;
create trigger clubs_set_updated_at
before update on public.clubs
for each row
execute function public.set_updated_at();

drop trigger if exists club_members_set_updated_at on public.club_members;
create trigger club_members_set_updated_at
before update on public.club_members
for each row
execute function public.set_updated_at();

drop trigger if exists events_set_updated_at on public.events;
create trigger events_set_updated_at
before update on public.events
for each row
execute function public.set_updated_at();

drop trigger if exists registrations_set_updated_at on public.registrations;
create trigger registrations_set_updated_at
before update on public.registrations
for each row
execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, full_name, display_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do update
  set email = excluded.email;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

create or replace function public.is_school_member(target_school uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.memberships m
    where m.school_id = target_school
      and m.user_id = auth.uid()
      and m.status = 'active'
  );
$$;

create or replace function public.has_school_role(target_school uuid, role_name text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.memberships m
    where m.school_id = target_school
      and m.user_id = auth.uid()
      and m.status = 'active'
      and role_name = any(m.roles)
  );
$$;

create or replace function public.is_club_member(target_club uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.club_members cm
    where cm.club_id = target_club
      and cm.user_id = auth.uid()
  );
$$;

create or replace function public.is_club_lead(target_club uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.club_members cm
    where cm.club_id = target_club
      and cm.user_id = auth.uid()
      and cm.role in ('club_president', 'vice_president')
  );
$$;

create or replace function public.is_event_organizer(target_event uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.events e
    where e.id = target_event
      and e.organizer_id = auth.uid()
  );
$$;

create or replace function public.guard_registration_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.user_id = auth.uid()
     and not public.is_event_organizer(new.event_id)
     and not public.has_school_role(new.school_id, 'admin') then
    new.status = old.status;
    new.certificate_path = old.certificate_path;
    new.certificate_url = old.certificate_url;
  end if;

  return new;
end;
$$;

drop trigger if exists registrations_guard_mutation on public.registrations;
create trigger registrations_guard_mutation
before update on public.registrations
for each row
execute function public.guard_registration_update();

alter table public.schools enable row level security;
alter table public.users enable row level security;
alter table public.memberships enable row level security;
alter table public.clubs enable row level security;
alter table public.club_members enable row level security;
alter table public.events enable row level security;
alter table public.registrations enable row level security;

drop policy if exists "schools_select" on public.schools;
create policy "schools_select"
on public.schools
for select
using (auth.uid() is not null);

drop policy if exists "schools_insert" on public.schools;
create policy "schools_insert"
on public.schools
for insert
with check (auth.uid() is not null);

drop policy if exists "schools_update_admin" on public.schools;
create policy "schools_update_admin"
on public.schools
for update
using (public.has_school_role(id, 'admin'))
with check (public.has_school_role(id, 'admin'));

drop policy if exists "users_select" on public.users;
create policy "users_select"
on public.users
for select
using (
  id = auth.uid()
  or (school_id is not null and public.is_school_member(school_id))
);

drop policy if exists "users_insert_self" on public.users;
create policy "users_insert_self"
on public.users
for insert
with check (id = auth.uid());

drop policy if exists "users_update_self" on public.users;
create policy "users_update_self"
on public.users
for update
using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists "memberships_select" on public.memberships;
create policy "memberships_select"
on public.memberships
for select
using (
  user_id = auth.uid()
  or public.has_school_role(school_id, 'admin')
);

drop policy if exists "memberships_insert" on public.memberships;
create policy "memberships_insert"
on public.memberships
for insert
with check (
  user_id = auth.uid()
  or public.has_school_role(school_id, 'admin')
);

drop policy if exists "memberships_update_admin" on public.memberships;
create policy "memberships_update_admin"
on public.memberships
for update
using (public.has_school_role(school_id, 'admin'))
with check (public.has_school_role(school_id, 'admin'));

drop policy if exists "clubs_select" on public.clubs;
create policy "clubs_select"
on public.clubs
for select
using (
  public.has_school_role(school_id, 'admin')
  or public.is_club_member(id)
);

drop policy if exists "clubs_insert_admin" on public.clubs;
create policy "clubs_insert_admin"
on public.clubs
for insert
with check (
  public.has_school_role(school_id, 'admin')
  and created_by = auth.uid()
);

drop policy if exists "clubs_update_admin_or_lead" on public.clubs;
create policy "clubs_update_admin_or_lead"
on public.clubs
for update
using (
  public.has_school_role(school_id, 'admin')
  or public.is_club_lead(id)
)
with check (
  public.has_school_role(school_id, 'admin')
  or public.is_club_lead(id)
);

drop policy if exists "club_members_select" on public.club_members;
create policy "club_members_select"
on public.club_members
for select
using (
  public.has_school_role(school_id, 'admin')
  or public.is_club_member(club_id)
);

drop policy if exists "club_members_insert" on public.club_members;
create policy "club_members_insert"
on public.club_members
for insert
with check (
  public.has_school_role(school_id, 'admin')
  or public.is_club_lead(club_id)
);

drop policy if exists "club_members_update" on public.club_members;
create policy "club_members_update"
on public.club_members
for update
using (
  public.has_school_role(school_id, 'admin')
  or public.is_club_lead(club_id)
)
with check (
  public.has_school_role(school_id, 'admin')
  or public.is_club_lead(club_id)
);

drop policy if exists "club_members_delete" on public.club_members;
create policy "club_members_delete"
on public.club_members
for delete
using (
  public.has_school_role(school_id, 'admin')
  or public.is_club_lead(club_id)
);

drop policy if exists "events_select" on public.events;
create policy "events_select"
on public.events
for select
using (
  public.is_school_member(school_id)
  or visibility = 'public'
);

drop policy if exists "events_insert" on public.events;
create policy "events_insert"
on public.events
for insert
with check (
  organizer_id = auth.uid()
  and (
    public.has_school_role(school_id, 'admin')
    or (club_id is not null and public.is_club_lead(club_id))
  )
);

drop policy if exists "events_update" on public.events;
create policy "events_update"
on public.events
for update
using (
  public.has_school_role(school_id, 'admin')
  or organizer_id = auth.uid()
)
with check (
  public.has_school_role(school_id, 'admin')
  or organizer_id = auth.uid()
);

drop policy if exists "events_delete" on public.events;
create policy "events_delete"
on public.events
for delete
using (
  public.has_school_role(school_id, 'admin')
  or organizer_id = auth.uid()
);

drop policy if exists "registrations_select" on public.registrations;
create policy "registrations_select"
on public.registrations
for select
using (
  user_id = auth.uid()
  or public.is_event_organizer(event_id)
  or public.has_school_role(school_id, 'admin')
);

drop policy if exists "registrations_insert" on public.registrations;
create policy "registrations_insert"
on public.registrations
for insert
with check (
  user_id = auth.uid()
  and exists (
    select 1
    from public.events e
    where e.id = event_id
      and (
        e.visibility = 'public'
        or public.is_school_member(e.school_id)
      )
  )
);

drop policy if exists "registrations_update" on public.registrations;
create policy "registrations_update"
on public.registrations
for update
using (
  user_id = auth.uid()
  or public.is_event_organizer(event_id)
  or public.has_school_role(school_id, 'admin')
)
with check (
  user_id = auth.uid()
  or public.is_event_organizer(event_id)
  or public.has_school_role(school_id, 'admin')
);

insert into storage.buckets (id, name, public)
values ('event-assets', 'event-assets', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('certificates', 'certificates', false)
on conflict (id) do nothing;

create policy "event_assets_public_read"
on storage.objects
for select
using (bucket_id = 'event-assets');

create policy "event_assets_authenticated_upload"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'event-assets');

create policy "event_assets_owner_delete"
on storage.objects
for delete
to authenticated
using (bucket_id = 'event-assets' and auth.uid()::text = owner);

create policy "certificates_owner_read"
on storage.objects
for select
using (
  bucket_id = 'certificates'
  and auth.uid()::text = (storage.foldername(name))[2]
);

 - -   M i g r a t i o n :   A d d   S o c i a l   L i n k s   a n d   F o l l o w s 
 
 a l t e r   t a b l e   p u b l i c . u s e r s   a d d   c o l u m n   i f   n o t   e x i s t s   w e b s i t e   t e x t ; 
 a l t e r   t a b l e   p u b l i c . u s e r s   a d d   c o l u m n   i f   n o t   e x i s t s   i n s t a g r a m   t e x t ; 
 a l t e r   t a b l e   p u b l i c . u s e r s   a d d   c o l u m n   i f   n o t   e x i s t s   p u b l i c _ e m a i l   t e x t ; 
 
 a l t e r   t a b l e   p u b l i c . s c h o o l s   a d d   c o l u m n   i f   n o t   e x i s t s   w e b s i t e   t e x t ; 
 a l t e r   t a b l e   p u b l i c . s c h o o l s   a d d   c o l u m n   i f   n o t   e x i s t s   i n s t a g r a m   t e x t ; 
 a l t e r   t a b l e   p u b l i c . s c h o o l s   a d d   c o l u m n   i f   n o t   e x i s t s   p u b l i c _ e m a i l   t e x t ; 
 
 a l t e r   t a b l e   p u b l i c . c l u b s   a d d   c o l u m n   i f   n o t   e x i s t s   w e b s i t e   t e x t ; 
 a l t e r   t a b l e   p u b l i c . c l u b s   a d d   c o l u m n   i f   n o t   e x i s t s   i n s t a g r a m   t e x t ; 
 a l t e r   t a b l e   p u b l i c . c l u b s   a d d   c o l u m n   i f   n o t   e x i s t s   p u b l i c _ e m a i l   t e x t ; 
 
 c r e a t e   t a b l e   i f   n o t   e x i s t s   p u b l i c . f o l l o w s   ( 
     i d   u u i d   p r i m a r y   k e y   d e f a u l t   g e n _ r a n d o m _ u u i d ( ) , 
     f o l l o w e r _ i d   u u i d   n o t   n u l l   r e f e r e n c e s   p u b l i c . u s e r s   ( i d )   o n   d e l e t e   c a s c a d e , 
     t a r g e t _ t y p e   t e x t   n o t   n u l l   c h e c k   ( t a r g e t _ t y p e   i n   ( ' u s e r ' ,   ' s c h o o l ' ,   ' c l u b ' ) ) , 
     t a r g e t _ i d   u u i d   n o t   n u l l , 
     c r e a t e d _ a t   t i m e s t a m p t z   n o t   n u l l   d e f a u l t   t i m e z o n e ( ' u t c ' ,   n o w ( ) ) , 
     u n i q u e   ( f o l l o w e r _ i d ,   t a r g e t _ t y p e ,   t a r g e t _ i d ) 
 ) ; 
 
 a l t e r   t a b l e   p u b l i c . f o l l o w s   e n a b l e   r o w   l e v e l   s e c u r i t y ; 
 
 d r o p   p o l i c y   i f   e x i s t s   \  
 f o l l o w s _ s e l e c t \   o n   p u b l i c . f o l l o w s ; 
 c r e a t e   p o l i c y   \ f o l l o w s _ s e l e c t \   o n   p u b l i c . f o l l o w s 
     f o r   s e l e c t   u s i n g   ( t r u e ) ; 
 
 d r o p   p o l i c y   i f   e x i s t s   \ f o l l o w s _ i n s e r t \   o n   p u b l i c . f o l l o w s ; 
 c r e a t e   p o l i c y   \ f o l l o w s _ i n s e r t \   o n   p u b l i c . f o l l o w s 
     f o r   i n s e r t   w i t h   c h e c k   ( a u t h . u i d ( )   =   f o l l o w e r _ i d ) ; 
 
 d r o p   p o l i c y   i f   e x i s t s   \ f o l l o w s _ d e l e t e \   o n   p u b l i c . f o l l o w s ; 
 c r e a t e   p o l i c y   \ f o l l o w s _ d e l e t e \   o n   p u b l i c . f o l l o w s 
     f o r   d e l e t e   u s i n g   ( a u t h . u i d ( )   =   f o l l o w e r _ i d ) ; 
  
 