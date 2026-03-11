/*
  # Community Seed: Starter Content for Launch (v4)

  Final corrected version. Changes from v3:
  - reaction_type 'nodding' replaced with 'hug' (valid types: heart, hug, helpful)
*/

-- ============================================================
-- STEP 1: auth.users
-- ============================================================
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, role, aud, instance_id)
VALUES
  ('00000001-0000-0000-0000-000000000001', 'margaretc@seed.careview.internal', '', now()-interval'90 days', now()-interval'90 days', now()-interval'90 days', 'authenticated', 'authenticated', '00000000-0000-0000-0000-000000000000'),
  ('00000001-0000-0000-0000-000000000002', 'davidh@seed.careview.internal',    '', now()-interval'85 days', now()-interval'85 days', now()-interval'85 days', 'authenticated', 'authenticated', '00000000-0000-0000-0000-000000000000'),
  ('00000001-0000-0000-0000-000000000003', 'saraht@seed.careview.internal',    '', now()-interval'80 days', now()-interval'80 days', now()-interval'80 days', 'authenticated', 'authenticated', '00000000-0000-0000-0000-000000000000'),
  ('00000001-0000-0000-0000-000000000004', 'tomb@seed.careview.internal',      '', now()-interval'75 days', now()-interval'75 days', now()-interval'75 days', 'authenticated', 'authenticated', '00000000-0000-0000-0000-000000000000'),
  ('00000001-0000-0000-0000-000000000005', 'elenam@seed.careview.internal',    '', now()-interval'70 days', now()-interval'70 days', now()-interval'70 days', 'authenticated', 'authenticated', '00000000-0000-0000-0000-000000000000'),
  ('00000001-0000-0000-0000-000000000006', 'patriciaw@seed.careview.internal', '', now()-interval'65 days', now()-interval'65 days', now()-interval'65 days', 'authenticated', 'authenticated', '00000000-0000-0000-0000-000000000000'),
  ('00000001-0000-0000-0000-000000000007', 'rupertg@seed.careview.internal',   '', now()-interval'60 days', now()-interval'60 days', now()-interval'60 days', 'authenticated', 'authenticated', '00000000-0000-0000-0000-000000000000'),
  ('00000001-0000-0000-0000-000000000008', 'niamhd@seed.careview.internal',    '', now()-interval'55 days', now()-interval'55 days', now()-interval'55 days', 'authenticated', 'authenticated', '00000000-0000-0000-0000-000000000000'),
  ('00000001-0000-0000-0000-000000000009', 'claref@seed.careview.internal',    '', now()-interval'50 days', now()-interval'50 days', now()-interval'50 days', 'authenticated', 'authenticated', '00000000-0000-0000-0000-000000000000')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- STEP 2: public.profiles
-- ============================================================
INSERT INTO public.profiles (id, email, display_name, role, disabled, created_at, updated_at)
VALUES
  ('00000001-0000-0000-0000-000000000001', 'margaretc@seed.careview.internal', 'Margaret C', 'caregiver', false, now()-interval'90 days', now()-interval'90 days'),
  ('00000001-0000-0000-0000-000000000002', 'davidh@seed.careview.internal',    'David H',    'caregiver', false, now()-interval'85 days', now()-interval'85 days'),
  ('00000001-0000-0000-0000-000000000003', 'saraht@seed.careview.internal',    'Sarah T',    'caregiver', false, now()-interval'80 days', now()-interval'80 days'),
  ('00000001-0000-0000-0000-000000000004', 'tomb@seed.careview.internal',      'Tom B',      'caregiver', false, now()-interval'75 days', now()-interval'75 days'),
  ('00000001-0000-0000-0000-000000000005', 'elenam@seed.careview.internal',    'Elena M',    'caregiver', false, now()-interval'70 days', now()-interval'70 days'),
  ('00000001-0000-0000-0000-000000000006', 'patriciaw@seed.careview.internal', 'Patricia W', 'caregiver', false, now()-interval'65 days', now()-interval'65 days'),
  ('00000001-0000-0000-0000-000000000007', 'rupertg@seed.careview.internal',   'Rupert G',   'caregiver', false, now()-interval'60 days', now()-interval'60 days'),
  ('00000001-0000-0000-0000-000000000008', 'niamhd@seed.careview.internal',    'Niamh D',    'caregiver', false, now()-interval'55 days', now()-interval'55 days'),
  ('00000001-0000-0000-0000-000000000009', 'claref@seed.careview.internal',    'Clare F',    'caregiver', false, now()-interval'50 days', now()-interval'50 days')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- STEP 3: community_profiles
-- ============================================================
INSERT INTO public.community_profiles (user_id, handle, bio, avatar_color, is_banned, post_count, reply_count, created_at, updated_at)
VALUES
  ('00000001-0000-0000-0000-000000000001', 'MargaretC', 'Caring for my mum with Alzheimer''s. Five years in and still learning.',     '#E57373', false, 0, 0, now()-interval'90 days', now()-interval'90 days'),
  ('00000001-0000-0000-0000-000000000002', 'DavidH',    'Son and carer. Dad had a stroke two years ago. Taking it one day at a time.','#64B5F6', false, 0, 0, now()-interval'85 days', now()-interval'85 days'),
  ('00000001-0000-0000-0000-000000000003', 'SarahT',    'Professional carer turned family carer. Here to share what I''ve learned.', '#81C784', false, 0, 0, now()-interval'80 days', now()-interval'80 days'),
  ('00000001-0000-0000-0000-000000000004', 'TomB',      'Caring for my wife who has MS. We navigate it together when we can.',        '#FFB74D', false, 0, 0, now()-interval'75 days', now()-interval'75 days'),
  ('00000001-0000-0000-0000-000000000005', 'ElenaM',    'Mum is 84, lives with us, vascular dementia. Grateful for spaces like this.','#BA68C8', false, 0, 0, now()-interval'70 days', now()-interval'70 days'),
  ('00000001-0000-0000-0000-000000000006', 'PatriciaW', 'Retired nurse, now caring for my husband. The role reversal is hard.',       '#4DD0E1', false, 0, 0, now()-interval'65 days', now()-interval'65 days'),
  ('00000001-0000-0000-0000-000000000007', 'RupertG',   'Dad is 78, Parkinson''s. Trying to keep him at home as long as possible.',   '#A1887F', false, 0, 0, now()-interval'60 days', now()-interval'60 days'),
  ('00000001-0000-0000-0000-000000000008', 'NiamhD',    'First-time carer, learning as I go. So glad this community exists.',        '#F06292', false, 0, 0, now()-interval'55 days', now()-interval'55 days'),
  ('00000001-0000-0000-0000-000000000009', 'ClareF',    'Three years caring for my nan. Night shifts are my biggest challenge.',      '#AED581', false, 0, 0, now()-interval'50 days', now()-interval'50 days')
ON CONFLICT (user_id) DO NOTHING;

-- ============================================================
-- STEP 4: community_posts
-- ============================================================
INSERT INTO public.community_posts (id, room_id, author_user_id, is_anonymous, title, body, help_type, post_status, is_deleted, is_locked, reply_count, reaction_count, created_at, updated_at, last_activity_at)
VALUES
('b0000001-0000-0000-0000-000000000001','935228f1-e03b-4612-bf24-ec93f39f7d80','00000001-0000-0000-0000-000000000001',false,
 'I haven''t had a full night''s sleep in four months',
 'Mum gets up between 2 and 4am almost every night now. She''s confused, sometimes frightened, and I''m the only one who can settle her. During the day I''m running on fumes and I can see it''s affecting how I talk to her, which makes me feel terrible. I love her but I''m running out of steam. Has anyone found a way to manage the night disruptions without it completely destroying the next day?',
 'similar_experiences','active',false,false,0,0, now()-interval'18 days',now()-interval'18 days',now()-interval'15 days'),

('b0000001-0000-0000-0000-000000000002','935228f1-e03b-4612-bf24-ec93f39f7d80','00000001-0000-0000-0000-000000000004',false,
 'Feeling guilty for needing a break — anyone else?',
 'Every time I think about taking an afternoon off or asking someone to cover for me, I get this wave of guilt. Like I should be able to handle it, like wanting time to myself means I don''t care enough. My wife would hate the idea of me struggling like this. I know logically that carers burn out and that''s bad for everyone. But the guilt doesn''t respond to logic. How do you all deal with this?',
 'emotional_support','active',false,false,0,0, now()-interval'14 days',now()-interval'14 days',now()-interval'12 days'),

('b0000001-0000-0000-0000-000000000003','935228f1-e03b-4612-bf24-ec93f39f7d80','00000001-0000-0000-0000-000000000008',true,
 'I snapped at him today and I can''t stop thinking about it',
 'I lost my patience this afternoon. He kept asking me the same question over and over and I raised my voice. Not screaming, but enough. He looked so startled and confused. I apologised immediately but he probably won''t remember it tomorrow. I will though. I feel awful. I know I''m not a bad person but it doesn''t feel that way right now.',
 'emotional_support','active',false,false,0,0, now()-interval'6 days',now()-interval'6 days',now()-interval'4 days'),

('b0000001-0000-0000-0000-000000000004','cb5efa1d-caa4-4883-8582-e2109b1220c3','00000001-0000-0000-0000-000000000005',false,
 'Refusing to bathe — what finally worked for you?',
 'Mum has refused to shower or bathe for about three weeks now. She says she already washed, or that she''s not dirty, or sometimes just becomes very distressed when we try. I''ve read about distraction techniques, music, warm flannels — but I''d love to hear what''s actually worked for real people in this situation rather than what the leaflets say.',
 'practical_tips','active',false,false,0,0, now()-interval'22 days',now()-interval'22 days',now()-interval'19 days'),

('b0000001-0000-0000-0000-000000000005','cb5efa1d-caa4-4883-8582-e2109b1220c3','00000001-0000-0000-0000-000000000002',false,
 'How do you handle repeated questions without going mad?',
 'Dad asks me what day it is approximately 40 times a day. I know it''s the disease, I know he can''t help it. But by the fifteenth time I find myself either giving a clipped answer or quietly leaving the room. I don''t want to be dismissive but I also can''t pretend every repetition is the first time — it takes a toll. What do others do?',
 'practical_tips','active',false,false,0,0, now()-interval'16 days',now()-interval'16 days',now()-interval'14 days'),

('b0000001-0000-0000-0000-000000000006','cb5efa1d-caa4-4883-8582-e2109b1220c3','00000001-0000-0000-0000-000000000007',false,
 'Sundowning is getting worse — any strategies?',
 'Dad''s sundowning has intensified over the last two months. From about 4pm he becomes agitated, sometimes convinced he needs to go somewhere, sometimes distressed about things that aren''t happening. I''ve tried blackout curtains, keeping lights on earlier, a calming playlist. Some days nothing helps. Wondering if anyone has found a real difference-maker.',
 'similar_experiences','active',false,false,0,0, now()-interval'10 days',now()-interval'10 days',now()-interval'8 days'),

('b0000001-0000-0000-0000-000000000007','dd70e962-e708-4934-8aa2-7b510ffbd99e','00000001-0000-0000-0000-000000000003',false,
 'Siblings who don''t help but have opinions on everything',
 'I am the only one of three siblings who lives nearby, so I do almost all of the day-to-day caring. My brother calls once a week, my sister visits once a month, but both of them feel completely comfortable telling me what I''m doing wrong. Last week they were upset I''d changed Mum''s GP without "consulting" them. I was the one who took her to every appointment for six months. How do others navigate this?',
 'similar_experiences','active',false,false,0,0, now()-interval'20 days',now()-interval'20 days',now()-interval'18 days'),

('b0000001-0000-0000-0000-000000000008','dd70e962-e708-4934-8aa2-7b510ffbd99e','00000001-0000-0000-0000-000000000006',false,
 'Husband''s family wants him to move in with them instead',
 'My in-laws have decided that my husband should move in with them rather than stay at home with me as his primary carer. They think they know better and they keep raising it at every visit. He is confused and doesn''t understand what''s being discussed. I feel undermined and honestly frightened. Has anyone dealt with extended family overreach like this?',
 'emotional_support','active',false,false,0,0, now()-interval'11 days',now()-interval'11 days',now()-interval'11 days'),

('b0000001-0000-0000-0000-000000000009','dd70e962-e708-4934-8aa2-7b510ffbd99e','00000001-0000-0000-0000-000000000009',true,
 'Power of attorney — my sibling is threatening to contest it',
 'I was granted lasting power of attorney for my nan two years ago with her full consent when she still had capacity. Now my cousin has decided I''m mismanaging things and is threatening legal action. I am doing everything by the book. I feel sick about it. Has anyone been through a contested LPA situation? Any advice on what to expect?',
 'question','active',false,false,0,0, now()-interval'4 days',now()-interval'4 days',now()-interval'4 days'),

('b0000001-0000-0000-0000-000000000010','61ac58e0-26a2-4ef1-8095-2cc6e9b8fcb5','00000001-0000-0000-0000-000000000008',false,
 'Just started — what do I actually need to know?',
 'My dad had a fall last month and I''ve suddenly become his main carer. I have no idea what I''m doing. I''m trying to work out what benefits he''s entitled to, whether we need any adaptations to the house, and how to have honest conversations with him about what he can and can''t do safely. Where did everyone start? What do you wish someone had told you in week one?',
 'practical_tips','active',false,false,0,0, now()-interval'9 days',now()-interval'9 days',now()-interval'6 days'),

('b0000001-0000-0000-0000-000000000011','61ac58e0-26a2-4ef1-8095-2cc6e9b8fcb5','00000001-0000-0000-0000-000000000002',false,
 'How do you know when someone needs more care than you can give?',
 'I''ve been Dad''s main carer since his stroke. He''s physically safe and his basic needs are met. But I notice I''m always watching for things that could go wrong, I''m tired in a way that sleep doesn''t fix, and I wonder sometimes if he needs specialist input I can''t provide. How did others recognise the line between managing and struggling? I don''t want to overreact but I also don''t want to miss something important.',
 'similar_experiences','active',false,false,0,0, now()-interval'7 days',now()-interval'7 days',now()-interval'7 days'),

('b0000001-0000-0000-0000-000000000012','61ac58e0-26a2-4ef1-8095-2cc6e9b8fcb5','00000001-0000-0000-0000-000000000005',false,
 'Trying to balance work and caring — is it actually possible?',
 'I went back to part-time work last year thinking it would help me feel more like myself. Instead I feel like I''m doing both things badly. My employer is understanding in theory but less so in practice when I need to leave early or take calls. And when I''m at work I''m worrying about Mum. Has anyone found a way to make this work, or is it just something you have to accept isn''t going to be tidy?',
 'similar_experiences','active',false,false,0,0, now()-interval'3 days',now()-interval'3 days',now()-interval'3 days'),

('b0000001-0000-0000-0000-000000000013','5ea49478-d09f-4e69-8ebf-54725295378d','00000001-0000-0000-0000-000000000003',false,
 'The pill organiser change that saved us hours a week',
 'We switched from a weekly pill organiser to a monthly one with AM/PM compartments and a colour-coded chart on the fridge. Before this, medication was a daily source of confusion and stress. Now it takes fifteen minutes on a Sunday and the rest of the week runs more smoothly. Small thing but it genuinely changed the texture of our days.',
 'resource','active',false,false,0,0, now()-interval'25 days',now()-interval'25 days',now()-interval'19 days'),

('b0000001-0000-0000-0000-000000000014','5ea49478-d09f-4e69-8ebf-54725295378d','00000001-0000-0000-0000-000000000006',false,
 'Grab rails — which ones are worth paying for?',
 'After Mum''s second fall we finally decided to properly kit out the bathroom. I''d love recommendations from people who have actually installed and used grab rails rather than just read about them. Particularly around the toilet and shower. Budget isn''t huge but we don''t want something that feels flimsy either.',
 'practical_tips','active',false,false,0,0, now()-interval'17 days',now()-interval'17 days',now()-interval'17 days'),

('b0000001-0000-0000-0000-000000000015','5ea49478-d09f-4e69-8ebf-54725295378d','00000001-0000-0000-0000-000000000007',false,
 'Using a simple whiteboard for daily routine — has anyone tried this?',
 'A physiotherapist suggested putting a small whiteboard in the kitchen with the day''s plan written in large text. I was sceptical but three weeks in, Dad checks it himself and it has reduced the number of times he asks me what''s happening next. Not a magic solution but it''s made mornings calmer. Anyone else using visual prompts like this?',
 'resource','active',false,false,0,0, now()-interval'8 days',now()-interval'8 days',now()-interval'8 days'),

('b0000001-0000-0000-0000-000000000016','26c9d01b-0674-42e4-85ef-3373407b4a16','00000001-0000-0000-0000-000000000009',false,
 'The loneliness of caring — does it get easier?',
 'I''ve been caring for my nan for three years and the loneliness has crept up on me. Friends have slowly drifted away, not unkindly, just because our lives have diverged so much. I rarely go out in the evenings. I''ve stopped talking about caring to people who aren''t in this situation because it''s hard to explain. Is this something others have experienced? Does it shift over time?',
 'similar_experiences','active',false,false,0,0, now()-interval'19 days',now()-interval'19 days',now()-interval'17 days'),

('b0000001-0000-0000-0000-000000000017','26c9d01b-0674-42e4-85ef-3373407b4a16','00000001-0000-0000-0000-000000000001',true,
 'Grieving someone who is still here',
 'The person I''m caring for is still alive and physically present. But the person I knew — the sharp, funny, independent person — is largely gone. I find myself grieving them while they''re still here, which feels strange and somehow disloyal. The good moments make it more complicated, not less. Has anyone found language or a framework for this kind of grief that helps?',
 'emotional_support','active',false,false,0,0, now()-interval'12 days',now()-interval'12 days',now()-interval'10 days'),

('b0000001-0000-0000-0000-000000000018','26c9d01b-0674-42e4-85ef-3373407b4a16','00000001-0000-0000-0000-000000000004',false,
 'What do you do when you have a genuinely good day?',
 'Yesterday was one of those rare days where everything was calm, she was lucid and happy, we had a good conversation and she laughed properly. Today I feel almost worse — like the good days make the harder ones harder to face. Anyone know what I mean? How do you hold onto the good days without the contrast becoming painful?',
 'emotional_support','active',false,false,0,0, now()-interval'2 days',now()-interval'2 days',now()-interval'2 days'),

('b0000001-0000-0000-0000-000000000019','1dbc9f04-64df-497a-ad45-8a6de137d7c3','00000001-0000-0000-0000-000000000003',false,
 'What apps or tools do you actually use day to day?',
 'I''m always curious what practical tech other carers find useful, if anything. I use a shared Google calendar so family can see appointments, a simple notes app to log anything unusual, and a medication reminder. But I''m sure I''m missing things. What has actually stuck for you — not what looks good in theory but what you still use after six months?',
 'resource','active',false,false,0,0, now()-interval'21 days',now()-interval'21 days',now()-interval'19 days'),

('b0000001-0000-0000-0000-000000000020','1dbc9f04-64df-497a-ad45-8a6de137d7c3','00000001-0000-0000-0000-000000000008',false,
 'Introducing myself — recently registered and feeling hopeful',
 'Hello everyone. I''ve been lurking here for a couple of weeks before working up the courage to post. I''m new to caring and new to this community. I don''t really have a specific question today — I just wanted to say hello and that reading other people''s experiences has already made me feel less alone. Thank you for making this a kind and honest place.',
 'emotional_support','active',false,false,0,0, now()-interval'5 days',now()-interval'5 days',now()-interval'4 days')

ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- STEP 5: community_replies
-- ============================================================
INSERT INTO public.community_replies (post_id, author_user_id, is_anonymous, body, is_deleted, reply_status, created_at, updated_at)
SELECT v.post_id, v.author_user_id, v.is_anonymous, v.body, false, 'active', v.created_at, v.created_at
FROM (VALUES
  ('b0000001-0000-0000-0000-000000000001'::uuid,'00000001-0000-0000-0000-000000000003'::uuid,false,'I went through this with my mum for about eight months. What eventually helped us was a low-dose melatonin supplement her GP prescribed, combined with keeping the bedroom cooler and darker. It didn''t stop the wake-ups entirely but they became shorter and less distressing. Worth asking the GP about — they were more open to it than I expected.',(now()-interval'17 days')::timestamptz),
  ('b0000001-0000-0000-0000-000000000001'::uuid,'00000001-0000-0000-0000-000000000007'::uuid,false,'The daytime exhaustion piece is real. I started doing a 20-minute lie-down every afternoon whether I felt tired or not — just horizontal with eyes closed. It doesn''t fix anything but it takes the edge off. Also: are there any night sitting services in your area? Carers Trust and some local authorities offer them. Even one night a fortnight changes things.',(now()-interval'16 days')::timestamptz),
  ('b0000001-0000-0000-0000-000000000001'::uuid,'00000001-0000-0000-0000-000000000009'::uuid,false,'You''re not running out of steam because you don''t care enough. You''re running out of steam because this is genuinely hard and you''re doing it alone in the early hours. Please be kind to yourself about it.',(now()-interval'15 days')::timestamptz),
  ('b0000001-0000-0000-0000-000000000002'::uuid,'00000001-0000-0000-0000-000000000001'::uuid,false,'The guilt is almost universal in my experience. A therapist once said to me: "You cannot pour from an empty vessel." It sounds like a cliché but it reframed things for me. Taking a break isn''t abandoning your wife — it''s maintaining the capacity to keep caring for her well. The guilt lies to you.',(now()-interval'13 days')::timestamptz),
  ('b0000001-0000-0000-0000-000000000002'::uuid,'00000001-0000-0000-0000-000000000005'::uuid,false,'I still feel it after three years. What I''ve found helps is framing the break as something I''m doing for Mum — coming back rested and less frayed means I''m a better carer. It''s not entirely honest but it quiets the guilt enough to actually rest.',(now()-interval'12 days')::timestamptz),
  ('b0000001-0000-0000-0000-000000000003'::uuid,'00000001-0000-0000-0000-000000000002'::uuid,false,'You''re not a bad person. You''re a person under sustained, exhausting pressure with no breaks and no one telling you you''re doing well. The fact that you feel terrible about it is itself a sign of how much you care. You apologised. You''re here. That counts.',(now()-interval'5 days')::timestamptz),
  ('b0000001-0000-0000-0000-000000000003'::uuid,'00000001-0000-0000-0000-000000000006'::uuid,false,'This has happened to almost every carer I know, including me. The repetitive questioning is one of the hardest things to endure with patience over long periods. You''re human. Forgive yourself and notice what triggered it — not to judge yourself but to see if there''s something that could be changed to reduce the pressure next time.',(now()-interval'4 days')::timestamptz),
  ('b0000001-0000-0000-0000-000000000004'::uuid,'00000001-0000-0000-0000-000000000003'::uuid,false,'What worked for us was switching from showers to a warm flannel wash at a regular time each morning — same time, same music playing, same sequence. Removing the shower itself from the equation stopped the distress almost immediately. She still resists occasionally but it''s manageable now.',(now()-interval'21 days')::timestamptz),
  ('b0000001-0000-0000-0000-000000000004'::uuid,'00000001-0000-0000-0000-000000000009'::uuid,false,'A carer support worker told me to try framing bathing as something Mum is doing for an occasion rather than hygiene — "let''s get you freshened up before your daughter visits." It doesn''t always work but it works more often than the direct request.',(now()-interval'20 days')::timestamptz),
  ('b0000001-0000-0000-0000-000000000004'::uuid,'00000001-0000-0000-0000-000000000001'::uuid,false,'I''d also gently suggest not pushing it every day if she''s very resistant. Dementia UK has a good guide on this — sometimes backing off completely for a day or two and trying again in a different way resets the resistance. Forcing it when she''s distressed can make the next attempt harder.',(now()-interval'19 days')::timestamptz),
  ('b0000001-0000-0000-0000-000000000005'::uuid,'00000001-0000-0000-0000-000000000005'::uuid,false,'We put a digital clock with the day and date in large text on the mantelpiece. Mum could see it from her chair. It didn''t stop the asking entirely but it gave me something to point to — "have a look at the clock, love" — which felt less like a rebuff than just answering again.',(now()-interval'15 days')::timestamptz),
  ('b0000001-0000-0000-0000-000000000005'::uuid,'00000001-0000-0000-0000-000000000004'::uuid,false,'The technique that helped me most was responding to the feeling under the question rather than the question itself. When Dad asks what day it is, he''s often actually anxious about whether something is happening or whether he''s missed something. Saying "Today''s quiet, nothing to worry about, we''re just having lunch" addresses the anxiety better than a day name.',(now()-interval'14 days')::timestamptz),
  ('b0000001-0000-0000-0000-000000000006'::uuid,'00000001-0000-0000-0000-000000000001'::uuid,false,'We had good results with a predictable late-afternoon activity at the same time each day — a short walk if possible, otherwise a folding task, sorting objects, something with his hands. The routine itself seemed to anchor him at that difficult time even on days he was unsettled.',(now()-interval'9 days')::timestamptz),
  ('b0000001-0000-0000-0000-000000000006'::uuid,'00000001-0000-0000-0000-000000000008'::uuid,false,'I''ve read that light therapy in the morning can help regulate the circadian rhythm and reduce sundowning. Haven''t tried it myself but it came up when I was researching for a relative. Might be worth discussing with his GP or dementia nurse.',(now()-interval'8 days')::timestamptz),
  ('b0000001-0000-0000-0000-000000000007'::uuid,'00000001-0000-0000-0000-000000000009'::uuid,false,'This is one of the most common painful dynamics in caring. What helped my family was a brief monthly update email — I''d send a short summary of how Mum was, any decisions I''d made, what was coming up. It gave them information and made them feel involved without me having to justify every decision in the moment.',(now()-interval'19 days')::timestamptz),
  ('b0000001-0000-0000-0000-000000000007'::uuid,'00000001-0000-0000-0000-000000000002'::uuid,false,'I had the same situation. In the end I was direct with my sister: "I make these decisions because I am here. If you want input, please be here." It was uncomfortable. It also worked. Sometimes naming the imbalance directly is the only thing that shifts it.',(now()-interval'18 days')::timestamptz),
  ('b0000001-0000-0000-0000-000000000010'::uuid,'00000001-0000-0000-0000-000000000003'::uuid,false,'First: contact your local carer''s centre or Carers UK. They can do a carer''s needs assessment for you (not just your dad) and point you toward local support, respite, and financial help. Most people don''t know they''re entitled to this. It was the most useful thing I did in my first month.',(now()-interval'8 days')::timestamptz),
  ('b0000001-0000-0000-0000-000000000010'::uuid,'00000001-0000-0000-0000-000000000006'::uuid,false,'Start a simple log now, even just notes on your phone — what he eats, any falls or near-misses, changes in behaviour or mood, medication times. You won''t remember the details later and the pattern often tells you something important. It also makes conversations with the GP much easier.',(now()-interval'7 days')::timestamptz),
  ('b0000001-0000-0000-0000-000000000010'::uuid,'00000001-0000-0000-0000-000000000007'::uuid,false,'Welcome. The fact that you''re asking these questions in week one puts you ahead. The most important thing I''d tell my earlier self: you don''t have to figure it all out at once. Pick one thing this week — benefits, GP introduction, house adaptations — and do that. One at a time.',(now()-interval'6 days')::timestamptz),
  ('b0000001-0000-0000-0000-000000000016'::uuid,'00000001-0000-0000-0000-000000000001'::uuid,false,'Yes, completely. After two years I had almost no social life left. What helped was a local carers'' support group — not primarily for the information but for being in a room with people who understood without needing explanation. The shared shorthand is a kind of relief I hadn''t expected.',(now()-interval'18 days')::timestamptz),
  ('b0000001-0000-0000-0000-000000000016'::uuid,'00000001-0000-0000-0000-000000000004'::uuid,false,'It shifts in texture rather than going away, in my experience. The acute loneliness of the early years softened as I found people who understood — here, in online groups, at respite events. You have to go looking for your people a bit, but they exist.',(now()-interval'17 days')::timestamptz),
  ('b0000001-0000-0000-0000-000000000019'::uuid,'00000001-0000-0000-0000-000000000007'::uuid,false,'Shared Google calendar has been essential for our family. We also use a WhatsApp group for quick updates. For medication specifically, a pharmacist recommended the NHS app for repeat prescriptions — saves a separate trip every month.',(now()-interval'20 days')::timestamptz),
  ('b0000001-0000-0000-0000-000000000019'::uuid,'00000001-0000-0000-0000-000000000002'::uuid,false,'CareView for logging observations has been genuinely useful for us. Having structured records means I can spot patterns I wouldn''t otherwise notice, and it makes GP appointments much more productive.',(now()-interval'19 days')::timestamptz),
  ('b0000001-0000-0000-0000-000000000020'::uuid,'00000001-0000-0000-0000-000000000003'::uuid,false,'Welcome. You''re in the right place. Ask anything — no question is too small or too basic here.',(now()-interval'4 days')::timestamptz),
  ('b0000001-0000-0000-0000-000000000020'::uuid,'00000001-0000-0000-0000-000000000005'::uuid,false,'Hello and welcome. The courage it takes to post the first time is real. Glad you''re here.',(now()-interval'4 days')::timestamptz)
) AS v(post_id, author_user_id, is_anonymous, body, created_at)
WHERE NOT EXISTS (
  SELECT 1 FROM public.community_replies r
  WHERE r.post_id = v.post_id AND r.author_user_id = v.author_user_id
);

-- ============================================================
-- STEP 6: community_reactions (valid types: heart, hug, helpful)
-- ============================================================
INSERT INTO public.community_reactions (post_id, user_id, reaction_type, created_at)
VALUES
  ('b0000001-0000-0000-0000-000000000001','00000001-0000-0000-0000-000000000002','heart',   now()-interval'17 days'),
  ('b0000001-0000-0000-0000-000000000001','00000001-0000-0000-0000-000000000005','heart',   now()-interval'16 days'),
  ('b0000001-0000-0000-0000-000000000001','00000001-0000-0000-0000-000000000006','hug',     now()-interval'16 days'),
  ('b0000001-0000-0000-0000-000000000002','00000001-0000-0000-0000-000000000003','heart',   now()-interval'13 days'),
  ('b0000001-0000-0000-0000-000000000002','00000001-0000-0000-0000-000000000009','hug',     now()-interval'13 days'),
  ('b0000001-0000-0000-0000-000000000003','00000001-0000-0000-0000-000000000001','heart',   now()-interval'5 days'),
  ('b0000001-0000-0000-0000-000000000003','00000001-0000-0000-0000-000000000004','heart',   now()-interval'5 days'),
  ('b0000001-0000-0000-0000-000000000003','00000001-0000-0000-0000-000000000007','hug',     now()-interval'5 days'),
  ('b0000001-0000-0000-0000-000000000004','00000001-0000-0000-0000-000000000002','helpful', now()-interval'21 days'),
  ('b0000001-0000-0000-0000-000000000004','00000001-0000-0000-0000-000000000008','helpful', now()-interval'20 days'),
  ('b0000001-0000-0000-0000-000000000005','00000001-0000-0000-0000-000000000003','helpful', now()-interval'15 days'),
  ('b0000001-0000-0000-0000-000000000005','00000001-0000-0000-0000-000000000009','hug',     now()-interval'14 days'),
  ('b0000001-0000-0000-0000-000000000007','00000001-0000-0000-0000-000000000004','hug',     now()-interval'19 days'),
  ('b0000001-0000-0000-0000-000000000007','00000001-0000-0000-0000-000000000008','hug',     now()-interval'19 days'),
  ('b0000001-0000-0000-0000-000000000010','00000001-0000-0000-0000-000000000001','heart',   now()-interval'8 days'),
  ('b0000001-0000-0000-0000-000000000010','00000001-0000-0000-0000-000000000006','helpful', now()-interval'8 days'),
  ('b0000001-0000-0000-0000-000000000013','00000001-0000-0000-0000-000000000002','helpful', now()-interval'24 days'),
  ('b0000001-0000-0000-0000-000000000013','00000001-0000-0000-0000-000000000008','helpful', now()-interval'23 days'),
  ('b0000001-0000-0000-0000-000000000013','00000001-0000-0000-0000-000000000009','helpful', now()-interval'23 days'),
  ('b0000001-0000-0000-0000-000000000016','00000001-0000-0000-0000-000000000002','heart',   now()-interval'18 days'),
  ('b0000001-0000-0000-0000-000000000016','00000001-0000-0000-0000-000000000007','hug',     now()-interval'17 days'),
  ('b0000001-0000-0000-0000-000000000017','00000001-0000-0000-0000-000000000003','heart',   now()-interval'11 days'),
  ('b0000001-0000-0000-0000-000000000017','00000001-0000-0000-0000-000000000006','hug',     now()-interval'11 days'),
  ('b0000001-0000-0000-0000-000000000017','00000001-0000-0000-0000-000000000009','hug',     now()-interval'10 days'),
  ('b0000001-0000-0000-0000-000000000020','00000001-0000-0000-0000-000000000001','heart',   now()-interval'4 days'),
  ('b0000001-0000-0000-0000-000000000020','00000001-0000-0000-0000-000000000007','heart',   now()-interval'4 days')
ON CONFLICT ON CONSTRAINT community_reactions_unique DO NOTHING;

-- ============================================================
-- STEP 7: Reconcile denormalized counters
-- ============================================================
UPDATE public.community_posts p
SET
  reply_count    = (SELECT COUNT(*) FROM public.community_replies r  WHERE r.post_id = p.id AND r.is_deleted = false),
  reaction_count = (SELECT COUNT(*) FROM public.community_reactions rc WHERE rc.post_id = p.id)
WHERE p.id::text LIKE 'b0000001%';

UPDATE public.community_profiles cp
SET
  post_count  = (SELECT COUNT(*) FROM public.community_posts p   WHERE p.author_user_id = cp.user_id AND p.is_deleted = false),
  reply_count = (SELECT COUNT(*) FROM public.community_replies r WHERE r.author_user_id = cp.user_id AND r.is_deleted = false)
WHERE cp.user_id::text LIKE '00000001%';

UPDATE public.community_rooms cr
SET post_count = (SELECT COUNT(*) FROM public.community_posts p WHERE p.room_id = cr.id AND p.is_deleted = false);
