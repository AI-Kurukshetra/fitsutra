"use client";

import CrudModule from "@/components/CrudModule";
import KpiGrid from "@/components/KpiGrid";
import ContextNotice from "@/components/ContextNotice";
import ModuleShell from "@/components/ModuleShell";
import useGymContext from "@/lib/useGymContext";
import { supabaseCount } from "@/lib/supabase";
import { useEffect, useState } from "react";

export default function SchedulingPage() {
  const { session, gymId, profile, loading, error } = useGymContext();
  const [kpis, setKpis] = useState([
    { label: "Classes", value: "0" },
    { label: "Sessions", value: "0" },
    { label: "Bookings", value: "0" },
    { label: "Waitlist", value: "0" },
  ]);

  useEffect(() => {
    async function loadKpis() {
      if (!session?.access_token || !gymId) return;
      const [classes, sessions, bookings, waitlists] = await Promise.all([
        supabaseCount(`classes?gym_id=eq.${gymId}`, session.access_token),
        supabaseCount(`class_sessions?gym_id=eq.${gymId}`, session.access_token),
        supabaseCount(`bookings?gym_id=eq.${gymId}`, session.access_token),
        supabaseCount(`waitlists?gym_id=eq.${gymId}`, session.access_token),
      ]);
      setKpis([
        { label: "Classes", value: classes.toString() },
        { label: "Sessions", value: sessions.toString() },
        { label: "Bookings", value: bookings.toString() },
        { label: "Waitlist", value: waitlists.toString() },
      ]);
    }

    loadKpis();
  }, [gymId, session?.access_token]);

  return (
    <ModuleShell
      title="Scheduling & Booking"
      subtitle={profile?.gym?.name ?? "FitSutra Flagship"}
    >
      <ContextNotice
        session={session}
        gymId={gymId}
        loading={loading}
        error={error}
      />

      <KpiGrid items={kpis} />

      <CrudModule
        title="Classes"
        description="Manage class templates and capacity."
        table="classes"
        session={session}
        gymId={gymId}
        fields={[
          { name: "title", label: "Title", required: true },
          { name: "coach", label: "Coach" },
          {
            name: "intensity",
            label: "Intensity",
            type: "select",
            options: [
              { label: "Low", value: "Low" },
              { label: "Medium", value: "Medium" },
              { label: "High", value: "High" },
            ],
          },
          { name: "capacity", label: "Capacity", type: "number" },
          { name: "duration_min", label: "Duration (min)", type: "number" },
        ]}
      />

      <CrudModule
        title="Class Sessions"
        description="Schedule sessions and track enrollments."
        table="class_sessions"
        session={session}
        gymId={gymId}
        fields={[
          { name: "class_id", label: "Class ID", required: true },
          { name: "session_date", label: "Date", type: "date" },
          { name: "start_time", label: "Start Time" },
          { name: "enrolled", label: "Enrolled", type: "number" },
        ]}
      />

      <CrudModule
        title="Appointments"
        description="One-on-one training and services."
        table="appointments"
        session={session}
        gymId={gymId}
        fields={[
          { name: "member_id", label: "Member ID" },
          { name: "staff_id", label: "Staff ID" },
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
          { name: "notes", label: "Notes", type: "textarea" },
        ]}
      />

      <CrudModule
        title="Bookings"
        description="Track member bookings and attendance."
        table="bookings"
        session={session}
        gymId={gymId}
        fields={[
          { name: "member_id", label: "Member ID" },
          { name: "class_session_id", label: "Class Session ID" },
          {
            name: "status",
            label: "Status",
            type: "select",
            options: [
              { label: "Booked", value: "booked" },
              { label: "Checked In", value: "checked_in" },
              { label: "Cancelled", value: "cancelled" },
            ],
          },
        ]}
      />

      <CrudModule
        title="Waitlists"
        description="Manage waitlisted members."
        table="waitlists"
        session={session}
        gymId={gymId}
        fields={[
          { name: "member_id", label: "Member ID" },
          { name: "class_session_id", label: "Class Session ID" },
          {
            name: "status",
            label: "Status",
            type: "select",
            options: [
              { label: "Waiting", value: "waiting" },
              { label: "Notified", value: "notified" },
              { label: "Joined", value: "joined" },
            ],
          },
        ]}
      />
    </ModuleShell>
  );
}
