"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getSession, signOut } from "@/lib/supabase";

const features = [
  {
    title: "Membership Mastery",
    description:
      "Automate plans, renewals, freezes, and upgrades with full visibility across every member lifecycle.",
  },
  {
    title: "Classes That Convert",
    description:
      "Plan, schedule, and scale group sessions with live capacity, waitlists, and coach assignments.",
  },
  {
    title: "Payments That Flow",
    description:
      "Unified billing for UPI, cards, and cash with automated reminders and reconciliations.",
  },
  {
    title: "Coach Performance",
    description:
      "Track trainer engagement, utilization, and member feedback in one dashboard.",
  },
];

const metrics = [
  { label: "Member Retention", value: "93%" },
  { label: "Monthly Revenue", value: "₹12.4L" },
  { label: "Class Fill Rate", value: "88%" },
];

export default function Home() {
  const [isAuthed, setIsAuthed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsAuthed(Boolean(getSession()?.access_token));
  }, []);

  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute -top-32 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-amber-400/10 blur-[120px]" />
      <div className="pointer-events-none absolute right-[-120px] top-20 h-[420px] w-[420px] rounded-full bg-teal-400/10 blur-[120px]" />

      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400/20 text-xl font-semibold text-amber-200">
            FS
          </div>
          <div>
            <p className="text-lg font-semibold tracking-wide">FitSutra</p>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
              Energetic · Focused · Ambitious
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {(mounted && isAuthed) ? (
            <>
              <Link
                href="/app"
                className="text-sm font-semibold text-slate-200/80 transition hover:text-amber-200"
              >
                Dashboard
              </Link>
              <button
                onClick={() => {
                  signOut();
                  setIsAuthed(false);
                }}
                className="rounded-full border border-slate-600/60 px-5 py-2 text-sm font-semibold text-slate-200 transition hover:border-amber-400/70 hover:text-amber-200"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-semibold text-slate-200/80 transition hover:text-amber-200"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="rounded-full bg-amber-400 px-5 py-2 text-sm font-semibold text-slate-900 shadow-lg shadow-amber-500/30 transition hover:translate-y-[-1px]"
              >
                Start free
              </Link>
            </>
          )}
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-6 pb-20 pt-10">
        <section className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <span className="badge inline-flex items-center gap-2 rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em]">
              India-first premium gym OS
            </span>
            <h1 className="text-5xl font-semibold leading-tight text-slate-100 md:text-6xl">
              Build a disciplined, premium fitness business with
              <span className="text-gradient"> FitSutra</span>.
            </h1>
            <p className="text-lg text-slate-300">
              FitSutra unifies memberships, class scheduling, payments, and
              performance tracking in one energetic command center built for
              modern Indian gyms.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              {(mounted && isAuthed) ? (
                <Link
                  href="/app"
                  className="rounded-full bg-amber-400 px-6 py-3 text-sm font-semibold text-slate-900 shadow-lg shadow-amber-500/30 transition hover:translate-y-[-1px]"
                >
                  Go to dashboard
                </Link>
              ) : (
          <Link
            href="/book-demo"
            className="rounded-full bg-amber-400 px-6 py-3 text-sm font-semibold text-slate-900 shadow-lg shadow-amber-500/30 transition hover:translate-y-[-1px]"
          >
            Book a demo
          </Link>
              )}
              <Link
                href="/app"
                className="rounded-full border border-slate-600/60 px-6 py-3 text-sm font-semibold text-slate-200 transition hover:border-amber-400/70 hover:text-amber-200"
              >
                View dashboard
              </Link>
            </div>
            <div className="flex flex-wrap gap-6 text-sm text-slate-400">
              <span>UPI-ready billing</span>
              <span>WhatsApp-friendly member journeys</span>
              <span>Coach utilization intelligence</span>
            </div>
          </div>

          <div className="glass rounded-3xl p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
                  Today at FitSutra
                </p>
                <span className="badge rounded-full px-3 py-1 text-xs font-semibold">
                  Live
                </span>
              </div>
              <div className="rounded-2xl border border-slate-700/60 bg-slate-950/60 p-5">
                <p className="text-sm text-slate-400">Member check-ins</p>
                <p className="text-4xl font-semibold text-slate-100">284</p>
                <p className="text-xs text-slate-500">+12% vs last Tuesday</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {metrics.map((metric) => (
                  <div
                    key={metric.label}
                    className="rounded-2xl border border-slate-800/70 bg-slate-950/50 p-4"
                  >
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                      {metric.label}
                    </p>
                    <p className="mt-3 text-2xl font-semibold text-slate-100">
                      {metric.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-20 grid gap-6 md:grid-cols-2">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="glass rounded-3xl p-6 transition hover:-translate-y-1"
            >
              <h3 className="text-2xl text-slate-100">{feature.title}</h3>
              <p className="mt-3 text-sm text-slate-300">
                {feature.description}
              </p>
            </div>
          ))}
        </section>

        <section className="mt-20 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="glass rounded-3xl p-6">
            <h2 className="text-3xl text-slate-100">Premium control room</h2>
            <p className="mt-4 text-sm text-slate-300">
              Manage multiple branches, pricing tiers, and trainer schedules in
              one focused workspace. FitSutra keeps your operations disciplined
              while your members feel seen.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-slate-300">
              <li>Automated renewal reminders with Indian payment rails</li>
              <li>Live class occupancy and waitlists</li>
              <li>Trainer performance scorecards</li>
              <li>Smart revenue forecasting</li>
            </ul>
          </div>
          <div className="glass rounded-3xl p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl text-slate-100">Growth snapshot</h3>
              <span className="text-xs uppercase tracking-[0.3em] text-slate-500">
                Last 30 days
              </span>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {[
                { label: "New Leads", value: "168", trend: "+18%" },
                { label: "Conversions", value: "94", trend: "+12%" },
                { label: "Churn Risk", value: "4%", trend: "-2%" },
                { label: "NPS", value: "72", trend: "+5" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-slate-800/70 bg-slate-950/50 p-4"
                >
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                    {item.label}
                  </p>
                  <div className="mt-3 flex items-end justify-between">
                    <p className="text-2xl font-semibold text-slate-100">
                      {item.value}
                    </p>
                    <span className="text-xs font-semibold text-emerald-300">
                      {item.trend}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-20 flex flex-col items-center justify-between gap-6 rounded-3xl border border-amber-400/30 bg-gradient-to-r from-amber-500/15 via-slate-900/40 to-teal-500/15 px-8 py-10 text-center md:flex-row md:text-left">
          <div>
            <h2 className="text-4xl text-slate-100">
              Ready to lead the next generation of gyms?
            </h2>
            <p className="mt-3 text-sm text-slate-300">
              FitSutra brings premium control, elite experiences, and operational
              clarity to every fitness brand you build.
            </p>
          </div>
          <Link
            href="/book-demo"
            className="rounded-full bg-amber-400 px-6 py-3 text-sm font-semibold text-slate-900 shadow-lg shadow-amber-500/30"
          >
            Book a demo
          </Link>
        </section>
      </main>
    </div>
  );
}
