-- ==============================================================================
-- LearnTrack Phase 2: Complete Relational Schema, Constraints, Indexes & RLS
-- ==============================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES (Extends auth.users)
create table if not exists public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    full_name text not null,
    email text not null unique,
    avatar_url text,
    university text default 'Institute of Technology & Science',
    department text default 'Computer Science & Engineering',
    year integer default 1,
    semester integer default 1,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. STUDENTS (Primary student record attached to profile)
create table if not exists public.students (
    id uuid primary key default uuid_generate_v4(),
    profile_id uuid not null unique references public.profiles(id) on delete cascade,
    roll_number text,
    university text,
    department text,
    year integer check (year >= 1 and year <= 6),
    semester integer check (semester >= 1 and semester <= 12),
    section text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. SUBJECTS (Enrolled courses for student)
create table if not exists public.subjects (
    id uuid primary key default uuid_generate_v4(),
    student_id uuid not null references public.students(id) on delete cascade,
    subject_name text not null,
    subject_code text,
    credits numeric not null check (credits > 0 and credits <= 12),
    semester integer not null check (semester >= 1 and semester <= 12),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    constraint unique_student_subject_code unique (student_id, subject_code)
);

-- 4. ACADEMIC RECORDS (Continuous marks, exams, attendance per subject)
create table if not exists public.academic_records (
    id uuid primary key default uuid_generate_v4(),
    student_id uuid not null references public.students(id) on delete cascade,
    subject_id uuid not null references public.subjects(id) on delete cascade,
    academic_year text,
    semester integer not null check (semester >= 1 and semester <= 12),
    attendance_percentage numeric not null check (attendance_percentage >= 0 and attendance_percentage <= 100),
    assignment_marks numeric not null check (assignment_marks >= 0 and assignment_marks <= 100),
    internal_marks numeric not null check (internal_marks >= 0 and internal_marks <= 100),
    exam_marks numeric check (exam_marks >= 0 and exam_marks <= 100),
    total_marks numeric not null check (total_marks >= 0 and total_marks <= 100),
    grade text not null,
    grade_point numeric check (grade_point >= 0 and grade_point <= 10),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    constraint unique_student_subject_record unique (student_id, subject_id, semester)
);

-- 5. STUDY ACTIVITY (Daily / session logged focused hours)
create table if not exists public.study_activity (
    id uuid primary key default uuid_generate_v4(),
    student_id uuid not null references public.students(id) on delete cascade,
    study_date date not null default current_date,
    study_hours numeric not null check (study_hours >= 0 and study_hours <= 24),
    assignments_completed integer default 0 check (assignments_completed >= 0),
    notes text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==============================================================================
-- DATABASE INDEXES
-- ==============================================================================
create index if not exists idx_students_profile_id on public.students(profile_id);
create index if not exists idx_subjects_student_id on public.subjects(student_id);
create index if not exists idx_academic_records_student_id on public.academic_records(student_id);
create index if not exists idx_academic_records_subject_id on public.academic_records(subject_id);
create index if not exists idx_academic_records_semester on public.academic_records(semester);
create index if not exists idx_study_activity_student_id on public.study_activity(student_id);
create index if not exists idx_study_activity_date on public.study_activity(student_id, study_date);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ==============================================================================
alter table public.profiles enable row level security;
alter table public.students enable row level security;
alter table public.subjects enable row level security;
alter table public.academic_records enable row level security;
alter table public.study_activity enable row level security;

-- PROFILES Policies
create policy "Profiles select own" on public.profiles for select using (auth.uid() = id);
create policy "Profiles insert own" on public.profiles for insert with check (auth.uid() = id);
create policy "Profiles update own" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

-- STUDENTS Policies
create policy "Students select own" on public.students for select using (profile_id = auth.uid());
create policy "Students insert own" on public.students for insert with check (profile_id = auth.uid());
create policy "Students update own" on public.students for update using (profile_id = auth.uid()) with check (profile_id = auth.uid());
create policy "Students delete own" on public.students for delete using (profile_id = auth.uid());

-- SUBJECTS Policies
create policy "Subjects select own" on public.subjects for select using (
    student_id in (select id from public.students where profile_id = auth.uid())
);
create policy "Subjects insert own" on public.subjects for insert with check (
    student_id in (select id from public.students where profile_id = auth.uid())
);
create policy "Subjects update own" on public.subjects for update using (
    student_id in (select id from public.students where profile_id = auth.uid())
) with check (
    student_id in (select id from public.students where profile_id = auth.uid())
);
create policy "Subjects delete own" on public.subjects for delete using (
    student_id in (select id from public.students where profile_id = auth.uid())
);

-- ACADEMIC RECORDS Policies
create policy "Academic records select own" on public.academic_records for select using (
    student_id in (select id from public.students where profile_id = auth.uid())
);
create policy "Academic records insert own" on public.academic_records for insert with check (
    student_id in (select id from public.students where profile_id = auth.uid())
);
create policy "Academic records update own" on public.academic_records for update using (
    student_id in (select id from public.students where profile_id = auth.uid())
) with check (
    student_id in (select id from public.students where profile_id = auth.uid())
);
create policy "Academic records delete own" on public.academic_records for delete using (
    student_id in (select id from public.students where profile_id = auth.uid())
);

-- STUDY ACTIVITY Policies
create policy "Study activity select own" on public.study_activity for select using (
    student_id in (select id from public.students where profile_id = auth.uid())
);
create policy "Study activity insert own" on public.study_activity for insert with check (
    student_id in (select id from public.students where profile_id = auth.uid())
);
create policy "Study activity update own" on public.study_activity for update using (
    student_id in (select id from public.students where profile_id = auth.uid())
) with check (
    student_id in (select id from public.students where profile_id = auth.uid())
);
create policy "Study activity delete own" on public.study_activity for delete using (
    student_id in (select id from public.students where profile_id = auth.uid())
);

-- ==============================================================================
-- AUTOMATIC TIMESTAMPS TRIGGER
-- ==============================================================================
create or replace function public.handle_updated_at()
returns trigger as $$
begin
    new.updated_at = timezone('utc'::text, now());
    return new;
end;
$$ language plpgsql;

create or replace trigger set_students_updated_at before update on public.students for each row execute procedure public.handle_updated_at();
create or replace trigger set_subjects_updated_at before update on public.subjects for each row execute procedure public.handle_updated_at();
create or replace trigger set_academic_records_updated_at before update on public.academic_records for each row execute procedure public.handle_updated_at();

-- ==============================================================================
-- 6. PERFORMANCE PREDICTIONS (ML inference tracking & history)
-- ==============================================================================
create table if not exists public.performance_predictions (
    id uuid primary key default uuid_generate_v4(),
    student_id uuid not null references public.students(id) on delete cascade,
    predicted_score numeric(5,2) not null check (predicted_score >= 0 and predicted_score <= 100),
    predicted_grade text not null,
    risk_level text not null,
    model_version text not null,
    features jsonb,
    explanations jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_performance_predictions_student_id on public.performance_predictions(student_id);
create index if not exists idx_performance_predictions_created_at on public.performance_predictions(student_id, created_at desc);

alter table public.performance_predictions enable row level security;

create policy "Predictions select own" on public.performance_predictions for select using (
    student_id in (select id from public.students where profile_id = auth.uid())
);
create policy "Predictions insert own" on public.performance_predictions for insert with check (
    student_id in (select id from public.students where profile_id = auth.uid())
);
create policy "Predictions delete own" on public.performance_predictions for delete using (
    student_id in (select id from public.students where profile_id = auth.uid())
);

-- ==============================================================================
-- 7. PERFORMANCE INSIGHTS (Phase 5 Explainable AI & Rule-Based Guidance)
-- ==============================================================================
create table if not exists public.performance_insights (
    id uuid primary key default uuid_generate_v4(),
    student_id uuid not null references public.students(id) on delete cascade,
    prediction_id uuid references public.performance_predictions(id) on delete set null,
    insight_type text not null check (insight_type in ('strength', 'improvement', 'trend', 'recommendation')),
    title text not null,
    description text not null,
    importance text not null check (importance in ('high', 'medium', 'low')),
    score numeric(5,2) default 0.0,
    supporting_value numeric(5,2),
    supporting_label text,
    action_label text,
    action_route text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_performance_insights_student_id on public.performance_insights(student_id);
create index if not exists idx_performance_insights_created_at on public.performance_insights(student_id, created_at desc);

alter table public.performance_insights enable row level security;

create policy "Insights select own" on public.performance_insights for select using (
    student_id in (select id from public.students where profile_id = auth.uid())
);
create policy "Insights insert own" on public.performance_insights for insert with check (
    student_id in (select id from public.students where profile_id = auth.uid())
);
create policy "Insights delete own" on public.performance_insights for delete using (
    student_id in (select id from public.students where profile_id = auth.uid())
);

-- ==============================================================================
-- 8. SIMULATION HISTORY (Phase 5 What-If Performance Simulator History)
-- ==============================================================================
create table if not exists public.simulation_history (
    id uuid primary key default uuid_generate_v4(),
    student_id uuid not null references public.students(id) on delete cascade,
    original_features jsonb not null,
    simulated_features jsonb not null,
    current_prediction numeric(5,2) not null,
    simulated_prediction numeric(5,2) not null,
    difference numeric(5,2) not null,
    model_version text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_simulation_history_student_id on public.simulation_history(student_id);
create index if not exists idx_simulation_history_created_at on public.simulation_history(student_id, created_at desc);

alter table public.simulation_history enable row level security;

create policy "Simulations select own" on public.simulation_history for select using (
    student_id in (select id from public.students where profile_id = auth.uid())
);
create policy "Simulations insert own" on public.simulation_history for insert with check (
    student_id in (select id from public.students where profile_id = auth.uid())
);
create policy "Simulations delete own" on public.simulation_history for delete using (
    student_id in (select id from public.students where profile_id = auth.uid())
);

-- ==============================================================================
-- 9. AI CONVERSATIONS (Phase 6 AI Study Assistant History)
-- ==============================================================================
create table if not exists public.ai_conversations (
    id uuid primary key default uuid_generate_v4(),
    student_id uuid not null references public.students(id) on delete cascade,
    title text not null default 'New Conversation',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_ai_conversations_student_id on public.ai_conversations(student_id);
create index if not exists idx_ai_conversations_updated_at on public.ai_conversations(student_id, updated_at desc);

alter table public.ai_conversations enable row level security;

create policy "Conversations select own" on public.ai_conversations for select using (
    student_id in (select id from public.students where profile_id = auth.uid())
);
create policy "Conversations insert own" on public.ai_conversations for insert with check (
    student_id in (select id from public.students where profile_id = auth.uid())
);
create policy "Conversations update own" on public.ai_conversations for update using (
    student_id in (select id from public.students where profile_id = auth.uid())
);
create policy "Conversations delete own" on public.ai_conversations for delete using (
    student_id in (select id from public.students where profile_id = auth.uid())
);

-- ==============================================================================
-- 10. AI MESSAGES (Phase 6 AI Assistant Conversation Messages)
-- ==============================================================================
create table if not exists public.ai_messages (
    id uuid primary key default uuid_generate_v4(),
    conversation_id uuid not null references public.ai_conversations(id) on delete cascade,
    role text not null check (role in ('user', 'assistant')),
    content text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_ai_messages_conversation_id on public.ai_messages(conversation_id);
create index if not exists idx_ai_messages_created_at on public.ai_messages(conversation_id, created_at asc);

alter table public.ai_messages enable row level security;

create policy "Messages select own" on public.ai_messages for select using (
    conversation_id in (
        select id from public.ai_conversations where student_id in (
            select id from public.students where profile_id = auth.uid()
        )
    )
);
create policy "Messages insert own" on public.ai_messages for insert with check (
    conversation_id in (
        select id from public.ai_conversations where student_id in (
            select id from public.students where profile_id = auth.uid()
        )
    )
);
create policy "Messages delete own" on public.ai_messages for delete using (
    conversation_id in (
        select id from public.ai_conversations where student_id in (
            select id from public.students where profile_id = auth.uid()
        )
    )
);

-- ==============================================================================
-- 11. STUDY PLANS (Phase 6 Personalized Study Planner)
-- ==============================================================================
create table if not exists public.study_plans (
    id uuid primary key default uuid_generate_v4(),
    student_id uuid not null references public.students(id) on delete cascade,
    title text not null,
    start_date date not null,
    end_date date not null,
    status text not null check (status in ('active', 'completed', 'archived')) default 'active',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_study_plans_student_id on public.study_plans(student_id);
create index if not exists idx_study_plans_created_at on public.study_plans(student_id, created_at desc);

alter table public.study_plans enable row level security;

create policy "Study plans select own" on public.study_plans for select using (
    student_id in (select id from public.students where profile_id = auth.uid())
);
create policy "Study plans insert own" on public.study_plans for insert with check (
    student_id in (select id from public.students where profile_id = auth.uid())
);
create policy "Study plans update own" on public.study_plans for update using (
    student_id in (select id from public.students where profile_id = auth.uid())
);
create policy "Study plans delete own" on public.study_plans for delete using (
    student_id in (select id from public.students where profile_id = auth.uid())
);

-- ==============================================================================
-- 12. STUDY PLAN SESSIONS (Phase 6 Individual Scheduled Study Sessions)
-- ==============================================================================
create table if not exists public.study_plan_sessions (
    id uuid primary key default uuid_generate_v4(),
    study_plan_id uuid not null references public.study_plans(id) on delete cascade,
    subject_id uuid references public.subjects(id) on delete set null,
    session_date date not null,
    start_time text not null,
    duration_minutes integer not null check (duration_minutes > 0),
    topic text not null,
    activity text not null,
    status text not null check (status in ('upcoming', 'in_progress', 'completed', 'skipped', 'rescheduled')) default 'upcoming',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_study_plan_sessions_plan_id on public.study_plan_sessions(study_plan_id);
create index if not exists idx_study_plan_sessions_date on public.study_plan_sessions(session_date, start_time);

alter table public.study_plan_sessions enable row level security;

create policy "Plan sessions select own" on public.study_plan_sessions for select using (
    study_plan_id in (
        select id from public.study_plans where student_id in (
            select id from public.students where profile_id = auth.uid()
        )
    )
);
create policy "Plan sessions insert own" on public.study_plan_sessions for insert with check (
    study_plan_id in (
        select id from public.study_plans where student_id in (
            select id from public.students where profile_id = auth.uid()
        )
    )
);
create policy "Plan sessions update own" on public.study_plan_sessions for update using (
    study_plan_id in (
        select id from public.study_plans where student_id in (
            select id from public.students where profile_id = auth.uid()
        )
    )
);
create policy "Plan sessions delete own" on public.study_plan_sessions for delete using (
    study_plan_id in (
        select id from public.study_plans where student_id in (
            select id from public.students where profile_id = auth.uid()
        )
    )
);

-- ==============================================================================
-- 13. ACADEMIC GOALS (Phase 7 Academic Progress & Goal Intelligence)
-- ==============================================================================
create table if not exists public.academic_goals (
    id uuid primary key default uuid_generate_v4(),
    student_id uuid not null references public.students(id) on delete cascade,
    subject_id uuid references public.subjects(id) on delete set null,
    title text not null,
    description text,
    goal_type text not null check (goal_type in ('attendance', 'average_score', 'subject_score', 'study_hours', 'assignments')),
    target_value numeric(5,2) not null,
    current_value numeric(5,2) not null default 0.0,
    unit text not null default '%',
    deadline date,
    status text not null check (status in ('active', 'completed', 'paused', 'expired')) default 'active',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_academic_goals_student_id on public.academic_goals(student_id);
create index if not exists idx_academic_goals_status on public.academic_goals(student_id, status);
create index if not exists idx_academic_goals_deadline on public.academic_goals(deadline);

alter table public.academic_goals enable row level security;

create policy "Goals select own" on public.academic_goals for select using (
    student_id in (select id from public.students where profile_id = auth.uid())
);
create policy "Goals insert own" on public.academic_goals for insert with check (
    student_id in (select id from public.students where profile_id = auth.uid())
);
create policy "Goals update own" on public.academic_goals for update using (
    student_id in (select id from public.students where profile_id = auth.uid())
);
create policy "Goals delete own" on public.academic_goals for delete using (
    student_id in (select id from public.students where profile_id = auth.uid())
);

-- ==============================================================================
-- 14. ML EXPERIMENTS & MODEL REGISTRY (Phase 10 MLflow Integration)
-- ==============================================================================
create table if not exists public.ml_experiments (
    id text primary key, -- MLflow Run ID
    experiment_name text not null,
    run_name text,
    model_type text not null,
    dataset_version text not null,
    dataset_hash text,
    parameters jsonb,
    metrics jsonb,
    status text not null,
    git_commit text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.ml_model_versions (
    id uuid primary key default uuid_generate_v4(),
    model_name text not null,
    version text not null,
    run_id text references public.ml_experiments(id) on delete set null,
    stage text not null check (stage in ('Candidate', 'Validated', 'Production', 'Archived')) default 'Candidate',
    is_production boolean not null default false,
    metrics jsonb,
    parameters jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    constraint unique_model_version unique (model_name, version)
);

-- ==============================================================================
-- 15. ML PREDICTIONS & MONITORING (Phase 10 Real-World Performance & Drift)
-- ==============================================================================
create table if not exists public.ml_predictions (
    id uuid primary key default uuid_generate_v4(),
    student_id uuid references public.students(id) on delete set null,
    user_id uuid references auth.users(id) on delete set null,
    model_name text not null,
    model_version text not null,
    dataset_version text not null,
    run_id text,
    prediction numeric(5,2) not null check (prediction >= 0 and prediction <= 100),
    latency_ms numeric(8,2),
    feature_snapshot jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.ml_prediction_feedback (
    id uuid primary key default uuid_generate_v4(),
    prediction_id uuid not null references public.ml_predictions(id) on delete cascade,
    actual_score numeric(5,2) not null check (actual_score >= 0 and actual_score <= 100),
    error numeric(5,2) not null,
    absolute_error numeric(5,2) not null,
    feedback_notes text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.ml_monitoring_snapshots (
    id uuid primary key default uuid_generate_v4(),
    window_days integer not null check (window_days in (7, 30, 90)),
    prediction_count integer not null default 0,
    feedback_count integer not null default 0,
    coverage_percentage numeric(5,2),
    mae numeric(5,2),
    rmse numeric(5,2),
    r2 numeric(5,4),
    mean_error numeric(5,2),
    median_absolute_error numeric(5,2),
    max_error numeric(5,2),
    alert_level text not null check (alert_level in ('NORMAL', 'WARNING', 'CRITICAL')) default 'NORMAL',
    snapshot_date date not null default current_date,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.ml_drift_reports (
    id uuid primary key default uuid_generate_v4(),
    report_date date not null default current_date,
    window_days integer not null default 30,
    feature_drifts jsonb not null,
    prediction_drift jsonb not null,
    overall_status text not null check (overall_status in ('NORMAL', 'WARNING', 'CRITICAL')),
    observations_count integer not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==============================================================================
-- INDEXES FOR ML MONITORING
-- ==============================================================================
create index if not exists idx_ml_experiments_name on public.ml_experiments(experiment_name);
create index if not exists idx_ml_model_versions_name on public.ml_model_versions(model_name, is_production);
create index if not exists idx_ml_predictions_user on public.ml_predictions(user_id, created_at desc);
create index if not exists idx_ml_predictions_student on public.ml_predictions(student_id, created_at desc);
create index if not exists idx_ml_feedback_prediction on public.ml_prediction_feedback(prediction_id);
create index if not exists idx_ml_snapshots_date on public.ml_monitoring_snapshots(snapshot_date desc, window_days);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) FOR ML TABLES
-- ==============================================================================
alter table public.ml_experiments enable row level security;
alter table public.ml_model_versions enable row level security;
alter table public.ml_predictions enable row level security;
alter table public.ml_prediction_feedback enable row level security;
alter table public.ml_monitoring_snapshots enable row level security;
alter table public.ml_drift_reports enable row level security;

-- Authenticated users can read model and experiment registry (transparency)
create policy "ML experiments select authenticated" on public.ml_experiments for select to authenticated using (true);
create policy "ML model versions select authenticated" on public.ml_model_versions for select to authenticated using (true);
create policy "ML snapshots select authenticated" on public.ml_monitoring_snapshots for select to authenticated using (true);
create policy "ML drift reports select authenticated" on public.ml_drift_reports for select to authenticated using (true);

-- Users can only view and manage their own prediction records
create policy "ML predictions select own" on public.ml_predictions for select using (
    user_id = auth.uid() or student_id in (select id from public.students where profile_id = auth.uid())
);
create policy "ML predictions insert own" on public.ml_predictions for insert with check (
    user_id = auth.uid() or student_id in (select id from public.students where profile_id = auth.uid())
);

-- Users can only view and insert feedback for predictions they own
create policy "ML feedback select own" on public.ml_prediction_feedback for select using (
    prediction_id in (
        select id from public.ml_predictions where user_id = auth.uid() or student_id in (
            select id from public.students where profile_id = auth.uid()
        )
    )
);
create policy "ML feedback insert own" on public.ml_prediction_feedback for insert with check (
    prediction_id in (
        select id from public.ml_predictions where user_id = auth.uid() or student_id in (
            select id from public.students where profile_id = auth.uid()
        )
    )
);

-- ==============================================================================
-- 16. ML RELIABILITY UPGRADE (Phase 11: Data Quality, Error Analysis & Retraining)
-- ==============================================================================

-- ML DATA QUALITY REPORTS
create table if not exists public.ml_data_quality_reports (
    id uuid primary key default uuid_generate_v4(),
    dataset_version text not null,
    dataset_hash text,
    total_rows integer not null,
    total_columns integer not null,
    validation_status text not null check (validation_status in ('PASSED', 'WARNING', 'FAILED')),
    missing_values integer not null default 0,
    duplicate_rows integer not null default 0,
    numeric_columns jsonb default '[]'::jsonb,
    categorical_columns jsonb default '[]'::jsonb,
    checks jsonb not null,
    issues jsonb default '[]'::jsonb,
    warnings jsonb default '[]'::jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ML ERROR ANALYSIS
create table if not exists public.ml_error_analysis (
    id uuid primary key default uuid_generate_v4(),
    model_name text not null,
    model_version text not null,
    dataset_version text not null default '1.0.0',
    run_id text references public.ml_experiments(id) on delete set null,
    evaluation_type text not null check (evaluation_type in ('BENCHMARK', 'PRODUCTION')),
    sample_count integer not null,
    metrics jsonb not null,
    range_segments jsonb not null,
    feature_segments jsonb not null,
    residual_analysis jsonb not null,
    largest_errors jsonb not null,
    interpretation_guidance jsonb default '[]'::jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ML RETRAINING RUNS
create table if not exists public.ml_retraining_runs (
    id uuid primary key default uuid_generate_v4(),
    trigger text not null check (trigger in ('manual', 'scheduled', 'data_drift', 'performance_degradation', 'new_labeled_data')),
    dataset_version text not null,
    previous_model_version text not null,
    candidate_model_version text,
    candidate_run_id text references public.ml_experiments(id) on delete set null,
    status text not null check (status in ('eligible', 'running', 'completed', 'failed', 'rejected')),
    eligibility_check jsonb not null,
    metrics_comparison jsonb,
    validation_report_id uuid references public.ml_data_quality_reports(id) on delete set null,
    failure_reason text,
    started_at timestamp with time zone default timezone('utc'::text, now()) not null,
    completed_at timestamp with time zone
);

-- ML MODEL PROMOTIONS (AUDIT LOG)
create table if not exists public.ml_model_promotions (
    id uuid primary key default uuid_generate_v4(),
    model_name text not null,
    model_version text not null,
    previous_version text,
    action text not null check (action in ('trained', 'validated', 'promoted', 'rejected', 'rolled_back', 'retraining_triggered', 'retraining_failed')),
    actor text not null default 'system',
    reason text not null,
    metadata jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Indexes
create index if not exists idx_ml_data_quality_created_at on public.ml_data_quality_reports(created_at desc);
create index if not exists idx_ml_error_analysis_model on public.ml_error_analysis(model_name, model_version, evaluation_type);
create index if not exists idx_ml_retraining_runs_status on public.ml_retraining_runs(status, started_at desc);
create index if not exists idx_ml_model_promotions_model on public.ml_model_promotions(model_name, created_at desc);

-- RLS
alter table public.ml_data_quality_reports enable row level security;
alter table public.ml_error_analysis enable row level security;
alter table public.ml_retraining_runs enable row level security;
alter table public.ml_model_promotions enable row level security;

-- Policies for Authenticated Transparency
create policy "ML data quality select authenticated" on public.ml_data_quality_reports for select to authenticated using (true);
create policy "ML error analysis select authenticated" on public.ml_error_analysis for select to authenticated using (true);
create policy "ML retraining runs select authenticated" on public.ml_retraining_runs for select to authenticated using (true);
create policy "ML model promotions select authenticated" on public.ml_model_promotions for select to authenticated using (true);

-- Foreign Key Covering Indexes
create index if not exists idx_academic_goals_subject_id on public.academic_goals(subject_id);
create index if not exists idx_study_plan_sessions_subject_id on public.study_plan_sessions(subject_id);
create index if not exists idx_performance_insights_prediction_id on public.performance_insights(prediction_id);
create index if not exists idx_ml_model_versions_run_id on public.ml_model_versions(run_id);
create index if not exists idx_ml_error_analysis_run_id on public.ml_error_analysis(run_id);
create index if not exists idx_ml_retraining_runs_candidate_run_id on public.ml_retraining_runs(candidate_run_id);
create index if not exists idx_ml_retraining_runs_validation_report_id on public.ml_retraining_runs(validation_report_id);

-- 17. AUTOMATIC USER PROFILE & STUDENT RECORD CREATION TRIGGER
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
    user_full_name text;
    user_avatar text;
begin
    user_full_name := coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1));
    user_avatar := new.raw_user_meta_data->>'avatar_url';

    -- Insert into public.profiles
    insert into public.profiles (id, full_name, email, avatar_url, university, department, year, semester)
    values (
        new.id,
        user_full_name,
        new.email,
        user_avatar,
        'Institute of Technology & Science',
        'Computer Science & Engineering',
        1,
        1
    )
    on conflict (id) do update set
        full_name = coalesce(excluded.full_name, profiles.full_name),
        email = excluded.email;

    -- Insert into public.students
    insert into public.students (profile_id, roll_number, university, department, year, semester, section)
    values (
        new.id,
        concat('LT-', substring(new.id::text from 1 for 8)),
        'Institute of Technology & Science',
        'Computer Science & Engineering',
        1,
        1,
        'A'
    )
    on conflict (profile_id) do nothing;

    return new;
end;
$$;

-- Revoke public execution of SECURITY DEFINER function
revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- Attach trigger to auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute procedure public.handle_new_user();

-- 18. ROLE GRANTS (Tables are secured with Row Level Security)
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant select on all tables in schema public to anon;
grant usage, select on all sequences in schema public to authenticated;
alter default privileges in schema public grant select, insert, update, delete on tables to authenticated;
alter default privileges in schema public grant select on tables to anon;
alter default privileges in schema public grant usage, select on sequences to authenticated;

-- ==============================================================================
-- 19. LEARNING OS EXPANSION (Notebooks, Notes, Knowledge, Flashcards, Quizzes, Tutor, Exam)
-- ==============================================================================

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

create table if not exists public.flashcards (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references auth.users(id) on delete cascade,
    deck_id uuid references public.flashcard_decks(id) on delete set null,
    notebook_id uuid references public.notebooks(id) on delete set null,
    subject_id uuid references public.subjects(id) on delete set null,
    source_id uuid references public.knowledge_sources(id) on delete set null,
    front text not null,
    back text not null,
    topic text not null default 'General',
    difficulty text default 'medium',
    card_type text default 'concept',
    explanation text,
    example text,
    hint text,
    source_reference text,
    tags text[] default '{}',
    state text not null check (state in ('new', 'learning', 'review', 'mastered')) default 'new',
    interval_days integer default 1,
    ease_factor numeric(4,2) default 2.50,
    reps integer default 0,
    lapses integer default 0,
    due_date date default current_date,
    last_reviewed_at timestamp with time zone,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

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

create index if not exists idx_notebooks_user_id on public.notebooks(user_id);
create index if not exists idx_notes_notebook_id on public.notes(notebook_id);
create index if not exists idx_notes_user_id on public.notes(user_id);
create index if not exists idx_knowledge_sources_user_id on public.knowledge_sources(user_id);
create index if not exists idx_flashcard_decks_user_id on public.flashcard_decks(user_id);
create index if not exists idx_flashcards_user_id on public.flashcards(user_id);
create index if not exists idx_flashcards_deck_id on public.flashcards(deck_id);
create index if not exists idx_flashcards_due_date on public.flashcards(user_id, due_date);
create index if not exists idx_flashcard_reviews_user_id on public.flashcard_reviews(user_id);
create index if not exists idx_flashcard_reviews_card_id on public.flashcard_reviews(card_id);
create index if not exists idx_flashcard_reviews_reviewed_at on public.flashcard_reviews(user_id, reviewed_at desc);
create index if not exists idx_quizzes_user_id on public.quizzes(user_id);
create index if not exists idx_quiz_attempts_user_id on public.quiz_attempts(user_id);
create index if not exists idx_tutor_conv_user_id on public.tutor_conversations(user_id);
create index if not exists idx_tutor_msgs_conv_id on public.tutor_messages(conversation_id);
create index if not exists idx_exam_plans_user_id on public.exam_plans(user_id);
create index if not exists idx_student_resources_user_id on public.student_resources(user_id);

alter table public.notebooks enable row level security;
alter table public.notes enable row level security;
alter table public.knowledge_sources enable row level security;
alter table public.flashcard_decks enable row level security;
alter table public.flashcards enable row level security;
alter table public.flashcard_reviews enable row level security;
alter table public.quizzes enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.tutor_conversations enable row level security;
alter table public.tutor_messages enable row level security;
alter table public.exam_plans enable row level security;
alter table public.student_resources enable row level security;

create policy "Notebooks select own" on public.notebooks for select using (user_id = auth.uid());
create policy "Notebooks insert own" on public.notebooks for insert with check (user_id = auth.uid());
create policy "Notebooks update own" on public.notebooks for update using (user_id = auth.uid());
create policy "Notebooks delete own" on public.notebooks for delete using (user_id = auth.uid());

create policy "Notes select own" on public.notes for select using (user_id = auth.uid());
create policy "Notes insert own" on public.notes for insert with check (user_id = auth.uid());
create policy "Notes update own" on public.notes for update using (user_id = auth.uid());
create policy "Notes delete own" on public.notes for delete using (user_id = auth.uid());

create policy "Knowledge sources select own" on public.knowledge_sources for select using (user_id = auth.uid());
create policy "Knowledge sources insert own" on public.knowledge_sources for insert with check (user_id = auth.uid());
create policy "Knowledge sources update own" on public.knowledge_sources for update using (user_id = auth.uid());
create policy "Knowledge sources delete own" on public.knowledge_sources for delete using (user_id = auth.uid());

create policy "Flashcard decks select own" on public.flashcard_decks for select using (user_id = auth.uid());
create policy "Flashcard decks insert own" on public.flashcard_decks for insert with check (user_id = auth.uid());
create policy "Flashcard decks update own" on public.flashcard_decks for update using (user_id = auth.uid());
create policy "Flashcard decks delete own" on public.flashcard_decks for delete using (user_id = auth.uid());

create policy "Flashcards select own" on public.flashcards for select using (user_id = auth.uid());
create policy "Flashcards insert own" on public.flashcards for insert with check (user_id = auth.uid());
create policy "Flashcards update own" on public.flashcards for update using (user_id = auth.uid());
create policy "Flashcards delete own" on public.flashcards for delete using (user_id = auth.uid());

create policy "Flashcard reviews select own" on public.flashcard_reviews for select using (user_id = auth.uid());
create policy "Flashcard reviews insert own" on public.flashcard_reviews for insert with check (user_id = auth.uid());
create policy "Flashcard reviews update own" on public.flashcard_reviews for update using (user_id = auth.uid());
create policy "Flashcard reviews delete own" on public.flashcard_reviews for delete using (user_id = auth.uid());

create policy "Quizzes select own" on public.quizzes for select using (user_id = auth.uid());
create policy "Quizzes insert own" on public.quizzes for insert with check (user_id = auth.uid());
create policy "Quizzes update own" on public.quizzes for update using (user_id = auth.uid());
create policy "Quizzes delete own" on public.quizzes for delete using (user_id = auth.uid());

create policy "Quiz attempts select own" on public.quiz_attempts for select using (user_id = auth.uid());
create policy "Quiz attempts insert own" on public.quiz_attempts for insert with check (user_id = auth.uid());

create policy "Tutor conv select own" on public.tutor_conversations for select using (user_id = auth.uid());
create policy "Tutor conv insert own" on public.tutor_conversations for insert with check (user_id = auth.uid());
create policy "Tutor conv update own" on public.tutor_conversations for update using (user_id = auth.uid());
create policy "Tutor conv delete own" on public.tutor_conversations for delete using (user_id = auth.uid());

create policy "Tutor msgs select own" on public.tutor_messages for select using (
    conversation_id in (select id from public.tutor_conversations where user_id = auth.uid())
);
create policy "Tutor msgs insert own" on public.tutor_messages for insert with check (
    conversation_id in (select id from public.tutor_conversations where user_id = auth.uid())
);

create policy "Exam plans select own" on public.exam_plans for select using (user_id = auth.uid());
create policy "Exam plans insert own" on public.exam_plans for insert with check (user_id = auth.uid());
create policy "Exam plans update own" on public.exam_plans for update using (user_id = auth.uid());
create policy "Exam plans delete own" on public.exam_plans for delete using (user_id = auth.uid());

create policy "Student resources select own" on public.student_resources for select using (user_id = auth.uid());
create policy "Student resources insert own" on public.student_resources for insert with check (user_id = auth.uid());
create policy "Student resources update own" on public.student_resources for update using (user_id = auth.uid());
create policy "Student resources delete own" on public.student_resources for delete using (user_id = auth.uid());
