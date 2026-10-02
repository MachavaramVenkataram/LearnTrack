/**
 * Environment Configuration and Validation
 *
 * Ensures all required environment variables are present and valid.
 * Fails fast with descriptive errors instead of silently degrading to mock data.
 */

export function getEnvVar(key: string, required = true): string {
  const value = process.env[key];
  if (!value && required) {
    throw new Error(
      `[LearnTrack Environment Error] Missing required environment variable: "${key}".\n` +
      `Please configure "${key}" in your .env.local file.\n` +
      `Reference: .env.example`
    );
  }
  return value || "";
}

export function validateSupabaseEnv(): { supabaseUrl: string; supabaseAnonKey: string } {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    const missing = [];
    if (!supabaseUrl) missing.push("NEXT_PUBLIC_SUPABASE_URL");
    if (!supabaseAnonKey) missing.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");

    throw new Error(
      `[Supabase Configuration Missing]\n` +
      `LearnTrack requires a genuine Supabase connection.\n` +
      `Missing required variables: ${missing.join(", ")}.\n` +
      `Please set these in frontend/.env.local (refer to .env.example).\n` +
      `Mock fallbacks are disabled to guarantee data integrity.`
    );
  }

  // Reject placeholder and mock URLs
  if (
    supabaseUrl.includes("mock-instance") ||
    supabaseUrl.includes("placeholder-project") ||
    supabaseUrl.includes("your-project-id")
  ) {
    throw new Error(
      `[Supabase Configuration Invalid]\n` +
      `NEXT_PUBLIC_SUPABASE_URL is currently set to a placeholder: "${supabaseUrl}".\n` +
      `Please provide your real Supabase project URL in .env.local.`
    );
  }

  if (
    supabaseAnonKey.includes("placeholder") ||
    supabaseAnonKey.includes("mock-anon-key")
  ) {
    throw new Error(
      `[Supabase Configuration Invalid]\n` +
      `NEXT_PUBLIC_SUPABASE_ANON_KEY is currently set to a placeholder key.\n` +
      `Please provide your real Supabase anon key in .env.local.`
    );
  }

  return { supabaseUrl, supabaseAnonKey };
}

export const env = {
  get supabaseUrl(): string {
    return validateSupabaseEnv().supabaseUrl;
  },
  get supabaseAnonKey(): string {
    return validateSupabaseEnv().supabaseAnonKey;
  },
  get isSupabaseConfigured(): boolean {
    try {
      validateSupabaseEnv();
      return true;
    } catch {
      return false;
    }
  },
  get mlApiUrl(): string {
    return (
      process.env.NEXT_PUBLIC_ML_API_URL ||
      process.env.NEXT_PUBLIC_ML_SERVICE_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "http://127.0.0.1:8001"
    );
  },
  get mlServiceUrl(): string {
    return (
      process.env.NEXT_PUBLIC_ML_API_URL ||
      process.env.NEXT_PUBLIC_ML_SERVICE_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "http://127.0.0.1:8001"
    );
  },
  get apiUrl(): string {
    return (
      process.env.NEXT_PUBLIC_ML_API_URL ||
      process.env.NEXT_PUBLIC_ML_SERVICE_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "http://127.0.0.1:8001"
    );
  },
  get isGoogleOAuthEnabled(): boolean {
    return process.env.NEXT_PUBLIC_ENABLE_GOOGLE_OAUTH === "true";
  },
};
