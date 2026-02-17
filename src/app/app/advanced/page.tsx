"use client";

import CrudModule from "@/components/CrudModule";
import KpiGrid from "@/components/KpiGrid";
import ContextNotice from "@/components/ContextNotice";
import ModuleShell from "@/components/ModuleShell";
import useGymContext from "@/lib/useGymContext";
import { supabaseCount } from "@/lib/supabase";
import { useEffect, useState } from "react";

export default function AdvancedPage() {
  const { session, gymId, profile, loading, error } = useGymContext();
  const [kpis, setKpis] = useState([
    { label: "Integrations", value: "0" },
    { label: "Forms", value: "0" },
    { label: "Waivers", value: "0" },
    { label: "Locations", value: "0" },
  ]);

  useEffect(() => {
    async function loadKpis() {
      if (!session?.access_token || !gymId) return;
      const [integrations, forms, waivers, locations] = await Promise.all([
        supabaseCount(`integrations?gym_id=eq.${gymId}`, session.access_token),
        supabaseCount(`forms?gym_id=eq.${gymId}`, session.access_token),
        supabaseCount(`waivers?gym_id=eq.${gymId}`, session.access_token),
        supabaseCount(`locations?gym_id=eq.${gymId}`, session.access_token),
      ]);
      setKpis([
        { label: "Integrations", value: integrations.toString() },
        { label: "Forms", value: forms.toString() },
        { label: "Waivers", value: waivers.toString() },
        { label: "Locations", value: locations.toString() },
      ]);
    }

    loadKpis();
  }, [gymId, session?.access_token]);

  return (
    <ModuleShell
      title="Advanced Tools"
      subtitle={profile?.gym?.name ?? "FitSutra"}
    >
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
        title="Integrations"
        description="Accounting, CRM, and health integrations."
        table="integrations"
        session={session}
        gymId={gymId}
        useModal
        modalColumns={2}
        fields={[
          { name: "provider", label: "Provider", required: true },
          {
            name: "status",
            label: "Status",
            type: "select",
            options: [
              { label: "Active", value: "active" },
              { label: "Inactive", value: "inactive" },
            ],
          },
          { name: "connected_at", label: "Connected At", type: "datetime-local" },
        ]}
      />

      <CrudModule
        title="Custom Forms"
        description="Waivers, surveys, and compliance forms."
        table="forms"
        session={session}
        gymId={gymId}
        useModal
        modalColumns={2}
        fields={[
          { name: "title", label: "Title", required: true },
          { name: "form_type", label: "Form Type" },
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

      <CrudModule
        title="Waivers"
        description="Liability waivers and compliance packs."
        table="waivers"
        session={session}
        gymId={gymId}
        useModal
        modalColumns={2}
        fields={[
          { name: "title", label: "Title", required: true },
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

      <CrudModule
        title="Waiver Signatures"
        description="Track member consent and signatures."
        table="waiver_signatures"
        session={session}
        gymId={gymId}
        useModal
        modalColumns={2}
        fields={[
          { name: "waiver_id", label: "Waiver ID", required: true },
          { name: "member_id", label: "Member ID" },
          { name: "signed_at", label: "Signed At", type: "datetime-local" },
        ]}
      />

      <CrudModule
        title="Locations"
        description="Multi-location and branch management."
        table="locations"
        session={session}
        gymId={gymId}
        useModal
        modalColumns={2}
        fields={[
          { name: "name", label: "Location Name", required: true },
          { name: "address", label: "Address" },
          { name: "city", label: "City" },
          { name: "state", label: "State" },
          { name: "timezone", label: "Timezone" },
        ]}
      />
    </ModuleShell>
  );
}
