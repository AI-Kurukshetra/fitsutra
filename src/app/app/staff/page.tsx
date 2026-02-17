"use client";

import CrudModule from "@/components/CrudModule";
import KpiGrid from "@/components/KpiGrid";
import ContextNotice from "@/components/ContextNotice";
import ModuleShell from "@/components/ModuleShell";
import useGymContext from "@/lib/useGymContext";
import { supabaseCount } from "@/lib/supabase";
import { useEffect, useState } from "react";

export default function StaffPage() {
  const { session, gymId, profile, loading, error } = useGymContext();
  const [kpis, setKpis] = useState([
    { label: "Staff", value: "0" },
    { label: "Shifts", value: "0" },
    { label: "Payroll", value: "0" },
    { label: "Appointments", value: "0" },
  ]);

  useEffect(() => {
    async function loadKpis() {
      if (!session?.access_token || !gymId) return;
      const [staff, shifts, payroll, appointments] = await Promise.all([
        supabaseCount(`staff?gym_id=eq.${gymId}`, session.access_token),
        supabaseCount(`staff_shifts?gym_id=eq.${gymId}`, session.access_token),
        supabaseCount(
          `payroll_entries?gym_id=eq.${gymId}`,
          session.access_token
        ),
        supabaseCount(
          `appointments?gym_id=eq.${gymId}`,
          session.access_token
        ),
      ]);
      setKpis([
        { label: "Staff", value: staff.toString() },
        { label: "Shifts", value: shifts.toString() },
        { label: "Payroll", value: payroll.toString() },
        { label: "Appointments", value: appointments.toString() },
      ]);
    }

    loadKpis();
  }, [gymId, session?.access_token]);

  return (
    <ModuleShell title="Staff & Team" subtitle={profile?.gym?.name ?? "FitSutra"}>
      <ContextNotice
        session={session}
        gymId={gymId}
        loading={loading}
        error={error}
      />

      <KpiGrid items={kpis} />

      <CrudModule
        title="Staff Directory"
        description="Manage roles, availability, and status."
        table="staff"
        session={session}
        gymId={gymId}
        fields={[
          { name: "full_name", label: "Full Name", required: true },
          { name: "role", label: "Role" },
          { name: "phone", label: "Phone" },
          {
            name: "status",
            label: "Status",
            type: "select",
            options: [
              { label: "Active", value: "active" },
              { label: "On Leave", value: "on leave" },
            ],
          },
        ]}
      />

      <CrudModule
        title="Staff Shifts"
        description="Assign sessions and shift coverage."
        table="staff_shifts"
        session={session}
        gymId={gymId}
        fields={[
          { name: "staff_id", label: "Staff ID", required: true },
          { name: "start_at", label: "Start", type: "datetime-local" },
          { name: "end_at", label: "End", type: "datetime-local" },
          {
            name: "status",
            label: "Status",
            type: "select",
            options: [
              { label: "Scheduled", value: "scheduled" },
              { label: "Completed", value: "completed" },
              { label: "Cancelled", value: "cancelled" },
            ],
          },
        ]}
      />

      <CrudModule
        title="Payroll Entries"
        description="Compensation cycles and approvals."
        table="payroll_entries"
        session={session}
        gymId={gymId}
        fields={[
          { name: "staff_id", label: "Staff ID", required: true },
          { name: "period_start", label: "Period Start", type: "date" },
          { name: "period_end", label: "Period End", type: "date" },
          { name: "amount", label: "Amount", type: "number" },
          {
            name: "status",
            label: "Status",
            type: "select",
            options: [
              { label: "Pending", value: "pending" },
              { label: "Approved", value: "approved" },
            ],
          },
        ]}
      />
    </ModuleShell>
  );
}
