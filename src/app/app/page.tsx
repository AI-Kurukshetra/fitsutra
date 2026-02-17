"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import {
  getValidSession,
  isSupabaseConfigured,
  createGymWorkspace,
  signOut,
  supabaseFetch,
  type SupabaseSession,
} from "@/lib/supabase";
import {
  getSupabaseClient,
  hydrateRealtimeSession,
} from "@/lib/supabaseClient";
import {
  demoClasses,
  demoMembers,
  demoPayments,
  demoSessions,
  demoStaff,
  demoStats,
} from "@/lib/demoData";

type Member = {
  id: string;
  member_code: string | null;
  full_name: string;
  email: string | null;
  status: string;
  membership_type: string | null;
  joined_on: string | null;
};

type ClassInfo = {
  id: string;
  title: string;
  coach: string | null;
  intensity: string | null;
  capacity: number | null;
};

type SessionInfo = {
  id: string;
  session_date: string;
  start_time: string;
  enrolled: number | null;
  class_id: string;
};

type SessionView = {
  id: string;
  session_date: string;
  start_time: string;
  enrolled: number | null;
  title: string;
};

type Profile = {
  gym_id: string | null;
  role: string | null;
  gym?: {
    name?: string | null;
  };
};

type Payment = {
  id: string;
  amount: number;
  status: string;
  paid_on: string | null;
  method: string | null;
  member_id: string;
};

type PaymentView = {
  id: string;
  amount: number;
  status: string;
  paid_on: string | null;
  method: string | null;
  member: string;
};

type Staff = {
  id: string;
  full_name: string;
  role: string | null;
  status: string | null;
};

const statFallback = [
  { label: "Active Members", value: "0" },
  { label: "Monthly Revenue", value: "₹0" },
  { label: "Classes This Week", value: "0" },
  { label: "Trainer Utilization", value: "0%" },
];

const moduleLinks = [
  { href: "/app/scheduling", label: "Scheduling" },
  { href: "/app/crm", label: "CRM" },
  { href: "/app/payments", label: "Payments & POS" },
  { href: "/app/marketing", label: "Marketing" },
  { href: "/app/reporting", label: "Reporting" },
  { href: "/app/staff", label: "Staff" },
  { href: "/app/brand", label: "Brand" },
  { href: "/app/advanced", label: "Advanced" },
  { href: "/app/growth", label: "Growth" },
];

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useDemo, setUseDemo] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [gymName, setGymName] = useState("FitSutra Flagship");
  const [city, setCity] = useState("Mumbai");
  const [stateRegion, setStateRegion] = useState("MH");
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [liveStats, setLiveStats] = useState(statFallback);
  const [members, setMembers] = useState<Member[]>([]);
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);

  const [session, setSession] = useState<SupabaseSession | null>(null);
  const supabaseReady = isSupabaseConfigured();

  useEffect(() => {
    let mounted = true;
    (async () => {
      const activeSession = await getValidSession();
      if (mounted) setSession(activeSession);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const loadData = useCallback(async () => {
    if (!supabaseReady || !session?.access_token) {
      setUseDemo(true);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const profileRows = await supabaseFetch<Profile[]>(
        `profiles?select=gym_id,role,gym:gyms(name)&user_id=eq.${session.user.id}&limit=1`,
        session.access_token
      );
      const profileRow = profileRows[0] ?? null;
      setProfile(profileRow);

      if (!profileRow?.gym_id) {
        setNeedsOnboarding(true);
        setUseDemo(true);
        setLoading(false);
        return;
      }

      setNeedsOnboarding(false);
      setUseDemo(false);
      const [membersData, classesData, sessionsData, paymentsData, staffData] =
        await Promise.all([
            supabaseFetch<Member[]>(
              `members?select=id,member_code,full_name,email,status,membership_type,joined_on&order=joined_on.desc&limit=6&gym_id=eq.${profileRow.gym_id}`,
              session.access_token
            ),
          supabaseFetch<ClassInfo[]>(
            `classes?select=id,title,coach,intensity,capacity&order=created_at.desc&limit=4&gym_id=eq.${profileRow.gym_id}`,
            session.access_token
          ),
          supabaseFetch<SessionInfo[]>(
            `class_sessions?select=id,session_date,start_time,enrolled,class_id&order=session_date.desc&limit=6&gym_id=eq.${profileRow.gym_id}`,
            session.access_token
          ),
          supabaseFetch<Payment[]>(
            `payments?select=id,amount,status,paid_on,method,member_id&order=paid_on.desc&limit=5&gym_id=eq.${profileRow.gym_id}`,
            session.access_token
          ),
          supabaseFetch<Staff[]>(
            `staff?select=id,full_name,role,status&order=created_at.desc&limit=4&gym_id=eq.${profileRow.gym_id}`,
            session.access_token
          ),
        ]);

      setMembers(membersData);
      setClasses(classesData);
      setSessions(sessionsData);
      setPayments(paymentsData);
      setStaff(staffData);
      const activeMembers = membersData.filter(
        (member) => member.status === "active"
      ).length;
      const revenue = paymentsData.reduce(
        (sum, payment) => sum + (payment.amount || 0),
        0
      );
      const utilization = Math.min(
        95,
        65 + Math.round((staffData.length / 6) * 20)
      );
      setLiveStats([
        { label: "Active Members", value: activeMembers.toString() },
        { label: "Monthly Revenue", value: formatCurrency(revenue) },
        { label: "Classes This Week", value: sessionsData.length.toString() },
        { label: "Trainer Utilization", value: `${utilization}%` },
      ]);
      setLastUpdated(
        new Date().toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
      setUseDemo(true);
    } finally {
      setLoading(false);
    }
  }, [session?.access_token, session?.user?.id, supabaseReady]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (!supabaseReady || !session?.access_token) return;
    let channel: RealtimeChannel | null = null;
    let cancelled = false;

    (async () => {
      await hydrateRealtimeSession(session);
      if (cancelled) return;
      const supabase = getSupabaseClient();
      channel = supabase.channel(`fitsutra-live-${session.user.id}`);
      [
        "members",
        "staff",
        "classes",
        "class_sessions",
        "payments",
        "profiles",
        "gyms",
      ].forEach((table) => {
        channel?.on(
          "postgres_changes",
          { event: "*", schema: "public", table },
          () => {
            loadData();
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
    loadData,
    session?.access_token,
    session?.refresh_token,
    session?.user?.id,
    supabaseReady,
  ]);

  const stats = useDemo ? demoStats : liveStats;
  const visibleMembers = useDemo ? demoMembers : members;
  const visibleClasses = useDemo ? demoClasses : classes;
  const visibleSessions: SessionView[] = useDemo
    ? demoSessions
    : sessions.map((sessionRow) => {
        const match = classes.find((item) => item.id === sessionRow.class_id);
        return {
          id: sessionRow.id,
          session_date: sessionRow.session_date,
          start_time: sessionRow.start_time,
          enrolled: sessionRow.enrolled,
          title: match?.title ?? "Session",
        };
      });
  const visiblePayments: PaymentView[] = useDemo
    ? demoPayments
    : payments.map((payment) => {
        const memberMatch = members.find((item) => item.id === payment.member_id);
        return {
          id: payment.id,
          amount: payment.amount,
          status: payment.status,
          paid_on: payment.paid_on,
          method: payment.method,
          member: memberMatch?.full_name ?? "Member",
        };
      });
  const visibleStaff = useDemo ? demoStaff : staff;
  const displayGymName =
    profile?.gym?.name ?? (useDemo ? "FitSutra Flagship" : gymName);
  const roleLabel = profile?.role ?? "Owner";

  async function handleCreateGym(event: React.FormEvent) {
    event.preventDefault();
    if (!session?.access_token || !session.user?.id) return;
    setLoading(true);
    setError(null);
    try {
      await createGymWorkspace(
        session.access_token,
        session.user.id,
        gymName,
        city,
        stateRegion
      );
      setNeedsOnboarding(false);
      setUseDemo(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Setup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen px-6 py-8">
      <header className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
            FitSutra Dashboard
          </p>
          <h1 className="text-4xl text-slate-100">Gym Operations</h1>
          <p className="mt-2 text-xs text-slate-500">
            {displayGymName} · {roleLabel}
            {lastUpdated ? ` · Live updated at ${lastUpdated}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/app/analytics"
            className="rounded-full border border-slate-700/60 px-4 py-2 text-xs font-semibold text-slate-200"
          >
            Analytics
          </Link>
          <Link
            href="/"
            className="rounded-full border border-slate-700/60 px-4 py-2 text-xs font-semibold text-slate-200"
          >
            Back home
          </Link>
          {session?.access_token ? (
            <button
              onClick={() => {
                signOut();
                window.location.href = "/";
              }}
              className="rounded-full bg-amber-400 px-4 py-2 text-xs font-semibold text-slate-900"
            >
              Sign out
            </button>
          ) : (
            <Link
              href="/login"
              className="rounded-full bg-amber-400 px-4 py-2 text-xs font-semibold text-slate-900"
            >
              Sign in
            </Link>
          )}
        </div>
      </header>

      <main className="mx-auto mt-10 w-full max-w-6xl space-y-8">
        {!supabaseReady && (
          <div className="rounded-3xl border border-amber-400/40 bg-amber-500/10 px-6 py-4 text-sm text-amber-100">
            Add your Supabase keys in `.env.local` to connect live data.
          </div>
        )}
        {!session?.access_token && (
          <div className="glass rounded-3xl p-6">
            <h2 className="text-2xl text-slate-100">Sign in to go live</h2>
            <p className="mt-2 text-sm text-slate-300">
              Connect FitSutra to your Supabase project to see real memberships,
              class schedules, and revenue.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href="/login"
                className="rounded-full bg-amber-400 px-5 py-2 text-xs font-semibold text-slate-900"
              >
                Sign in
              </Link>
              <button
                onClick={() => setUseDemo(true)}
                className="rounded-full border border-slate-700/60 px-5 py-2 text-xs font-semibold text-slate-200"
              >
                View demo data
              </button>
            </div>
          </div>
        )}

        {needsOnboarding && session?.access_token && (
          <div className="glass rounded-3xl p-6">
            <h2 className="text-2xl text-slate-100">Complete your gym setup</h2>
            <p className="mt-2 text-sm text-slate-300">
              Add your flagship location to unlock live data, role-based access,
              and real-time updates.
            </p>
            <form onSubmit={handleCreateGym} className="mt-6 grid gap-4">
              <div>
                <label className="text-xs uppercase tracking-[0.3em] text-slate-400">
                  Gym Name
                </label>
                <input
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
                    value={stateRegion}
                    onChange={(event) => setStateRegion(event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-slate-700/60 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 outline-none focus:border-amber-400/70"
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-full bg-amber-400 px-6 py-3 text-sm font-semibold text-slate-900 shadow-lg shadow-amber-500/30 transition disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Setting up..." : "Create workspace"}
              </button>
            </form>
          </div>
        )}

        {error && (
          <div className="rounded-3xl border border-red-400/40 bg-red-500/10 px-6 py-4 text-sm text-red-200">
            {error}
          </div>
        )}

        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="glass rounded-3xl p-5">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                {stat.label}
              </p>
              <p className="mt-3 text-3xl text-slate-100">{stat.value}</p>
              <p className="text-xs text-slate-500">Updated today</p>
            </div>
          ))}
        </section>

        <section className="glass rounded-3xl p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl text-slate-100">Modules</h2>
            <span className="text-xs uppercase tracking-[0.3em] text-slate-500">
              Full suite
            </span>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {moduleLinks.map((module) => (
              <Link
                key={module.href}
                href={module.href}
                className="rounded-2xl border border-slate-800/70 bg-slate-950/50 px-4 py-4 text-sm font-semibold text-slate-100 transition hover:border-amber-400/60 hover:text-amber-200"
              >
                {module.label}
              </Link>
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="glass rounded-3xl p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl text-slate-100">Members</h2>
              <span className="text-xs uppercase tracking-[0.3em] text-slate-500">
                Latest
              </span>
            </div>
            <div className="mt-4 space-y-3">
              {loading && <p className="text-sm text-slate-400">Loading...</p>}
              {!loading && visibleMembers.length === 0 && (
                <p className="text-sm text-slate-400">
                  No members yet. Run the seed script to populate data.
                </p>
              )}
              {visibleMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800/70 bg-slate-950/50 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-100">
                      {member.full_name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {member.member_code ? `ID ${member.member_code}` : member.email}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-400">
                      {member.membership_type ?? "Membership"}
                    </p>
                    <p className="text-xs font-semibold text-emerald-300">
                      {member.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass rounded-3xl p-6">
            <h2 className="text-2xl text-slate-100">Coach Roster</h2>
            <div className="mt-4 space-y-3">
              {visibleStaff.map((coach) => (
                <div
                  key={coach.id}
                  className="flex items-center justify-between rounded-2xl border border-slate-800/70 bg-slate-950/50 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-100">
                      {coach.full_name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {coach.role ?? "Coach"}
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-amber-300">
                    {coach.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <div className="glass rounded-3xl p-6">
            <h2 className="text-2xl text-slate-100">Class Schedule</h2>
            <div className="mt-4 space-y-3">
              {visibleSessions.map((sessionRow) => (
                <div
                  key={sessionRow.id}
                  className="flex items-center justify-between rounded-2xl border border-slate-800/70 bg-slate-950/50 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-100">
                      {sessionRow.title}
                    </p>
                    <p className="text-xs text-slate-500">
                      {sessionRow.session_date} · {sessionRow.start_time}
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-emerald-300">
                    {sessionRow.enrolled ?? 0} enrolled
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass rounded-3xl p-6">
            <h2 className="text-2xl text-slate-100">Payments</h2>
            <div className="mt-4 space-y-3">
              {visiblePayments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between rounded-2xl border border-slate-800/70 bg-slate-950/50 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-100">
                      {payment.member}
                    </p>
                    <p className="text-xs text-slate-500">
                      {payment.method ?? "UPI"} · {payment.paid_on}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-amber-300">
                      {formatCurrency(payment.amount)}
                    </p>
                    <p className="text-xs text-slate-500">{payment.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="glass rounded-3xl p-6">
          <h2 className="text-2xl text-slate-100">Program Library</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {visibleClasses.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-slate-800/70 bg-slate-950/50 p-4"
              >
                <p className="text-sm font-semibold text-slate-100">
                  {item.title}
                </p>
                <p className="text-xs text-slate-500">
                  {item.coach ?? "Coach"} · {item.intensity ?? "Medium"}
                </p>
                <p className="mt-3 text-xs text-amber-300">
                  {item.capacity ?? 0} capacity
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
