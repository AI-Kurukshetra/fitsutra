"use client";

import CrudModule from "@/components/CrudModule";
import KpiGrid from "@/components/KpiGrid";
import ContextNotice from "@/components/ContextNotice";
import ModuleShell from "@/components/ModuleShell";
import StorageModule from "@/components/StorageModule";
import useGymContext from "@/lib/useGymContext";
import { supabaseCount } from "@/lib/supabase";
import { useEffect, useState } from "react";

export default function BrandPage() {
  const { session, gymId, profile, loading, error } = useGymContext();
  const [kpis, setKpis] = useState([
    { label: "Widgets", value: "0" },
    { label: "Listings", value: "0" },
    { label: "Themes", value: "0" },
    { label: "Assets", value: "—" },
  ]);

  useEffect(() => {
    async function loadKpis() {
      if (!session?.access_token || !gymId) return;
      const [widgets, listings, settings] = await Promise.all([
        supabaseCount(`widgets?gym_id=eq.${gymId}`, session.access_token),
        supabaseCount(
          `marketplace_listings?gym_id=eq.${gymId}`,
          session.access_token
        ),
        supabaseCount(`app_settings?gym_id=eq.${gymId}`, session.access_token),
      ]);
      setKpis([
        { label: "Widgets", value: widgets.toString() },
        { label: "Listings", value: listings.toString() },
        { label: "Themes", value: settings.toString() },
        { label: "Assets", value: "Storage" },
      ]);
    }

    loadKpis();
  }, [gymId, session?.access_token]);

  return (
    <ModuleShell
      title="Brand Experience"
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
        title="Website Widgets"
        description="Embedded booking widgets and web components."
        table="widgets"
        session={session}
        gymId={gymId}
        useModal
        modalColumns={2}
        fields={[
          { name: "name", label: "Widget Name", required: true },
          { name: "embed_code", label: "Embed Code", type: "textarea" },
          {
            name: "status",
            label: "Status",
            type: "select",
            options: [
              { label: "Active", value: "active" },
              { label: "Inactive", value: "inactive" },
            ],
          },
        ]}
      />

      <CrudModule
        title="Marketplace Listings"
        description="Discovery listings for consumer marketplace."
        table="marketplace_listings"
        session={session}
        gymId={gymId}
        useModal
        modalColumns={2}
        fields={[
          { name: "title", label: "Listing Title", required: true },
          {
            name: "status",
            label: "Status",
            type: "select",
            options: [
              { label: "Active", value: "active" },
              { label: "Paused", value: "paused" },
            ],
          },
          { name: "views", label: "Views", type: "number" },
        ]}
      />

      <CrudModule
        title="App Settings"
        description="White-label app theming."
        table="app_settings"
        session={session}
        gymId={gymId}
        useModal
        modalColumns={2}
        fields={[
          { name: "theme", label: "Theme" },
          { name: "primary_color", label: "Primary Color" },
        ]}
      />

      <StorageModule session={session} gymId={gymId} />
    </ModuleShell>
  );
}
