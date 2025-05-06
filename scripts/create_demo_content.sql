-- First create daftars for investors
INSERT INTO "public"."daftar" (
  "id",
  "name",
  "profile_url",
  "structure",
  "website",
  "type",
  "big_picture",
  "location",
  "team_size",
  "is_active",
  "created_at"
) VALUES
('demo-daftar1-' || gen_random_uuid(), 'Parv''s VC Fund', '', 'Venture Capital', 'https://example.com', 'VC', 'Demo daftar for testing', 'Global', 5, true, CURRENT_TIMESTAMP),
('demo-daftar2-' || gen_random_uuid(), 'Rohit''s Angel Fund', '', 'Angel Fund', 'https://example.com', 'Angel', 'Demo daftar for testing', 'Global', 3, true, CURRENT_TIMESTAMP),
('demo-daftar3-' || gen_random_uuid(), 'Pratie''s Investment Group', '', 'Investment Group', 'https://example.com', 'VC', 'Demo daftar for testing', 'Global', 4, true, CURRENT_TIMESTAMP)
RETURNING id, name;

-- Link investors to their daftars
WITH daftar_data AS (
  SELECT id as daftar_id, name
  FROM "public"."daftar"
  WHERE name LIKE '%''s%'
  ORDER BY created_at DESC
  LIMIT 3
)
INSERT INTO "public"."daftar_investors" (
  "daftar_id",
  "investor_id",
  "status",
  "designation",
  "join_type",
  "join_date"
)
SELECT 
  d.daftar_id,
  u.id,
  'active',
  'Founder',
  'creator',
  CURRENT_TIMESTAMP
FROM daftar_data d
JOIN "public"."users" u ON 
  (u.first_name = 'Parv' AND d.name LIKE 'Parv''s%') OR
  (u.first_name = 'Rohit' AND d.name LIKE 'Rohit''s%') OR
  (u.first_name = 'Pratie' AND d.name LIKE 'Pratie''s%');

-- Create scouts under daftars
WITH daftar_info AS (
  SELECT d.id as daftar_id, d.name as daftar_name
  FROM "public"."daftar" d
  WHERE d.name LIKE '%''s%'
  ORDER BY d.created_at DESC
  LIMIT 3
)
INSERT INTO "public"."scouts" (
  "scout_id",
  "daftar_id",
  "scout_name",
  "scout_details",
  "scout_sector",
  "last_day_to_pitch",
  "program_launch_date",
  "status",
  "is_approved_by_all",
  "is_archived",
  "delete_is_agreed_by_all",
  "is_locked",
  "scout_created_at"
) 
SELECT
  'demo-scout-' || gen_random_uuid(),
  daftar_id,
  'Demo Scout - ' || REPLACE(REPLACE(daftar_name, '''s', ''), ' Fund', ''),
  'A demo scout program by ' || daftar_name,
  '[]',
  CURRENT_DATE + INTERVAL '30 days',
  CURRENT_DATE + INTERVAL '45 days',
  'Active',
  true,
  false,
  false,
  false,
  CURRENT_TIMESTAMP
FROM daftar_info
RETURNING scout_id, daftar_id;

-- Insert demo questions for each scout
WITH scout_ids AS (
  SELECT scout_id FROM scouts WHERE scout_name LIKE 'Demo Scout%'
)
INSERT INTO "public"."scout_questions" (
  "scout_id",
  "scout_question",
  "is_custom",
  "language"
)
SELECT 
  scout_id,
  question,
  true,
  'en'
FROM scout_ids
CROSS JOIN (
  VALUES 
    ('What problem does your startup solve?'),
    ('Who is your target audience?'),
    ('What is your business model?'),
    ('Who are your competitors?'),
    ('What is your go-to-market strategy?'),
    ('What is your current traction?'),
    ('How will you use the investment?')
) AS q(question);

-- Create pitches for founders and link them to Parv's scout (first created scout)
WITH first_scout AS (
  SELECT scout_id, daftar_id
  FROM scouts 
  WHERE scout_name LIKE 'Demo Scout - Parv'
  LIMIT 1
)
INSERT INTO "public"."pitch" (
  "id",
  "pitch_name",
  "location",
  "scout_id",
  "demo_link",
  "stage",
  "ask_for_investor",
  "status",
  "is_completed",
  "team_size",
  "is_paid",
  "is_locked",
  "investor_status",
  "created_at"
)
SELECT 
  'demo-pitch-' || gen_random_uuid(),
  CASE 
    WHEN u.first_name = 'prat' THEN 'Demo Pitch - Prat''s Startup'
    WHEN u.first_name = 'DaftarOS' THEN 'Demo Pitch - DaftarOS Project'
  END,
  'Global',
  s.scout_id,
  'https://example.com/demo',
  'Seed',
  'Looking for seed investment of $500,000',
  'Inbox',
  false,
  1,
  true,
  false,
  'Inbox',
  CURRENT_TIMESTAMP
FROM "public"."users" u
CROSS JOIN first_scout s
WHERE u.id IN (
  '40c7b7f3-3b22-4c3c-a6f4-a39577816309',  -- prat
  '517379ae-329b-4fff-aec8-e1710befacf7'   -- DaftarOS
)
RETURNING id, pitch_name;

-- Add founders to their pitch teams
WITH pitch_data AS (
  SELECT p.id as pitch_id, 
         CASE 
           WHEN p.pitch_name LIKE '%Prat%' THEN '40c7b7f3-3b22-4c3c-a6f4-a39577816309'
           WHEN p.pitch_name LIKE '%DaftarOS%' THEN '517379ae-329b-4fff-aec8-e1710befacf7'
         END as user_id
  FROM pitch p
  WHERE p.pitch_name LIKE 'Demo Pitch%'
)
INSERT INTO "public"."pitch_team" (
  "pitch_id",
  "user_id",
  "designation",
  "has_approved"
)
SELECT 
  pitch_id,
  user_id,
  'Founder',
  true
FROM pitch_data
WHERE user_id IS NOT NULL; 