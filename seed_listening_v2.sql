-- ============================================================================
-- LingoPrep — Listening tests, version 2  (GENERATED: do not edit by hand)
-- Source: tools/listening-seed/  ·  rebuild with: node tools/listening-seed/build.mjs
--
-- Run once in the Supabase SQL editor. Safe to run again.
--
--   IELTS Listening     : 4 parts, 40 questions (10 per part), about 30 minutes
--                         (form, plan labelling, multiple choice, matching,
--                          flow chart and note completion)
--   TOEFL iBT Listening : January 2026 format, 47 items
--                         (Listen and Choose a Response, Listen to a
--                          Conversation, Listen to an Announcement,
--                          Listen to an Academic Talk)
--
-- It REPLACES every listening recording. Their questions and options are
-- removed with them; past results stay in session_logs.
-- ============================================================================

BEGIN;

DELETE FROM public.passages WHERE module = 'listening';


-- ── IELTS · Part 1: Volunteering at Riverside Library (10 questions) ──
INSERT INTO public.passages (id, title, content, module, audio_url, audio_duration_seconds, transcript, difficulty, exam_type) VALUES (
  'bb100001-0001-0001-0001-000000000001', 'Part 1: Volunteering at Riverside Library',
  'Kind: conversation
Setting: A phone call to a community library
Speakers: Hannah, a caller (f); Tom, the volunteer coordinator (m)
Photo: /media/listening/ielts-1-library.jpg | Rows of library bookshelves',
  'listening', '', 302,
  'Part 1. You will hear a woman called Hannah telephoning a community library to ask about volunteering. First you have some time to look at questions 1 to 6.
[pause 20]
Now listen carefully and answer questions 1 to 6.
Tom (m): Good morning, Riverside Community Library, Tom speaking. How can I help?
Hannah (f): Oh, hello. I saw a poster in the window saying you''re looking for volunteers, and I''d like to find out a bit more.
Tom (m): That''s great to hear. I''m the volunteer coordinator, so you''ve come to the right person. Would you mind if I took a few details first?
Hannah (f): Not at all.
Tom (m): Lovely. Can I start with your full name?
Hannah (f): It''s Hannah Whitfield.
Tom (m): Could you spell the surname for me?
Hannah (f): Yes, it''s W-H-I-T-F-I-E-L-D.
Tom (m): W-H-I-T-F-I-E-L-D. Thank you. And your address?
Hannah (f): It''s 47 Mill Lane. That''s here in Riverside.
Tom (m): 47 Mill Lane. And is there a phone number we can reach you on during the day?
Hannah (f): My mobile is best. It''s 07911 254683.
Tom (m): 07911 254683. Got that. Now, we like to know a little about our volunteers'' backgrounds. What do you do at the moment?
Hannah (f): I''m a nurse, actually, at the hospital on the other side of town. I used to be a teaching assistant, which is partly why the children''s activities appealed to me.
Tom (m): A nurse, right. That''s useful, because we always need someone with first aid knowledge around. And when would you be free to come in?
Hannah (f): Well, I work shifts, so it changes, but I''m always off on Tuesday mornings. I thought Thursday afternoons might work too, but I''ve just taken on an extra shift then.
Tom (m): Tuesday mornings would be perfect. That''s when we''re busiest with the under-fives. Is there a particular role you had in mind? We have people helping on the desk, shelving returned books, running the computer sessions for older residents, and helping with the homework club after school.
Hannah (f): I did wonder about the computer sessions, but I think the homework club would suit me best. I enjoy working with children.
Tom (m): The homework club it is. We''re especially short of helpers there, so that''s ideal.
Before you hear the rest of the conversation, you have some time to look at questions 7 to 10.
[pause 15]
Now listen and answer questions 7 to 10.
Hannah (f): Is there any training involved?
Tom (m): There is, yes. Every new volunteer attends one training session. It used to take a whole day, but we''ve condensed it, so it now lasts three hours. We cover safeguarding, the library computer system and what to do in an emergency.
Hannah (f): That sounds manageable. Where does it take place?
Tom (m): Here in the library. We have a meeting room on the first floor, just past the local history section. There''s a lift if you need it.
Hannah (f): Fine. And is there anything volunteers get in return? I''m not expecting to be paid, obviously.
Tom (m): No, it''s unpaid, but there are a few perks. You get a free parking permit for the council car park behind the building, which is renewed every year, and you can borrow up to twelve books at a time instead of the usual eight. We also hold a volunteers'' lunch in December.
Hannah (f): A parking permit would be really helpful. The hospital charges a fortune.
Tom (m): I thought it might be. So, what happens next is that I''ll put together a welcome pack for you, with the training dates and a short form to fill in, and I''ll send it to you by email. Could I have your email address?
Hannah (f): Of course. It''s hannah dot whitfield at mailbox dot com.
Tom (m): Perfect. You should have the welcome pack by tomorrow. Thanks so much for getting in touch, Hannah.
Hannah (f): Thank you. I''m looking forward to it.
That is the end of Part 1. You now have half a minute to check your answers.
[pause 15]',
  'easy', 'ielts'
);
INSERT INTO public.questions (id, passage_id, question_text, explanation, difficulty, sort_order, question_type, question_group_label, correct_answer_text, question_data) VALUES
  ('bb100001-e001-4000-8000-000000000001', 'bb100001-0001-0001-0001-000000000001', '', 'Hannah spells her surname: W-H-I-T-F-I-E-L-D.', 'easy', 1, 'note_completion', 'Questions 1–6: Form Completion', 'Whitfield', '{"instruction":"Complete the form below. Write NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.","max_words":2,"notes":[{"heading":"Riverside Community Library: Volunteer Application","items":["Name: Hannah __BLANK__","Address: __BLANK__ Mill Lane, Riverside","Mobile number: __BLANK__","Current job: __BLANK__","Available: __BLANK__ mornings","Preferred role: helping with the __BLANK__"]}]}'::jsonb),
  ('bb100001-e002-4000-8000-000000000002', 'bb100001-0001-0001-0001-000000000001', '', '''It''s 47 Mill Lane.''', 'easy', 2, 'note_completion', 'Questions 1–6: Form Completion', '47', '{"instruction":"Complete the form below. Write NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.","max_words":2,"notes":[{"heading":"Riverside Community Library: Volunteer Application","items":["Name: Hannah __BLANK__","Address: __BLANK__ Mill Lane, Riverside","Mobile number: __BLANK__","Current job: __BLANK__","Available: __BLANK__ mornings","Preferred role: helping with the __BLANK__"]}]}'::jsonb),
  ('bb100001-e003-4000-8000-000000000003', 'bb100001-0001-0001-0001-000000000001', '', '''My mobile is best. It''s 07911 254683.''', 'easy', 3, 'note_completion', 'Questions 1–6: Form Completion', '07911 254683|07911254683|07911 254 683', '{"instruction":"Complete the form below. Write NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.","max_words":2,"notes":[{"heading":"Riverside Community Library: Volunteer Application","items":["Name: Hannah __BLANK__","Address: __BLANK__ Mill Lane, Riverside","Mobile number: __BLANK__","Current job: __BLANK__","Available: __BLANK__ mornings","Preferred role: helping with the __BLANK__"]}]}'::jsonb),
  ('bb100001-e004-4000-8000-000000000004', 'bb100001-0001-0001-0001-000000000001', '', '''I''m a nurse, actually.'' She used to be a teaching assistant, which is a distractor.', 'easy', 4, 'note_completion', 'Questions 1–6: Form Completion', 'nurse', '{"instruction":"Complete the form below. Write NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.","max_words":2,"notes":[{"heading":"Riverside Community Library: Volunteer Application","items":["Name: Hannah __BLANK__","Address: __BLANK__ Mill Lane, Riverside","Mobile number: __BLANK__","Current job: __BLANK__","Available: __BLANK__ mornings","Preferred role: helping with the __BLANK__"]}]}'::jsonb),
  ('bb100001-e005-4000-8000-000000000005', 'bb100001-0001-0001-0001-000000000001', '', '''I''m always off on Tuesday mornings.'' Thursday afternoons are no longer possible.', 'easy', 5, 'note_completion', 'Questions 1–6: Form Completion', 'Tuesday', '{"instruction":"Complete the form below. Write NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.","max_words":2,"notes":[{"heading":"Riverside Community Library: Volunteer Application","items":["Name: Hannah __BLANK__","Address: __BLANK__ Mill Lane, Riverside","Mobile number: __BLANK__","Current job: __BLANK__","Available: __BLANK__ mornings","Preferred role: helping with the __BLANK__"]}]}'::jsonb),
  ('bb100001-e006-4000-8000-000000000006', 'bb100001-0001-0001-0001-000000000001', '', '''I think the homework club would suit me best.'' The computer sessions are rejected.', 'easy', 6, 'note_completion', 'Questions 1–6: Form Completion', 'homework club', '{"instruction":"Complete the form below. Write NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.","max_words":2,"notes":[{"heading":"Riverside Community Library: Volunteer Application","items":["Name: Hannah __BLANK__","Address: __BLANK__ Mill Lane, Riverside","Mobile number: __BLANK__","Current job: __BLANK__","Available: __BLANK__ mornings","Preferred role: helping with the __BLANK__"]}]}'::jsonb),
  ('bb100001-e007-4000-8000-000000000007', 'bb100001-0001-0001-0001-000000000001', 'The training session now lasts ___ hours.', '''It used to take a whole day, but we''ve condensed it, so it now lasts three hours.''', 'easy', 7, 'sentence_completion', 'Questions 7–10: Sentence Completion', '3|three', '{"instruction":"Complete the sentences below. Write NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.","max_words":2}'::jsonb),
  ('bb100001-e008-4000-8000-000000000008', 'bb100001-0001-0001-0001-000000000001', 'Training takes place in the ___ on the first floor.', '''We have a meeting room on the first floor, just past the local history section.''', 'easy', 8, 'sentence_completion', 'Questions 7–10: Sentence Completion', 'meeting room', '{"instruction":"Complete the sentences below. Write NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.","max_words":2}'::jsonb),
  ('bb100001-e009-4000-8000-000000000009', 'bb100001-0001-0001-0001-000000000001', 'Volunteers are given a free ___ every year.', '''You get a free parking permit for the council car park... which is renewed every year.''', 'easy', 9, 'sentence_completion', 'Questions 7–10: Sentence Completion', 'parking permit|car park permit', '{"instruction":"Complete the sentences below. Write NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.","max_words":2}'::jsonb),
  ('bb100001-e010-4000-8000-000000000010', 'bb100001-0001-0001-0001-000000000001', 'Tom will email Hannah a ___.', '''I''ll put together a welcome pack for you... and I''ll send it to you by email.''', 'easy', 10, 'sentence_completion', 'Questions 7–10: Sentence Completion', 'welcome pack', '{"instruction":"Complete the sentences below. Write NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.","max_words":2}'::jsonb);

-- ── IELTS · Part 2: Welcome to the Harbourside Maritime Museum (10 questions) ──
INSERT INTO public.passages (id, title, content, module, audio_url, audio_duration_seconds, transcript, difficulty, exam_type) VALUES (
  'bb100002-0002-0002-0002-000000000002', 'Part 2: Welcome to the Harbourside Maritime Museum',
  'Kind: monologue
Setting: A guide welcoming a group of visitors
Speakers: Museum guide (f)
Photo: /media/listening/ielts-2-museum.jpg | Museum gallery wall of framed paintings',
  'listening', '', 306,
  'Part 2. You will hear a guide welcoming a group of visitors to a maritime museum. First you have some time to look at questions 11 to 15.
[pause 20]
Now listen carefully and answer questions 11 to 15.
Guide (f): Good morning, everyone, and welcome to the Harbourside Maritime Museum. My name''s Claire and I''ll be looking after you today. Before we start the tour, let me explain the layout of the building, because it''s easy to lose your way in here.
Guide (f): We''re standing just inside the main entrance, and directly in front of you is the information desk, where you can collect a free map. Beyond the desk is the main hall, which runs right through the middle of the building, and the staircase to the upper floor is at the far end of the hall.
Guide (f): Now, if you turn to your left as you come in, the first door you reach, in the front corner, is the café. It serves hot food until three o''clock and drinks and cakes until we close. Next to the café, further along the left-hand side of the hall, you''ll find the gift shop. It used to be at the back of the building, near the stairs, but we moved it last year so that it''s easier to find on your way out.
Guide (f): On the right-hand side of the hall, the first room you come to, in the front corner opposite the café, is the toilets, and beyond those, halfway along the right-hand side, is the lecture theatre, where there''s a short film about the history of the harbour every hour. Then at the far end on the right, just before the stairs, is the children''s discovery room, with model boats to sail and costumes to try on. It''s very popular, so you may have to wait at busy times.
Guide (f): Our permanent galleries are all upstairs. Downstairs, in the back corner on the left, opposite the children''s room, is the temporary exhibition gallery. This month it''s showing photographs of the fishing fleet in the nineteen fifties. Finally, right at the back of the hall, between the discovery room and the exhibition gallery, is the staircase I mentioned, and there''s a lift beside it.
Before you hear the rest of the talk, you have some time to look at questions 16 to 20.
[pause 15]
Now listen and answer questions 16 to 20.
Guide (f): A few practical points before we set off. The museum is open from ten until five every day except Monday, when we''re closed for cleaning. During the summer holidays we stay open an hour later, until six.
Guide (f): Your ticket is valid for the whole day, so you''re welcome to go out for lunch and come back in. Just keep the ticket with you, because you''ll be asked to show it at the desk. Unfortunately it can''t be used again on another day, even if you haven''t seen everything.
Guide (f): This afternoon, at two o''clock, there''s a special event in the lecture theatre. We''d planned a talk by a retired lighthouse keeper, but he''s unwell, so instead one of our curators will be demonstrating how sailors tied the knots you''ll see in the rope gallery. There''s no need to book; just turn up a few minutes early.
Guide (f): You''re welcome to take photographs anywhere in the museum, including the temporary exhibition, but please don''t use a flash, as it damages the older paintings and textiles. Video recording is only allowed in the children''s room.
Guide (f): Lastly, large bags and rucksacks aren''t permitted in the galleries. There are free lockers next to the information desk. You''ll need a one-pound coin to operate them, but you get the coin back when you open the locker again. Right, if everyone''s ready, let''s begin with the main hall.
That is the end of Part 2. You now have half a minute to check your answers.
[pause 15]',
  'medium', 'ielts'
);
INSERT INTO public.questions (id, passage_id, question_text, explanation, difficulty, sort_order, question_type, question_group_label, correct_answer_text, question_data) VALUES
  ('bb100002-e011-4000-8000-000000000011', 'bb100002-0002-0002-0002-000000000002', 'Café', '''If you turn to your left as you come in, the first door you reach, in the front corner, is the café.''', 'medium', 11, 'diagram_label', 'Questions 11–15: Plan Labelling', 'A', '{"instruction":"Label the plan below. Write the correct letter, A–H, next to questions 11–15.","diagram":"museum-plan","diagram_title":"Harbourside Maritime Museum: ground floor","choices":["A","B","C","D","E","F","G","H"]}'::jsonb),
  ('bb100002-e012-4000-8000-000000000012', 'bb100002-0002-0002-0002-000000000002', 'Gift shop', '''Next to the café, further along the left-hand side of the hall, you''ll find the gift shop.''', 'medium', 12, 'diagram_label', 'Questions 11–15: Plan Labelling', 'B', '{"instruction":"Label the plan below. Write the correct letter, A–H, next to questions 11–15.","diagram":"museum-plan","diagram_title":"Harbourside Maritime Museum: ground floor","choices":["A","B","C","D","E","F","G","H"]}'::jsonb),
  ('bb100002-e013-4000-8000-000000000013', 'bb100002-0002-0002-0002-000000000002', 'Lecture theatre', '''Beyond those (the toilets), halfway along the right-hand side, is the lecture theatre.''', 'medium', 13, 'diagram_label', 'Questions 11–15: Plan Labelling', 'F', '{"instruction":"Label the plan below. Write the correct letter, A–H, next to questions 11–15.","diagram":"museum-plan","diagram_title":"Harbourside Maritime Museum: ground floor","choices":["A","B","C","D","E","F","G","H"]}'::jsonb),
  ('bb100002-e014-4000-8000-000000000014', 'bb100002-0002-0002-0002-000000000002', 'Children''s discovery room', '''At the far end on the right, just before the stairs, is the children''s discovery room.''', 'medium', 14, 'diagram_label', 'Questions 11–15: Plan Labelling', 'G', '{"instruction":"Label the plan below. Write the correct letter, A–H, next to questions 11–15.","diagram":"museum-plan","diagram_title":"Harbourside Maritime Museum: ground floor","choices":["A","B","C","D","E","F","G","H"]}'::jsonb),
  ('bb100002-e015-4000-8000-000000000015', 'bb100002-0002-0002-0002-000000000002', 'Temporary exhibition gallery', '''In the back corner on the left, opposite the children''s room, is the temporary exhibition gallery.''', 'medium', 15, 'diagram_label', 'Questions 11–15: Plan Labelling', 'C', '{"instruction":"Label the plan below. Write the correct letter, A–H, next to questions 11–15.","diagram":"museum-plan","diagram_title":"Harbourside Maritime Museum: ground floor","choices":["A","B","C","D","E","F","G","H"]}'::jsonb),
  ('bb100002-e016-4000-8000-000000000016', 'bb100002-0002-0002-0002-000000000002', 'On which day is the museum closed?', '''Every day except Monday, when we''re closed for cleaning.''', 'medium', 16, 'multiple_choice', 'Questions 16–20: Multiple Choice', '', '{"instruction":"Choose the correct letter, A, B or C."}'::jsonb),
  ('bb100002-e017-4000-8000-000000000017', 'bb100002-0002-0002-0002-000000000002', 'What does the guide say about tickets?', '''Just keep the ticket with you, because you''ll be asked to show it at the desk.''', 'medium', 17, 'multiple_choice', 'Questions 16–20: Multiple Choice', '', '{"instruction":"Choose the correct letter, A, B or C."}'::jsonb),
  ('bb100002-e018-4000-8000-000000000018', 'bb100002-0002-0002-0002-000000000002', 'What will happen in the lecture theatre at two o''clock?', 'The lighthouse keeper is unwell, so a curator will demonstrate knots instead.', 'medium', 18, 'multiple_choice', 'Questions 16–20: Multiple Choice', '', '{"instruction":"Choose the correct letter, A, B or C."}'::jsonb),
  ('bb100002-e019-4000-8000-000000000019', 'bb100002-0002-0002-0002-000000000002', 'Visitors must not', '''Please don''t use a flash, as it damages the older paintings and textiles.''', 'medium', 19, 'multiple_choice', 'Questions 16–20: Multiple Choice', '', '{"instruction":"Choose the correct letter, A, B or C."}'::jsonb),
  ('bb100002-e020-4000-8000-000000000020', 'bb100002-0002-0002-0002-000000000002', 'To use a locker, visitors need', '''You''ll need a one-pound coin to operate them, but you get the coin back.''', 'medium', 20, 'multiple_choice', 'Questions 16–20: Multiple Choice', '', '{"instruction":"Choose the correct letter, A, B or C."}'::jsonb);
INSERT INTO public.options (question_id, option_label, option_text, is_correct, sort_order) VALUES
  ('bb100002-e016-4000-8000-000000000016', 'A', 'Sunday', false, 1),
  ('bb100002-e016-4000-8000-000000000016', 'B', 'Monday', true, 2),
  ('bb100002-e016-4000-8000-000000000016', 'C', 'Saturday', false, 3),
  ('bb100002-e017-4000-8000-000000000017', 'A', 'They can be used again the following day.', false, 1),
  ('bb100002-e017-4000-8000-000000000017', 'B', 'They must be shown when re-entering the museum.', true, 2),
  ('bb100002-e017-4000-8000-000000000017', 'C', 'They include a free map of the building.', false, 3),
  ('bb100002-e018-4000-8000-000000000018', 'A', 'a talk by a lighthouse keeper', false, 1),
  ('bb100002-e018-4000-8000-000000000018', 'B', 'a film about the harbour', false, 2),
  ('bb100002-e018-4000-8000-000000000018', 'C', 'a demonstration of knots', true, 3),
  ('bb100002-e019-4000-8000-000000000019', 'A', 'photograph the temporary exhibition.', false, 1),
  ('bb100002-e019-4000-8000-000000000019', 'B', 'use flash photography.', true, 2),
  ('bb100002-e019-4000-8000-000000000019', 'C', 'film in the children''s room.', false, 3),
  ('bb100002-e020-4000-8000-000000000020', 'A', 'a one-pound coin.', true, 1),
  ('bb100002-e020-4000-8000-000000000020', 'B', 'to ask at the information desk.', false, 2),
  ('bb100002-e020-4000-8000-000000000020', 'C', 'to leave their ticket.', false, 3);

-- ── IELTS · Part 3: Planning a research project on bike sharing (10 questions) ──
INSERT INTO public.passages (id, title, content, module, audio_url, audio_duration_seconds, transcript, difficulty, exam_type) VALUES (
  'bb100003-0003-0003-0003-000000000003', 'Part 3: Planning a research project on bike sharing',
  'Kind: conversation
Setting: A tutorial about a group research project
Speakers: Priya, a student (f); Daniel, a student (m); Dr Lee, their tutor (m)
Photo: /media/listening/ielts-3-research.jpg | Students discussing a project at their laptops',
  'listening', '', 286,
  'Part 3. You will hear two geography students, Priya and Daniel, discussing their research project with their tutor, Dr Lee. First you have some time to look at questions 21 to 25.
[pause 20]
Now listen carefully and answer questions 21 to 25.
Dr Lee (m): So, Priya, Daniel, you''ve decided to look at the new campus bike-share scheme. Have you worked out who''s doing what?
Priya (f): More or less. We thought we''d start with a questionnaire for students who''ve used the bikes. I''ve done one before, for my first-year methods module, so I''ll design that.
Daniel (m): And I was going to help with it, but honestly Priya''s much better at wording questions than I am, so I''ll leave it to her.
Dr Lee (m): Fine. You''ll also need the company''s own figures. They track every journey through the app.
Daniel (m): That''s my job. I''ve already found the name of their operations manager, so I''ll contact the bike company this week and ask whether they''ll share the data.
Priya (f): And then somebody has to make sense of all those numbers once we get them.
Daniel (m): I assumed that would be me too, since I''d have the contact.
Dr Lee (m): Actually, I''d suggest Priya takes the usage statistics. She''s done the statistics module, and you''ll be busy with the interviews, Daniel.
Daniel (m): Fair enough. Priya analyses the statistics, then.
Priya (f): Speaking of the interviews, we''ll need somewhere quiet to hold them. Could you book one of the rooms in the department for us, Dr Lee? Students can''t do it online.
Dr Lee (m): I could, but it''s quicker if you ask Mrs Hart in the office. Daniel, since you''re running the interviews, you book the interview room.
Daniel (m): Will do.
Priya (f): There''s also the ethics form. We filled it in last night, but I''m not sure we''ve described the interviews properly.
Dr Lee (m): Send it to me. Checking the ethics form is something I have to sign off anyway, so I''ll go through it before you submit it.
Priya (f): Thanks, that''s a relief.
Before you hear the rest of the conversation, you have some time to look at questions 26 to 30.
[pause 15]
Now listen and answer questions 26 to 30.
Dr Lee (m): Let''s go through the stages, so you have a timetable. What comes first?
Priya (f): The questionnaire. But before we send it to everyone, we want to try it out on a small group. We''ll run a pilot survey with about twenty first-year students, because they''re the ones who use the bikes most.
Dr Lee (m): Good. And when the questionnaire is final?
Daniel (m): By then the company should have replied, so the next stage is collecting the usage data. We''re hoping for a full term''s journeys, with times and distances.
Dr Lee (m): Then the interviews.
Daniel (m): Yes. We did think about interviewing other students, but we''ve decided on staff instead, because nobody has asked them about the scheme and quite a few of them cycle in.
Priya (f): Ten staff interviews, we thought, about twenty minutes each.
Dr Lee (m): Sensible. After that you write a draft report. Who''s going to read that?
Priya (f): We''d like you to, of course, but we''ve also arranged for the draft to be reviewed by the council''s transport officer, since they fund part of the scheme and know what questions they want answered.
Dr Lee (m): Excellent. That''s exactly the kind of contact that strengthens a project. And at the end?
Daniel (m): The department wants a final presentation at the research fair in May, rather than a written report. We''ll have fifteen minutes and then questions.
Dr Lee (m): Then work backwards from May and you have your timetable. Well done, both of you.
That is the end of Part 3. You now have half a minute to check your answers.
[pause 15]',
  'medium', 'ielts'
);
INSERT INTO public.questions (id, passage_id, question_text, explanation, difficulty, sort_order, question_type, question_group_label, correct_answer_text, question_data) VALUES
  ('bb100003-e021-4000-8000-000000000021', 'bb100003-0003-0003-0003-000000000003', 'design the questionnaire', '''I''ve done one before... so I''ll design that,'' says Priya, and Daniel agrees to leave it to her.', 'medium', 21, 'matching_features', 'Questions 21–25: Matching', 'A', '{"instruction":"Who will do each of the following tasks? Choose the correct answer for each task. You may choose any letter more than once.","list_title":"People","features":[{"label":"A","text":"Priya"},{"label":"B","text":"Daniel"},{"label":"C","text":"Dr Lee"}]}'::jsonb),
  ('bb100003-e022-4000-8000-000000000022', 'bb100003-0003-0003-0003-000000000003', 'contact the bike company', '''That''s my job... I''ll contact the bike company this week,'' says Daniel.', 'medium', 22, 'matching_features', 'Questions 21–25: Matching', 'B', '{"instruction":"Who will do each of the following tasks? Choose the correct answer for each task. You may choose any letter more than once.","list_title":"People","features":[{"label":"A","text":"Priya"},{"label":"B","text":"Daniel"},{"label":"C","text":"Dr Lee"}]}'::jsonb),
  ('bb100003-e023-4000-8000-000000000023', 'bb100003-0003-0003-0003-000000000003', 'analyse the usage statistics', 'Dr Lee suggests Priya takes the statistics, and Daniel agrees.', 'medium', 23, 'matching_features', 'Questions 21–25: Matching', 'A', '{"instruction":"Who will do each of the following tasks? Choose the correct answer for each task. You may choose any letter more than once.","list_title":"People","features":[{"label":"A","text":"Priya"},{"label":"B","text":"Daniel"},{"label":"C","text":"Dr Lee"}]}'::jsonb),
  ('bb100003-e024-4000-8000-000000000024', 'bb100003-0003-0003-0003-000000000003', 'book the interview room', '''Daniel, since you''re running the interviews, you book the interview room.''', 'medium', 24, 'matching_features', 'Questions 21–25: Matching', 'B', '{"instruction":"Who will do each of the following tasks? Choose the correct answer for each task. You may choose any letter more than once.","list_title":"People","features":[{"label":"A","text":"Priya"},{"label":"B","text":"Daniel"},{"label":"C","text":"Dr Lee"}]}'::jsonb),
  ('bb100003-e025-4000-8000-000000000025', 'bb100003-0003-0003-0003-000000000003', 'check the ethics form', '''Checking the ethics form is something I have to sign off anyway, so I''ll go through it,'' says Dr Lee.', 'medium', 25, 'matching_features', 'Questions 21–25: Matching', 'C', '{"instruction":"Who will do each of the following tasks? Choose the correct answer for each task. You may choose any letter more than once.","list_title":"People","features":[{"label":"A","text":"Priya"},{"label":"B","text":"Daniel"},{"label":"C","text":"Dr Lee"}]}'::jsonb),
  ('bb100003-e026-4000-8000-000000000026', 'bb100003-0003-0003-0003-000000000003', '', '''We''ll run a pilot survey with about twenty first-year students.''', 'medium', 26, 'flowchart_completion', 'Questions 26–30: Flow-chart Completion', 'first-year|first year', '{"instruction":"Complete the flow chart below. Write NO MORE THAN TWO WORDS for each answer.","flowchart_title":"Stages of the project","max_words":2,"nodes":[{"text":"Pilot survey with a small group of __BLANK__ students"},{"text":"Collect a term''s __BLANK__ from the bike company"},{"text":"Ten interviews with __BLANK__"},{"text":"Draft report reviewed by the council''s __BLANK__"},{"text":"Final __BLANK__ at the research fair in May"}]}'::jsonb),
  ('bb100003-e027-4000-8000-000000000027', 'bb100003-0003-0003-0003-000000000003', '', '''The next stage is collecting the usage data.''', 'medium', 27, 'flowchart_completion', 'Questions 26–30: Flow-chart Completion', 'usage data', '{"instruction":"Complete the flow chart below. Write NO MORE THAN TWO WORDS for each answer.","flowchart_title":"Stages of the project","max_words":2,"nodes":[{"text":"Pilot survey with a small group of __BLANK__ students"},{"text":"Collect a term''s __BLANK__ from the bike company"},{"text":"Ten interviews with __BLANK__"},{"text":"Draft report reviewed by the council''s __BLANK__"},{"text":"Final __BLANK__ at the research fair in May"}]}'::jsonb),
  ('bb100003-e028-4000-8000-000000000028', 'bb100003-0003-0003-0003-000000000003', '', '''We''ve decided on staff instead.'' Other students are rejected.', 'medium', 28, 'flowchart_completion', 'Questions 26–30: Flow-chart Completion', 'staff', '{"instruction":"Complete the flow chart below. Write NO MORE THAN TWO WORDS for each answer.","flowchart_title":"Stages of the project","max_words":2,"nodes":[{"text":"Pilot survey with a small group of __BLANK__ students"},{"text":"Collect a term''s __BLANK__ from the bike company"},{"text":"Ten interviews with __BLANK__"},{"text":"Draft report reviewed by the council''s __BLANK__"},{"text":"Final __BLANK__ at the research fair in May"}]}'::jsonb),
  ('bb100003-e029-4000-8000-000000000029', 'bb100003-0003-0003-0003-000000000003', '', '''The draft to be reviewed by the council''s transport officer.''', 'medium', 29, 'flowchart_completion', 'Questions 26–30: Flow-chart Completion', 'transport officer', '{"instruction":"Complete the flow chart below. Write NO MORE THAN TWO WORDS for each answer.","flowchart_title":"Stages of the project","max_words":2,"nodes":[{"text":"Pilot survey with a small group of __BLANK__ students"},{"text":"Collect a term''s __BLANK__ from the bike company"},{"text":"Ten interviews with __BLANK__"},{"text":"Draft report reviewed by the council''s __BLANK__"},{"text":"Final __BLANK__ at the research fair in May"}]}'::jsonb),
  ('bb100003-e030-4000-8000-000000000030', 'bb100003-0003-0003-0003-000000000003', '', '''The department wants a final presentation at the research fair in May, rather than a written report.''', 'medium', 30, 'flowchart_completion', 'Questions 26–30: Flow-chart Completion', 'presentation', '{"instruction":"Complete the flow chart below. Write NO MORE THAN TWO WORDS for each answer.","flowchart_title":"Stages of the project","max_words":2,"nodes":[{"text":"Pilot survey with a small group of __BLANK__ students"},{"text":"Collect a term''s __BLANK__ from the bike company"},{"text":"Ten interviews with __BLANK__"},{"text":"Draft report reviewed by the council''s __BLANK__"},{"text":"Final __BLANK__ at the research fair in May"}]}'::jsonb);

-- ── IELTS · Part 4: Seagrass meadows (10 questions) ──
INSERT INTO public.passages (id, title, content, module, audio_url, audio_duration_seconds, transcript, difficulty, exam_type) VALUES (
  'bb100004-0004-0004-0004-000000000004', 'Part 4: Seagrass meadows',
  'Kind: lecture
Setting: A university lecture in marine biology
Speakers: Lecturer (m)
Photo: /media/listening/ielts-4-ocean.jpg | Aerial view of ocean waves meeting the shore',
  'listening', '', 254,
  'Part 4. You will hear a lecturer talking about seagrass meadows. First you have some time to look at questions 31 to 40.
[pause 30]
Now listen carefully and answer questions 31 to 40.
Lecturer (m): Good afternoon. Today I want to talk about a habitat that most people have never heard of, even though it may be one of the most valuable on the planet: the seagrass meadow.
Lecturer (m): Let''s begin with what seagrasses are, because they''re often confused with seaweed. Seaweeds are algae. Seagrasses, on the other hand, are flowering plants. They have leaves, stems and roots, they produce seeds, and their ancestors lived on land before moving back into the sea around a hundred million years ago. There are about seventy species, and they grow in shallow, sheltered coastal water on every continent except Antarctica, where the ice and the cold winters make it impossible for them to survive.
Lecturer (m): So why should we care about a few underwater fields of grass? The first reason is carbon. Seagrass meadows cover less than a fifth of one per cent of the ocean floor, yet they''re responsible for around ten per cent of the carbon the ocean buries each year. Studies suggest that they can absorb carbon up to thirty-five times faster than tropical forests, and because the carbon ends up locked in the seabed, it can stay there for thousands of years.
Lecturer (m): The second benefit is physical. Seagrasses have a dense network of roots, and these roots hold the seabed in place. Where meadows are healthy, the shoreline is protected from storms, and far less sand is washed away. Thirdly, the meadows are a nursery. Young fish, including many species that we catch commercially, spend the first months of their lives hiding among the leaves, where larger predators can''t reach them. And finally, the leaves slow the movement of the water, so that sediment that would otherwise cloud the sea sinks to the bottom and is trapped. That''s why the water above a seagrass meadow is often strikingly clear.
Lecturer (m): Unfortunately, we''re losing these meadows at an alarming rate: around seven per cent a year worldwide, according to the most recent survey. The causes are mostly local. Fertiliser washed off farms into rivers and then into the sea causes algae to grow so thickly that it blocks the sunlight the grass needs. Boats do damage too. It''s not so much the hulls as the anchors, which tear up the roots when they''re dropped and dragged, leaving bare scars that can take decades to recover. And over all of this sits climate change. Seagrasses are sensitive to heat, and rising sea temperatures have already wiped out meadows in parts of Australia and the Mediterranean.
Lecturer (m): The good news is that restoration works, and it''s surprisingly low-tech. In one project on the south coast of England, volunteers collect seeds in the summer, and in the autumn they pack them into small hessian bags, which are dropped onto the seabed from boats. The bags rot away within a few months, leaving the seeds to germinate in place. In the first three years, more than a million seeds were planted in this way. Next week we''ll look at how the success of projects like this one is measured, and at why some replanted meadows fail.
That is the end of Part 4. You now have two minutes to check your answers.',
  'hard', 'ielts'
);
INSERT INTO public.questions (id, passage_id, question_text, explanation, difficulty, sort_order, question_type, question_group_label, correct_answer_text, question_data) VALUES
  ('bb100004-e031-4000-8000-000000000031', 'bb100004-0004-0004-0004-000000000004', '', '''Seagrasses, on the other hand, are flowering plants.''', 'hard', 31, 'note_completion', 'Questions 31–40: Note Completion', 'plants', '{"instruction":"Complete the notes below. Write ONE WORD ONLY for each answer.","max_words":1,"notes":[{"heading":"Seagrass meadows","items":["Seagrasses are flowering __BLANK__, not seaweeds (which are algae)","Found in shallow coastal water on every continent except __BLANK__"]},{"heading":"Benefits","items":["Absorb carbon up to 35 times faster than tropical __BLANK__","Their __BLANK__ hold the seabed in place and protect the shoreline","A nursery for young __BLANK__","Trap __BLANK__, so the water stays clear"]},{"heading":"Threats","items":["Fertiliser from farms causes __BLANK__ to block the light","Boat __BLANK__ tear up the roots","Rising sea __BLANK__"]},{"heading":"Restoration","items":["Volunteers pack seeds into __BLANK__ bags and drop them onto the seabed"]}]}'::jsonb),
  ('bb100004-e032-4000-8000-000000000032', 'bb100004-0004-0004-0004-000000000004', '', '''On every continent except Antarctica.''', 'hard', 32, 'note_completion', 'Questions 31–40: Note Completion', 'Antarctica', '{"instruction":"Complete the notes below. Write ONE WORD ONLY for each answer.","max_words":1,"notes":[{"heading":"Seagrass meadows","items":["Seagrasses are flowering __BLANK__, not seaweeds (which are algae)","Found in shallow coastal water on every continent except __BLANK__"]},{"heading":"Benefits","items":["Absorb carbon up to 35 times faster than tropical __BLANK__","Their __BLANK__ hold the seabed in place and protect the shoreline","A nursery for young __BLANK__","Trap __BLANK__, so the water stays clear"]},{"heading":"Threats","items":["Fertiliser from farms causes __BLANK__ to block the light","Boat __BLANK__ tear up the roots","Rising sea __BLANK__"]},{"heading":"Restoration","items":["Volunteers pack seeds into __BLANK__ bags and drop them onto the seabed"]}]}'::jsonb),
  ('bb100004-e033-4000-8000-000000000033', 'bb100004-0004-0004-0004-000000000004', '', '''Absorb carbon up to thirty-five times faster than tropical forests.''', 'hard', 33, 'note_completion', 'Questions 31–40: Note Completion', 'forests', '{"instruction":"Complete the notes below. Write ONE WORD ONLY for each answer.","max_words":1,"notes":[{"heading":"Seagrass meadows","items":["Seagrasses are flowering __BLANK__, not seaweeds (which are algae)","Found in shallow coastal water on every continent except __BLANK__"]},{"heading":"Benefits","items":["Absorb carbon up to 35 times faster than tropical __BLANK__","Their __BLANK__ hold the seabed in place and protect the shoreline","A nursery for young __BLANK__","Trap __BLANK__, so the water stays clear"]},{"heading":"Threats","items":["Fertiliser from farms causes __BLANK__ to block the light","Boat __BLANK__ tear up the roots","Rising sea __BLANK__"]},{"heading":"Restoration","items":["Volunteers pack seeds into __BLANK__ bags and drop them onto the seabed"]}]}'::jsonb),
  ('bb100004-e034-4000-8000-000000000034', 'bb100004-0004-0004-0004-000000000004', '', '''Seagrasses have a dense network of roots, and these roots hold the seabed in place.''', 'hard', 34, 'note_completion', 'Questions 31–40: Note Completion', 'roots', '{"instruction":"Complete the notes below. Write ONE WORD ONLY for each answer.","max_words":1,"notes":[{"heading":"Seagrass meadows","items":["Seagrasses are flowering __BLANK__, not seaweeds (which are algae)","Found in shallow coastal water on every continent except __BLANK__"]},{"heading":"Benefits","items":["Absorb carbon up to 35 times faster than tropical __BLANK__","Their __BLANK__ hold the seabed in place and protect the shoreline","A nursery for young __BLANK__","Trap __BLANK__, so the water stays clear"]},{"heading":"Threats","items":["Fertiliser from farms causes __BLANK__ to block the light","Boat __BLANK__ tear up the roots","Rising sea __BLANK__"]},{"heading":"Restoration","items":["Volunteers pack seeds into __BLANK__ bags and drop them onto the seabed"]}]}'::jsonb),
  ('bb100004-e035-4000-8000-000000000035', 'bb100004-0004-0004-0004-000000000004', '', '''Young fish... spend the first months of their lives hiding among the leaves.''', 'hard', 35, 'note_completion', 'Questions 31–40: Note Completion', 'fish', '{"instruction":"Complete the notes below. Write ONE WORD ONLY for each answer.","max_words":1,"notes":[{"heading":"Seagrass meadows","items":["Seagrasses are flowering __BLANK__, not seaweeds (which are algae)","Found in shallow coastal water on every continent except __BLANK__"]},{"heading":"Benefits","items":["Absorb carbon up to 35 times faster than tropical __BLANK__","Their __BLANK__ hold the seabed in place and protect the shoreline","A nursery for young __BLANK__","Trap __BLANK__, so the water stays clear"]},{"heading":"Threats","items":["Fertiliser from farms causes __BLANK__ to block the light","Boat __BLANK__ tear up the roots","Rising sea __BLANK__"]},{"heading":"Restoration","items":["Volunteers pack seeds into __BLANK__ bags and drop them onto the seabed"]}]}'::jsonb),
  ('bb100004-e036-4000-8000-000000000036', 'bb100004-0004-0004-0004-000000000004', '', '''Sediment that would otherwise cloud the sea sinks to the bottom and is trapped.''', 'hard', 36, 'note_completion', 'Questions 31–40: Note Completion', 'sediment', '{"instruction":"Complete the notes below. Write ONE WORD ONLY for each answer.","max_words":1,"notes":[{"heading":"Seagrass meadows","items":["Seagrasses are flowering __BLANK__, not seaweeds (which are algae)","Found in shallow coastal water on every continent except __BLANK__"]},{"heading":"Benefits","items":["Absorb carbon up to 35 times faster than tropical __BLANK__","Their __BLANK__ hold the seabed in place and protect the shoreline","A nursery for young __BLANK__","Trap __BLANK__, so the water stays clear"]},{"heading":"Threats","items":["Fertiliser from farms causes __BLANK__ to block the light","Boat __BLANK__ tear up the roots","Rising sea __BLANK__"]},{"heading":"Restoration","items":["Volunteers pack seeds into __BLANK__ bags and drop them onto the seabed"]}]}'::jsonb),
  ('bb100004-e037-4000-8000-000000000037', 'bb100004-0004-0004-0004-000000000004', '', '''Fertiliser... causes algae to grow so thickly that it blocks the sunlight.''', 'hard', 37, 'note_completion', 'Questions 31–40: Note Completion', 'algae', '{"instruction":"Complete the notes below. Write ONE WORD ONLY for each answer.","max_words":1,"notes":[{"heading":"Seagrass meadows","items":["Seagrasses are flowering __BLANK__, not seaweeds (which are algae)","Found in shallow coastal water on every continent except __BLANK__"]},{"heading":"Benefits","items":["Absorb carbon up to 35 times faster than tropical __BLANK__","Their __BLANK__ hold the seabed in place and protect the shoreline","A nursery for young __BLANK__","Trap __BLANK__, so the water stays clear"]},{"heading":"Threats","items":["Fertiliser from farms causes __BLANK__ to block the light","Boat __BLANK__ tear up the roots","Rising sea __BLANK__"]},{"heading":"Restoration","items":["Volunteers pack seeds into __BLANK__ bags and drop them onto the seabed"]}]}'::jsonb),
  ('bb100004-e038-4000-8000-000000000038', 'bb100004-0004-0004-0004-000000000004', '', '''It''s not so much the hulls as the anchors, which tear up the roots.''', 'hard', 38, 'note_completion', 'Questions 31–40: Note Completion', 'anchors', '{"instruction":"Complete the notes below. Write ONE WORD ONLY for each answer.","max_words":1,"notes":[{"heading":"Seagrass meadows","items":["Seagrasses are flowering __BLANK__, not seaweeds (which are algae)","Found in shallow coastal water on every continent except __BLANK__"]},{"heading":"Benefits","items":["Absorb carbon up to 35 times faster than tropical __BLANK__","Their __BLANK__ hold the seabed in place and protect the shoreline","A nursery for young __BLANK__","Trap __BLANK__, so the water stays clear"]},{"heading":"Threats","items":["Fertiliser from farms causes __BLANK__ to block the light","Boat __BLANK__ tear up the roots","Rising sea __BLANK__"]},{"heading":"Restoration","items":["Volunteers pack seeds into __BLANK__ bags and drop them onto the seabed"]}]}'::jsonb),
  ('bb100004-e039-4000-8000-000000000039', 'bb100004-0004-0004-0004-000000000004', '', '''Rising sea temperatures have already wiped out meadows.''', 'hard', 39, 'note_completion', 'Questions 31–40: Note Completion', 'temperatures', '{"instruction":"Complete the notes below. Write ONE WORD ONLY for each answer.","max_words":1,"notes":[{"heading":"Seagrass meadows","items":["Seagrasses are flowering __BLANK__, not seaweeds (which are algae)","Found in shallow coastal water on every continent except __BLANK__"]},{"heading":"Benefits","items":["Absorb carbon up to 35 times faster than tropical __BLANK__","Their __BLANK__ hold the seabed in place and protect the shoreline","A nursery for young __BLANK__","Trap __BLANK__, so the water stays clear"]},{"heading":"Threats","items":["Fertiliser from farms causes __BLANK__ to block the light","Boat __BLANK__ tear up the roots","Rising sea __BLANK__"]},{"heading":"Restoration","items":["Volunteers pack seeds into __BLANK__ bags and drop them onto the seabed"]}]}'::jsonb),
  ('bb100004-e040-4000-8000-000000000040', 'bb100004-0004-0004-0004-000000000004', '', '''They pack them into small hessian bags, which are dropped onto the seabed.''', 'hard', 40, 'note_completion', 'Questions 31–40: Note Completion', 'hessian', '{"instruction":"Complete the notes below. Write ONE WORD ONLY for each answer.","max_words":1,"notes":[{"heading":"Seagrass meadows","items":["Seagrasses are flowering __BLANK__, not seaweeds (which are algae)","Found in shallow coastal water on every continent except __BLANK__"]},{"heading":"Benefits","items":["Absorb carbon up to 35 times faster than tropical __BLANK__","Their __BLANK__ hold the seabed in place and protect the shoreline","A nursery for young __BLANK__","Trap __BLANK__, so the water stays clear"]},{"heading":"Threats","items":["Fertiliser from farms causes __BLANK__ to block the light","Boat __BLANK__ tear up the roots","Rising sea __BLANK__"]},{"heading":"Restoration","items":["Volunteers pack seeds into __BLANK__ bags and drop them onto the seabed"]}]}'::jsonb);

-- ── TOEFL · Choose a Response 1 (1 questions) ──
INSERT INTO public.passages (id, title, content, module, audio_url, audio_duration_seconds, transcript, difficulty, exam_type) VALUES (
  'cc100001-0001-0001-0001-000000000001', 'Choose a Response 1',
  'Kind: response
Setting: Outside a lecture hall
Speakers: Student (f)',
  'listening', '', 6,
  'Student (f): Excuse me, do you know if this is the room for the chemistry lecture?',
  'easy', 'toefl'
);
INSERT INTO public.questions (id, passage_id, question_text, explanation, difficulty, sort_order, question_type, question_group_label, correct_answer_text, question_data) VALUES
  ('cc100001-e001-4000-8000-000000000001', 'cc100001-0001-0001-0001-000000000001', 'Choose the best response.', 'The speaker is asking whether this is the right room; the only reply that answers is the one confirming it and saying when the lecture starts.', 'easy', 1, 'multiple_choice', 'Questions 1–16: Listen and Choose a Response', '', '{"task":"response","hide_instruction":true,"instruction":"Choose the best response."}'::jsonb);
INSERT INTO public.options (question_id, option_label, option_text, is_correct, sort_order) VALUES
  ('cc100001-e001-4000-8000-000000000001', 'A', 'Yes, it starts in about ten minutes.', true, 1),
  ('cc100001-e001-4000-8000-000000000001', 'B', 'No, I don''t take chemistry this year.', false, 2),
  ('cc100001-e001-4000-8000-000000000001', 'C', 'The lecture was very interesting.', false, 3),
  ('cc100001-e001-4000-8000-000000000001', 'D', 'It''s on the third floor of the library.', false, 4);

-- ── TOEFL · Choose a Response 2 (1 questions) ──
INSERT INTO public.passages (id, title, content, module, audio_url, audio_duration_seconds, transcript, difficulty, exam_type) VALUES (
  'cc100002-0002-0001-0001-000000000002', 'Choose a Response 2',
  'Kind: response
Setting: At the student services desk
Speakers: Receptionist (m)',
  'listening', '', 7,
  'Receptionist (m): The advisor is with another student right now. Would you like to wait, or come back later?',
  'easy', 'toefl'
);
INSERT INTO public.questions (id, passage_id, question_text, explanation, difficulty, sort_order, question_type, question_group_label, correct_answer_text, question_data) VALUES
  ('cc100002-e002-4000-8000-000000000002', 'cc100002-0002-0001-0001-000000000002', 'Choose the best response.', 'The receptionist offers two choices; the reply chooses one of them.', 'easy', 2, 'multiple_choice', 'Questions 1–16: Listen and Choose a Response', '', '{"task":"response","hide_instruction":true,"instruction":"Choose the best response."}'::jsonb);
INSERT INTO public.options (question_id, option_label, option_text, is_correct, sort_order) VALUES
  ('cc100002-e002-4000-8000-000000000002', 'A', 'I''ll wait, if it won''t be too long.', true, 1),
  ('cc100002-e002-4000-8000-000000000002', 'B', 'I''ve already met the advisor.', false, 2),
  ('cc100002-e002-4000-8000-000000000002', 'C', 'Yes, I came back yesterday.', false, 3),
  ('cc100002-e002-4000-8000-000000000002', 'D', 'The office is on the second floor.', false, 4);

-- ── TOEFL · Choose a Response 3 (1 questions) ──
INSERT INTO public.passages (id, title, content, module, audio_url, audio_duration_seconds, transcript, difficulty, exam_type) VALUES (
  'cc100003-0003-0001-0001-000000000003', 'Choose a Response 3',
  'Kind: response
Setting: In a dormitory corridor
Speakers: Student (m)',
  'listening', '', 4,
  'Student (m): Hey, are you coming to the study group tonight?',
  'easy', 'toefl'
);
INSERT INTO public.questions (id, passage_id, question_text, explanation, difficulty, sort_order, question_type, question_group_label, correct_answer_text, question_data) VALUES
  ('cc100003-e003-4000-8000-000000000003', 'cc100003-0003-0001-0001-000000000003', 'Choose the best response.', 'A yes-or-no invitation; the reply explains why the speaker can''t come.', 'easy', 3, 'multiple_choice', 'Questions 1–16: Listen and Choose a Response', '', '{"task":"response","hide_instruction":true,"instruction":"Choose the best response."}'::jsonb);
INSERT INTO public.options (question_id, option_label, option_text, is_correct, sort_order) VALUES
  ('cc100003-e003-4000-8000-000000000003', 'A', 'I studied in the library last night.', false, 1),
  ('cc100003-e003-4000-8000-000000000003', 'B', 'I''d like to, but I have a shift at work.', true, 2),
  ('cc100003-e003-4000-8000-000000000003', 'C', 'The group has about eight members.', false, 3),
  ('cc100003-e003-4000-8000-000000000003', 'D', 'Tonight the weather should be clear.', false, 4);

-- ── TOEFL · Choose a Response 4 (1 questions) ──
INSERT INTO public.passages (id, title, content, module, audio_url, audio_duration_seconds, transcript, difficulty, exam_type) VALUES (
  'cc100004-0004-0001-0001-000000000004', 'Choose a Response 4',
  'Kind: response
Setting: At the library counter
Speakers: Librarian (f)',
  'listening', '', 8,
  'Librarian (f): These two books are due back next Friday, but you can renew them online if you need more time.',
  'easy', 'toefl'
);
INSERT INTO public.questions (id, passage_id, question_text, explanation, difficulty, sort_order, question_type, question_group_label, correct_answer_text, question_data) VALUES
  ('cc100004-e004-4000-8000-000000000004', 'cc100004-0004-0001-0001-000000000004', 'Choose the best response.', 'The librarian is giving information about the loan; the natural reply acknowledges it and refers to needing more time.', 'easy', 4, 'multiple_choice', 'Questions 1–16: Listen and Choose a Response', '', '{"task":"response","hide_instruction":true,"instruction":"Choose the best response."}'::jsonb);
INSERT INTO public.options (question_id, option_label, option_text, is_correct, sort_order) VALUES
  ('cc100004-e004-4000-8000-000000000004', 'A', 'Thanks, I''ll probably need them a bit longer.', true, 1),
  ('cc100004-e004-4000-8000-000000000004', 'B', 'I didn''t know the library was open on Fridays.', false, 2),
  ('cc100004-e004-4000-8000-000000000004', 'C', 'I''ve already read both of them.', false, 3),
  ('cc100004-e004-4000-8000-000000000004', 'D', 'The website is very easy to use.', false, 4);

-- ── TOEFL · Choose a Response 5 (1 questions) ──
INSERT INTO public.passages (id, title, content, module, audio_url, audio_duration_seconds, transcript, difficulty, exam_type) VALUES (
  'cc100005-0005-0001-0001-000000000005', 'Choose a Response 5',
  'Kind: response
Setting: After class
Speakers: Professor (m)',
  'listening', '', 5,
  'Professor (m): I noticed you weren''t in class on Tuesday. Is everything all right?',
  'easy', 'toefl'
);
INSERT INTO public.questions (id, passage_id, question_text, explanation, difficulty, sort_order, question_type, question_group_label, correct_answer_text, question_data) VALUES
  ('cc100005-e005-4000-8000-000000000005', 'cc100005-0005-0001-0001-000000000005', 'Choose the best response.', 'The professor asks about a missed class; the reply answers the question and gives a reason.', 'easy', 5, 'multiple_choice', 'Questions 1–16: Listen and Choose a Response', '', '{"task":"response","hide_instruction":true,"instruction":"Choose the best response."}'::jsonb);
INSERT INTO public.options (question_id, option_label, option_text, is_correct, sort_order) VALUES
  ('cc100005-e005-4000-8000-000000000005', 'A', 'Tuesday''s lecture was about volcanoes.', false, 1),
  ('cc100005-e005-4000-8000-000000000005', 'B', 'Yes, I''m fine, I had a dentist''s appointment.', true, 2),
  ('cc100005-e005-4000-8000-000000000005', 'C', 'Class usually ends at eleven.', false, 3),
  ('cc100005-e005-4000-8000-000000000005', 'D', 'I''ll be in the office all afternoon.', false, 4);

-- ── TOEFL · Choose a Response 6 (1 questions) ──
INSERT INTO public.passages (id, title, content, module, audio_url, audio_duration_seconds, transcript, difficulty, exam_type) VALUES (
  'cc100006-0006-0001-0001-000000000006', 'Choose a Response 6',
  'Kind: response
Setting: In the cafeteria
Speakers: Student (f)',
  'listening', '', 2,
  'Student (f): Could you pass me the salt?',
  'easy', 'toefl'
);
INSERT INTO public.questions (id, passage_id, question_text, explanation, difficulty, sort_order, question_type, question_group_label, correct_answer_text, question_data) VALUES
  ('cc100006-e006-4000-8000-000000000006', 'cc100006-0006-0001-0001-000000000006', 'Choose the best response.', 'A simple request; the reply agrees and hands it over.', 'easy', 6, 'multiple_choice', 'Questions 1–16: Listen and Choose a Response', '', '{"task":"response","hide_instruction":true,"instruction":"Choose the best response."}'::jsonb);
INSERT INTO public.options (question_id, option_label, option_text, is_correct, sort_order) VALUES
  ('cc100006-e006-4000-8000-000000000006', 'A', 'Sure, here you go.', true, 1),
  ('cc100006-e006-4000-8000-000000000006', 'B', 'No, I don''t like salt.', false, 2),
  ('cc100006-e006-4000-8000-000000000006', 'C', 'The soup is quite good today.', false, 3),
  ('cc100006-e006-4000-8000-000000000006', 'D', 'I passed the exam, thanks.', false, 4);

-- ── TOEFL · Choose a Response 7 (1 questions) ──
INSERT INTO public.passages (id, title, content, module, audio_url, audio_duration_seconds, transcript, difficulty, exam_type) VALUES (
  'cc100007-0007-0001-0001-000000000007', 'Choose a Response 7',
  'Kind: response
Setting: In a laboratory
Speakers: Teaching assistant (m)',
  'listening', '', 7,
  'Teaching assistant (m): Before you leave, make sure all the equipment is switched off and the bench is wiped down.',
  'medium', 'toefl'
);
INSERT INTO public.questions (id, passage_id, question_text, explanation, difficulty, sort_order, question_type, question_group_label, correct_answer_text, question_data) VALUES
  ('cc100007-e007-4000-8000-000000000007', 'cc100007-0007-0001-0001-000000000007', 'Choose the best response.', 'An instruction; the reply agrees to it and asks a related follow-up question.', 'medium', 7, 'multiple_choice', 'Questions 1–16: Listen and Choose a Response', '', '{"task":"response","hide_instruction":true,"instruction":"Choose the best response."}'::jsonb);
INSERT INTO public.options (question_id, option_label, option_text, is_correct, sort_order) VALUES
  ('cc100007-e007-4000-8000-000000000007', 'A', 'The experiment took longer than I expected.', false, 1),
  ('cc100007-e007-4000-8000-000000000007', 'B', 'Will do. Where do we put the used gloves?', true, 2),
  ('cc100007-e007-4000-8000-000000000007', 'C', 'I switched to a different lab section last week.', false, 3),
  ('cc100007-e007-4000-8000-000000000007', 'D', 'Yes, the bench by the window is free.', false, 4);

-- ── TOEFL · Choose a Response 8 (1 questions) ──
INSERT INTO public.passages (id, title, content, module, audio_url, audio_duration_seconds, transcript, difficulty, exam_type) VALUES (
  'cc100008-0008-0001-0001-000000000008', 'Choose a Response 8',
  'Kind: response
Setting: In a seminar room
Speakers: Student (f)',
  'listening', '', 6,
  'Student (f): I''m not sure I follow the second part of the reading. Did you get it?',
  'medium', 'toefl'
);
INSERT INTO public.questions (id, passage_id, question_text, explanation, difficulty, sort_order, question_type, question_group_label, correct_answer_text, question_data) VALUES
  ('cc100008-e008-4000-8000-000000000008', 'cc100008-0008-0001-0001-000000000008', 'Choose the best response.', 'The speaker asks whether the other person understood the reading; the reply comments on the reading''s content.', 'medium', 8, 'multiple_choice', 'Questions 1–16: Listen and Choose a Response', '', '{"task":"response","hide_instruction":true,"instruction":"Choose the best response."}'::jsonb);
INSERT INTO public.options (question_id, option_label, option_text, is_correct, sort_order) VALUES
  ('cc100008-e008-4000-8000-000000000008', 'A', 'I read it twice, and I think the author is contradicting herself.', true, 1),
  ('cc100008-e008-4000-8000-000000000008', 'B', 'The second seminar is on Thursday.', false, 2),
  ('cc100008-e008-4000-8000-000000000008', 'C', 'I got a copy from the bookshop.', false, 3),
  ('cc100008-e008-4000-8000-000000000008', 'D', 'Yes, the reading room closes at nine.', false, 4);

-- ── TOEFL · Choose a Response 9 (1 questions) ──
INSERT INTO public.passages (id, title, content, module, audio_url, audio_duration_seconds, transcript, difficulty, exam_type) VALUES (
  'cc100009-0009-0001-0001-000000000009', 'Choose a Response 9',
  'Kind: response
Setting: In the housing office
Speakers: Housing officer (m)',
  'listening', '', 8,
  'Housing officer (m): I''m afraid there are no single rooms left for next semester, but I can put your name on the waiting list.',
  'medium', 'toefl'
);
INSERT INTO public.questions (id, passage_id, question_text, explanation, difficulty, sort_order, question_type, question_group_label, correct_answer_text, question_data) VALUES
  ('cc100009-e009-4000-8000-000000000009', 'cc100009-0009-0001-0001-000000000009', 'Choose the best response.', 'The officer offers to add the student to a waiting list; the reply accepts and asks about it.', 'medium', 9, 'multiple_choice', 'Questions 1–16: Listen and Choose a Response', '', '{"task":"response","hide_instruction":true,"instruction":"Choose the best response."}'::jsonb);
INSERT INTO public.options (question_id, option_label, option_text, is_correct, sort_order) VALUES
  ('cc100009-e009-4000-8000-000000000009', 'A', 'Please do. How long is the list usually?', true, 1),
  ('cc100009-e009-4000-8000-000000000009', 'B', 'I''d prefer a room with a view.', false, 2),
  ('cc100009-e009-4000-8000-000000000009', 'C', 'The semester starts in September.', false, 3),
  ('cc100009-e009-4000-8000-000000000009', 'D', 'I live in a single room at the moment.', false, 4);

-- ── TOEFL · Choose a Response 10 (1 questions) ──
INSERT INTO public.passages (id, title, content, module, audio_url, audio_duration_seconds, transcript, difficulty, exam_type) VALUES (
  'cc100010-0010-0001-0001-000000000010', 'Choose a Response 10',
  'Kind: response
Setting: On the campus bus
Speakers: Student (f)',
  'listening', '', 4,
  'Student (f): This bus does stop at the medical school, doesn''t it?',
  'medium', 'toefl'
);
INSERT INTO public.questions (id, passage_id, question_text, explanation, difficulty, sort_order, question_type, question_group_label, correct_answer_text, question_data) VALUES
  ('cc100010-e010-4000-8000-000000000010', 'cc100010-0010-0001-0001-000000000010', 'Choose the best response.', 'A question seeking confirmation about the route; only one reply answers it.', 'medium', 10, 'multiple_choice', 'Questions 1–16: Listen and Choose a Response', '', '{"task":"response","hide_instruction":true,"instruction":"Choose the best response."}'::jsonb);
INSERT INTO public.options (question_id, option_label, option_text, is_correct, sort_order) VALUES
  ('cc100010-e010-4000-8000-000000000010', 'A', 'It did last year, but now you have to change at the main gate.', true, 1),
  ('cc100010-e010-4000-8000-000000000010', 'B', 'The medical school has a new building.', false, 2),
  ('cc100010-e010-4000-8000-000000000010', 'C', 'I''m studying medicine as well.', false, 3),
  ('cc100010-e010-4000-8000-000000000010', 'D', 'The bus was late this morning.', false, 4);

-- ── TOEFL · Choose a Response 11 (1 questions) ──
INSERT INTO public.passages (id, title, content, module, audio_url, audio_duration_seconds, transcript, difficulty, exam_type) VALUES (
  'cc100011-0011-0001-0001-000000000011', 'Choose a Response 11',
  'Kind: response
Setting: In a professor''s office
Speakers: Professor (f)',
  'listening', '', 6,
  'Professor (f): Your draft is promising, but the argument in the third section needs more evidence.',
  'medium', 'toefl'
);
INSERT INTO public.questions (id, passage_id, question_text, explanation, difficulty, sort_order, question_type, question_group_label, correct_answer_text, question_data) VALUES
  ('cc100011-e011-4000-8000-000000000011', 'cc100011-0011-0001-0001-000000000011', 'Choose the best response.', 'Feedback on a draft; the reply responds to the point about evidence.', 'medium', 11, 'multiple_choice', 'Questions 1–16: Listen and Choose a Response', '', '{"task":"response","hide_instruction":true,"instruction":"Choose the best response."}'::jsonb);
INSERT INTO public.options (question_id, option_label, option_text, is_correct, sort_order) VALUES
  ('cc100011-e011-4000-8000-000000000011', 'A', 'I''ll add the survey results I collected in the spring.', true, 1),
  ('cc100011-e011-4000-8000-000000000011', 'B', 'Section three is the longest in the book.', false, 2),
  ('cc100011-e011-4000-8000-000000000011', 'C', 'Thank you, I enjoyed writing the introduction.', false, 3),
  ('cc100011-e011-4000-8000-000000000011', 'D', 'The deadline is the end of the month.', false, 4);

-- ── TOEFL · Choose a Response 12 (1 questions) ──
INSERT INTO public.passages (id, title, content, module, audio_url, audio_duration_seconds, transcript, difficulty, exam_type) VALUES (
  'cc100012-0012-0001-0001-000000000012', 'Choose a Response 12',
  'Kind: response
Setting: In the computer lab
Speakers: Student (m)',
  'listening', '', 4,
  'Student (m): Mind if I use this printer? Mine keeps jamming.',
  'medium', 'toefl'
);
INSERT INTO public.questions (id, passage_id, question_text, explanation, difficulty, sort_order, question_type, question_group_label, correct_answer_text, question_data) VALUES
  ('cc100012-e012-4000-8000-000000000012', 'cc100012-0012-0001-0001-000000000012', 'Choose the best response.', 'A request for permission; the reply grants it.', 'medium', 12, 'multiple_choice', 'Questions 1–16: Listen and Choose a Response', '', '{"task":"response","hide_instruction":true,"instruction":"Choose the best response."}'::jsonb);
INSERT INTO public.options (question_id, option_label, option_text, is_correct, sort_order) VALUES
  ('cc100012-e012-4000-8000-000000000012', 'A', 'Go ahead, I''m just about finished.', true, 1),
  ('cc100012-e012-4000-8000-000000000012', 'B', 'I don''t have a printer at home.', false, 2),
  ('cc100012-e012-4000-8000-000000000012', 'C', 'Jam is in the fridge in the kitchen.', false, 3),
  ('cc100012-e012-4000-8000-000000000012', 'D', 'This computer is faster than the old ones.', false, 4);

-- ── TOEFL · Choose a Response 13 (1 questions) ──
INSERT INTO public.passages (id, title, content, module, audio_url, audio_duration_seconds, transcript, difficulty, exam_type) VALUES (
  'cc100013-0013-0001-0001-000000000013', 'Choose a Response 13',
  'Kind: response
Setting: At a careers fair
Speakers: Career advisor (f)',
  'listening', '', 8,
  'Career advisor (f): If you''re interested in the internship, the application has to be in by the fifteenth, and you''ll need two references.',
  'hard', 'toefl'
);
INSERT INTO public.questions (id, passage_id, question_text, explanation, difficulty, sort_order, question_type, question_group_label, correct_answer_text, question_data) VALUES
  ('cc100013-e013-4000-8000-000000000013', 'cc100013-0013-0001-0001-000000000013', 'Choose the best response.', 'The advisor gives a deadline and a requirement; the reply reacts to both.', 'hard', 13, 'multiple_choice', 'Questions 1–16: Listen and Choose a Response', '', '{"task":"response","hide_instruction":true,"instruction":"Choose the best response."}'::jsonb);
INSERT INTO public.options (question_id, option_label, option_text, is_correct, sort_order) VALUES
  ('cc100013-e013-4000-8000-000000000013', 'A', 'That''s tight, but I think I can get the references in time.', true, 1),
  ('cc100013-e013-4000-8000-000000000013', 'B', 'I''ve done two internships already.', false, 2),
  ('cc100013-e013-4000-8000-000000000013', 'C', 'The fair finishes at four o''clock.', false, 3),
  ('cc100013-e013-4000-8000-000000000013', 'D', 'My reference book is in my bag.', false, 4);

-- ── TOEFL · Choose a Response 14 (1 questions) ──
INSERT INTO public.passages (id, title, content, module, audio_url, audio_duration_seconds, transcript, difficulty, exam_type) VALUES (
  'cc100014-0014-0001-0001-000000000014', 'Choose a Response 14',
  'Kind: response
Setting: In a dormitory kitchen
Speakers: Student (m)',
  'listening', '', 5,
  'Student (m): Whoever used the kitchen last night left a real mess. Was it you?',
  'hard', 'toefl'
);
INSERT INTO public.questions (id, passage_id, question_text, explanation, difficulty, sort_order, question_type, question_group_label, correct_answer_text, question_data) VALUES
  ('cc100014-e014-4000-8000-000000000014', 'cc100014-0014-0001-0001-000000000014', 'Choose the best response.', 'A direct accusation in the form of a question; the reply denies it and gives an alibi.', 'hard', 14, 'multiple_choice', 'Questions 1–16: Listen and Choose a Response', '', '{"task":"response","hide_instruction":true,"instruction":"Choose the best response."}'::jsonb);
INSERT INTO public.options (question_id, option_label, option_text, is_correct, sort_order) VALUES
  ('cc100014-e014-4000-8000-000000000014', 'A', 'Not me. I was at the gym until it closed.', true, 1),
  ('cc100014-e014-4000-8000-000000000014', 'B', 'The kitchen is bigger than the one in my old dorm.', false, 2),
  ('cc100014-e014-4000-8000-000000000014', 'C', 'Yes, last night''s dinner was really good.', false, 3),
  ('cc100014-e014-4000-8000-000000000014', 'D', 'I''ll be using it tonight at seven.', false, 4);

-- ── TOEFL · Choose a Response 15 (1 questions) ──
INSERT INTO public.passages (id, title, content, module, audio_url, audio_duration_seconds, transcript, difficulty, exam_type) VALUES (
  'cc100015-0015-0001-0001-000000000015', 'Choose a Response 15',
  'Kind: response
Setting: At the end of a lecture
Speakers: Lecturer (m)',
  'listening', '', 6,
  'Lecturer (m): I''ve posted the slides online, so don''t worry if you didn''t get everything down.',
  'hard', 'toefl'
);
INSERT INTO public.questions (id, passage_id, question_text, explanation, difficulty, sort_order, question_type, question_group_label, correct_answer_text, question_data) VALUES
  ('cc100015-e015-4000-8000-000000000015', 'cc100015-0015-0001-0001-000000000015', 'Choose the best response.', 'The lecturer reassures students about notes; the reply shows relief and refers to what was missed.', 'hard', 15, 'multiple_choice', 'Questions 1–16: Listen and Choose a Response', '', '{"task":"response","hide_instruction":true,"instruction":"Choose the best response."}'::jsonb);
INSERT INTO public.options (question_id, option_label, option_text, is_correct, sort_order) VALUES
  ('cc100015-e015-4000-8000-000000000015', 'A', 'Great, I missed the last few points about trade routes.', true, 1),
  ('cc100015-e015-4000-8000-000000000015', 'B', 'The slides were a little too bright.', false, 2),
  ('cc100015-e015-4000-8000-000000000015', 'C', 'I always sit at the back of the room.', false, 3),
  ('cc100015-e015-4000-8000-000000000015', 'D', 'The website was down yesterday afternoon.', false, 4);

-- ── TOEFL · Choose a Response 16 (1 questions) ──
INSERT INTO public.passages (id, title, content, module, audio_url, audio_duration_seconds, transcript, difficulty, exam_type) VALUES (
  'cc100016-0016-0001-0001-000000000016', 'Choose a Response 16',
  'Kind: response
Setting: Outside the sports centre
Speakers: Student (f)',
  'listening', '', 6,
  'Student (f): Any chance you could cover my shift at the pool on Saturday? Something''s come up.',
  'hard', 'toefl'
);
INSERT INTO public.questions (id, passage_id, question_text, explanation, difficulty, sort_order, question_type, question_group_label, correct_answer_text, question_data) VALUES
  ('cc100016-e016-4000-8000-000000000016', 'cc100016-0016-0001-0001-000000000016', 'Choose the best response.', 'A request for a favour; the reply declines with a reason and suggests an alternative.', 'hard', 16, 'multiple_choice', 'Questions 1–16: Listen and Choose a Response', '', '{"task":"response","hide_instruction":true,"instruction":"Choose the best response."}'::jsonb);
INSERT INTO public.options (question_id, option_label, option_text, is_correct, sort_order) VALUES
  ('cc100016-e016-4000-8000-000000000016', 'A', 'I would, but I''m away this weekend. Have you asked Marco?', true, 1),
  ('cc100016-e016-4000-8000-000000000016', 'B', 'The pool is open until eight on Saturdays.', false, 2),
  ('cc100016-e016-4000-8000-000000000016', 'C', 'I swim every Saturday morning.', false, 3),
  ('cc100016-e016-4000-8000-000000000016', 'D', 'Yes, something came up for me too last week.', false, 4);

-- ── TOEFL · Conversation 1: Changing a paper topic (2 questions) ──
INSERT INTO public.passages (id, title, content, module, audio_url, audio_duration_seconds, transcript, difficulty, exam_type) VALUES (
  'cc200001-0001-0002-0002-000000000001', 'Conversation 1: Changing a paper topic',
  'Kind: conversation
Setting: A student visits her history professor during office hours
Speakers: Student (f); Professor (m)',
  'listening', '', 80,
  'Student (f): Professor Alvarez, do you have a minute? It''s about my research paper.
Professor (m): Of course, come in. You were going to write about the building of the transcontinental railroad, weren''t you?
Student (f): That was the plan, but when I started looking for sources, there was just too much. Every book I opened took me in a different direction.
Professor (m): That''s a common problem with big topics. Did you find anything in particular that caught your interest?
Student (f): Actually, yes. I kept coming across references to the Chinese workers who built the western section, and how little was written about them at the time.
Professor (m): Then there''s your paper. Narrowing it down to one group of workers gives you a question to answer, rather than a story to retell.
Student (f): Would it be a problem that most of the sources are quite recent? The older histories hardly mention them.
Professor (m): Not at all. In fact, you could make that silence part of your argument. Just make sure you use at least two primary sources, such as payroll records or newspaper reports from the eighteen sixties.
Student (f): The library has some newspapers on microfilm. I''ll start there.
Professor (m): Good. Send me a one-page outline by Friday and we''ll go from there.',
  'medium', 'toefl'
);
INSERT INTO public.questions (id, passage_id, question_text, explanation, difficulty, sort_order, question_type, question_group_label, correct_answer_text, question_data) VALUES
  ('cc200001-e017-4000-8000-000000000017', 'cc200001-0001-0002-0002-000000000001', 'Why does the student visit the professor?', 'She explains that her original topic was too broad and that every source ''took me in a different direction''.', 'medium', 17, 'multiple_choice', 'Questions 17–26: Listen to a Conversation', '', '{"task":"conversation","hide_instruction":true,"instruction":"Choose the best answer."}'::jsonb),
  ('cc200001-e018-4000-8000-000000000018', 'cc200001-0001-0002-0002-000000000001', 'What does the professor tell the student to do?', '''Just make sure you use at least two primary sources, such as payroll records or newspaper reports.'' Only the outline is due on Friday.', 'medium', 18, 'multiple_choice', 'Questions 17–26: Listen to a Conversation', '', '{"task":"conversation","hide_instruction":true,"instruction":"Choose the best answer."}'::jsonb);
INSERT INTO public.options (question_id, option_label, option_text, is_correct, sort_order) VALUES
  ('cc200001-e017-4000-8000-000000000017', 'A', 'To ask for an extension on her paper', false, 1),
  ('cc200001-e017-4000-8000-000000000017', 'B', 'To discuss a problem with her chosen topic', true, 2),
  ('cc200001-e017-4000-8000-000000000017', 'C', 'To borrow a book about the railroad', false, 3),
  ('cc200001-e017-4000-8000-000000000017', 'D', 'To find out her grade on an outline', false, 4),
  ('cc200001-e018-4000-8000-000000000018', 'A', 'Use only sources written in the nineteenth century', false, 1),
  ('cc200001-e018-4000-8000-000000000018', 'B', 'Return to her original topic', false, 2),
  ('cc200001-e018-4000-8000-000000000018', 'C', 'Include at least two primary sources', true, 3),
  ('cc200001-e018-4000-8000-000000000018', 'D', 'Submit the finished paper on Friday', false, 4);

-- ── TOEFL · Conversation 2: A problem with a meal plan (2 questions) ──
INSERT INTO public.passages (id, title, content, module, audio_url, audio_duration_seconds, transcript, difficulty, exam_type) VALUES (
  'cc200002-0002-0002-0002-000000000002', 'Conversation 2: A problem with a meal plan',
  'Kind: conversation
Setting: A student speaks to a staff member at the dining services office
Speakers: Student (m); Dining services staff (f)',
  'listening', '', 73,
  'Student (m): Hi, I think there''s a mistake with my meal plan. My card was refused at breakfast this morning.
Dining services staff (f): Let me have a look. Can I see your student ID? Thanks. Ah, I see what''s happened. You''re on the ten-meals-a-week plan, and you''d already used all ten by Sunday night.
Student (m): Really? I only eat on campus a few times a week.
Dining services staff (f): According to the system, your card was used twice at lunchtime on Thursday and twice on Friday, within a few minutes each time.
Student (m): Oh. That''ll be my roommate. I lent him my card when his was being replaced. I didn''t realise it would count against my plan.
Dining services staff (f): It does, I''m afraid. The plan resets on Monday morning, so you''ll be fine from tomorrow. In the meantime you can pay cash in the dining hall.
Student (m): Is there a plan with more meals? I''d rather not run out again.
Dining services staff (f): There''s a fifteen-meal plan, and the difference in price is only about forty dollars a semester. If you fill in this form, the change takes effect next week.
Student (m): I''ll do that now. Thanks for your help.',
  'easy', 'toefl'
);
INSERT INTO public.questions (id, passage_id, question_text, explanation, difficulty, sort_order, question_type, question_group_label, correct_answer_text, question_data) VALUES
  ('cc200002-e019-4000-8000-000000000019', 'cc200002-0002-0002-0002-000000000002', 'Why was the student''s card refused?', '''You''re on the ten-meals-a-week plan, and you''d already used all ten by Sunday night.''', 'easy', 19, 'multiple_choice', 'Questions 17–26: Listen to a Conversation', '', '{"task":"conversation","hide_instruction":true,"instruction":"Choose the best answer."}'::jsonb),
  ('cc200002-e020-4000-8000-000000000020', 'cc200002-0002-0002-0002-000000000002', 'What will the student probably do next?', 'He asks about a plan with more meals and says ''I''ll do that now'' when given the form.', 'easy', 20, 'multiple_choice', 'Questions 17–26: Listen to a Conversation', '', '{"task":"conversation","hide_instruction":true,"instruction":"Choose the best answer."}'::jsonb);
INSERT INTO public.options (question_id, option_label, option_text, is_correct, sort_order) VALUES
  ('cc200002-e019-4000-8000-000000000019', 'A', 'The card had expired', false, 1),
  ('cc200002-e019-4000-8000-000000000019', 'B', 'He had used all his meals for the week', true, 2),
  ('cc200002-e019-4000-8000-000000000019', 'C', 'His roommate''s card was being replaced', false, 3),
  ('cc200002-e019-4000-8000-000000000019', 'D', 'He had not paid for the semester', false, 4),
  ('cc200002-e020-4000-8000-000000000020', 'A', 'Pay cash for his breakfast', false, 1),
  ('cc200002-e020-4000-8000-000000000020', 'B', 'Ask for a new card', false, 2),
  ('cc200002-e020-4000-8000-000000000020', 'C', 'Change to a plan with more meals', true, 3),
  ('cc200002-e020-4000-8000-000000000020', 'D', 'Report his roommate', false, 4);

-- ── TOEFL · Conversation 3: Preparing a class presentation (2 questions) ──
INSERT INTO public.passages (id, title, content, module, audio_url, audio_duration_seconds, transcript, difficulty, exam_type) VALUES (
  'cc200003-0003-0002-0002-000000000003', 'Conversation 3: Preparing a class presentation',
  'Kind: conversation
Setting: Two students plan a joint presentation in the library
Speakers: Maya, a student (f); Ben, a student (m)',
  'listening', '', 74,
  'Maya (f): Ben, we need to decide how we''re splitting the presentation. It''s on Thursday and we''ve barely started.
Ben (m): I know. I was thinking you could do the background on renewable energy policy, since that''s your area, and I''ll take the case study on the wind farm.
Maya (f): That makes sense. But Dr Kim said last week that he doesn''t want more than fifteen minutes in total. The background alone could take that long.
Ben (m): Then let''s cut it to five minutes. Just the main policies since twenty ten. Nobody needs the whole history.
Maya (f): Fine. And the slides? Last time we used two different templates and it looked a mess.
Ben (m): I''ll set up a shared file tonight with one design, and we both add our slides to it. That way we can see each other''s parts as we go.
Maya (f): Good idea. Can we do a practice run on Wednesday afternoon? I''m free after two.
Ben (m): Two thirty works. I''ll book one of the group study rooms on the third floor so we can use the screen.
Maya (f): Perfect. If we time it on Wednesday, we won''t get caught out on Thursday.',
  'medium', 'toefl'
);
INSERT INTO public.questions (id, passage_id, question_text, explanation, difficulty, sort_order, question_type, question_group_label, correct_answer_text, question_data) VALUES
  ('cc200003-e021-4000-8000-000000000021', 'cc200003-0003-0002-0002-000000000003', 'What does Maya say about the background section?', '''The background alone could take that long,'' she says, referring to the fifteen-minute limit.', 'medium', 21, 'multiple_choice', 'Questions 17–26: Listen to a Conversation', '', '{"task":"conversation","hide_instruction":true,"instruction":"Choose the best answer."}'::jsonb),
  ('cc200003-e022-4000-8000-000000000022', 'cc200003-0003-0002-0002-000000000003', 'What will Ben do tonight?', '''I''ll set up a shared file tonight with one design.'' The room booking is for Wednesday.', 'medium', 22, 'multiple_choice', 'Questions 17–26: Listen to a Conversation', '', '{"task":"conversation","hide_instruction":true,"instruction":"Choose the best answer."}'::jsonb);
INSERT INTO public.options (question_id, option_label, option_text, is_correct, sort_order) VALUES
  ('cc200003-e021-4000-8000-000000000021', 'A', 'It is the part she finds most difficult', false, 1),
  ('cc200003-e021-4000-8000-000000000021', 'B', 'It might take too long', true, 2),
  ('cc200003-e021-4000-8000-000000000021', 'C', 'It should be left out entirely', false, 3),
  ('cc200003-e021-4000-8000-000000000021', 'D', 'Ben should present it instead', false, 4),
  ('cc200003-e022-4000-8000-000000000022', 'A', 'Write his part of the presentation', false, 1),
  ('cc200003-e022-4000-8000-000000000022', 'B', 'Email Dr Kim about the time limit', false, 2),
  ('cc200003-e022-4000-8000-000000000022', 'C', 'Create a shared slide file', true, 3),
  ('cc200003-e022-4000-8000-000000000022', 'D', 'Book a study room', false, 4);

-- ── TOEFL · Conversation 4: A late lab report (2 questions) ──
INSERT INTO public.passages (id, title, content, module, audio_url, audio_duration_seconds, transcript, difficulty, exam_type) VALUES (
  'cc200004-0004-0002-0002-000000000004', 'Conversation 4: A late lab report',
  'Kind: conversation
Setting: A student talks to a teaching assistant after a lab session
Speakers: Student (m); Teaching assistant (f)',
  'listening', '', 64,
  'Student (m): Hi, I wanted to ask about the lab report that was due yesterday. I know I''m late.
Teaching assistant (f): You''re not the only one. What happened?
Student (m): The data file I saved on the lab computer was gone when I came back on Monday. I had to rerun the whole experiment.
Teaching assistant (f): The lab computers are wiped every weekend. There''s a notice on the door, but nobody reads it. Did you finish the rerun?
Student (m): Yes, I have the results now, and the write-up is nearly done. Could I hand it in tomorrow?
Teaching assistant (f): The policy is ten per cent off for each day it''s late. But since you have a genuine reason, I can ask Professor Novak to waive the penalty. I can''t promise she''ll agree.
Student (m): I''d really appreciate that. Is there anything I should do?
Teaching assistant (f): Email me a short explanation, so I have it in writing, and from now on save your files to your university drive, not the desktop.
Student (m): I will. Thanks.',
  'medium', 'toefl'
);
INSERT INTO public.questions (id, passage_id, question_text, explanation, difficulty, sort_order, question_type, question_group_label, correct_answer_text, question_data) VALUES
  ('cc200004-e023-4000-8000-000000000023', 'cc200004-0004-0002-0002-000000000004', 'Why is the student''s report late?', '''The data file I saved on the lab computer was gone... I had to rerun the whole experiment.''', 'medium', 23, 'multiple_choice', 'Questions 17–26: Listen to a Conversation', '', '{"task":"conversation","hide_instruction":true,"instruction":"Choose the best answer."}'::jsonb),
  ('cc200004-e024-4000-8000-000000000024', 'cc200004-0004-0002-0002-000000000004', 'What does the teaching assistant offer to do?', '''I can ask Professor Novak to waive the penalty. I can''t promise she''ll agree.''', 'medium', 24, 'multiple_choice', 'Questions 17–26: Listen to a Conversation', '', '{"task":"conversation","hide_instruction":true,"instruction":"Choose the best answer."}'::jsonb);
INSERT INTO public.options (question_id, option_label, option_text, is_correct, sort_order) VALUES
  ('cc200004-e023-4000-8000-000000000023', 'A', 'He was ill over the weekend', false, 1),
  ('cc200004-e023-4000-8000-000000000023', 'B', 'His data was deleted from a lab computer', true, 2),
  ('cc200004-e023-4000-8000-000000000023', 'C', 'He did not know the due date', false, 3),
  ('cc200004-e023-4000-8000-000000000023', 'D', 'The professor changed the assignment', false, 4),
  ('cc200004-e024-4000-8000-000000000024', 'A', 'Extend the deadline for the whole class', false, 1),
  ('cc200004-e024-4000-8000-000000000024', 'B', 'Grade the report herself', false, 2),
  ('cc200004-e024-4000-8000-000000000024', 'C', 'Ask the professor not to apply the penalty', true, 3),
  ('cc200004-e024-4000-8000-000000000024', 'D', 'Recover the student''s lost file', false, 4);

-- ── TOEFL · Conversation 5: Joining the orchestra (2 questions) ──
INSERT INTO public.passages (id, title, content, module, audio_url, audio_duration_seconds, transcript, difficulty, exam_type) VALUES (
  'cc200005-0005-0002-0002-000000000005', 'Conversation 5: Joining the orchestra',
  'Kind: conversation
Setting: A student asks the music department secretary about auditions
Speakers: Student (f); Department secretary (m)',
  'listening', '', 80,
  'Student (f): Hello, I''m interested in joining the university orchestra. Is it only for music majors?
Department secretary (m): Not at all. About half the players study something else entirely. You do have to audition, though. What do you play?
Student (f): The cello. I''ve been playing for nine years, but I haven''t had lessons since high school.
Department secretary (m): That shouldn''t be a problem. Auditions are next Tuesday and Wednesday, in the recital hall. You prepare one piece of your own choice, and then the conductor gives you a short passage to sight-read.
Student (f): Sight-reading is my weak point, to be honest.
Department secretary (m): Most people say that. The conductor is more interested in how you recover from a mistake than in whether you make one. Rehearsals are Monday evenings, seven to nine thirty, and there are two concerts a semester.
Student (f): Monday evenings might clash with my lab. Could I still join if I missed the occasional rehearsal?
Department secretary (m): Occasionally, yes, but not regularly. If you''re serious, talk to your lab instructor about moving to the Tuesday section. Several orchestra members have done that.
Student (f): I''ll ask. Can I sign up for an audition now?
Department secretary (m): Just put your name, instrument and email on this sheet, and we''ll confirm a time by Friday.',
  'hard', 'toefl'
);
INSERT INTO public.questions (id, passage_id, question_text, explanation, difficulty, sort_order, question_type, question_group_label, correct_answer_text, question_data) VALUES
  ('cc200005-e025-4000-8000-000000000025', 'cc200005-0005-0002-0002-000000000005', 'What does the secretary say about the audition?', '''The conductor gives you a short passage to sight-read,'' meaning a passage she has not prepared.', 'hard', 25, 'multiple_choice', 'Questions 17–26: Listen to a Conversation', '', '{"task":"conversation","hide_instruction":true,"instruction":"Choose the best answer."}'::jsonb),
  ('cc200005-e026-4000-8000-000000000026', 'cc200005-0005-0002-0002-000000000005', 'What does the secretary suggest the student do about her lab?', '''Talk to your lab instructor about moving to the Tuesday section. Several orchestra members have done that.''', 'hard', 26, 'multiple_choice', 'Questions 17–26: Listen to a Conversation', '', '{"task":"conversation","hide_instruction":true,"instruction":"Choose the best answer."}'::jsonb);
INSERT INTO public.options (question_id, option_label, option_text, is_correct, sort_order) VALUES
  ('cc200005-e025-4000-8000-000000000025', 'A', 'It is only open to music majors', false, 1),
  ('cc200005-e025-4000-8000-000000000025', 'B', 'It includes a piece the student has not seen before', true, 2),
  ('cc200005-e025-4000-8000-000000000025', 'C', 'It takes place on Monday evening', false, 3),
  ('cc200005-e025-4000-8000-000000000025', 'D', 'It requires a letter from a teacher', false, 4),
  ('cc200005-e026-4000-8000-000000000026', 'A', 'Miss the rehearsals when necessary', false, 1),
  ('cc200005-e026-4000-8000-000000000026', 'B', 'Ask to change to a different lab section', true, 2),
  ('cc200005-e026-4000-8000-000000000026', 'C', 'Speak to the conductor about it', false, 3),
  ('cc200005-e026-4000-8000-000000000026', 'D', 'Drop the lab for a semester', false, 4);

-- ── TOEFL · Announcement 1: Library closure (3 questions) ──
INSERT INTO public.passages (id, title, content, module, audio_url, audio_duration_seconds, transcript, difficulty, exam_type) VALUES (
  'cc300001-0001-0003-0003-000000000001', 'Announcement 1: Library closure',
  'Kind: announcement
Setting: An announcement over the library''s public address system
Speakers: Library staff (f)',
  'listening', '', 33,
  'Library staff (f): May I have your attention, please. Because of essential electrical work, the main library will close early today, at six o''clock instead of midnight, and will remain closed all day tomorrow. Books can still be returned using the drop box outside the main entrance, and any loans due during the closure will be extended automatically by two days. Students who need a study space tomorrow can use the science library, which will stay open until midnight as usual. We apologise for the inconvenience.',
  'easy', 'toefl'
);
INSERT INTO public.questions (id, passage_id, question_text, explanation, difficulty, sort_order, question_type, question_group_label, correct_answer_text, question_data) VALUES
  ('cc300001-e027-4000-8000-000000000027', 'cc300001-0001-0003-0003-000000000001', 'What is the purpose of the announcement?', 'The library is closing early today and all day tomorrow because of electrical work.', 'easy', 27, 'multiple_choice', 'Questions 27–35: Listen to an Announcement', '', '{"task":"announcement","hide_instruction":true,"instruction":"Choose the best answer."}'::jsonb),
  ('cc300001-e028-4000-8000-000000000028', 'cc300001-0001-0003-0003-000000000001', 'What will happen to books due during the closure?', '''Any loans due during the closure will be extended automatically by two days.''', 'easy', 28, 'multiple_choice', 'Questions 27–35: Listen to an Announcement', '', '{"task":"announcement","hide_instruction":true,"instruction":"Choose the best answer."}'::jsonb),
  ('cc300001-e029-4000-8000-000000000029', 'cc300001-0001-0003-0003-000000000001', 'What are students advised to do tomorrow if they need somewhere to study?', '''Students who need a study space tomorrow can use the science library.''', 'easy', 29, 'multiple_choice', 'Questions 27–35: Listen to an Announcement', '', '{"task":"announcement","hide_instruction":true,"instruction":"Choose the best answer."}'::jsonb);
INSERT INTO public.options (question_id, option_label, option_text, is_correct, sort_order) VALUES
  ('cc300001-e027-4000-8000-000000000027', 'A', 'To announce new opening hours for the year', false, 1),
  ('cc300001-e027-4000-8000-000000000027', 'B', 'To inform users about a temporary closure', true, 2),
  ('cc300001-e027-4000-8000-000000000027', 'C', 'To remind users to return overdue books', false, 3),
  ('cc300001-e027-4000-8000-000000000027', 'D', 'To introduce a new study space', false, 4),
  ('cc300001-e028-4000-8000-000000000028', 'A', 'They must be returned to the science library', false, 1),
  ('cc300001-e028-4000-8000-000000000028', 'B', 'A fine will be charged', false, 2),
  ('cc300001-e028-4000-8000-000000000028', 'C', 'The due date will be extended', true, 3),
  ('cc300001-e028-4000-8000-000000000028', 'D', 'They must be renewed online', false, 4),
  ('cc300001-e029-4000-8000-000000000029', 'A', 'Use the drop box', false, 1),
  ('cc300001-e029-4000-8000-000000000029', 'B', 'Wait until the library reopens', false, 2),
  ('cc300001-e029-4000-8000-000000000029', 'C', 'Go to the science library', true, 3),
  ('cc300001-e029-4000-8000-000000000029', 'D', 'Study in the main entrance', false, 4);

-- ── TOEFL · Announcement 2: Change to the field trip (3 questions) ──
INSERT INTO public.passages (id, title, content, module, audio_url, audio_duration_seconds, transcript, difficulty, exam_type) VALUES (
  'cc300002-0002-0003-0003-000000000002', 'Announcement 2: Change to the field trip',
  'Kind: announcement
Setting: A professor makes an announcement at the start of class
Speakers: Professor (m)',
  'listening', '', 42,
  'Professor (m): Before we begin, a quick announcement about Friday''s geology field trip. The forecast is for heavy rain, and the trail to the quarry becomes dangerous when it''s wet, so we''re postponing the trip to the following Friday, the twenty-first. The bus will still leave from the car park behind the science building, but at eight o''clock rather than nine, because we''ll be stopping at a second site on the way back. Anyone who can''t make the new date should see me after class so we can arrange an alternative assignment. And please, this time, bring proper boots. Trainers are not suitable for the quarry.',
  'medium', 'toefl'
);
INSERT INTO public.questions (id, passage_id, question_text, explanation, difficulty, sort_order, question_type, question_group_label, correct_answer_text, question_data) VALUES
  ('cc300002-e030-4000-8000-000000000030', 'cc300002-0002-0003-0003-000000000002', 'Why has the field trip been postponed?', '''The forecast is for heavy rain, and the trail to the quarry becomes dangerous when it''s wet.''', 'medium', 30, 'multiple_choice', 'Questions 27–35: Listen to an Announcement', '', '{"task":"announcement","hide_instruction":true,"instruction":"Choose the best answer."}'::jsonb),
  ('cc300002-e031-4000-8000-000000000031', 'cc300002-0002-0003-0003-000000000002', 'What has changed about the departure?', '''At eight o''clock rather than nine.'' The departure point is the same.', 'medium', 31, 'multiple_choice', 'Questions 27–35: Listen to an Announcement', '', '{"task":"announcement","hide_instruction":true,"instruction":"Choose the best answer."}'::jsonb),
  ('cc300002-e032-4000-8000-000000000032', 'cc300002-0002-0003-0003-000000000002', 'What should students who cannot attend on the new date do?', '''Anyone who can''t make the new date should see me after class so we can arrange an alternative assignment.''', 'medium', 32, 'multiple_choice', 'Questions 27–35: Listen to an Announcement', '', '{"task":"announcement","hide_instruction":true,"instruction":"Choose the best answer."}'::jsonb);
INSERT INTO public.options (question_id, option_label, option_text, is_correct, sort_order) VALUES
  ('cc300002-e030-4000-8000-000000000030', 'A', 'The bus is not available', false, 1),
  ('cc300002-e030-4000-8000-000000000030', 'B', 'The weather is expected to be bad', true, 2),
  ('cc300002-e030-4000-8000-000000000030', 'C', 'The quarry is closed', false, 3),
  ('cc300002-e030-4000-8000-000000000030', 'D', 'Too few students signed up', false, 4),
  ('cc300002-e031-4000-8000-000000000031', 'A', 'The bus will leave from a different place', false, 1),
  ('cc300002-e031-4000-8000-000000000031', 'B', 'The bus will leave an hour earlier', true, 2),
  ('cc300002-e031-4000-8000-000000000031', 'C', 'Students must find their own transport', false, 3),
  ('cc300002-e031-4000-8000-000000000031', 'D', 'The trip will last two days', false, 4),
  ('cc300002-e032-4000-8000-000000000032', 'A', 'Email the department', false, 1),
  ('cc300002-e032-4000-8000-000000000032', 'B', 'Join a later trip', false, 2),
  ('cc300002-e032-4000-8000-000000000032', 'C', 'Speak to the professor after class', true, 3),
  ('cc300002-e032-4000-8000-000000000032', 'D', 'Complete the assignment online', false, 4);

-- ── TOEFL · Announcement 3: Student elections (3 questions) ──
INSERT INTO public.passages (id, title, content, module, audio_url, audio_duration_seconds, transcript, difficulty, exam_type) VALUES (
  'cc300003-0003-0003-0003-000000000003', 'Announcement 3: Student elections',
  'Kind: announcement
Setting: A message from the student union played in the student centre
Speakers: Student union officer (f)',
  'listening', '', 44,
  'Student union officer (f): Hello, everyone. This is a reminder from the student union that nominations for next year''s union officers close this Thursday at five. If you''d like to stand, collect a nomination form from the union office on the ground floor of the student centre, get it signed by ten students, and return it before the deadline. Late forms will not be accepted, however good the excuse. Voting will take place online during the first week of November, and every registered student will receive a link by email. Even if you''re not standing, please vote. Last year fewer than a third of students did, and the union''s funding partly depends on turnout.',
  'hard', 'toefl'
);
INSERT INTO public.questions (id, passage_id, question_text, explanation, difficulty, sort_order, question_type, question_group_label, correct_answer_text, question_data) VALUES
  ('cc300003-e033-4000-8000-000000000033', 'cc300003-0003-0003-0003-000000000003', 'What is the deadline for nominations?', '''Nominations for next year''s union officers close this Thursday at five.''', 'hard', 33, 'multiple_choice', 'Questions 27–35: Listen to an Announcement', '', '{"task":"announcement","hide_instruction":true,"instruction":"Choose the best answer."}'::jsonb),
  ('cc300003-e034-4000-8000-000000000034', 'cc300003-0003-0003-0003-000000000003', 'What must a student do to stand for election?', '''Get it signed by ten students, and return it before the deadline.''', 'hard', 34, 'multiple_choice', 'Questions 27–35: Listen to an Announcement', '', '{"task":"announcement","hide_instruction":true,"instruction":"Choose the best answer."}'::jsonb),
  ('cc300003-e035-4000-8000-000000000035', 'cc300003-0003-0003-0003-000000000003', 'Why does the speaker encourage everyone to vote?', '''The union''s funding partly depends on turnout.''', 'hard', 35, 'multiple_choice', 'Questions 27–35: Listen to an Announcement', '', '{"task":"announcement","hide_instruction":true,"instruction":"Choose the best answer."}'::jsonb);
INSERT INTO public.options (question_id, option_label, option_text, is_correct, sort_order) VALUES
  ('cc300003-e033-4000-8000-000000000033', 'A', 'Thursday at five o''clock', true, 1),
  ('cc300003-e033-4000-8000-000000000033', 'B', 'The end of October', false, 2),
  ('cc300003-e033-4000-8000-000000000033', 'C', 'The first week of November', false, 3),
  ('cc300003-e033-4000-8000-000000000033', 'D', 'Friday at noon', false, 4),
  ('cc300003-e034-4000-8000-000000000034', 'A', 'Pay a registration fee', false, 1),
  ('cc300003-e034-4000-8000-000000000034', 'B', 'Collect signatures from other students', true, 2),
  ('cc300003-e034-4000-8000-000000000034', 'C', 'Attend a meeting in the student centre', false, 3),
  ('cc300003-e034-4000-8000-000000000034', 'D', 'Send an email to the union', false, 4),
  ('cc300003-e035-4000-8000-000000000035', 'A', 'Voting is compulsory for registered students', false, 1),
  ('cc300003-e035-4000-8000-000000000035', 'B', 'The results will be announced in the student centre', false, 2),
  ('cc300003-e035-4000-8000-000000000035', 'C', 'The union''s funding is affected by how many people vote', true, 3),
  ('cc300003-e035-4000-8000-000000000035', 'D', 'There are more candidates than last year', false, 4);

-- ── TOEFL · Academic Talk 1: Why the Romans built straight roads (4 questions) ──
INSERT INTO public.passages (id, title, content, module, audio_url, audio_duration_seconds, transcript, difficulty, exam_type) VALUES (
  'cc400001-0001-0004-0004-000000000001', 'Academic Talk 1: Why the Romans built straight roads',
  'Kind: talk
Setting: A short talk in an ancient history class
Speakers: Professor (m)',
  'listening', '', 100,
  'Professor (m): You''ve probably heard that Roman roads were straight, and in general that''s true. But the reason isn''t the one most people give. It wasn''t that the Romans loved straight lines for their own sake. It was that their roads were built by and for the army. A legion marching to a frontier needed the shortest route, and surveyors could lay out a straight line between two high points using nothing more than a wooden instrument called a groma: a cross with weighted strings hanging from each arm. By sighting along the strings, a surveyor could keep a line straight for miles.
Professor (m): Of course, the land didn''t always cooperate. When a road met a marsh, the engineers didn''t go around it. They drove wooden piles into the mud and built the road on top. When it met a steep hill, they cut a zigzag, but only on the slope itself, returning to the original line at the top. That''s why, on a map, a Roman road looks like a series of long straight stretches joined by short kinks, rather than a smooth curve.
Professor (m): The roads lasted because of how they were layered. First a trench, then large stones, then gravel packed hard, and on the main routes a surface of fitted paving slabs with a slight curve, so that rain ran off into ditches on either side. Some of these roads carried traffic for fifteen hundred years. Next time, we''ll look at what happened to the network after the legions left.',
  'medium', 'toefl'
);
INSERT INTO public.questions (id, passage_id, question_text, explanation, difficulty, sort_order, question_type, question_group_label, correct_answer_text, question_data) VALUES
  ('cc400001-e036-4000-8000-000000000036', 'cc400001-0001-0004-0004-000000000001', 'What is the main point the professor makes about Roman roads?', '''Their roads were built by and for the army. A legion marching to a frontier needed the shortest route.''', 'medium', 36, 'multiple_choice', 'Questions 36–47: Listen to an Academic Talk', '', '{"task":"talk","hide_instruction":true,"instruction":"Choose the best answer."}'::jsonb),
  ('cc400001-e037-4000-8000-000000000037', 'cc400001-0001-0004-0004-000000000001', 'What was the groma used for?', '''By sighting along the strings, a surveyor could keep a line straight for miles.''', 'medium', 37, 'multiple_choice', 'Questions 36–47: Listen to an Academic Talk', '', '{"task":"talk","hide_instruction":true,"instruction":"Choose the best answer."}'::jsonb),
  ('cc400001-e038-4000-8000-000000000038', 'cc400001-0001-0004-0004-000000000001', 'According to the professor, how did engineers deal with a marsh?', '''They drove wooden piles into the mud and built the road on top.''', 'medium', 38, 'multiple_choice', 'Questions 36–47: Listen to an Academic Talk', '', '{"task":"talk","hide_instruction":true,"instruction":"Choose the best answer."}'::jsonb),
  ('cc400001-e039-4000-8000-000000000039', 'cc400001-0001-0004-0004-000000000001', 'Why does the professor describe the layers of a road?', '''The roads lasted because of how they were layered.''', 'medium', 39, 'multiple_choice', 'Questions 36–47: Listen to an Academic Talk', '', '{"task":"talk","hide_instruction":true,"instruction":"Choose the best answer."}'::jsonb);
INSERT INTO public.options (question_id, option_label, option_text, is_correct, sort_order) VALUES
  ('cc400001-e036-4000-8000-000000000036', 'A', 'They were built mainly to serve the army', true, 1),
  ('cc400001-e036-4000-8000-000000000036', 'B', 'They were the first paved roads in Europe', false, 2),
  ('cc400001-e036-4000-8000-000000000036', 'C', 'They were curved to drain rainwater', false, 3),
  ('cc400001-e036-4000-8000-000000000036', 'D', 'They were built by local people', false, 4),
  ('cc400001-e037-4000-8000-000000000037', 'A', 'Measuring the depth of a trench', false, 1),
  ('cc400001-e037-4000-8000-000000000037', 'B', 'Keeping the road in a straight line', true, 2),
  ('cc400001-e037-4000-8000-000000000037', 'C', 'Cutting paving slabs', false, 3),
  ('cc400001-e037-4000-8000-000000000037', 'D', 'Testing the ground in a marsh', false, 4),
  ('cc400001-e038-4000-8000-000000000038', 'A', 'They built a bridge over it', false, 1),
  ('cc400001-e038-4000-8000-000000000038', 'B', 'They changed the direction of the road', false, 2),
  ('cc400001-e038-4000-8000-000000000038', 'C', 'They supported the road on wooden piles', true, 3),
  ('cc400001-e038-4000-8000-000000000038', 'D', 'They drained it with ditches', false, 4),
  ('cc400001-e039-4000-8000-000000000039', 'A', 'To explain why the roads were so expensive', false, 1),
  ('cc400001-e039-4000-8000-000000000039', 'B', 'To explain why the roads lasted so long', true, 2),
  ('cc400001-e039-4000-8000-000000000039', 'C', 'To compare Roman roads with modern ones', false, 3),
  ('cc400001-e039-4000-8000-000000000039', 'D', 'To show how the roads were repaired', false, 4);

-- ── TOEFL · Academic Talk 2: How birds navigate (4 questions) ──
INSERT INTO public.passages (id, title, content, module, audio_url, audio_duration_seconds, transcript, difficulty, exam_type) VALUES (
  'cc400002-0002-0004-0004-000000000002', 'Academic Talk 2: How birds navigate',
  'Kind: talk
Setting: A short talk in a biology class
Speakers: Professor (f)',
  'listening', '', 95,
  'Professor (f): Every autumn, the Arctic tern leaves its nesting grounds near the North Pole and flies to the Antarctic, a round trip of around seventy thousand kilometres. The obvious question is how it finds the way. For a long time the answer was thought to be the sun and the stars, and birds do use both. Young birds raised under a planetarium sky, with the stars rotated, set off in the wrong direction.
Professor (f): But the sun and stars can''t be the whole story, because many birds migrate on cloudy nights. In the nineteen seventies, researchers attached small magnets to the heads of homing pigeons. On sunny days the pigeons found their way home as usual. On overcast days, the pigeons with magnets became lost, while pigeons wearing non-magnetic brass bars did not. The conclusion was that birds can sense the Earth''s magnetic field, and that they rely on it when they can''t see the sky.
Professor (f): Where this sense is located is still debated. One theory points to tiny crystals of iron in the beak. Another, which has gained support recently, involves a protein in the eye called cryptochrome, which reacts to light in a way that is affected by magnetic fields. If that theory is right, a migrating bird might literally see the magnetic field as a pattern across its vision. What''s clear is that birds use several systems at once, and switch between them as conditions change.',
  'medium', 'toefl'
);
INSERT INTO public.questions (id, passage_id, question_text, explanation, difficulty, sort_order, question_type, question_group_label, correct_answer_text, question_data) VALUES
  ('cc400002-e040-4000-8000-000000000040', 'cc400002-0002-0004-0004-000000000002', 'What is the talk mainly about?', 'The talk moves through the sun and stars, the magnetic sense and where that sense may be located.', 'medium', 40, 'multiple_choice', 'Questions 36–47: Listen to an Academic Talk', '', '{"task":"talk","hide_instruction":true,"instruction":"Choose the best answer."}'::jsonb),
  ('cc400002-e041-4000-8000-000000000041', 'cc400002-0002-0004-0004-000000000002', 'What did the experiment with the planetarium show?', '''Young birds raised under a planetarium sky, with the stars rotated, set off in the wrong direction.''', 'medium', 41, 'multiple_choice', 'Questions 36–47: Listen to an Academic Talk', '', '{"task":"talk","hide_instruction":true,"instruction":"Choose the best answer."}'::jsonb),
  ('cc400002-e042-4000-8000-000000000042', 'cc400002-0002-0004-0004-000000000002', 'Why did the researchers give some pigeons brass bars?', 'The brass bars were non-magnetic, so they served as a comparison group.', 'medium', 42, 'multiple_choice', 'Questions 36–47: Listen to an Academic Talk', '', '{"task":"talk","hide_instruction":true,"instruction":"Choose the best answer."}'::jsonb),
  ('cc400002-e043-4000-8000-000000000043', 'cc400002-0002-0004-0004-000000000002', 'What does the professor say about cryptochrome?', '''A migrating bird might literally see the magnetic field as a pattern across its vision.''', 'medium', 43, 'multiple_choice', 'Questions 36–47: Listen to an Academic Talk', '', '{"task":"talk","hide_instruction":true,"instruction":"Choose the best answer."}'::jsonb);
INSERT INTO public.options (question_id, option_label, option_text, is_correct, sort_order) VALUES
  ('cc400002-e040-4000-8000-000000000040', 'A', 'Why the Arctic tern migrates so far', false, 1),
  ('cc400002-e040-4000-8000-000000000040', 'B', 'The methods birds use to find their way', true, 2),
  ('cc400002-e040-4000-8000-000000000040', 'C', 'How pigeons were trained to carry messages', false, 3),
  ('cc400002-e040-4000-8000-000000000040', 'D', 'The effect of weather on bird populations', false, 4),
  ('cc400002-e041-4000-8000-000000000041', 'A', 'Young birds can navigate without any training', false, 1),
  ('cc400002-e041-4000-8000-000000000041', 'B', 'Birds use the pattern of the stars to choose a direction', true, 2),
  ('cc400002-e041-4000-8000-000000000041', 'C', 'Birds cannot fly in artificial light', false, 3),
  ('cc400002-e041-4000-8000-000000000041', 'D', 'Birds prefer to migrate during the day', false, 4),
  ('cc400002-e042-4000-8000-000000000042', 'A', 'To make the magnets heavier', false, 1),
  ('cc400002-e042-4000-8000-000000000042', 'B', 'To protect the pigeons'' heads', false, 2),
  ('cc400002-e042-4000-8000-000000000042', 'C', 'To compare them with the pigeons wearing magnets', true, 3),
  ('cc400002-e042-4000-8000-000000000042', 'D', 'To help the pigeons fly in a straight line', false, 4),
  ('cc400002-e043-4000-8000-000000000043', 'A', 'It is found in the beak', false, 1),
  ('cc400002-e043-4000-8000-000000000043', 'B', 'It has been proved to be the source of the magnetic sense', false, 2),
  ('cc400002-e043-4000-8000-000000000043', 'C', 'It may allow birds to see the magnetic field', true, 3),
  ('cc400002-e043-4000-8000-000000000043', 'D', 'It only works on cloudy days', false, 4);

-- ── TOEFL · Academic Talk 3: The invention of canned food (4 questions) ──
INSERT INTO public.passages (id, title, content, module, audio_url, audio_duration_seconds, transcript, difficulty, exam_type) VALUES (
  'cc400003-0003-0004-0004-000000000003', 'Academic Talk 3: The invention of canned food',
  'Kind: talk
Setting: A short talk in a history of technology class
Speakers: Lecturer (m)',
  'listening', '', 100,
  'Lecturer (m): In seventeen ninety-five, the French government offered a prize of twelve thousand francs to anyone who could find a way of preserving food for the army. Napoleon''s troops were losing more men to hunger and scurvy than to battle. The prize was eventually won by a confectioner named Nicolas Appert, who had noticed that food sealed in glass jars and then heated in boiling water stayed fresh for months. He had no idea why it worked. Louis Pasteur wouldn''t explain the role of bacteria for another fifty years. Appert simply knew that it did.
Lecturer (m): Glass, however, was heavy and broke easily on the march, so within a year an English merchant, Peter Durand, had patented the same process using containers of tinned iron. The first cans were made by hand, at a rate of about six an hour, and were so thick that soldiers opened them with a hammer and chisel, or, famously, with their bayonets. The can opener wasn''t invented until eighteen fifty-five, almost half a century later.
Lecturer (m): The real change came with mass production. By the eighteen seventies, machines could make thousands of cans an hour, and canned meat, fish and milk became cheap enough for ordinary families. In the process, the diet of cities was transformed. For the first time, a factory worker in Manchester could eat beef raised in Argentina. So when you open a can of soup, you''re using a technology that began as a military secret and ended by changing what the whole world eats.',
  'hard', 'toefl'
);
INSERT INTO public.questions (id, passage_id, question_text, explanation, difficulty, sort_order, question_type, question_group_label, correct_answer_text, question_data) VALUES
  ('cc400003-e044-4000-8000-000000000044', 'cc400003-0003-0004-0004-000000000003', 'Why did the French government offer a prize?', 'The prize was for ''a way of preserving food for the army''.', 'hard', 44, 'multiple_choice', 'Questions 36–47: Listen to an Academic Talk', '', '{"task":"talk","hide_instruction":true,"instruction":"Choose the best answer."}'::jsonb),
  ('cc400003-e045-4000-8000-000000000045', 'cc400003-0003-0004-0004-000000000003', 'What does the lecturer say about Nicolas Appert?', '''He had no idea why it worked... Appert simply knew that it did.''', 'hard', 45, 'multiple_choice', 'Questions 36–47: Listen to an Academic Talk', '', '{"task":"talk","hide_instruction":true,"instruction":"Choose the best answer."}'::jsonb),
  ('cc400003-e046-4000-8000-000000000046', 'cc400003-0003-0004-0004-000000000003', 'Why does the lecturer mention bayonets?', 'The cans ''were so thick that soldiers opened them with a hammer and chisel, or, famously, with their bayonets''.', 'hard', 46, 'multiple_choice', 'Questions 36–47: Listen to an Academic Talk', '', '{"task":"talk","hide_instruction":true,"instruction":"Choose the best answer."}'::jsonb),
  ('cc400003-e047-4000-8000-000000000047', 'cc400003-0003-0004-0004-000000000003', 'According to the lecturer, what was the effect of mass production?', '''Canned meat, fish and milk became cheap enough for ordinary families.''', 'hard', 47, 'multiple_choice', 'Questions 36–47: Listen to an Academic Talk', '', '{"task":"talk","hide_instruction":true,"instruction":"Choose the best answer."}'::jsonb);
INSERT INTO public.options (question_id, option_label, option_text, is_correct, sort_order) VALUES
  ('cc400003-e044-4000-8000-000000000044', 'A', 'To improve the quality of army food', false, 1),
  ('cc400003-e044-4000-8000-000000000044', 'B', 'To find a way to keep food from going bad', true, 2),
  ('cc400003-e044-4000-8000-000000000044', 'C', 'To encourage the glass industry', false, 3),
  ('cc400003-e044-4000-8000-000000000044', 'D', 'To reward Nicolas Appert for his work', false, 4),
  ('cc400003-e045-4000-8000-000000000045', 'A', 'He understood why heating preserved food', false, 1),
  ('cc400003-e045-4000-8000-000000000045', 'B', 'He was a scientist who worked with Pasteur', false, 2),
  ('cc400003-e045-4000-8000-000000000045', 'C', 'He did not know why his method worked', true, 3),
  ('cc400003-e045-4000-8000-000000000045', 'D', 'He invented the tin can', false, 4),
  ('cc400003-e046-4000-8000-000000000046', 'A', 'To show how thick early cans were', true, 1),
  ('cc400003-e046-4000-8000-000000000046', 'B', 'To explain why glass jars were replaced', false, 2),
  ('cc400003-e046-4000-8000-000000000046', 'C', 'To describe how cans were made', false, 3),
  ('cc400003-e046-4000-8000-000000000046', 'D', 'To show that soldiers disliked canned food', false, 4),
  ('cc400003-e047-4000-8000-000000000047', 'A', 'Cans became thicker and stronger', false, 1),
  ('cc400003-e047-4000-8000-000000000047', 'B', 'Canned food became affordable for ordinary people', true, 2),
  ('cc400003-e047-4000-8000-000000000047', 'C', 'The army stopped using canned food', false, 3),
  ('cc400003-e047-4000-8000-000000000047', 'D', 'Glass jars came back into use', false, 4);

COMMIT;
