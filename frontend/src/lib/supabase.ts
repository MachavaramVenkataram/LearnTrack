/**
 * Supabase Client Re-export
 *
 * Forwards to the canonical @supabase/ssr browser client in ./supabase/client.ts.
 * Eliminates duplicate client instances and ensures single source of truth.
 */
export { supabase, createClient, isSupabaseConfigured } from "./supabase/client";
