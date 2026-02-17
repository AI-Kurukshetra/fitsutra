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

  await upsert("locations", [
    {
      id: "11111111-1111-1111-1111-111111111112",
      gym_id: "11111111-1111-1111-1111-111111111111",
      name: "Bandra Flagship",
      address: "Bandra West",
      city: "Mumbai",
      state: "MH",
      timezone: "Asia/Kolkata",
    },
  ]);

  await upsert("members", [
    {
      id: "22222222-2222-2222-2222-222222222221",
      gym_id: "11111111-1111-1111-1111-111111111111",
      member_code: "ABC1234",
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
      member_code: "FS-9281",
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
      member_code: "FS-7723",
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
      member_code: "FS-5571",
      full_name: "Meera Iyer",
      email: "meera@fitsutra.in",
      phone: "+91 90000 44444",
      status: "active",
      membership_type: "Elite Annual",
      joined_on: "2026-02-02",
    },
  ]);

  await upsert("membership_plans", [
    {
      id: "22222222-2222-2222-2222-222222222231",
      gym_id: "11111111-1111-1111-1111-111111111111",
      name: "Elite Annual",
      price: 24000,
      billing_cycle: "annual",
      tier: "elite",
      status: "active",
    },
    {
      id: "22222222-2222-2222-2222-222222222232",
      gym_id: "11111111-1111-1111-1111-111111111111",
      name: "Power Monthly",
      price: 8000,
      billing_cycle: "monthly",
      tier: "standard",
      status: "active",
    },
  ]);

  await upsert("memberships", [
    {
      id: "22222222-2222-2222-2222-222222222241",
      gym_id: "11111111-1111-1111-1111-111111111111",
      member_id: "22222222-2222-2222-2222-222222222221",
      plan_id: "22222222-2222-2222-2222-222222222231",
      payment_method: "upi",
      upi_id: "fitsutra@upi",
      status: "active",
      start_date: "2025-11-12",
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

  await upsert("staff_shifts", [
    {
      id: "33333333-3333-3333-3333-333333333341",
      gym_id: "11111111-1111-1111-1111-111111111111",
      staff_id: "33333333-3333-3333-3333-333333333332",
      start_at: "2026-02-17 06:00",
      end_at: "2026-02-17 12:00",
      status: "scheduled",
    },
  ]);

  await upsert("payroll_entries", [
    {
      id: "33333333-3333-3333-3333-333333333351",
      gym_id: "11111111-1111-1111-1111-111111111111",
      staff_id: "33333333-3333-3333-3333-333333333331",
      period_start: "2026-02-01",
      period_end: "2026-02-15",
      amount: 45000,
      status: "pending",
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
      gym_id: "11111111-1111-1111-1111-111111111111",
      class_id: "44444444-4444-4444-4444-444444444441",
      session_date: "2026-02-17",
      start_time: "06:30",
      enrolled: 18,
    },
    {
      id: "55555555-5555-5555-5555-555555555552",
      gym_id: "11111111-1111-1111-1111-111111111111",
      class_id: "44444444-4444-4444-4444-444444444442",
      session_date: "2026-02-17",
      start_time: "07:45",
      enrolled: 15,
    },
    {
      id: "55555555-5555-5555-5555-555555555553",
      gym_id: "11111111-1111-1111-1111-111111111111",
      class_id: "44444444-4444-4444-4444-444444444443",
      session_date: "2026-02-17",
      start_time: "18:30",
      enrolled: 20,
    },
  ]);

  await upsert("appointments", [
    {
      id: "55555555-5555-5555-5555-555555555561",
      gym_id: "11111111-1111-1111-1111-111111111111",
      member_id: "22222222-2222-2222-2222-222222222222",
      staff_id: "33333333-3333-3333-3333-333333333331",
      start_at: "2026-02-18 08:00",
      end_at: "2026-02-18 09:00",
      status: "scheduled",
    },
  ]);

  await upsert("bookings", [
    {
      id: "55555555-5555-5555-5555-555555555571",
      gym_id: "11111111-1111-1111-1111-111111111111",
      member_id: "22222222-2222-2222-2222-222222222221",
      class_session_id: "55555555-5555-5555-5555-555555555551",
      status: "booked",
    },
  ]);

  await upsert("waitlists", [
    {
      id: "55555555-5555-5555-5555-555555555581",
      gym_id: "11111111-1111-1111-1111-111111111111",
      member_id: "22222222-2222-2222-2222-222222222223",
      class_session_id: "55555555-5555-5555-5555-555555555552",
      status: "waiting",
    },
  ]);

  await upsert("payments", [
    {
      id: "66666666-6666-6666-6666-666666666661",
      gym_id: "11111111-1111-1111-1111-111111111111",
      member_id: "22222222-2222-2222-2222-222222222221",
      amount: 24000,
      status: "paid",
      paid_on: "2026-02-10",
      method: "UPI",
      invoice_no: "INV-2401",
    },
    {
      id: "66666666-6666-6666-6666-666666666662",
      gym_id: "11111111-1111-1111-1111-111111111111",
      member_id: "22222222-2222-2222-2222-222222222224",
      amount: 8000,
      status: "paid",
      paid_on: "2026-02-14",
      method: "Card",
      invoice_no: "INV-2402",
    },
    {
      id: "66666666-6666-6666-6666-666666666663",
      gym_id: "11111111-1111-1111-1111-111111111111",
      member_id: "22222222-2222-2222-2222-222222222223",
      amount: 12000,
      status: "pending",
      paid_on: "2026-02-12",
      method: "NetBanking",
      invoice_no: "INV-2403",
    },
  ]);

  await upsert("products", [
    {
      id: "66666666-6666-6666-6666-666666666671",
      gym_id: "11111111-1111-1111-1111-111111111111",
      name: "FitSutra Protein",
      sku: "FS-PRO-1",
      price: 2499,
      stock: 120,
      status: "active",
    },
  ]);

  await upsert("orders", [
    {
      id: "66666666-6666-6666-6666-666666666681",
      gym_id: "11111111-1111-1111-1111-111111111111",
      member_id: "22222222-2222-2222-2222-222222222221",
      total: 2499,
      status: "paid",
    },
  ]);

  await upsert("order_items", [
    {
      id: "66666666-6666-6666-6666-666666666691",
      gym_id: "11111111-1111-1111-1111-111111111111",
      order_id: "66666666-6666-6666-6666-666666666681",
      product_id: "66666666-6666-6666-6666-666666666671",
      quantity: 1,
      price: 2499,
    },
  ]);

  await upsert("campaigns", [
    {
      id: "77777777-7777-7777-7777-777777777771",
      gym_id: "11111111-1111-1111-1111-111111111111",
      name: "New Year Reset",
      channel: "email",
      status: "active",
      start_at: "2026-01-01",
      end_at: "2026-02-28",
    },
  ]);

  await upsert("messages", [
    {
      id: "77777777-7777-7777-7777-777777777781",
      gym_id: "11111111-1111-1111-1111-111111111111",
      campaign_id: "77777777-7777-7777-7777-777777777771",
      recipient: "aarav@fitsutra.in",
      status: "sent",
      sent_at: "2026-02-10 09:30",
    },
  ]);

  await upsert("promo_codes", [
    {
      id: "77777777-7777-7777-7777-777777777791",
      gym_id: "11111111-1111-1111-1111-111111111111",
      code: "FITSUTRA15",
      discount_percent: 15,
      status: "active",
      expires_on: "2026-06-30",
    },
  ]);

  await upsert("loyalty_rewards", [
    {
      id: "77777777-7777-7777-7777-777777777792",
      gym_id: "11111111-1111-1111-1111-111111111111",
      member_id: "22222222-2222-2222-2222-222222222221",
      points: 340,
      tier: "Gold",
      status: "active",
    },
  ]);

  await upsert("referrals", [
    {
      id: "77777777-7777-7777-7777-777777777793",
      gym_id: "11111111-1111-1111-1111-111111111111",
      referrer_member_id: "22222222-2222-2222-2222-222222222222",
      referee_name: "Arjun Mehta",
      reward_status: "pending",
    },
  ]);

  await upsert("reports", [
    {
      id: "77777777-7777-7777-7777-777777777794",
      gym_id: "11111111-1111-1111-1111-111111111111",
      name: "Monthly Revenue",
      report_type: "financial",
      status: "active",
    },
  ]);

  await upsert("widgets", [
    {
      id: "88888888-8888-8888-8888-888888888881",
      gym_id: "11111111-1111-1111-1111-111111111111",
      name: "Booking Widget",
      embed_code: "<div>Book Now</div>",
      status: "active",
    },
  ]);

  await upsert("marketplace_listings", [
    {
      id: "88888888-8888-8888-8888-888888888882",
      gym_id: "11111111-1111-1111-1111-111111111111",
      title: "FitSutra Flagship",
      status: "active",
      views: 1820,
    },
  ]);

  await upsert("app_settings", [
    {
      id: "88888888-8888-8888-8888-888888888883",
      gym_id: "11111111-1111-1111-1111-111111111111",
      theme: "Energetic",
      primary_color: "#f59e0b",
    },
  ]);

  await upsert("integrations", [
    {
      id: "99999999-9999-9999-9999-999999999991",
      gym_id: "11111111-1111-1111-1111-111111111111",
      provider: "QuickBooks",
      status: "active",
      connected_at: "2026-02-01 12:00",
    },
  ]);

  await upsert("forms", [
    {
      id: "99999999-9999-9999-9999-999999999992",
      gym_id: "11111111-1111-1111-1111-111111111111",
      title: "New Member Intake",
      form_type: "survey",
      status: "active",
    },
  ]);

  await upsert("waivers", [
    {
      id: "99999999-9999-9999-9999-999999999993",
      gym_id: "11111111-1111-1111-1111-111111111111",
      title: "Standard Liability Waiver",
      status: "active",
    },
  ]);

  await upsert("waiver_signatures", [
    {
      id: "99999999-9999-9999-9999-999999999994",
      gym_id: "11111111-1111-1111-1111-111111111111",
      waiver_id: "99999999-9999-9999-9999-999999999993",
      member_id: "22222222-2222-2222-2222-222222222221",
      signed_at: "2026-02-05 10:00",
    },
  ]);

  await upsert("leads", [
    {
      id: "10101010-1010-1010-1010-101010101010",
      gym_id: "11111111-1111-1111-1111-111111111111",
      full_name: "Neha Sharma",
      email: "neha@fitsutra.in",
      phone: "+91 90000 88888",
      source: "Instagram",
      stage: "qualified",
    },
  ]);

  await upsert("finance_offers", [
    {
      id: "11111111-2222-3333-4444-555555555555",
      gym_id: "11111111-1111-1111-1111-111111111111",
      provider: "Bacancy Capital",
      amount: 150000,
      status: "offered",
    },
  ]);

  console.log("Seed complete.");
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
