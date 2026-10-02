-- ==============================================================================
-- LearnTrack Phase 13: Student Operating System Migration
-- Assignments, Focus Sessions, Learning Memory, Skills, Career, Projects,
-- Interview Studio & Achievements
-- ==============================================================================

-- 1. ASSIGNMENTS & TASKS
create table if not exists public.assignments (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references auth.users(id) on delete cascade,
    subject_id uuid references public.subjects(id) on delete set null,
    subject_name text not null default 'General',
    title text not null,
    description text default '',
    type text not null check (type in ('Assignment', 'Lab', 'Project', 'Presentation', 'Exam', 'Deadline')) default 'Assignment',
    status text not null check (status in ('Not Started', 'In Progress', 'Submitted', 'Completed', 'Overdue')) default 'Not Started',
    priority text not null check (priority in ('Low', 'Medium', 'High', 'Urgent')) default 'Medium',
    due_date timestamp with time zone not null,
    estimated_minutes integer default 60,
    actual_minutes integer default 0,
    attachments jsonb default '[]'::jsonb,
    notes text default '',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.assignment_tasks (
    id uuid primary key default uuid_generate_v4(),
    assignment_id uuid not null references public.assignments(id) on delete cascade,
    user_id uuid not null references auth.users(id) on delete cascade,
    title text not null,
    completed boolean default false,
    estimated_minutes integer default 15,
    order_index integer default 0,
    study_plan_task_id uuid,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. FOCUS SESSIONS
create table if not exists public.focus_sessions (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references auth.users(id) on delete cascade,
    subject_id uuid references public.subjects(id) on delete set null,
    subject_name text not null,
    task_title text not null,
    objective text default '',
    duration_minutes integer not null default 25,
    target_duration_minutes integer not null default 25,
    status text not null check (status in ('completed', 'cancelled', 'interrupted')) default 'completed',
    reflection text default '',
    notes text default '',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. LEARNING MEMORY ITEMS
create table if not exists public.learning_memory_items (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references auth.users(id) on delete cascade,
    subject text not null,
    topic text not null,
    status text not null check (status in ('mastered', 'needs_review', 'recently_practiced', 'recommended_next')),
    mastery_score numeric(5,2) default 0.0,
    evidence_count integer default 1,
    last_activity_at timestamp with time zone default timezone('utc'::text, now()) not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. SKILLS & EVIDENCE
create table if not exists public.skills (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references auth.users(id) on delete cascade,
    name text not null,
    category text not null default 'Technical',
    level text not null check (level in ('Beginner', 'Intermediate', 'Advanced', 'Strong', 'Expert')) default 'Intermediate',
    score numeric(5,2) not null default 0.0,
    verified_evidence_count integer default 0,
    recent_activity text default '',
    weak_areas text[] default array[]::text[],
    recommended_action text default '',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.skill_evidence (
    id uuid primary key default uuid_generate_v4(),
    skill_id uuid not null references public.skills(id) on delete cascade,
    user_id uuid not null references auth.users(id) on delete cascade,
    source_type text not null check (source_type in ('practice_quiz', 'project', 'academic_record', 'coding_exercise', 'assessment')),
    source_id text,
    description text not null,
    score_impact numeric(5,2) default 0.0,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. CAREER PROFILES & ROADMAPS
create table if not exists public.career_profiles (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references auth.users(id) on delete cascade,
    target_role text not null default 'AI / ML Engineer',
    secondary_roles text[] default array[]::text[],
    current_strengths text[] default array[]::text[],
    development_areas text[] default array[]::text[],
    resume_summary text default '',
    raw_resume_text text default '',
    ats_match_score numeric(5,2) default 0.0,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. PROJECTS PORTFOLIO
create table if not exists public.projects (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references auth.users(id) on delete cascade,
    title text not null,
    description text not null,
    tech_stack text[] default array[]::text[],
    github_url text default '',
    demo_url text default '',
    status text not null check (status in ('Idea', 'In Progress', 'Completed', 'Archived')) default 'In Progress',
    skills_used text[] default array[]::text[],
    documentation text default '',
    ai_bullets text[] default array[]::text[],
    readme_outline text default '',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. INTERVIEW SESSIONS & QUESTIONS
create table if not exists public.interview_sessions (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references auth.users(id) on delete cascade,
    mode text not null check (mode in ('Technical', 'AIML', 'Python', 'SQL', 'Project', 'HR')) default 'AIML',
    target_role text not null default 'AI / ML Engineer',
    status text not null check (status in ('active', 'completed', 'cancelled')) default 'active',
    overall_feedback text default '',
    technical_coverage text default '',
    topics_covered text[] default array[]::text[],
    areas_to_revise text[] default array[]::text[],
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.interview_questions (
    id uuid primary key default uuid_generate_v4(),
    session_id uuid not null references public.interview_sessions(id) on delete cascade,
    user_id uuid not null references auth.users(id) on delete cascade,
    question_index integer not null default 1,
    question text not null,
    user_answer text default '',
    feedback text default '',
    suggested_answer text default '',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 8. ACHIEVEMENTS & STUDENT BADGES
create table if not exists public.student_achievements (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references auth.users(id) on delete cascade,
    badge_key text not null,
    title text not null,
    description text not null,
    icon text not null default 'Award',
    category text not null default 'Study',
    unlocked_at timestamp with time zone default timezone('utc'::text, now()) not null,
    progress integer default 100,
    target integer default 100,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==============================================================================
-- INDEXES
-- ==============================================================================
create index if not exists idx_assignments_user_id on public.assignments(user_id);
create index if not exists idx_assignments_due_date on public.assignments(user_id, due_date);
create index if not exists idx_assignment_tasks_assignment on public.assignment_tasks(assignment_id);
create index if not exists idx_focus_sessions_user_id on public.focus_sessions(user_id);
create index if not exists idx_learning_memory_user_id on public.learning_memory_items(user_id);
create index if not exists idx_skills_user_id on public.skills(user_id);
create index if not exists idx_skill_evidence_skill_id on public.skill_evidence(skill_id);
create index if not exists idx_career_profiles_user_id on public.career_profiles(user_id);
create index if not exists idx_projects_user_id on public.projects(user_id);
create index if not exists idx_interview_sessions_user_id on public.interview_sessions(user_id);
create index if not exists idx_interview_questions_session on public.interview_questions(session_id);
create index if not exists idx_student_achievements_user_id on public.student_achievements(user_id);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
alter table public.assignments enable row level security;
alter table public.assignment_tasks enable row level security;
alter table public.focus_sessions enable row level security;
alter table public.learning_memory_items enable row level security;
alter table public.skills enable row level security;
alter table public.skill_evidence enable row level security;
alter table public.career_profiles enable row level security;
alter table public.projects enable row level security;
alter table public.interview_sessions enable row level security;
alter table public.interview_questions enable row level security;
alter table public.student_achievements enable row level security;

-- Assignments RLS
create policy "Assignments select own" on public.assignments for select using (user_id = auth.uid());
create policy "Assignments insert own" on public.assignments for insert with check (user_id = auth.uid());
create policy "Assignments update own" on public.assignments for update using (user_id = auth.uid());
create policy "Assignments delete own" on public.assignments for delete using (user_id = auth.uid());

-- Assignment Tasks RLS
create policy "Assignment tasks select own" on public.assignment_tasks for select using (user_id = auth.uid());
create policy "Assignment tasks insert own" on public.assignment_tasks for insert with check (user_id = auth.uid());
create policy "Assignment tasks update own" on public.assignment_tasks for update using (user_id = auth.uid());
create policy "Assignment tasks delete own" on public.assignment_tasks for delete using (user_id = auth.uid());

-- Focus Sessions RLS
create policy "Focus sessions select own" on public.focus_sessions for select using (user_id = auth.uid());
create policy "Focus sessions insert own" on public.focus_sessions for insert with check (user_id = auth.uid());
create policy "Focus sessions update own" on public.focus_sessions for update using (user_id = auth.uid());
create policy "Focus sessions delete own" on public.focus_sessions for delete using (user_id = auth.uid());

-- Learning Memory RLS
create policy "Learning memory select own" on public.learning_memory_items for select using (user_id = auth.uid());
create policy "Learning memory insert own" on public.learning_memory_items for insert with check (user_id = auth.uid());
create policy "Learning memory update own" on public.learning_memory_items for update using (user_id = auth.uid());
create policy "Learning memory delete own" on public.learning_memory_items for delete using (user_id = auth.uid());

-- Skills RLS
create policy "Skills select own" on public.skills for select using (user_id = auth.uid());
create policy "Skills insert own" on public.skills for insert with check (user_id = auth.uid());
create policy "Skills update own" on public.skills for update using (user_id = auth.uid());
create policy "Skills delete own" on public.skills for delete using (user_id = auth.uid());

-- Skill Evidence RLS
create policy "Skill evidence select own" on public.skill_evidence for select using (user_id = auth.uid());
create policy "Skill evidence insert own" on public.skill_evidence for insert with check (user_id = auth.uid());

-- Career Profiles RLS
create policy "Career profiles select own" on public.career_profiles for select using (user_id = auth.uid());
create policy "Career profiles insert own" on public.career_profiles for insert with check (user_id = auth.uid());
create policy "Career profiles update own" on public.career_profiles for update using (user_id = auth.uid());

-- Projects RLS
create policy "Projects select own" on public.projects for select using (user_id = auth.uid());
create policy "Projects insert own" on public.projects for insert with check (user_id = auth.uid());
create policy "Projects update own" on public.projects for update using (user_id = auth.uid());
create policy "Projects delete own" on public.projects for delete using (user_id = auth.uid());

-- Interview Sessions RLS
create policy "Interview sessions select own" on public.interview_sessions for select using (user_id = auth.uid());
create policy "Interview sessions insert own" on public.interview_sessions for insert with check (user_id = auth.uid());
create policy "Interview sessions update own" on public.interview_sessions for update using (user_id = auth.uid());
create policy "Interview sessions delete own" on public.interview_sessions for delete using (user_id = auth.uid());

-- Interview Questions RLS
create policy "Interview questions select own" on public.interview_questions for select using (user_id = auth.uid());
create policy "Interview questions insert own" on public.interview_questions for insert with check (user_id = auth.uid());

-- Student Achievements RLS
create policy "Achievements select own" on public.student_achievements for select using (user_id = auth.uid());
create policy "Achievements insert own" on public.student_achievements for insert with check (user_id = auth.uid());
create policy "Achievements update own" on public.student_achievements for update using (user_id = auth.uid());

-- Grants
grant select, insert, update, delete on all tables in schema public to authenticated;
