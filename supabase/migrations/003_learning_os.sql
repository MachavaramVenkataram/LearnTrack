-- ==============================================================================
-- LearnTrack Phase 12: Learning OS Expansion
-- Notebooks, Notes, Knowledge Sources, Flashcards, Quizzes, AI Tutor & Exam Prep
-- ==============================================================================

-- 1. NOTEBOOKS
create table if not exists public.notebooks (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references auth.users(id) on delete cascade,
    student_id uuid references public.students(id) on delete set null,
    title text not null,
    description text,
    icon text default '📓',
    color text default '#2563EB',
    subject_id uuid references public.subjects(id) on delete set null,
    is_favorite boolean default false,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. NOTES
create table if not exists public.notes (
    id uuid primary key default uuid_generate_v4(),
    notebook_id uuid not null references public.notebooks(id) on delete cascade,
    user_id uuid not null references auth.users(id) on delete cascade,
    title text not null default 'Untitled Note',
    content text not null default '',
    tags text[] default array[]::text[],
    is_pinned boolean default false,
    word_count integer default 0,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. KNOWLEDGE SOURCES
create table if not exists public.knowledge_sources (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references auth.users(id) on delete cascade,
    notebook_id uuid references public.notebooks(id) on delete set null,
    subject_id uuid references public.subjects(id) on delete set null,
    title text not null,
    source_type text not null check (source_type in ('pdf', 'docx', 'txt', 'markdown', 'url')),
    file_size text,
    file_path text,
    url text,
    processing_status text not null check (processing_status in ('uploading', 'processing', 'extracting', 'indexing', 'ready', 'failed')) default 'ready',
    extracted_text text,
    summary jsonb,
    error_message text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. FLASHCARDS & REPETITION
create table if not exists public.flashcards (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references auth.users(id) on delete cascade,
    notebook_id uuid references public.notebooks(id) on delete set null,
    subject_id uuid references public.subjects(id) on delete set null,
    source_id uuid references public.knowledge_sources(id) on delete set null,
    front text not null,
    back text not null,
    topic text not null default 'General',
    state text not null check (state in ('new', 'learning', 'review', 'mastered')) default 'new',
    interval_days integer default 1,
    ease_factor numeric(4,2) default 2.50,
    reps integer default 0,
    due_date date default current_date,
    last_reviewed_at timestamp with time zone,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. QUIZZES & ATTEMPTS
create table if not exists public.quizzes (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references auth.users(id) on delete cascade,
    notebook_id uuid references public.notebooks(id) on delete set null,
    subject_id uuid references public.subjects(id) on delete set null,
    source_id uuid references public.knowledge_sources(id) on delete set null,
    title text not null,
    topic text not null,
    difficulty text not null check (difficulty in ('Easy', 'Medium', 'Hard')) default 'Medium',
    question_count integer not null default 5,
    questions jsonb not null default '[]'::jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.quiz_attempts (
    id uuid primary key default uuid_generate_v4(),
    quiz_id uuid not null references public.quizzes(id) on delete cascade,
    user_id uuid not null references auth.users(id) on delete cascade,
    score integer not null,
    total_questions integer not null,
    accuracy numeric(5,2) not null,
    time_seconds integer not null default 0,
    user_answers jsonb default '[]'::jsonb,
    weak_topics text[] default array[]::text[],
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. AI TUTOR CONVERSATIONS & MESSAGES
create table if not exists public.tutor_conversations (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references auth.users(id) on delete cascade,
    subject text not null default 'General Academic',
    topic text not null default 'Concept Tutoring',
    mode text not null check (mode in ('Explain', 'Teach', 'Quiz Me', 'Give Hint', 'Solve Step-by-Step', 'Check My Answer', 'Exam Mode')) default 'Explain',
    is_socratic boolean default false,
    title text not null default 'Tutoring Session',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.tutor_messages (
    id uuid primary key default uuid_generate_v4(),
    conversation_id uuid not null references public.tutor_conversations(id) on delete cascade,
    role text not null check (role in ('user', 'assistant')),
    content text not null,
    mode text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. EXAM PREP ROADMAPS
create table if not exists public.exam_plans (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references auth.users(id) on delete cascade,
    subject_id uuid references public.subjects(id) on delete set null,
    subject_name text not null,
    exam_date date not null,
    confidence_level text not null check (confidence_level in ('Low', 'Medium', 'High')) default 'Medium',
    target_score numeric(5,2),
    topics jsonb not null default '[]'::jsonb,
    status text not null check (status in ('active', 'completed', 'archived')) default 'active',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 8. STUDENT RESOURCES & QUESTION PAPERS
create table if not exists public.student_resources (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references auth.users(id) on delete cascade,
    subject_id uuid references public.subjects(id) on delete set null,
    title text not null,
    category text not null check (category in ('Notes', 'Documents', 'Books', 'Links', 'Videos', 'Question Papers', 'Assignments')),
    url text,
    description text,
    tags text[] default array[]::text[],
    metadata jsonb default '{}'::jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==============================================================================
-- INDEXES FOR PERFORMANCE
-- ==============================================================================
create index if not exists idx_notebooks_user_id on public.notebooks(user_id);
create index if not exists idx_notes_notebook_id on public.notes(notebook_id);
create index if not exists idx_notes_user_id on public.notes(user_id);
create index if not exists idx_knowledge_sources_user_id on public.knowledge_sources(user_id);
create index if not exists idx_flashcards_user_id on public.flashcards(user_id);
create index if not exists idx_flashcards_due_date on public.flashcards(user_id, due_date);
create index if not exists idx_quizzes_user_id on public.quizzes(user_id);
create index if not exists idx_quiz_attempts_user_id on public.quiz_attempts(user_id);
create index if not exists idx_tutor_conv_user_id on public.tutor_conversations(user_id);
create index if not exists idx_tutor_msgs_conv_id on public.tutor_messages(conversation_id);
create index if not exists idx_exam_plans_user_id on public.exam_plans(user_id);
create index if not exists idx_student_resources_user_id on public.student_resources(user_id);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
alter table public.notebooks enable row level security;
alter table public.notes enable row level security;
alter table public.knowledge_sources enable row level security;
alter table public.flashcards enable row level security;
alter table public.quizzes enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.tutor_conversations enable row level security;
alter table public.tutor_messages enable row level security;
alter table public.exam_plans enable row level security;
alter table public.student_resources enable row level security;

-- Notebooks RLS
create policy "Notebooks select own" on public.notebooks for select using (user_id = auth.uid());
create policy "Notebooks insert own" on public.notebooks for insert with check (user_id = auth.uid());
create policy "Notebooks update own" on public.notebooks for update using (user_id = auth.uid());
create policy "Notebooks delete own" on public.notebooks for delete using (user_id = auth.uid());

-- Notes RLS
create policy "Notes select own" on public.notes for select using (user_id = auth.uid());
create policy "Notes insert own" on public.notes for insert with check (user_id = auth.uid());
create policy "Notes update own" on public.notes for update using (user_id = auth.uid());
create policy "Notes delete own" on public.notes for delete using (user_id = auth.uid());

-- Knowledge Sources RLS
create policy "Knowledge sources select own" on public.knowledge_sources for select using (user_id = auth.uid());
create policy "Knowledge sources insert own" on public.knowledge_sources for insert with check (user_id = auth.uid());
create policy "Knowledge sources update own" on public.knowledge_sources for update using (user_id = auth.uid());
create policy "Knowledge sources delete own" on public.knowledge_sources for delete using (user_id = auth.uid());

-- Flashcards RLS
create policy "Flashcards select own" on public.flashcards for select using (user_id = auth.uid());
create policy "Flashcards insert own" on public.flashcards for insert with check (user_id = auth.uid());
create policy "Flashcards update own" on public.flashcards for update using (user_id = auth.uid());
create policy "Flashcards delete own" on public.flashcards for delete using (user_id = auth.uid());

-- Quizzes RLS
create policy "Quizzes select own" on public.quizzes for select using (user_id = auth.uid());
create policy "Quizzes insert own" on public.quizzes for insert with check (user_id = auth.uid());
create policy "Quizzes update own" on public.quizzes for update using (user_id = auth.uid());
create policy "Quizzes delete own" on public.quizzes for delete using (user_id = auth.uid());

-- Quiz Attempts RLS
create policy "Quiz attempts select own" on public.quiz_attempts for select using (user_id = auth.uid());
create policy "Quiz attempts insert own" on public.quiz_attempts for insert with check (user_id = auth.uid());

-- Tutor Conversations RLS
create policy "Tutor conv select own" on public.tutor_conversations for select using (user_id = auth.uid());
create policy "Tutor conv insert own" on public.tutor_conversations for insert with check (user_id = auth.uid());
create policy "Tutor conv update own" on public.tutor_conversations for update using (user_id = auth.uid());
create policy "Tutor conv delete own" on public.tutor_conversations for delete using (user_id = auth.uid());

-- Tutor Messages RLS
create policy "Tutor msgs select own" on public.tutor_messages for select using (
    conversation_id in (select id from public.tutor_conversations where user_id = auth.uid())
);
create policy "Tutor msgs insert own" on public.tutor_messages for insert with check (
    conversation_id in (select id from public.tutor_conversations where user_id = auth.uid())
);

-- Exam Plans RLS
create policy "Exam plans select own" on public.exam_plans for select using (user_id = auth.uid());
create policy "Exam plans insert own" on public.exam_plans for insert with check (user_id = auth.uid());
create policy "Exam plans update own" on public.exam_plans for update using (user_id = auth.uid());
create policy "Exam plans delete own" on public.exam_plans for delete using (user_id = auth.uid());

-- Student Resources RLS
create policy "Student resources select own" on public.student_resources for select using (user_id = auth.uid());
create policy "Student resources insert own" on public.student_resources for insert with check (user_id = auth.uid());
create policy "Student resources update own" on public.student_resources for update using (user_id = auth.uid());
create policy "Student resources delete own" on public.student_resources for delete using (user_id = auth.uid());

-- Grants
grant select, insert, update, delete on all tables in schema public to authenticated;
