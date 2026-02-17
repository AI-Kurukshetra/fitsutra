"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { getSession, isSupabaseConfigured, supabaseFetch } from "@/lib/supabase";
import {
  getSupabaseClient,
  hydrateRealtimeSession,
} from "@/lib/supabaseClient";
import { demoPayments, demoStats } from "@/lib/demoData";

type Profile = {
  gym_id: string | null;
  role: string | null;
  gym?: {
    name?: string | null;
  };
};

type Member = {
  id: string;
};

type Payment = {
  id: string;
  amount: number;
  paid_on: string | null;
  method?: string | null;
};

function Sparkline({ data, stroke }: { data: number[]; stroke: string }) {
  const max = Math.max(...data, 1);
  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = 40 - (value / max) * 34;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg viewBox="0 0 100 40" className="h-12 w-full">
      <polyline
        fill="none"
        stroke={stroke}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

export default function AnalyticsPage() {
  const session = useMemo(() => getSession(), []);
  const supabaseReady = isSupabaseConfigured();
  const [useDemo, setUseDemo] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [memberCount, setMemberCount] = useState(0);
  const [monthlyRevenue, setMonthlyRevenue] = useState(0);
  const [payments, setPayments] = useState<
    Array<{
      id: string;
      amount: number;
      paid_on: string | null;
      method: string | null;
      member: string;
    }>
  >([]);
  const [loading, setLoading] = useState(true);

  const loadAnalytics = useCallback(async () => {
    if (!supabaseReady || !session?.access_token) {
      setUseDemo(true);
      setLoading(false);
      return;
    }

    try {
      const profileRows = await supabaseFetch<Profile[]>(
        `profiles?select=gym_id,role,gym:gyms(name)&user_id=eq.${session.user.id}&limit=1`,
        session.access_token
      );
      const profileRow = profileRows[0] ?? null;
      setProfile(profileRow);

      if (!profileRow?.gym_id) {
        setUseDemo(true);
        setLoading(false);
        return;
      }

      setUseDemo(false);
        const [members, paymentsData] = await Promise.all([
          supabaseFetch<Member[]>(
            `members?select=id&gym_id=eq.${profileRow.gym_id}`,
            session.access_token
          ),
          supabaseFetch<Payment[]>(
            `payments?select=id,amount,paid_on&gym_id=eq.${profileRow.gym_id}`,
            session.access_token
          ),
        ]);

      const revenue = paymentsData.reduce(
        (sum, payment) => sum + (payment.amount || 0),
        0
      );

      setMemberCount(members.length);
      setMonthlyRevenue(revenue);
      setPayments(
        paymentsData.map((payment, index) => ({
          id: payment.id,
          amount: payment.amount,
          paid_on: payment.paid_on,
          method: index % 2 === 0 ? "UPI" : "Card",
          member: `Member ${index + 1}`,
        }))
      );
    } catch {
      setUseDemo(true);
    } finally {
      setLoading(false);
    }
  }, [session?.access_token, session?.user?.id, supabaseReady]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  useEffect(() => {
    if (!supabaseReady || !session?.access_token) return;
    let channel: RealtimeChannel | null = null;
    let cancelled = false;

    (async () => {
      await hydrateRealtimeSession(session);
      if (cancelled) return;
      const supabase = getSupabaseClient();
      channel = supabase.channel(`fitsutra-analytics-${session.user.id}`);
      ["members", "payments", "profiles", "gyms"].forEach((table) => {
        channel?.on(
          "postgres_changes",
          { event: "*", schema: "public", table },
          () => {
            loadAnalytics();
          }
        );
      });
      channel.subscribe();
    })();

    return () => {
      cancelled = true;
      if (channel) {
        getSupabaseClient().removeChannel(channel);
      }
    };
  }, [
    loadAnalytics,
    session?.access_token,
    session?.refresh_token,
    session?.user?.id,
    supabaseReady,
  ]);

  const checkinTrend = [48, 52, 56, 61, 58, 66, 72];
  const revenueTrend = [6.4, 7.1, 7.6, 8.2, 8.9, 10.4, 12.4];
  const retentionTrend = [88, 89, 90, 92, 91, 93, 93];

  const stats = useDemo ? demoStats : demoStats.map((stat) => ({ ...stat }));
  if (!useDemo) {
    stats[0].value = memberCount.toString();
    stats[1].value = `₹${(monthlyRevenue / 100000).toFixed(1)}L`;
  }

  return (
    <div className="min-h-screen px-6 py-8">
      <header className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
            FitSutra Analytics
          </p>
          <h1 className="text-4xl text-slate-100">Performance Pulse</h1>
          <p className="mt-2 text-xs text-slate-500">
            {profile?.gym?.name ?? "FitSutra Flagship"}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/app"
            className="rounded-full border border-slate-700/60 px-4 py-2 text-xs font-semibold text-slate-200"
          >
            Back to dashboard
          </Link>
          <Link
            href="/"
            className="rounded-full border border-slate-700/60 px-4 py-2 text-xs font-semibold text-slate-200"
          >
            Back home
          </Link>
        </div>
      </header>

      <main className="mx-auto mt-10 w-full max-w-6xl space-y-8">
        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="glass rounded-3xl p-5">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                {stat.label}
              </p>
              <p className="mt-3 text-3xl text-slate-100">{stat.value}</p>
              <p className="text-xs text-slate-500">30-day average</p>
            </div>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="glass rounded-3xl p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl text-slate-100">Check-in velocity</h2>
              <span className="text-xs uppercase tracking-[0.3em] text-slate-500">
                Weekly
              </span>
            </div>
            <div className="mt-6 rounded-2xl border border-slate-800/70 bg-slate-950/50 p-6">
              <Sparkline data={checkinTrend} stroke="#f59e0b" />
              <p className="mt-4 text-sm text-slate-300">
                Momentum is strongest on Thursday evening. Keep HIIT Ignite
                stacked for peak energy.
              </p>
            </div>
          </div>

          <div className="glass rounded-3xl p-6">
            <h2 className="text-2xl text-slate-100">Retention trend</h2>
            <div className="mt-6 rounded-2xl border border-slate-800/70 bg-slate-950/50 p-6">
              <Sparkline data={retentionTrend} stroke="#22d3ee" />
              <p className="mt-4 text-sm text-slate-300">
                Retention is holding above 92% with disciplined renewal nudges.
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="glass rounded-3xl p-6">
            <h2 className="text-2xl text-slate-100">Revenue lift</h2>
            <p className="mt-2 text-sm text-slate-300">
              Monthly revenue acceleration over the last 7 weeks.
            </p>
            <div className="mt-6 space-y-3">
              {revenueTrend.map((value, index) => (
                <div key={value} className="flex items-center gap-3">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-800/70">
                    <div
                      className="h-full rounded-full bg-amber-400/80"
                      style={{ width: `${(value / 12.4) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-slate-400">
                    W{index + 1} · ₹{value.toFixed(1)}L
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass rounded-3xl p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl text-slate-100">Revenue intelligence</h2>
              <span className="text-xs uppercase tracking-[0.3em] text-slate-500">
                Actionable
              </span>
            </div>
            <div className="mt-6 space-y-4 text-sm text-slate-300">
              <p>
                Premium annual plans are contributing 62% of total revenue.
                Upsell quarterly members with guided transformation programs.
              </p>
              <p>
                UPI is the dominant payment method. Automate renewal reminders
                5 days before expiry to reduce churn risk.
              </p>
              <p>
                Trainer utilization peaks on Tue/Thu evenings. Add a second
                strength circuit to capture demand.
              </p>
            </div>
            {loading && (
              <p className="mt-6 text-xs text-slate-500">
                Loading live analytics…
              </p>
            )}
          </div>
        </section>

        <section className="glass rounded-3xl p-6">
          <h2 className="text-2xl text-slate-100">Payment momentum</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {(useDemo ? demoPayments : payments).map((payment) => (
              <div
                key={payment.id}
                className="rounded-2xl border border-slate-800/70 bg-slate-950/50 p-4"
              >
                <p className="text-sm font-semibold text-slate-100">
                  {payment.member}
                </p>
                <p className="text-xs text-slate-500">
                  {(payment.method ?? "UPI")} · {payment.paid_on}
                </p>
                <p className="mt-3 text-xs text-amber-300">₹{payment.amount}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
