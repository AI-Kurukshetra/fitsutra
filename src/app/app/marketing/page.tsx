"use client";

import CrudModule from "@/components/CrudModule";
import KpiGrid from "@/components/KpiGrid";
import ContextNotice from "@/components/ContextNotice";
import ModuleShell from "@/components/ModuleShell";
import useGymContext from "@/lib/useGymContext";
import { supabaseCount } from "@/lib/supabase";
import { useEffect, useState } from "react";

export default function MarketingPage() {
  const { session, gymId, profile, loading, error } = useGymContext();
  const [kpis, setKpis] = useState([
    { label: "Campaigns", value: "0" },
    { label: "Messages", value: "0" },
    { label: "Promo Codes", value: "0" },
    { label: "Referrals", value: "0" },
  ]);

  useEffect(() => {
    async function loadKpis() {
      if (!session?.access_token || !gymId) return;
      const [campaigns, messages, promos, referrals] = await Promise.all([
        supabaseCount(`campaigns?gym_id=eq.${gymId}`, session.access_token),
        supabaseCount(`messages?gym_id=eq.${gymId}`, session.access_token),
        supabaseCount(`promo_codes?gym_id=eq.${gymId}`, session.access_token),
        supabaseCount(`referrals?gym_id=eq.${gymId}`, session.access_token),
      ]);
      setKpis([
        { label: "Campaigns", value: campaigns.toString() },
        { label: "Messages", value: messages.toString() },
        { label: "Promo Codes", value: promos.toString() },
        { label: "Referrals", value: referrals.toString() },
      ]);
    }

    loadKpis();
  }, [gymId, session?.access_token]);

  return (
    <ModuleShell
      title="Marketing & Engagement"
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
        title="Campaigns"
        description="Email, SMS, and digital campaigns."
        table="campaigns"
        session={session}
        gymId={gymId}
        useModal
        modalColumns={2}
        fields={[
          { name: "name", label: "Campaign Name", required: true },
          {
            name: "channel",
            label: "Channel",
            type: "select",
            options: [
              { label: "Email", value: "email" },
              { label: "SMS", value: "sms" },
              { label: "Push", value: "push" },
            ],
          },
          {
            name: "status",
            label: "Status",
            type: "select",
            options: [
              { label: "Draft", value: "draft" },
              { label: "Active", value: "active" },
              { label: "Paused", value: "paused" },
            ],
          },
          { name: "start_at", label: "Start", type: "date" },
          { name: "end_at", label: "End", type: "date" },
        ]}
      />

      <CrudModule
        title="Messages"
        description="Automated outreach and reminders."
        table="messages"
        session={session}
        gymId={gymId}
        useModal
        modalColumns={2}
        fields={[
          { name: "campaign_id", label: "Campaign ID" },
          { name: "recipient", label: "Recipient" },
          {
            name: "status",
            label: "Status",
            type: "select",
            options: [
              { label: "Queued", value: "queued" },
              { label: "Sent", value: "sent" },
              { label: "Failed", value: "failed" },
            ],
          },
          { name: "sent_at", label: "Sent At", type: "datetime-local" },
        ]}
      />

      <CrudModule
        title="Promo Codes"
        description="Discounts and promotional offers."
        table="promo_codes"
        session={session}
        gymId={gymId}
        useModal
        modalColumns={2}
        fields={[
          { name: "code", label: "Code", required: true },
          { name: "discount_percent", label: "Discount %", type: "number" },
          {
            name: "status",
            label: "Status",
            type: "select",
            options: [
              { label: "Active", value: "active" },
              { label: "Expired", value: "expired" },
            ],
          },
          { name: "expires_on", label: "Expires", type: "date" },
        ]}
      />

      <CrudModule
        title="Loyalty Rewards"
        description="Points, tiers, and reward status."
        table="loyalty_rewards"
        session={session}
        gymId={gymId}
        useModal
        modalColumns={2}
        fields={[
          { name: "member_id", label: "Member ID" },
          { name: "points", label: "Points", type: "number" },
          { name: "tier", label: "Tier" },
          {
            name: "status",
            label: "Status",
            type: "select",
            options: [
              { label: "Active", value: "active" },
              { label: "Redeemed", value: "redeemed" },
            ],
          },
        ]}
      />

      <CrudModule
        title="Referrals"
        description="Track referral programs and rewards."
        table="referrals"
        session={session}
        gymId={gymId}
        useModal
        modalColumns={2}
        fields={[
          { name: "referrer_member_id", label: "Referrer Member ID" },
          { name: "referee_name", label: "Referee Name" },
          {
            name: "reward_status",
            label: "Reward Status",
            type: "select",
            options: [
              { label: "Pending", value: "pending" },
              { label: "Issued", value: "issued" },
            ],
          },
        ]}
      />
    </ModuleShell>
  );
}
