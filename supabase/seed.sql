insert into public.gyms (id, owner_id, name, city, state)
values
  ('11111111-1111-1111-1111-111111111111', null, 'FitSutra Flagship', 'Mumbai', 'MH');

insert into public.locations (id, gym_id, name, address, city, state, timezone)
values
  ('11111111-1111-1111-1111-111111111112', '11111111-1111-1111-1111-111111111111', 'Bandra Flagship', 'Bandra West', 'Mumbai', 'MH', 'Asia/Kolkata');

insert into public.members (id, gym_id, full_name, email, phone, status, membership_type, joined_on)
values
  ('22222222-2222-2222-2222-222222222221', '11111111-1111-1111-1111-111111111111', 'Aarav Kapoor', 'aarav@fitsutra.in', '+91 90000 11111', 'active', 'Elite Annual', '2025-11-12'),
  ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Ishita Verma', 'ishita@fitsutra.in', '+91 90000 22222', 'active', 'Power Monthly', '2026-01-28'),
  ('22222222-2222-2222-2222-222222222223', '11111111-1111-1111-1111-111111111111', 'Kabir Malhotra', 'kabir@fitsutra.in', '+91 90000 33333', 'paused', 'Strength Quarterly', '2025-10-05'),
  ('22222222-2222-2222-2222-222222222224', '11111111-1111-1111-1111-111111111111', 'Meera Iyer', 'meera@fitsutra.in', '+91 90000 44444', 'active', 'Elite Annual', '2026-02-02');

insert into public.membership_plans (id, gym_id, name, price, billing_cycle, tier, status)
values
  ('22222222-2222-2222-2222-222222222231', '11111111-1111-1111-1111-111111111111', 'Elite Annual', 24000, 'annual', 'elite', 'active'),
  ('22222222-2222-2222-2222-222222222232', '11111111-1111-1111-1111-111111111111', 'Power Monthly', 8000, 'monthly', 'standard', 'active');

insert into public.memberships (id, gym_id, member_id, plan_id, status, start_date)
values
  ('22222222-2222-2222-2222-222222222241', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222221', '22222222-2222-2222-2222-222222222231', 'active', '2025-11-12');

insert into public.staff (id, gym_id, full_name, role, phone, status)
values
  ('33333333-3333-3333-3333-333333333331', '11111111-1111-1111-1111-111111111111', 'Anika Rao', 'Head Coach', '+91 90000 55555', 'active'),
  ('33333333-3333-3333-3333-333333333332', '11111111-1111-1111-1111-111111111111', 'Rohan Bhat', 'Strength Specialist', '+91 90000 66666', 'active'),
  ('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'Sia Fernandes', 'Mobility Coach', '+91 90000 77777', 'on leave');

insert into public.staff_shifts (id, gym_id, staff_id, start_at, end_at, status)
values
  ('33333333-3333-3333-3333-333333333341', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333332', '2026-02-17 06:00', '2026-02-17 12:00', 'scheduled');

insert into public.payroll_entries (id, gym_id, staff_id, period_start, period_end, amount, status)
values
  ('33333333-3333-3333-3333-333333333351', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333331', '2026-02-01', '2026-02-15', 45000, 'pending');

insert into public.classes (id, gym_id, title, coach, intensity, capacity, duration_min)
values
  ('44444444-4444-4444-4444-444444444441', '11111111-1111-1111-1111-111111111111', 'HIIT Ignite', 'Rohan Bhat', 'High', 24, 45),
  ('44444444-4444-4444-4444-444444444442', '11111111-1111-1111-1111-111111111111', 'Strength Circuit', 'Anika Rao', 'Medium', 18, 50),
  ('44444444-4444-4444-4444-444444444443', '11111111-1111-1111-1111-111111111111', 'Mobility Flow', 'Sia Fernandes', 'Low', 20, 40);

insert into public.class_sessions (id, gym_id, class_id, session_date, start_time, enrolled)
values
  ('55555555-5555-5555-5555-555555555551', '11111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444441', '2026-02-17', '06:30', 18),
  ('55555555-5555-5555-5555-555555555552', '11111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444442', '2026-02-17', '07:45', 15),
  ('55555555-5555-5555-5555-555555555553', '11111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444443', '2026-02-17', '18:30', 20);

insert into public.appointments (id, gym_id, member_id, staff_id, start_at, end_at, status)
values
  ('55555555-5555-5555-5555-555555555561', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333331', '2026-02-18 08:00', '2026-02-18 09:00', 'scheduled');

insert into public.bookings (id, gym_id, member_id, class_session_id, status)
values
  ('55555555-5555-5555-5555-555555555571', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222221', '55555555-5555-5555-5555-555555555551', 'booked');

insert into public.waitlists (id, gym_id, member_id, class_session_id, status)
values
  ('55555555-5555-5555-5555-555555555581', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222223', '55555555-5555-5555-5555-555555555552', 'waiting');

insert into public.payments (id, gym_id, member_id, amount, status, paid_on, method, invoice_no)
values
  ('66666666-6666-6666-6666-666666666661', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222221', 24000, 'paid', '2026-02-10', 'UPI', 'INV-2401'),
  ('66666666-6666-6666-6666-666666666662', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222224', 8000, 'paid', '2026-02-14', 'Card', 'INV-2402'),
  ('66666666-6666-6666-6666-666666666663', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222223', 12000, 'pending', '2026-02-12', 'NetBanking', 'INV-2403');

insert into public.products (id, gym_id, name, sku, price, stock, status)
values
  ('66666666-6666-6666-6666-666666666671', '11111111-1111-1111-1111-111111111111', 'FitSutra Protein', 'FS-PRO-1', 2499, 120, 'active');

insert into public.orders (id, gym_id, member_id, total, status)
values
  ('66666666-6666-6666-6666-666666666681', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222221', 2499, 'paid');

insert into public.order_items (id, gym_id, order_id, product_id, quantity, price)
values
  ('66666666-6666-6666-6666-666666666691', '11111111-1111-1111-1111-111111111111', '66666666-6666-6666-6666-666666666681', '66666666-6666-6666-6666-666666666671', 1, 2499);

insert into public.campaigns (id, gym_id, name, channel, status, start_at, end_at)
values
  ('77777777-7777-7777-7777-777777777771', '11111111-1111-1111-1111-111111111111', 'New Year Reset', 'email', 'active', '2026-01-01', '2026-02-28');

insert into public.messages (id, gym_id, campaign_id, recipient, status, sent_at)
values
  ('77777777-7777-7777-7777-777777777781', '11111111-1111-1111-1111-111111111111', '77777777-7777-7777-7777-777777777771', 'aarav@fitsutra.in', 'sent', '2026-02-10 09:30');

insert into public.promo_codes (id, gym_id, code, discount_percent, status, expires_on)
values
  ('77777777-7777-7777-7777-777777777791', '11111111-1111-1111-1111-111111111111', 'FITSUTRA15', 15, 'active', '2026-06-30');

insert into public.loyalty_rewards (id, gym_id, member_id, points, tier, status)
values
  ('77777777-7777-7777-7777-777777777792', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222221', 340, 'Gold', 'active');

insert into public.referrals (id, gym_id, referrer_member_id, referee_name, reward_status)
values
  ('77777777-7777-7777-7777-777777777793', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'Arjun Mehta', 'pending');

insert into public.reports (id, gym_id, name, report_type, status)
values
  ('77777777-7777-7777-7777-777777777794', '11111111-1111-1111-1111-111111111111', 'Monthly Revenue', 'financial', 'active');

insert into public.widgets (id, gym_id, name, embed_code, status)
values
  ('88888888-8888-8888-8888-888888888881', '11111111-1111-1111-1111-111111111111', 'Booking Widget', '<div>Book Now</div>', 'active');

insert into public.marketplace_listings (id, gym_id, title, status, views)
values
  ('88888888-8888-8888-8888-888888888882', '11111111-1111-1111-1111-111111111111', 'FitSutra Flagship', 'active', 1820);

insert into public.app_settings (id, gym_id, theme, primary_color)
values
  ('88888888-8888-8888-8888-888888888883', '11111111-1111-1111-1111-111111111111', 'Energetic', '#f59e0b');

insert into public.integrations (id, gym_id, provider, status, connected_at)
values
  ('99999999-9999-9999-9999-999999999991', '11111111-1111-1111-1111-111111111111', 'QuickBooks', 'active', '2026-02-01 12:00');

insert into public.forms (id, gym_id, title, form_type, status)
values
  ('99999999-9999-9999-9999-999999999992', '11111111-1111-1111-1111-111111111111', 'New Member Intake', 'survey', 'active');

insert into public.waivers (id, gym_id, title, status)
values
  ('99999999-9999-9999-9999-999999999993', '11111111-1111-1111-1111-111111111111', 'Standard Liability Waiver', 'active');

insert into public.waiver_signatures (id, gym_id, waiver_id, member_id, signed_at)
values
  ('99999999-9999-9999-9999-999999999994', '11111111-1111-1111-1111-111111111111', '99999999-9999-9999-9999-999999999993', '22222222-2222-2222-2222-222222222221', '2026-02-05 10:00');

insert into public.leads (id, gym_id, full_name, email, phone, source, stage)
values
  ('10101010-1010-1010-1010-101010101010', '11111111-1111-1111-1111-111111111111', 'Neha Sharma', 'neha@fitsutra.in', '+91 90000 88888', 'Instagram', 'qualified');

insert into public.finance_offers (id, gym_id, provider, amount, status)
values
  ('11111111-2222-3333-4444-555555555555', '11111111-1111-1111-1111-111111111111', 'Bacancy Capital', 150000, 'offered');
