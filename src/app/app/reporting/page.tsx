"use client";

import CrudModule from "@/components/CrudModule";
import KpiGrid from "@/components/KpiGrid";
import ContextNotice from "@/components/ContextNotice";
import ModuleShell from "@/components/ModuleShell";
import useGymContext from "@/lib/useGymContext";
import { supabaseCount } from "@/lib/supabase";
import { useEffect, useState } from "react";

export default function ReportingPage() {
  const { session, gymId, profile, loading, error } = useGymContext();
  const [kpis, setKpis] = useState([
    { label: "Reports", value: "0" },
    { label: "Payments", value: "0" },
    { label: "Members", value: "0" },
    { label: "Campaigns", value: "0" },
  ]);

  useEffect(() => {
    async function loadKpis() {
      if (!session?.access_token || !gymId) return;
      const [reports, payments, members, campaigns] = await Promise.all([
        supabaseCount(`reports?gym_id=eq.${gymId}`, session.access_token),
        supabaseCount(`payments?gym_id=eq.${gymId}`, session.access_token),
        supabaseCount(`members?gym_id=eq.${gymId}`, session.access_token),
        supabaseCount(`campaigns?gym_id=eq.${gymId}`, session.access_token),
      ]);
      setKpis([
        { label: "Reports", value: reports.toString() },
        { label: "Payments", value: payments.toString() },
        { label: "Members", value: members.toString() },
        { label: "Campaigns", value: campaigns.toString() },
      ]);
    }

    loadKpis();
  }, [gymId, session?.access_token]);

  return (
    <ModuleShell
      title="Reporting & Analytics"
      subtitle={profile?.gym?.name ?? "FitSutra"}
    >
      <ContextNotice
        session={session}
        gymId={gymId}
        loading={loading}
        error={error}
      />

      <KpiGrid items={kpis} />

      <CrudModule
        title="Custom Reports"
        description="Create and manage reporting views."
        table="reports"
        session={session}
        gymId={gymId}
        useModal
        modalColumns={2}
        fields={[
          { name: "name", label: "Report Name", required: true },
          { name: "report_type", label: "Type" },
          {
            name: "status",
            label: "Status",
            type: "select",
            options: [
              { label: "Active", value: "active" },
              { label: "Archived", value: "archived" },
            ],
          },
        ]}
      />
    </ModuleShell>
  );
}
