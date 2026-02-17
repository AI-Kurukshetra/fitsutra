import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  supabaseAnonKey,
  supabaseUrl,
  type SupabaseSession,
} from "@/lib/supabase";

let client: SupabaseClient | null = null;

export function getSupabaseClient() {
  if (!client) {
    client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }
  return client;
}

export async function hydrateRealtimeSession(session: SupabaseSession | null) {
  if (!session) return;
  const supabase = getSupabaseClient();
  await supabase.auth.setSession({
    access_token: session.access_token,
    refresh_token: session.refresh_token,
  });
}
