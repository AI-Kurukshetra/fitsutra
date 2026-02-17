"use client";

import { useEffect, useState } from "react";
import {
  getValidSession,
  isSupabaseConfigured,
  supabaseFetch,
  type SupabaseSession,
} from "@/lib/supabase";

type Profile = {
  gym_id: string | null;
  role: string | null;
  gym?: {
    name?: string | null;
  };
};

export default function useGymContext() {
  const supabaseReady = isSupabaseConfigured();
  const [session, setSession] = useState<SupabaseSession | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfile() {
      const activeSession = await getValidSession();
      setSession(activeSession);
      if (!supabaseReady || !activeSession?.access_token) {
        setLoading(false);
        return;
      }

      try {
        const profileRows = await supabaseFetch<Profile[]>(
          `profiles?select=gym_id,role,gym:gyms(name)&user_id=eq.${activeSession.user.id}&limit=1`,
          activeSession.access_token
        );
        setProfile(profileRows[0] ?? null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load profile");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [supabaseReady]);

  return {
    session,
    profile,
    gymId: profile?.gym_id ?? null,
    loading,
    error,
  };
}
