-- ==============================================================================
-- LearnTrack: Optional Development & Local Demo Seed Script (Phase 8)
-- ==============================================================================
-- IMPORTANT:
-- This script is strictly for local/staging database development and testing.
-- It seeds an isolated demo student profile ('00000000-0000-0000-0000-000000000099').
-- NEVER run this in a production environment with real student accounts.
-- ==============================================================================

DO $$
DECLARE
    demo_user_id UUID := '00000000-0000-0000-0000-000000000099';
    demo_student_id UUID;
    sub_ml_id UUID;
    sub_db_id UUID;
    sub_se_id UUID;
    sub_cc_id UUID;
    sub_dm_id UUID;
BEGIN
    -- 1. Create or update profile for demo user
    INSERT INTO public.profiles (id, full_name, email, university, department, year, semester)
    VALUES (
        demo_user_id,
        'Alex Mitchell (Demo Student)',
        'demo.student@learntrack.dev',
        'Institute of Technology & Science',
        'Computer Science & Engineering',
        3,
        6
    )
    ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        semester = EXCLUDED.semester;

    -- 2. Create student record
    INSERT INTO public.students (profile_id, roll_number, university, department, year, semester, section)
    VALUES (
        demo_user_id,
        'LT-2024-DEMO99',
        'Institute of Technology & Science',
        'Computer Science & Engineering',
        3,
        6,
        'A'
    )
    ON CONFLICT (profile_id) DO UPDATE SET
        roll_number = EXCLUDED.roll_number
    RETURNING id INTO demo_student_id;

    -- Clean up existing demo data for this student to ensure idempotency
    DELETE FROM public.subjects WHERE student_id = demo_student_id;

    -- 3. Insert Subjects
    INSERT INTO public.subjects (student_id, subject_name, subject_code, credits, semester)
    VALUES (demo_student_id, 'Advanced Machine Learning', 'CS601', 4, 6)
    RETURNING id INTO sub_ml_id;

    INSERT INTO public.subjects (student_id, subject_name, subject_code, credits, semester)
    VALUES (demo_student_id, 'Distributed Database Systems', 'CS602', 4, 6)
    RETURNING id INTO sub_db_id;

    INSERT INTO public.subjects (student_id, subject_name, subject_code, credits, semester)
    VALUES (demo_student_id, 'Software Engineering & Agile', 'CS603', 3, 6)
    RETURNING id INTO sub_se_id;

    INSERT INTO public.subjects (student_id, subject_name, subject_code, credits, semester)
    VALUES (demo_student_id, 'Cloud Computing & DevOps', 'CS604', 3, 6)
    RETURNING id INTO sub_cc_id;

    INSERT INTO public.subjects (student_id, subject_name, subject_code, credits, semester)
    VALUES (demo_student_id, 'Discrete Mathematics & Optimization', 'MA605', 4, 6)
    RETURNING id INTO sub_dm_id;

    -- 4. Insert Academic Records
    INSERT INTO public.academic_records (
        student_id, subject_id, academic_year, semester,
        attendance_percentage, assignment_marks, internal_marks, exam_marks, total_marks, grade, grade_point
    ) VALUES
    (demo_student_id, sub_ml_id, '2025-2026', 6, 92.5, 19.0, 28.5, 42.0, 89.5, 'A+', 9.0),
    (demo_student_id, sub_db_id, '2025-2026', 6, 84.0, 17.5, 24.0, 36.5, 78.0, 'B+', 8.0),
    (demo_student_id, sub_se_id, '2025-2026', 6, 90.0, 18.5, 26.5, 40.0, 85.0, 'A', 8.5),
    (demo_student_id, sub_cc_id, '2025-2026', 6, 88.0, 18.0, 25.0, 39.0, 82.0, 'A', 8.2),
    (demo_student_id, sub_dm_id, '2025-2026', 6, 78.5, 16.0, 21.0, 34.5, 71.5, 'B', 7.2);

    -- 5. Insert Study Activity
    INSERT INTO public.study_activity (student_id, study_date, study_hours, assignments_completed, notes)
    VALUES
    (demo_student_id, CURRENT_DATE - INTERVAL '1 day', 3.5, 1, 'Deep learning backpropagation notes revision'),
    (demo_student_id, CURRENT_DATE - INTERVAL '2 days', 2.0, 0, 'Database normalization practice questions'),
    (demo_student_id, CURRENT_DATE - INTERVAL '3 days', 4.0, 2, 'DevOps lab exercise on Docker containerization');

    -- 6. Insert Academic Goals
    INSERT INTO public.academic_goals (student_id, title, target_type, target_value, current_value, status, deadline)
    VALUES
    (demo_student_id, 'Maintain CGPA Above 8.5', 'cgpa', 8.5, 8.18, 'in_progress', CURRENT_DATE + INTERVAL '60 days'),
    (demo_student_id, 'Reach 85% Attendance in Discrete Math', 'attendance', 85.0, 78.5, 'in_progress', CURRENT_DATE + INTERVAL '30 days');

    RAISE NOTICE 'Demo student seeded successfully with ID: %', demo_student_id;
END $$;
