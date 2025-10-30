import { createBrowserClient } from "@supabase/ssr";
import { createServerClient } from "@supabase/ssr";
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

let supabaseServerInstance: ReturnType<typeof createServerClient> | null = null;

export const getSupabaseServer = async () => {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const cookieStore = await cookies();

  return createServerClient(
    supabaseUrl!,
    supabaseKey!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
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

// Legacy export for backward compatibility
export const supabaseServer = getSupabaseServer();
