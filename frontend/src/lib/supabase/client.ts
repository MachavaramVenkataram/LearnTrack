import { createBrowserClient } from "@supabase/ssr";
import { validateSupabaseEnv } from "@/lib/env";

export function createClient() {
  const { supabaseUrl, supabaseAnonKey } = validateSupabaseEnv();
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

export const isSupabaseConfigured = true;

// Singleton browser client instance for client components
export const supabase = createClient();
