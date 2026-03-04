INSERT INTO public.subjects (subject_name, section)
SELECT s.subject_name, sec.section
FROM (VALUES 
  ('LA Lab'), ('Physics Lab'), ('Physics Lab (Main)'), ('Physics Lab (Chemical)'),
  ('Data Structures Using C'), ('Elements of Electronics Engineering'),
  ('Mathematics-II'), ('Self Study / Library'), ('Physics'), ('DS Lab'),
  ('Data Structures Lab'), ('Digital Logic Design'), ('Swachh Bharat'),
  ('Linux Admn. Lab')
) AS s(subject_name)
CROSS JOIN (VALUES ('A9'), ('Women''s College')) AS sec(section)
ON CONFLICT (subject_name, section) DO NOTHING;