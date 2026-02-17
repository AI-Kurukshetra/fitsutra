insert into public.gyms (id, owner_id, name, city, state)
values
  ('11111111-1111-1111-1111-111111111111', null, 'FitSutra Flagship', 'Mumbai', 'MH');

insert into public.members (id, gym_id, full_name, email, phone, status, membership_type, joined_on)
values
  ('22222222-2222-2222-2222-222222222221', '11111111-1111-1111-1111-111111111111', 'Aarav Kapoor', 'aarav@fitsutra.in', '+91 90000 11111', 'active', 'Elite Annual', '2025-11-12'),
  ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Ishita Verma', 'ishita@fitsutra.in', '+91 90000 22222', 'active', 'Power Monthly', '2026-01-28'),
  ('22222222-2222-2222-2222-222222222223', '11111111-1111-1111-1111-111111111111', 'Kabir Malhotra', 'kabir@fitsutra.in', '+91 90000 33333', 'paused', 'Strength Quarterly', '2025-10-05'),
  ('22222222-2222-2222-2222-222222222224', '11111111-1111-1111-1111-111111111111', 'Meera Iyer', 'meera@fitsutra.in', '+91 90000 44444', 'active', 'Elite Annual', '2026-02-02');

insert into public.staff (id, gym_id, full_name, role, phone, status)
values
  ('33333333-3333-3333-3333-333333333331', '11111111-1111-1111-1111-111111111111', 'Anika Rao', 'Head Coach', '+91 90000 55555', 'active'),
  ('33333333-3333-3333-3333-333333333332', '11111111-1111-1111-1111-111111111111', 'Rohan Bhat', 'Strength Specialist', '+91 90000 66666', 'active'),
  ('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'Sia Fernandes', 'Mobility Coach', '+91 90000 77777', 'on leave');

insert into public.classes (id, gym_id, title, coach, intensity, capacity, duration_min)
values
  ('44444444-4444-4444-4444-444444444441', '11111111-1111-1111-1111-111111111111', 'HIIT Ignite', 'Rohan Bhat', 'High', 24, 45),
  ('44444444-4444-4444-4444-444444444442', '11111111-1111-1111-1111-111111111111', 'Strength Circuit', 'Anika Rao', 'Medium', 18, 50),
  ('44444444-4444-4444-4444-444444444443', '11111111-1111-1111-1111-111111111111', 'Mobility Flow', 'Sia Fernandes', 'Low', 20, 40);

insert into public.class_sessions (id, class_id, session_date, start_time, enrolled)
values
  ('55555555-5555-5555-5555-555555555551', '44444444-4444-4444-4444-444444444441', '2026-02-17', '06:30', 18),
  ('55555555-5555-5555-5555-555555555552', '44444444-4444-4444-4444-444444444442', '2026-02-17', '07:45', 15),
  ('55555555-5555-5555-5555-555555555553', '44444444-4444-4444-4444-444444444443', '2026-02-17', '18:30', 20);

insert into public.payments (id, member_id, amount, status, paid_on, method, invoice_no)
values
  ('66666666-6666-6666-6666-666666666661', '22222222-2222-2222-2222-222222222221', 24000, 'paid', '2026-02-10', 'UPI', 'INV-2401'),
  ('66666666-6666-6666-6666-666666666662', '22222222-2222-2222-2222-222222222224', 8000, 'paid', '2026-02-14', 'Card', 'INV-2402'),
  ('66666666-6666-6666-6666-666666666663', '22222222-2222-2222-2222-222222222223', 12000, 'pending', '2026-02-12', 'NetBanking', 'INV-2403');
