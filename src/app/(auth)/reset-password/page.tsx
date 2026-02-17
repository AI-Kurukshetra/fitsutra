"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { updatePassword } from "@/lib/supabase";

type ResetTokens = {
  access_token: string;
  refresh_token?: string;
  type?: string;
};

function parseHash(hash: string): ResetTokens | null {
  if (!hash) return null;
  const cleaned = hash.startsWith("#") ? hash.slice(1) : hash;
  const params = new URLSearchParams(cleaned);
  const accessToken = params.get("access_token");
  if (!accessToken) return null;
  return {
    access_token: accessToken,
    refresh_token: params.get("refresh_token") ?? undefined,
    type: params.get("type") ?? undefined,
  };
}

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const tokens = useMemo(() => {
    if (typeof window === "undefined") return null;
    return parseHash(window.location.hash);
  }, []);

  useEffect(() => {
    if (!tokens) return;
    if (tokens.type && tokens.type !== "recovery") {
      setError("This reset link is invalid or expired.");
    }
  }, [tokens]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (!tokens?.access_token) {
      setError("Missing reset token. Use the link from your email.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await updatePassword(tokens.access_token, password);
      setSuccess(true);
      setTimeout(() => router.push("/login"), 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Reset failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen px-6 py-16">
      <div className="mx-auto w-full max-w-lg space-y-8">
        <Link href="/" className="text-sm text-slate-400">
          ← Back to FitSutra
        </Link>
        <div className="glass rounded-3xl p-8">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.3em] text-amber-300">
              Reset Access
            </p>
            <h1 className="text-4xl text-slate-100">Set a new password.</h1>
            <p className="text-sm text-slate-300">
              Use the link from your email to reset your password.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label className="text-xs uppercase tracking-[0.3em] text-slate-400">
                New Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-700/60 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 outline-none focus:border-amber-400/70"
                required
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.3em] text-slate-400">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirm}
                onChange={(event) => setConfirm(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-700/60 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 outline-none focus:border-amber-400/70"
                required
              />
            </div>

            {error && (
              <div className="rounded-2xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            )}
            {success && (
              <div className="rounded-2xl border border-emerald-400/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
                Password updated. Redirecting to login...
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-amber-400 px-6 py-3 text-sm font-semibold text-slate-900 shadow-lg shadow-amber-500/30 transition disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Updating..." : "Update password"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-400">
            Back to{" "}
            <Link href="/login" className="font-semibold text-amber-300">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
