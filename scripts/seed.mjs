const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ownerId = process.env.SEED_OWNER_ID || null;

if (!supabaseUrl || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const headers = {
  apikey: serviceKey,
  Authorization: `Bearer ${serviceKey}`,
  "Content-Type": "application/json",
  Prefer: "resolution=merge-duplicates,return=representation",
};

async function upsert(table, rows) {
  const response = await fetch(
    `${supabaseUrl}/rest/v1/${table}?on_conflict=id`,
    {
      method: "POST",
      headers,
      body: JSON.stringify(rows),
    }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Seed failed for ${table}: ${text}`);
  }

  return response.json();
}

async function run() {
  const gyms = await upsert("gyms", [
    {
      id: "11111111-1111-1111-1111-111111111111",
      owner_id: ownerId,
      name: "FitSutra Flagship",
      city: "Mumbai",
      state: "MH",
    },
  ]);

  if (ownerId) {
    await upsert("profiles", [
      {
        user_id: ownerId,
        gym_id: gyms[0]?.id ?? "11111111-1111-1111-1111-111111111111",
        role: "owner",
      },
    ]);
  }

  await upsert("members", [
    {
      id: "22222222-2222-2222-2222-222222222221",
      gym_id: "11111111-1111-1111-1111-111111111111",
      full_name: "Aarav Kapoor",
      email: "aarav@fitsutra.in",
      phone: "+91 90000 11111",
      status: "active",
      membership_type: "Elite Annual",
      joined_on: "2025-11-12",
    },
    {
      id: "22222222-2222-2222-2222-222222222222",
      gym_id: "11111111-1111-1111-1111-111111111111",
      full_name: "Ishita Verma",
      email: "ishita@fitsutra.in",
      phone: "+91 90000 22222",
      status: "active",
      membership_type: "Power Monthly",
      joined_on: "2026-01-28",
    },
    {
      id: "22222222-2222-2222-2222-222222222223",
      gym_id: "11111111-1111-1111-1111-111111111111",
      full_name: "Kabir Malhotra",
      email: "kabir@fitsutra.in",
      phone: "+91 90000 33333",
      status: "paused",
      membership_type: "Strength Quarterly",
      joined_on: "2025-10-05",
    },
    {
      id: "22222222-2222-2222-2222-222222222224",
      gym_id: "11111111-1111-1111-1111-111111111111",
      full_name: "Meera Iyer",
      email: "meera@fitsutra.in",
      phone: "+91 90000 44444",
      status: "active",
      membership_type: "Elite Annual",
      joined_on: "2026-02-02",
    },
  ]);

  await upsert("staff", [
    {
      id: "33333333-3333-3333-3333-333333333331",
      gym_id: "11111111-1111-1111-1111-111111111111",
      full_name: "Anika Rao",
      role: "Head Coach",
      phone: "+91 90000 55555",
      status: "active",
    },
    {
      id: "33333333-3333-3333-3333-333333333332",
      gym_id: "11111111-1111-1111-1111-111111111111",
      full_name: "Rohan Bhat",
      role: "Strength Specialist",
      phone: "+91 90000 66666",
      status: "active",
    },
    {
      id: "33333333-3333-3333-3333-333333333333",
      gym_id: "11111111-1111-1111-1111-111111111111",
      full_name: "Sia Fernandes",
      role: "Mobility Coach",
      phone: "+91 90000 77777",
      status: "on leave",
    },
  ]);

  await upsert("classes", [
    {
      id: "44444444-4444-4444-4444-444444444441",
      gym_id: "11111111-1111-1111-1111-111111111111",
      title: "HIIT Ignite",
      coach: "Rohan Bhat",
      intensity: "High",
      capacity: 24,
      duration_min: 45,
    },
    {
      id: "44444444-4444-4444-4444-444444444442",
      gym_id: "11111111-1111-1111-1111-111111111111",
      title: "Strength Circuit",
      coach: "Anika Rao",
      intensity: "Medium",
      capacity: 18,
      duration_min: 50,
    },
    {
      id: "44444444-4444-4444-4444-444444444443",
      gym_id: "11111111-1111-1111-1111-111111111111",
      title: "Mobility Flow",
      coach: "Sia Fernandes",
      intensity: "Low",
      capacity: 20,
      duration_min: 40,
    },
  ]);

  await upsert("class_sessions", [
    {
      id: "55555555-5555-5555-5555-555555555551",
      class_id: "44444444-4444-4444-4444-444444444441",
      session_date: "2026-02-17",
      start_time: "06:30",
      enrolled: 18,
    },
    {
      id: "55555555-5555-5555-5555-555555555552",
      class_id: "44444444-4444-4444-4444-444444444442",
      session_date: "2026-02-17",
      start_time: "07:45",
      enrolled: 15,
    },
    {
      id: "55555555-5555-5555-5555-555555555553",
      class_id: "44444444-4444-4444-4444-444444444443",
      session_date: "2026-02-17",
      start_time: "18:30",
      enrolled: 20,
    },
  ]);

  await upsert("payments", [
    {
      id: "66666666-6666-6666-6666-666666666661",
      member_id: "22222222-2222-2222-2222-222222222221",
      amount: 24000,
      status: "paid",
      paid_on: "2026-02-10",
      method: "UPI",
      invoice_no: "INV-2401",
    },
    {
      id: "66666666-6666-6666-6666-666666666662",
      member_id: "22222222-2222-2222-2222-222222222224",
      amount: 8000,
      status: "paid",
      paid_on: "2026-02-14",
      method: "Card",
      invoice_no: "INV-2402",
    },
    {
      id: "66666666-6666-6666-6666-666666666663",
      member_id: "22222222-2222-2222-2222-222222222223",
      amount: 12000,
      status: "pending",
      paid_on: "2026-02-12",
      method: "NetBanking",
      invoice_no: "INV-2403",
    },
  ]);

  console.log("Seed complete.");
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
