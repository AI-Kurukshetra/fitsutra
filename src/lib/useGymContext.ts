"use client";

import { useEffect, useMemo, useState } from "react";
import { getSession, isSupabaseConfigured, supabaseFetch } from "@/lib/supabase";

type Profile = {
  gym_id: string | null;
  role: string | null;
  gym?: {
    name?: string | null;
  };
};

export default function useGymContext() {
  const session = useMemo(() => getSession(), []);
  const supabaseReady = isSupabaseConfigured();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfile() {
      if (!supabaseReady || !session?.access_token) {
        setLoading(false);
        return;
      }

      try {
        const profileRows = await supabaseFetch<Profile[]>(
          `profiles?select=gym_id,role,gym:gyms(name)&user_id=eq.${session.user.id}&limit=1`,
          session.access_token
        );
        setProfile(profileRows[0] ?? null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load profile");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [session?.access_token, session?.user?.id, supabaseReady]);

  return {
    session,
    profile,
    gymId: profile?.gym_id ?? null,
    loading,
    error,
  };
}
