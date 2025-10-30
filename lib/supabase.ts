import { createBrowserClient } from "@supabase/ssr";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const createClient = () =>
  createBrowserClient(
    supabaseUrl!,
    supabaseKey!,
  );

export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseKey);
};

export const getSupabaseServer = () => {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const cookieStore = cookies();

  return createServerClient(
    supabaseUrl!,
    supabaseKey!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: CookieOptions }>) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Ignore errors in setAll, can happen in Server Components
          }
        },
      },
    }
  );
};

// Export as a function that can be called synchronously in route handlers
export const supabaseServer = getSupabaseServer();
