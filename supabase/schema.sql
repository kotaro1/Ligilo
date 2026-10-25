-- Ligilo schema. Run once in the Supabase SQL Editor.
-- Word data is NOT in this repo (see docs/adr/0001); it is loaded from a local SQL file.

create table if not exists public.words (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  chapter integer not null,
  hanzi text not null,
  pinyin text not null default '',
  meaning text not null default '',
  is_measure_word boolean not null default false,
  pos_note text,
  needs_check boolean not null default false,
  position integer not null,
  created_at timestamptz not null default now(),
  unique (user_id, chapter, hanzi)
);

create table if not exists public.word_statuses (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  word_id uuid not null references public.words (id) on delete cascade,
  direction text not null check (direction in ('hanzi_to_pinyin', 'pinyin_to_hanzi')),
  status text not null check (status in ('none', 'easy', 'hard')),
  updated_at timestamptz not null default now(),
  primary key (word_id, direction)
);

-- The latest drill per direction, so another device can resume where this one stopped.
create table if not exists public.drill_progress (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  direction text not null check (direction in ('hanzi_to_pinyin', 'pinyin_to_hanzi')),
  chapters integer[] not null,
  statuses text[] not null,
  order_mode text not null check (order_mode in ('random', 'sequential')),
  word_ids uuid[] not null,
  index integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key (user_id, direction)
);

alter table public.words enable row level security;
alter table public.word_statuses enable row level security;
alter table public.drill_progress enable row level security;

create policy "own words" on public.words
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own word_statuses" on public.word_statuses
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own drill_progress" on public.drill_progress
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
