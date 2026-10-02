-- LearnTrack Spaced Repetition Flashcards 2.0
-- Migration 005: Flashcard Decks, Rich Pedagogical Fields, and Spaced Repetition Review Logs

-- 1. FLASHCARD DECKS
create table if not exists public.flashcard_decks (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references auth.users(id) on delete cascade,
    title text not null,
    description text,
    subject text,
    color text default '#2563eb',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_flashcard_decks_user_id on public.flashcard_decks(user_id);
alter table public.flashcard_decks enable row level security;

create policy "Flashcard decks select own" on public.flashcard_decks for select using (user_id = auth.uid());
create policy "Flashcard decks insert own" on public.flashcard_decks for insert with check (user_id = auth.uid());
create policy "Flashcard decks update own" on public.flashcard_decks for update using (user_id = auth.uid());
create policy "Flashcard decks delete own" on public.flashcard_decks for delete using (user_id = auth.uid());

-- 2. EXTEND FLASHCARDS TABLE
alter table public.flashcards add column if not exists deck_id uuid references public.flashcard_decks(id) on delete set null;
alter table public.flashcards add column if not exists difficulty text default 'medium';
alter table public.flashcards add column if not exists card_type text default 'concept';
alter table public.flashcards add column if not exists explanation text;
alter table public.flashcards add column if not exists example text;
alter table public.flashcards add column if not exists hint text;
alter table public.flashcards add column if not exists source_reference text;
alter table public.flashcards add column if not exists tags text[] default '{}';
alter table public.flashcards add column if not exists lapses integer default 0;

create index if not exists idx_flashcards_deck_id on public.flashcards(deck_id);

-- 3. FLASHCARD REVIEWS (Actual Spaced Repetition Review History for Analytics & Retention)
create table if not exists public.flashcard_reviews (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references auth.users(id) on delete cascade,
    card_id uuid not null references public.flashcards(id) on delete cascade,
    deck_id uuid references public.flashcard_decks(id) on delete set null,
    rating text not null check (rating in ('again', 'hard', 'good', 'easy')),
    interval_days integer not null,
    ease_factor numeric(4,2) not null,
    repetition integer not null default 1,
    duration_ms integer default 0,
    reviewed_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_flashcard_reviews_user_id on public.flashcard_reviews(user_id);
create index if not exists idx_flashcard_reviews_card_id on public.flashcard_reviews(card_id);
create index if not exists idx_flashcard_reviews_user_date on public.flashcard_reviews(user_id, reviewed_at desc);

alter table public.flashcard_reviews enable row level security;

create policy "Flashcard reviews select own" on public.flashcard_reviews for select using (user_id = auth.uid());
create policy "Flashcard reviews insert own" on public.flashcard_reviews for insert with check (user_id = auth.uid());
create policy "Flashcard reviews update own" on public.flashcard_reviews for update using (user_id = auth.uid());
create policy "Flashcard reviews delete own" on public.flashcard_reviews for delete using (user_id = auth.uid());
