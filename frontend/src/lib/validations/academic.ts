/**
 * LearnTrack Academic Input Validation Rules
 * Ensures data integrity across client and server operations.
 */

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export function validateStudentProfile(data: {
  roll_number?: string;
  university?: string;
  department?: string;
  year?: number | string;
  semester?: number | string;
  section?: string;
}): ValidationResult {
  const errors: Record<string, string> = {};

  if (!data.roll_number || data.roll_number.trim().length === 0) {
    errors.roll_number = "Roll number / Student ID is required.";
  }

  if (!data.university || data.university.trim().length === 0) {
    errors.university = "University or college institution is required.";
  }

  if (!data.department || data.department.trim().length === 0) {
    errors.department = "Department or major program is required.";
  }

  const year = Number(data.year);
  if (isNaN(year) || year <= 0 || !Number.isInteger(year) || year > 8) {
    errors.year = "Year must be a positive integer between 1 and 8.";
  }

  const semester = Number(data.semester);
  if (isNaN(semester) || semester <= 0 || !Number.isInteger(semester) || semester > 16) {
    errors.semester = "Semester must be a positive integer between 1 and 16.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateSubject(data: {
  subject_name?: string;
  subject_code?: string;
  credits?: number | string;
  semester?: number | string;
}): ValidationResult {
  const errors: Record<string, string> = {};

  if (!data.subject_name || data.subject_name.trim().length === 0) {
    errors.subject_name = "Subject name is required.";
  }

  const credits = Number(data.credits);
  if (isNaN(credits) || credits <= 0 || credits > 12) {
    errors.credits = "Credits must be a positive number between 1 and 12.";
  }

  const semester = Number(data.semester);
  if (isNaN(semester) || semester <= 0 || !Number.isInteger(semester) || semester > 16) {
    errors.semester = "Semester must be an integer between 1 and 16.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateAcademicRecord(data: {
  subject_id?: string;
  academic_year?: string;
  semester?: number | string;
  attendance_percentage?: number | string;
  internal_marks?: number | string;
  assignment_marks?: number | string;
  exam_marks?: number | string;
}): ValidationResult {
  const errors: Record<string, string> = {};

  if (!data.subject_id) {
    errors.subject_id = "Please select a valid enrolled subject.";
  }

  const attendance = Number(data.attendance_percentage);
  if (isNaN(attendance) || attendance < 0 || attendance > 100) {
    errors.attendance_percentage = "Attendance must be between 0% and 100%.";
  }

  const internal = Number(data.internal_marks);
  if (isNaN(internal) || internal < 0 || internal > 100) {
    errors.internal_marks = "Internal marks must be between 0 and 100.";
  }

  const assignment = Number(data.assignment_marks);
  if (isNaN(assignment) || assignment < 0 || assignment > 100) {
    errors.assignment_marks = "Assignment marks must be between 0 and 100.";
  }

  if (data.exam_marks !== undefined && data.exam_marks !== null && data.exam_marks !== "") {
    const exam = Number(data.exam_marks);
    if (isNaN(exam) || exam < 0 || exam > 100) {
      errors.exam_marks = "Exam marks must be between 0 and 100.";
    }
  }

  const sem = Number(data.semester);
  if (isNaN(sem) || sem <= 0 || !Number.isInteger(sem)) {
    errors.semester = "Semester must be a positive integer.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateStudyActivity(data: {
  study_date?: string;
  study_hours?: number | string;
  assignments_completed?: number | string;
}): ValidationResult {
  const errors: Record<string, string> = {};

  if (!data.study_date) {
    errors.study_date = "Please specify a study date.";
  }

  const hours = Number(data.study_hours);
  if (isNaN(hours) || hours < 0 || hours > 24) {
    errors.study_hours = "Study hours must be between 0 and 24 hours.";
  }

  const assignments = Number(data.assignments_completed ?? 0);
  if (isNaN(assignments) || assignments < 0 || !Number.isInteger(assignments)) {
    errors.assignments_completed = "Assignments completed must be a non-negative integer.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
