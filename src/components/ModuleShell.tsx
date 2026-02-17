"use client";

import Link from "next/link";

const navItems = [
  { href: "/app", label: "Dashboard" },
  { href: "/app/scheduling", label: "Scheduling" },
  { href: "/app/crm", label: "CRM" },
  { href: "/app/payments", label: "Payments" },
  { href: "/app/marketing", label: "Marketing" },
  { href: "/app/reporting", label: "Reporting" },
  { href: "/app/staff", label: "Staff" },
  { href: "/app/brand", label: "Brand" },
  { href: "/app/advanced", label: "Advanced" },
  { href: "/app/growth", label: "Growth" },
  { href: "/app/analytics", label: "Analytics" },
];

type ModuleShellProps = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
};

export default function ModuleShell({ title, subtitle, children }: ModuleShellProps) {
  return (
    <div className="min-h-screen px-6 py-8">
      <header className="mx-auto w-full max-w-6xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
              FitSutra Platform
            </p>
            <h1 className="text-4xl text-slate-100">{title}</h1>
            {subtitle && (
              <p className="mt-2 text-xs text-slate-500">{subtitle}</p>
            )}
          </div>
          <Link
            href="/"
            className="rounded-full border border-slate-700/60 px-4 py-2 text-xs font-semibold text-slate-200"
          >
            Back home
          </Link>
        </div>
        <nav className="flex flex-wrap gap-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full border border-slate-800/70 bg-slate-950/40 px-4 py-2 text-xs font-semibold text-slate-200"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto mt-10 w-full max-w-6xl space-y-8">
        {children}
      </main>
    </div>
  );
}
