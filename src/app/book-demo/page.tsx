"use client";

import Link from "next/link";
import { useState } from "react";

export default function BookDemoPage() {
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    city: "",
    company: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/book-demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload?.error ?? "Submission failed");
      }
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen px-6 py-16">
      <div className="mx-auto w-full max-w-2xl space-y-8">
        <Link href="/" className="text-sm text-slate-400">
          ← Back to FitSutra
        </Link>
        <div className="glass rounded-3xl p-8">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.3em] text-amber-300">
              Schedule a call Today
            </p>
            <h1 className="text-4xl text-slate-100">
              See FitSutra in action.
            </h1>
            <p className="text-sm text-slate-300">
              Tell us about your gym and we’ll schedule a tailored walkthrough.
            </p>
          </div>

          {success ? (
            <div className="mt-8 rounded-2xl border border-emerald-400/40 bg-emerald-500/10 px-4 py-4 text-sm text-emerald-200">
              Thanks! Your demo request is in. Our team will reach out shortly.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 grid gap-4">
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="text-xs uppercase tracking-[0.3em] text-slate-400">
                    Full Name
                  </label>
                  <input
                    required
                    value={form.full_name}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        full_name: event.target.value,
                      }))
                    }
                    className="mt-2 w-full rounded-2xl border border-slate-700/60 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 outline-none focus:border-amber-400/70"
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-[0.3em] text-slate-400">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        email: event.target.value,
                      }))
                    }
                    className="mt-2 w-full rounded-2xl border border-slate-700/60 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 outline-none focus:border-amber-400/70"
                  />
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="text-xs uppercase tracking-[0.3em] text-slate-400">
                    Phone
                  </label>
                  <input
                    value={form.phone}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        phone: event.target.value,
                      }))
                    }
                    className="mt-2 w-full rounded-2xl border border-slate-700/60 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 outline-none focus:border-amber-400/70"
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-[0.3em] text-slate-400">
                    City
                  </label>
                  <input
                    value={form.city}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        city: event.target.value,
                      }))
                    }
                    className="mt-2 w-full rounded-2xl border border-slate-700/60 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 outline-none focus:border-amber-400/70"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs uppercase tracking-[0.3em] text-slate-400">
                  Gym / Company
                </label>
                <input
                  value={form.company}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      company: event.target.value,
                    }))
                  }
                  className="mt-2 w-full rounded-2xl border border-slate-700/60 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 outline-none focus:border-amber-400/70"
                />
              </div>

              <div>
                <label className="text-xs uppercase tracking-[0.3em] text-slate-400">
                  Message
                </label>
                <textarea
                  value={form.message}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      message: event.target.value,
                    }))
                  }
                  className="mt-2 w-full rounded-2xl border border-slate-700/60 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 outline-none focus:border-amber-400/70"
                  rows={4}
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
                {loading ? "Submitting..." : "Request demo"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
