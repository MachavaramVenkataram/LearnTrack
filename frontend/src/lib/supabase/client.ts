import { createBrowserClient } from "@supabase/ssr";
import { validateSupabaseEnv } from "@/lib/env";

export function createClient() {
  const { supabaseUrl, supabaseAnonKey } = validateSupabaseEnv();
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

export const isSupabaseConfigured = true;

// Singleton browser client instance for client components (lazy-initialized to avoid premature env evaluation)
let cachedClient: ReturnType<typeof createBrowserClient> | null = null;

export const supabase: ReturnType<typeof createBrowserClient> = new Proxy({} as ReturnType<typeof createBrowserClient>, {
  get(_target, prop, receiver) {
    if (!cachedClient) {
      cachedClient = createClient();
    }
    const value = Reflect.get(cachedClient, prop, receiver);
    if (typeof value === "function") {
      return value.bind(cachedClient);
    }
    return value;
  },
});
