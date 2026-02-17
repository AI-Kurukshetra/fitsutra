"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  isSupabaseConfigured,
  sendPasswordReset,
  signInWithPassword,
} from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetError, setResetError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (!isSupabaseConfigured()) {
      setError("Supabase is not configured yet. Add environment variables.");
      return;
    }

    setLoading(true);
    try {
      await signInWithPassword(email, password);
      router.push("/app");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword() {
    setResetError(null);
    setResetSent(false);

    if (!isSupabaseConfigured()) {
      setResetError("Supabase is not configured yet. Add environment variables.");
      return;
    }

    if (!email) {
      setResetError("Enter your email first.");
      return;
    }

    setResetLoading(true);
    try {
      const redirectTo = `${window.location.origin}/reset-password`;
      await sendPasswordReset(email, redirectTo);
      setResetSent(true);
    } catch (err) {
      setResetError(err instanceof Error ? err.message : "Reset failed");
    } finally {
      setResetLoading(false);
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
              Member Access
            </p>
            <h1 className="text-4xl text-slate-100">Welcome back.</h1>
            <p className="text-sm text-slate-300">
              Sign in to manage memberships, classes, and revenue.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label className="text-xs uppercase tracking-[0.3em] text-slate-400">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-700/60 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 outline-none focus:border-amber-400/70"
                required
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.3em] text-slate-400">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-700/60 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 outline-none focus:border-amber-400/70"
                required
              />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
              <span>Forgot your password?</span>
              <button
                type="button"
                onClick={handleResetPassword}
                disabled={resetLoading}
                className="font-semibold text-amber-300 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {resetLoading ? "Sending..." : "Send reset link"}
              </button>
            </div>

            {resetError && (
              <div className="rounded-2xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {resetError}
              </div>
            )}
            {resetSent && (
              <div className="rounded-2xl border border-emerald-400/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
                Password reset email sent. Check your inbox.
              </div>
            )}

            {error && (
              <div className="rounded-2xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-amber-400 px-6 py-3 text-sm font-semibold text-slate-900 shadow-lg shadow-amber-500/30 transition disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-400">
            New to FitSutra?{" "}
            <Link href="/signup" className="font-semibold text-amber-300">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
