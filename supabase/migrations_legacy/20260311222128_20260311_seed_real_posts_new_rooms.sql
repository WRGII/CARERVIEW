/*
  # Seed Real Posts for 4 Newly Activated Community Rooms

  ## Summary
  Adds 3 real seed posts per newly activated room (12 posts total) using the
  existing seed author accounts (00000001-... series). Post content is realistic
  caregiver discussion appropriate to each room topic.

  ## Rooms Covered
  - Daily Care Tips      (2dde44ef-b445-4129-9016-966e8f90b9b6)
  - Practical Advice     (041fe382-2f7a-4606-960e-a58e62847b1e)
  - Diagnosis & Conditions (f96b5af0-58b0-4de5-a4b6-00275b42bc28)
  - Equipment & Aids     (ac265583-5876-47c4-b0c2-7030e7cbde0a)

  ## Notes
  - Uses existing seed user IDs (00000001-... series)
  - Follows identical pattern to 20260311043655 seed migration
  - ON CONFLICT DO NOTHING ensures idempotency
*/

INSERT INTO public.community_posts (
  id, room_id, author_user_id, is_anonymous, title, body,
  help_type, post_status, is_deleted, is_locked,
  reply_count, reaction_count, created_at, updated_at, last_activity_at
)
VALUES

-- ── Daily Care Tips ──────────────────────────────────────────
('c0000001-0000-0000-0000-000000000001',
 '2dde44ef-b445-4129-9016-966e8f90b9b6',
 '00000001-0000-0000-0000-000000000003', false,
 'Our morning routine that reduced daily stress by half',
 'After months of chaotic mornings I finally sat down and mapped out every single task we needed to do before 10am. The night before I now lay out clothes, prep the breakfast things, and charge the wheelchair. That 20 minutes the night before saves an hour of stress in the morning. Happy to share the full checklist if anyone wants it.',
 'practical_tips', 'active', false, false, 0, 0,
 now()-interval'20 days', now()-interval'20 days', now()-interval'17 days'),

('c0000001-0000-0000-0000-000000000002',
 '2dde44ef-b445-4129-9016-966e8f90b9b6',
 '00000001-0000-0000-0000-000000000006', false,
 'Quick batch-cooking ideas that work when you''re exhausted',
 'I used to feel guilty about not cooking fresh every day but I simply don''t have the energy. Now I batch-cook on Sunday afternoons — soups, stews, egg muffins — and it''s genuinely changed the week. Anyone else batch-cooking? I''d love more recipe ideas that are easy to eat for someone with swallowing difficulties.',
 'practical_tips', 'active', false, false, 0, 0,
 now()-interval'16 days', now()-interval'16 days', now()-interval'13 days'),

('c0000001-0000-0000-0000-000000000003',
 '2dde44ef-b445-4129-9016-966e8f90b9b6',
 '00000001-0000-0000-0000-000000000009', true,
 'Small bathroom changes that made a huge difference',
 'We added a grab rail next to the toilet, a non-slip mat, and a shower stool. Took one Saturday afternoon and probably cost £80 total. Dad went from needing two people to assist him to being nearly independent in the bathroom. Wish we''d done it sooner. What cheap wins have others found at home?',
 'practical_tips', 'active', false, false, 0, 0,
 now()-interval'10 days', now()-interval'10 days', now()-interval'8 days'),

-- ── Practical Advice ─────────────────────────────────────────
('c0000001-0000-0000-0000-000000000004',
 '041fe382-2f7a-4606-960e-a58e62847b1e',
 '00000001-0000-0000-0000-000000000002', false,
 'Navigating carer''s allowance — is it worth applying?',
 'I''ve been putting off applying for carer''s allowance because the form looked intimidating and I wasn''t sure I''d qualify. Finally did it last month and wish I''d done it years ago. The weekly amount isn''t huge but it adds up. Has anyone else been through the process? Happy to share what documentation they actually asked for.',
 'resource', 'active', false, false, 0, 0,
 now()-interval'24 days', now()-interval'24 days', now()-interval'21 days'),

('c0000001-0000-0000-0000-000000000005',
 '041fe382-2f7a-4606-960e-a58e62847b1e',
 '00000001-0000-0000-0000-000000000007', false,
 'Creating a handover sheet for when I can''t be there',
 'I travel occasionally for work and had to leave Mum with my brother for four days. I created a two-page handover document covering her medications, routine, triggers, emergency contacts, and GP details. He said it was invaluable. If anyone wants a template I can post it here.',
 'resource', 'active', false, false, 0, 0,
 now()-interval'19 days', now()-interval'19 days', now()-interval'16 days'),

('c0000001-0000-0000-0000-000000000006',
 '041fe382-2f7a-4606-960e-a58e62847b1e',
 '00000001-0000-0000-0000-000000000004', true,
 'Getting a needs assessment — our experience',
 'We finally pushed for a formal needs assessment from the local council after struggling for over a year. It took persistence — three phone calls and a letter — but the outcome was a care package that now covers four hours of help a week. For anyone who hasn''t done this yet: you are entitled to ask, and it does not commit you to anything.',
 'practical_tips', 'active', false, false, 0, 0,
 now()-interval'11 days', now()-interval'11 days', now()-interval'9 days'),

-- ── Diagnosis & Conditions ───────────────────────────────────
('c0000001-0000-0000-0000-000000000007',
 'f96b5af0-58b0-4de5-a4b6-00275b42bc28',
 '00000001-0000-0000-0000-000000000007', false,
 'Dad was just diagnosed with Parkinson''s — what should we expect in year one?',
 'We got the diagnosis six weeks ago. The neurologist was helpful but the appointment was 20 minutes and I left with a leaflet and a lot of unanswered questions. Dad is 78 and still pretty mobile. I''m trying to understand what the first year typically looks like, what changes to make now versus later, and what to push for from the GP. Any experience here would mean a lot.',
 'question', 'active', false, false, 0, 0,
 now()-interval'25 days', now()-interval'25 days', now()-interval'22 days'),

('c0000001-0000-0000-0000-000000000008',
 'f96b5af0-58b0-4de5-a4b6-00275b42bc28',
 '00000001-0000-0000-0000-000000000001', false,
 'Managing pain at home — what''s actually worked for your family',
 'Mum has arthritis and back pain and the GP''s answer is usually paracetamol and physio. The physio has a 4-month waiting list. In the meantime her mobility has declined and she''s much less willing to move around. I''d love to hear what other people have found helpful — heat pads, positioning, anything really. We''re doing what we can.',
 'question', 'active', false, false, 0, 0,
 now()-interval'17 days', now()-interval'17 days', now()-interval'14 days'),

('c0000001-0000-0000-0000-000000000009',
 'f96b5af0-58b0-4de5-a4b6-00275b42bc28',
 '00000001-0000-0000-0000-000000000005', true,
 'How do you explain a terminal diagnosis to children in the family?',
 'Mum has been given a terminal diagnosis and we need to tell the grandchildren, aged 8 and 11. We don''t want to lie but we also don''t want to overwhelm them. Has anyone navigated this? A family therapist would be ideal but there''s a long wait. Any books, phrases, or approaches that helped your family would be genuinely useful right now.',
 'question', 'active', false, false, 0, 0,
 now()-interval'8 days', now()-interval'8 days', now()-interval'6 days'),

-- ── Equipment & Aids ─────────────────────────────────────────
('c0000001-0000-0000-0000-000000000010',
 'ac265583-5876-47c4-b0c2-7030e7cbde0a',
 '00000001-0000-0000-0000-000000000006', false,
 'Raised toilet seats — which brands have actually held up?',
 'We''ve been through two cheap raised toilet seats in 18 months — both wobbled and one cracked. Dad is 95kg so we need something solid. I''d rather pay more for something reliable. Has anyone found a brand that holds up to daily use? Ideally with arms as he uses them to push himself up.',
 'question', 'active', false, false, 0, 0,
 now()-interval'21 days', now()-interval'21 days', now()-interval'18 days'),

('c0000001-0000-0000-0000-000000000011',
 'ac265583-5876-47c4-b0c2-7030e7cbde0a',
 '00000001-0000-0000-0000-000000000003', false,
 'Shower conversion vs. shower chair — weighing up the options',
 'We''re at the point where a standard shower is becoming unsafe. The OT mentioned both options. A level-access shower conversion would be around £3,000 and takes 2-3 days. A quality shower chair with a handheld attachment is £150 and takes an hour. Mum is still reasonably able but that won''t last indefinitely. Interested to hear what others chose and whether they regret it.',
 'question', 'active', false, false, 0, 0,
 now()-interval'14 days', now()-interval'14 days', now()-interval'11 days'),

('c0000001-0000-0000-0000-000000000012',
 'ac265583-5876-47c4-b0c2-7030e7cbde0a',
 '00000001-0000-0000-0000-000000000008', true,
 'Grab rail installation — DIY or call a professional?',
 'I''m comfortable with a drill and we have solid walls. I''m wondering whether the DIY grab rail kits you can buy online are genuinely safe or whether I should pay for a professional fitting. The ones I''m looking at have good reviews but I''ve also seen warnings about making sure you hit a stud. What did others do?',
 'practical_tips', 'active', false, false, 0, 0,
 now()-interval'7 days', now()-interval'7 days', now()-interval'5 days')

ON CONFLICT (id) DO NOTHING;

-- Update post_count on community_rooms for the 4 new rooms
UPDATE public.community_rooms
SET post_count = (
  SELECT COUNT(*) FROM public.community_posts
  WHERE room_id = community_rooms.id
    AND post_status = 'active'
    AND is_deleted = false
)
WHERE slug IN (
  'daily-care-tips',
  'practical-advice',
  'diagnosis-questions',
  'equipment-and-aids'
);
