"use client";

type Kpi = {
  label: string;
  value: string;
  hint?: string;
};

type KpiGridProps = {
  items: Kpi[];
};

export default function KpiGrid({ items }: KpiGridProps) {
  return (
    <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="glass rounded-3xl p-5">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
            {item.label}
          </p>
          <p className="mt-3 text-3xl text-slate-100">{item.value}</p>
          {item.hint && <p className="text-xs text-slate-500">{item.hint}</p>}
        </div>
      ))}
    </section>
  );
}
