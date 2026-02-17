"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createGymWorkspace, isSupabaseConfigured, signUp } from "@/lib/supabase";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [gymName, setGymName] = useState("FitSutra Flagship");
  const [city, setCity] = useState("Mumbai");
  const [state, setState] = useState("MH");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (!isSupabaseConfigured()) {
      setError("Supabase is not configured yet. Add environment variables.");
      return;
    }

    setLoading(true);
    try {
      const session = await signUp(email, password);
      if (session?.access_token && session.user?.id) {
        await createGymWorkspace(
          session.access_token,
          session.user.id,
          gymName,
          city,
          state
        );
      }
      router.push("/app");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
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
              Launch Access
            </p>
            <h1 className="text-4xl text-slate-100">Create your account.</h1>
            <p className="text-sm text-slate-300">
              Get a ready-to-run FitSutra workspace in minutes.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label className="text-xs uppercase tracking-[0.3em] text-slate-400">
                Gym Name
              </label>
              <input
                type="text"
                value={gymName}
                onChange={(event) => setGymName(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-700/60 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 outline-none focus:border-amber-400/70"
                required
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="text-xs uppercase tracking-[0.3em] text-slate-400">
                  City
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(event) => setCity(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-700/60 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 outline-none focus:border-amber-400/70"
                  required
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.3em] text-slate-400">
                  State
                </label>
                <input
                  type="text"
                  value={state}
                  onChange={(event) => setState(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-700/60 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 outline-none focus:border-amber-400/70"
                  required
                />
              </div>
            </div>
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
                minLength={6}
                required
              />
            </div>

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
              {loading ? "Creating..." : "Create account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-400">
            Already have access?{" "}
            <Link href="/login" className="font-semibold text-amber-300">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
