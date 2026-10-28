-- THIẾT KẾ DỰ KIẾN V2, CHƯA ÁP DỤNG VÀO APP V1.
-- Chạy trên Supabase PostgreSQL sau khi rà soát chính sách RLS.
create table if not exists public.lesson_groups (
  group_id bigint generated always as identity primary key,
  name text not null unique
);
create table if not exists public.lessons (
  lesson_id integer primary key check (lesson_id > 0),
  group_id bigint not null references public.lesson_groups(group_id),
  pattern text not null, usage text, formula text, sample_en text, sample_vi text,
  source_revision integer not null default 1,
  created_at timestamptz not null default now()
);
create table if not exists public.examples (
  example_id bigint generated always as identity primary key,
  lesson_id integer not null references public.lessons(lesson_id) on delete cascade,
  display_order integer not null check (display_order between 1 and 20),
  text_en text not null, text_vi text, context text, practice_prompt text,
  unique (lesson_id, display_order)
);
create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now()
);
create table if not exists public.lesson_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id integer not null references public.lessons(lesson_id),
  status text not null default 'not_started' check (status in ('not_started','in_progress','completed')),
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (user_id,lesson_id)
);
create table if not exists public.learner_notes (
  note_id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id integer not null references public.lessons(lesson_id),
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.review_schedule (
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id integer not null references public.lessons(lesson_id),
  stage integer not null default 0 check (stage between 0 and 4),
  due_on date not null,
  last_reviewed_at timestamptz,
  primary key (user_id,lesson_id)
);
create table if not exists public.review_events (
  event_id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id integer not null references public.lessons(lesson_id),
  rating text not null check (rating in ('again','easy')),
  stage_after integer not null,
  reviewed_at timestamptz not null default now()
);
create table if not exists public.practice_sessions (
  session_id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id integer references public.lessons(lesson_id),
  session_type text not null,
  started_at timestamptz not null default now(),
  ended_at timestamptz
);
create table if not exists public.speech_attempts (
  attempt_id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.practice_sessions(session_id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  transcript text,
  feedback jsonb,
  created_at timestamptz not null default now()
);
create table if not exists public.conversation_sessions (
  conversation_id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  scenario text not null,
  started_at timestamptz not null default now()
);
create table if not exists public.conversation_messages (
  message_id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversation_sessions(conversation_id) on delete cascade,
  sender text not null check (sender in ('learner','assistant','system')),
  content text not null,
  created_at timestamptz not null default now()
);
-- ENABLE RLS ON USER-OWNED TABLES
alter table public.profiles enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.learner_notes enable row level security;
alter table public.review_schedule enable row level security;
alter table public.review_events enable row level security;
alter table public.practice_sessions enable row level security;
alter table public.speech_attempts enable row level security;
alter table public.conversation_sessions enable row level security;
alter table public.conversation_messages enable row level security;
-- Self-only policies. Refine access for conversation messages as they inherit ownership through conversation_sessions.
create policy "profiles_owner" on public.profiles for all to authenticated using (user_id=auth.uid()) with check (user_id=auth.uid());
create policy "progress_owner" on public.lesson_progress for all to authenticated using (user_id=auth.uid()) with check (user_id=auth.uid());
create policy "notes_owner" on public.learner_notes for all to authenticated using (user_id=auth.uid()) with check (user_id=auth.uid());
create policy "schedule_owner" on public.review_schedule for all to authenticated using (user_id=auth.uid()) with check (user_id=auth.uid());
create policy "reviews_owner" on public.review_events for all to authenticated using (user_id=auth.uid()) with check (user_id=auth.uid());
create policy "sessions_owner" on public.practice_sessions for all to authenticated using (user_id=auth.uid()) with check (user_id=auth.uid());
create policy "speech_owner" on public.speech_attempts for all to authenticated using (user_id=auth.uid()) with check (user_id=auth.uid());
create policy "conversations_owner" on public.conversation_sessions for all to authenticated using (user_id=auth.uid()) with check (user_id=auth.uid());
create policy "messages_owner" on public.conversation_messages for all to authenticated
  using (exists (select 1 from public.conversation_sessions s where s.conversation_id=public.conversation_messages.conversation_id and s.user_id=auth.uid()))
  with check (exists (select 1 from public.conversation_sessions s where s.conversation_id=public.conversation_messages.conversation_id and s.user_id=auth.uid()));
-- Lessons & examples currently readable only by service role unless configured public read RLS/policies.
