"use client";

import CrudModule from "@/components/CrudModule";
import KpiGrid from "@/components/KpiGrid";
import ContextNotice from "@/components/ContextNotice";
import ModuleShell from "@/components/ModuleShell";
import useGymContext from "@/lib/useGymContext";
import { supabaseCount } from "@/lib/supabase";
import { useEffect, useState } from "react";

export default function CrmPage() {
  const { session, gymId, profile, loading, error } = useGymContext();
  const [kpis, setKpis] = useState([
    { label: "Members", value: "0" },
    { label: "Active", value: "0" },
    { label: "Plans", value: "0" },
    { label: "Memberships", value: "0" },
  ]);

  useEffect(() => {
    async function loadKpis() {
      if (!session?.access_token || !gymId) return;
      const [members, activeMembers, plans, memberships] = await Promise.all([
        supabaseCount(`members?gym_id=eq.${gymId}`, session.access_token),
        supabaseCount(
          `members?gym_id=eq.${gymId}&status=eq.active`,
          session.access_token
        ),
        supabaseCount(
          `membership_plans?gym_id=eq.${gymId}`,
          session.access_token
        ),
        supabaseCount(
          `memberships?gym_id=eq.${gymId}`,
          session.access_token
        ),
      ]);
      setKpis([
        { label: "Members", value: members.toString() },
        { label: "Active", value: activeMembers.toString() },
        { label: "Plans", value: plans.toString() },
        { label: "Memberships", value: memberships.toString() },
      ]);
    }

    loadKpis();
  }, [gymId, session?.access_token]);

  return (
    <ModuleShell title="Client CRM" subtitle={profile?.gym?.name ?? "FitSutra"}>
      <ContextNotice
        session={session}
        gymId={gymId}
        loading={loading}
        error={error}
      />

      <KpiGrid items={kpis} />

      <CrudModule
        title="Members"
        description="Client profiles, notes, and engagement history."
        table="members"
        session={session}
        gymId={gymId}
        useModal
        modalColumns={3}
        fields={[
          { name: "member_code", label: "Member Code" },
          { name: "full_name", label: "Full Name", required: true },
          { name: "email", label: "Email" },
          { name: "phone", label: "Phone" },
          {
            name: "status",
            label: "Status",
            type: "select",
            options: [
              { label: "Active", value: "active" },
              { label: "Paused", value: "paused" },
              { label: "Inactive", value: "inactive" },
            ],
          },
          { name: "membership_type", label: "Membership Type" },
          { name: "joined_on", label: "Joined On", type: "date" },
          { name: "notes", label: "Notes", type: "textarea" },
        ]}
      />

      <CrudModule
        title="Membership Plans"
        description="Recurring packages and tiers."
        table="membership_plans"
        session={session}
        gymId={gymId}
        useModal
        modalColumns={2}
        fields={[
          { name: "name", label: "Plan Name", required: true },
          { name: "price", label: "Price", type: "number" },
          {
            name: "billing_cycle",
            label: "Billing Cycle",
            type: "select",
            options: [
              { label: "Monthly", value: "monthly" },
              { label: "Quarterly", value: "quarterly" },
              { label: "Annual", value: "annual" },
            ],
          },
          { name: "tier", label: "Tier" },
          {
            name: "status",
            label: "Status",
            type: "select",
            options: [
              { label: "Active", value: "active" },
              { label: "Paused", value: "paused" },
            ],
          },
        ]}
      />

      <CrudModule
        title="Memberships"
        description="Link members to plans and manage renewals."
        table="memberships"
        session={session}
        gymId={gymId}
        useModal
        modalColumns={2}
        fields={[
          { name: "member_id", label: "Member ID", required: true },
          { name: "plan_id", label: "Plan ID" },
          {
            name: "status",
            label: "Status",
            type: "select",
            options: [
              { label: "Active", value: "active" },
              { label: "Paused", value: "paused" },
              { label: "Expired", value: "expired" },
            ],
          },
          { name: "start_date", label: "Start Date", type: "date" },
          { name: "end_date", label: "End Date", type: "date" },
        ]}
      />
    </ModuleShell>
  );
}
