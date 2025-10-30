import { createClient as createBrowserClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const createClient = () =>
  createBrowserClient(
    supabaseUrl || "",
    supabaseKey || "",
  );

export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseKey);
};

export default createClient
