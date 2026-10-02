-- ==============================================================================
-- LearnTrack Phase 11: ML Reliability Upgrade Migrations
-- Data Quality Reports, Model Error Analysis, Retraining Runs & Promotion Audit
-- ==============================================================================

-- 1. ML DATA QUALITY REPORTS
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

-- 2. ML ERROR ANALYSIS
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

-- 3. ML RETRAINING RUNS
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

-- 4. ML MODEL PROMOTIONS (AUDIT LOG)
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
