"use client";

import Link from "next/link";
import type { SupabaseSession } from "@/lib/supabase";

type ContextNoticeProps = {
  session: SupabaseSession | null;
  gymId: string | null;
  loading: boolean;
  error?: string | null;
};

export default function ContextNotice({
  session,
  gymId,
  loading,
  error,
}: ContextNoticeProps) {
  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-700/60 bg-slate-950/40 px-6 py-4 text-sm text-slate-300">
        Loading workspace...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-red-400/40 bg-red-500/10 px-6 py-4 text-sm text-red-200">
        {error}
      </div>
    );
  }

  if (!session?.access_token) {
    return (
      <div className="rounded-3xl border border-amber-400/40 bg-amber-500/10 px-6 py-4 text-sm text-amber-100">
        Sign in to manage this module.{" "}
        <Link href="/login" className="font-semibold text-amber-200">
          Go to login
        </Link>
      </div>
    );
  }

  if (!gymId) {
    return (
      <div className="rounded-3xl border border-amber-400/40 bg-amber-500/10 px-6 py-4 text-sm text-amber-100">
        Create a gym workspace first from the dashboard to unlock this module.
      </div>
    );
  }

  return null;
}
