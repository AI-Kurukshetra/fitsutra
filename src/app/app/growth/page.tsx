"use client";

import CrudModule from "@/components/CrudModule";
import KpiGrid from "@/components/KpiGrid";
import ContextNotice from "@/components/ContextNotice";
import ModuleShell from "@/components/ModuleShell";
import useGymContext from "@/lib/useGymContext";
import { supabaseCount } from "@/lib/supabase";
import { useEffect, useState } from "react";

export default function GrowthPage() {
  const { session, gymId, profile, loading, error } = useGymContext();
  const [kpis, setKpis] = useState([
    { label: "Leads", value: "0" },
    { label: "Qualified", value: "0" },
    { label: "Referrals", value: "0" },
    { label: "Finance Offers", value: "0" },
  ]);

  useEffect(() => {
    async function loadKpis() {
      if (!session?.access_token || !gymId) return;
      const [leads, qualified, referrals, finance] = await Promise.all([
        supabaseCount(`leads?gym_id=eq.${gymId}`, session.access_token),
        supabaseCount(
          `leads?gym_id=eq.${gymId}&stage=eq.qualified`,
          session.access_token
        ),
        supabaseCount(`referrals?gym_id=eq.${gymId}`, session.access_token),
        supabaseCount(
          `finance_offers?gym_id=eq.${gymId}`,
          session.access_token
        ),
      ]);
      setKpis([
        { label: "Leads", value: leads.toString() },
        { label: "Qualified", value: qualified.toString() },
        { label: "Referrals", value: referrals.toString() },
        { label: "Finance Offers", value: finance.toString() },
      ]);
    }

    loadKpis();
  }, [gymId, session?.access_token]);

  return (
    <ModuleShell title="Growth Tools" subtitle={profile?.gym?.name ?? "FitSutra"}>
      <ContextNotice
        session={session}
        gymId={gymId}
        useModal
        modalColumns={2}
        loading={loading}
        error={error}
      />

      <KpiGrid items={kpis} />

      <CrudModule
        title="Leads"
        description="Capture and convert new leads."
        table="leads"
        session={session}
        gymId={gymId}
        useModal
        modalColumns={2}
        fields={[
          { name: "full_name", label: "Full Name", required: true },
          { name: "email", label: "Email" },
          { name: "phone", label: "Phone" },
          { name: "source", label: "Source" },
          {
            name: "stage",
            label: "Stage",
            type: "select",
            options: [
              { label: "New", value: "new" },
              { label: "Qualified", value: "qualified" },
              { label: "Converted", value: "converted" },
            ],
          },
        ]}
      />

      <CrudModule
        title="Finance Offers"
        description="Funding and capital support options."
        table="finance_offers"
        session={session}
        gymId={gymId}
        useModal
        modalColumns={2}
        fields={[
          { name: "provider", label: "Provider", required: true },
          { name: "amount", label: "Amount", type: "number" },
          {
            name: "status",
            label: "Status",
            type: "select",
            options: [
              { label: "Offered", value: "offered" },
              { label: "Accepted", value: "accepted" },
              { label: "Rejected", value: "rejected" },
            ],
          },
        ]}
      />
    </ModuleShell>
  );
}
