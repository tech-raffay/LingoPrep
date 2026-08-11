-- ============================================
-- IELTS FULL LISTENING TEST — 40 Questions (4 Sections)
-- Run in Supabase SQL Editor
-- ============================================

-- Clean old listening seed data
DELETE FROM public.options WHERE question_id IN (SELECT id FROM public.questions WHERE passage_id IN ('33333333-3333-3333-3333-333333333333','44444444-4444-4444-4444-444444444444','bbbb0001-0001-0001-0001-000000000001','bbbb0002-0002-0002-0002-000000000002','bbbb0003-0003-0003-0003-000000000003','bbbb0004-0004-0004-0004-000000000004'));
DELETE FROM public.questions WHERE passage_id IN ('33333333-3333-3333-3333-333333333333','44444444-4444-4444-4444-444444444444','bbbb0001-0001-0001-0001-000000000001','bbbb0002-0002-0002-0002-000000000002','bbbb0003-0003-0003-0003-000000000003','bbbb0004-0004-0004-0004-000000000004');
DELETE FROM public.passages WHERE id IN ('33333333-3333-3333-3333-333333333333','44444444-4444-4444-4444-444444444444','bbbb0001-0001-0001-0001-000000000001','bbbb0002-0002-0002-0002-000000000002','bbbb0003-0003-0003-0003-000000000003','bbbb0004-0004-0004-0004-000000000004');

-- ============================================
-- SECTION 1: Library Registration Call (10 Qs)
-- Conversation between student and librarian
-- ============================================
INSERT INTO public.passages (id, title, content, module, audio_url, audio_duration_seconds, transcript, difficulty, exam_type) VALUES (
'bbbb0001-0001-0001-0001-000000000001',
'Section 1: Library Registration',
'',
'listening', '', 300,
E'Librarian: Good morning, Greenfield University Library. How can I help you?\n\nStudent: Hi, I''m a new student and I''d like to register for a library card.\n\nLibrarian: Of course. I''ll just need to take a few details. Can I start with your full name?\n\nStudent: Yes, it''s Michael Chen. That''s C-H-E-N.\n\nLibrarian: Thank you, Michael. And your student ID number?\n\nStudent: It''s GU-2025-4871.\n\nLibrarian: Perfect. And what programme are you enrolled in?\n\nStudent: I''m doing a Master''s degree in Environmental Science.\n\nLibrarian: Great. And your contact number?\n\nStudent: My mobile is 07745 332198.\n\nLibrarian: Thank you. Now, I should let you know about our borrowing limits. As a postgraduate student, you can borrow up to fifteen books at a time.\n\nStudent: Fifteen? That''s generous. How long can I keep them?\n\nLibrarian: The standard loan period is three weeks, but you can renew online up to two times if no one else has reserved the book.\n\nStudent: That''s good to know. What about late fees?\n\nLibrarian: We charge twenty pence per day per book. But if a book is more than six weeks overdue, the fine increases to fifty pence per day, and your borrowing privileges may be suspended.\n\nStudent: I''ll make sure to return them on time then. Can I also access the digital collections?\n\nLibrarian: Absolutely. Your library card gives you access to over three million e-books and journal articles through our online portal. You''ll need to log in with your student email address.\n\nStudent: Wonderful. And I heard there are group study rooms?\n\nLibrarian: Yes, we have twelve group study rooms on the second floor. Each room has a capacity of six people and is equipped with a projector and whiteboard. You can book them through the library website up to five days in advance.\n\nStudent: That sounds perfect. One last thing — what are the library''s opening hours?\n\nLibrarian: During term time, we''re open from eight a.m. to ten p.m., Monday to Friday. On weekends, it''s nine a.m. to six p.m. During vacations, the hours are reduced to nine to five, Monday to Friday only.\n\nStudent: Thank you so much. That''s very helpful.',
'medium', 'ielts'
);

INSERT INTO public.questions (id, passage_id, question_text, explanation, difficulty, sort_order) VALUES
('bbbb0001-f001-0001-0001-000000000001','bbbb0001-0001-0001-0001-000000000001','What is the student''s surname?','The student spells it out: C-H-E-N.','easy',1),
('bbbb0001-f002-0001-0001-000000000001','bbbb0001-0001-0001-0001-000000000001','What is the student''s ID number?','GU-2025-4871.','easy',2),
('bbbb0001-f003-0001-0001-000000000001','bbbb0001-0001-0001-0001-000000000001','What degree programme is the student enrolled in?','Master''s in Environmental Science.','easy',3),
('bbbb0001-f004-0001-0001-000000000001','bbbb0001-0001-0001-0001-000000000001','How many books can postgraduate students borrow at one time?','Fifteen books.','easy',4),
('bbbb0001-f005-0001-0001-000000000001','bbbb0001-0001-0001-0001-000000000001','What is the standard loan period for books?','Three weeks.','easy',5),
('bbbb0001-f006-0001-0001-000000000001','bbbb0001-0001-0001-0001-000000000001','How many times can books be renewed online?','Up to two times.','medium',6),
('bbbb0001-f007-0001-0001-000000000001','bbbb0001-0001-0001-0001-000000000001','What is the daily late fee for overdue books?','Twenty pence per day per book.','medium',7),
('bbbb0001-f008-0001-0001-000000000001','bbbb0001-0001-0001-0001-000000000001','How many e-books and journal articles are available in the digital collection?','Over three million.','medium',8),
('bbbb0001-f009-0001-0001-000000000001','bbbb0001-0001-0001-0001-000000000001','How many group study rooms are on the second floor?','Twelve rooms.','medium',9),
('bbbb0001-f010-0001-0001-000000000001','bbbb0001-0001-0001-0001-000000000001','What are the library''s weekday opening hours during term time?','Eight a.m. to ten p.m.','medium',10);

INSERT INTO public.options (question_id, option_label, option_text, is_correct, sort_order) VALUES
('bbbb0001-f001-0001-0001-000000000001','A','Chang',FALSE,1),
('bbbb0001-f001-0001-0001-000000000001','B','Chen',TRUE,2),
('bbbb0001-f001-0001-0001-000000000001','C','Cheng',FALSE,3),
('bbbb0001-f001-0001-0001-000000000001','D','Chan',FALSE,4),
('bbbb0001-f002-0001-0001-000000000001','A','GU-2025-4817',FALSE,1),
('bbbb0001-f002-0001-0001-000000000001','B','GU-2025-4871',TRUE,2),
('bbbb0001-f002-0001-0001-000000000001','C','GU-2025-4781',FALSE,3),
('bbbb0001-f002-0001-0001-000000000001','D','GU-2024-4871',FALSE,4),
('bbbb0001-f003-0001-0001-000000000001','A','Bachelor''s in Biology',FALSE,1),
('bbbb0001-f003-0001-0001-000000000001','B','Master''s in Environmental Science',TRUE,2),
('bbbb0001-f003-0001-0001-000000000001','C','PhD in Chemistry',FALSE,3),
('bbbb0001-f003-0001-0001-000000000001','D','Master''s in Marine Biology',FALSE,4),
('bbbb0001-f004-0001-0001-000000000001','A','Ten',FALSE,1),
('bbbb0001-f004-0001-0001-000000000001','B','Twelve',FALSE,2),
('bbbb0001-f004-0001-0001-000000000001','C','Fifteen',TRUE,3),
('bbbb0001-f004-0001-0001-000000000001','D','Twenty',FALSE,4),
('bbbb0001-f005-0001-0001-000000000001','A','Two weeks',FALSE,1),
('bbbb0001-f005-0001-0001-000000000001','B','Three weeks',TRUE,2),
('bbbb0001-f005-0001-0001-000000000001','C','Four weeks',FALSE,3),
('bbbb0001-f005-0001-0001-000000000001','D','One month',FALSE,4),
('bbbb0001-f006-0001-0001-000000000001','A','Once',FALSE,1),
('bbbb0001-f006-0001-0001-000000000001','B','Twice',TRUE,2),
('bbbb0001-f006-0001-0001-000000000001','C','Three times',FALSE,3),
('bbbb0001-f006-0001-0001-000000000001','D','Unlimited times',FALSE,4),
('bbbb0001-f007-0001-0001-000000000001','A','Ten pence',FALSE,1),
('bbbb0001-f007-0001-0001-000000000001','B','Twenty pence',TRUE,2),
('bbbb0001-f007-0001-0001-000000000001','C','Thirty pence',FALSE,3),
('bbbb0001-f007-0001-0001-000000000001','D','Fifty pence',FALSE,4),
('bbbb0001-f008-0001-0001-000000000001','A','Over one million',FALSE,1),
('bbbb0001-f008-0001-0001-000000000001','B','Over two million',FALSE,2),
('bbbb0001-f008-0001-0001-000000000001','C','Over three million',TRUE,3),
('bbbb0001-f008-0001-0001-000000000001','D','Over five million',FALSE,4),
('bbbb0001-f009-0001-0001-000000000001','A','Eight',FALSE,1),
('bbbb0001-f009-0001-0001-000000000001','B','Ten',FALSE,2),
('bbbb0001-f009-0001-0001-000000000001','C','Twelve',TRUE,3),
('bbbb0001-f009-0001-0001-000000000001','D','Fifteen',FALSE,4),
('bbbb0001-f010-0001-0001-000000000001','A','7 a.m. to 9 p.m.',FALSE,1),
('bbbb0001-f010-0001-0001-000000000001','B','8 a.m. to 10 p.m.',TRUE,2),
('bbbb0001-f010-0001-0001-000000000001','C','9 a.m. to 9 p.m.',FALSE,3),
('bbbb0001-f010-0001-0001-000000000001','D','8 a.m. to 8 p.m.',FALSE,4);

-- ============================================
-- SECTION 2: Museum Tour Guide (10 Qs)
-- Monologue - social context
-- ============================================
INSERT INTO public.passages (id, title, content, module, audio_url, audio_duration_seconds, transcript, difficulty, exam_type) VALUES (
'bbbb0002-0002-0002-0002-000000000002',
'Section 2: Westfield Museum Tour',
'',
'listening', '', 360,
E'Good afternoon, everyone, and welcome to the Westfield Museum of Natural History. My name is Dr. Patricia Holmes, and I''ll be your guide for today''s tour.\n\nBefore we begin, let me give you some practical information. The museum was originally founded in 1892 by the industrialist Sir Robert Westfield, who donated his personal collection of geological specimens. The building we''re standing in was designed by the architect James Crawford and completed in 1895. It was extensively renovated in 2018 at a cost of twelve million pounds.\n\nThe museum is arranged over three floors. On the ground floor, where we are now, you''ll find the Geology Hall and the Mineral Gallery. The first floor houses our famous Dinosaur Exhibition, which contains over two hundred fossil specimens, including the complete skeleton of a Tyrannosaurus Rex — one of only seven in the world. The second floor is dedicated to our Marine Life Collection and the Biodiversity Centre, which opened just last year.\n\nOur tour today will last approximately ninety minutes. We''ll start here in the Geology Hall, then move upstairs to the Dinosaur Exhibition, and finish in the Marine Life Collection. Please note that photography is permitted throughout the museum, but flash photography is not allowed in the Dinosaur Exhibition, as the light can damage some of the more delicate fossils.\n\nI should also mention our café on the ground floor, which serves light meals and refreshments. It closes at four thirty, so if you want to grab something to eat, please bear that in mind. The museum gift shop is located next to the main entrance and remains open until five fifteen, thirty minutes after the museum itself closes at four forty-five.\n\nFinally, please be aware that the West Wing is currently closed for maintenance and will reopen on March the fifteenth. The temporary exhibition on Antarctic exploration, which was originally scheduled for the West Wing, has been relocated to Gallery Seven on the first floor.\n\nNow, if you''ll follow me, we''ll begin with the geological history of our region.',
'medium', 'ielts'
);

INSERT INTO public.questions (id, passage_id, question_text, explanation, difficulty, sort_order) VALUES
('bbbb0002-f001-0002-0002-000000000002','bbbb0002-0002-0002-0002-000000000002','In what year was the Westfield Museum founded?','The speaker says 1892.','easy',1),
('bbbb0002-f002-0002-0002-000000000002','bbbb0002-0002-0002-0002-000000000002','Who designed the museum building?','James Crawford.','medium',2),
('bbbb0002-f003-0002-0002-000000000002','bbbb0002-0002-0002-0002-000000000002','How much did the 2018 renovation cost?','Twelve million pounds.','medium',3),
('bbbb0002-f004-0002-0002-000000000002','bbbb0002-0002-0002-0002-000000000002','How many fossil specimens does the Dinosaur Exhibition contain?','Over two hundred.','medium',4),
('bbbb0002-f005-0002-0002-000000000002','bbbb0002-0002-0002-0002-000000000002','How long will the tour last?','Approximately ninety minutes.','easy',5),
('bbbb0002-f006-0002-0002-000000000002','bbbb0002-0002-0002-0002-000000000002','Why is flash photography not allowed in the Dinosaur Exhibition?','Light can damage delicate fossils.','medium',6),
('bbbb0002-f007-0002-0002-000000000002','bbbb0002-0002-0002-0002-000000000002','What time does the museum café close?','Four thirty.','medium',7),
('bbbb0002-f008-0002-0002-000000000002','bbbb0002-0002-0002-0002-000000000002','What time does the museum itself close?','Four forty-five.','medium',8),
('bbbb0002-f009-0002-0002-000000000002','bbbb0002-0002-0002-0002-000000000002','When will the West Wing reopen?','March the fifteenth.','medium',9),
('bbbb0002-f010-0002-0002-000000000002','bbbb0002-0002-0002-0002-000000000002','Where has the Antarctic exploration exhibition been relocated to?','Gallery Seven on the first floor.','hard',10);

INSERT INTO public.options (question_id, option_label, option_text, is_correct, sort_order) VALUES
('bbbb0002-f001-0002-0002-000000000002','A','1882',FALSE,1),
('bbbb0002-f001-0002-0002-000000000002','B','1892',TRUE,2),
('bbbb0002-f001-0002-0002-000000000002','C','1902',FALSE,3),
('bbbb0002-f001-0002-0002-000000000002','D','1895',FALSE,4),
('bbbb0002-f002-0002-0002-000000000002','A','Robert Westfield',FALSE,1),
('bbbb0002-f002-0002-0002-000000000002','B','Patricia Holmes',FALSE,2),
('bbbb0002-f002-0002-0002-000000000002','C','James Crawford',TRUE,3),
('bbbb0002-f002-0002-0002-000000000002','D','William Morris',FALSE,4),
('bbbb0002-f003-0002-0002-000000000002','A','Eight million pounds',FALSE,1),
('bbbb0002-f003-0002-0002-000000000002','B','Ten million pounds',FALSE,2),
('bbbb0002-f003-0002-0002-000000000002','C','Twelve million pounds',TRUE,3),
('bbbb0002-f003-0002-0002-000000000002','D','Fifteen million pounds',FALSE,4),
('bbbb0002-f004-0002-0002-000000000002','A','Over one hundred',FALSE,1),
('bbbb0002-f004-0002-0002-000000000002','B','Over two hundred',TRUE,2),
('bbbb0002-f004-0002-0002-000000000002','C','Over three hundred',FALSE,3),
('bbbb0002-f004-0002-0002-000000000002','D','Over five hundred',FALSE,4),
('bbbb0002-f005-0002-0002-000000000002','A','Sixty minutes',FALSE,1),
('bbbb0002-f005-0002-0002-000000000002','B','Ninety minutes',TRUE,2),
('bbbb0002-f005-0002-0002-000000000002','C','Two hours',FALSE,3),
('bbbb0002-f005-0002-0002-000000000002','D','Forty-five minutes',FALSE,4),
('bbbb0002-f006-0002-0002-000000000002','A','It disturbs other visitors',FALSE,1),
('bbbb0002-f006-0002-0002-000000000002','B','It can damage delicate fossils',TRUE,2),
('bbbb0002-f006-0002-0002-000000000002','C','The museum does not allow any photography',FALSE,3),
('bbbb0002-f006-0002-0002-000000000002','D','The lighting system interferes with camera flash',FALSE,4),
('bbbb0002-f007-0002-0002-000000000002','A','4:00 p.m.',FALSE,1),
('bbbb0002-f007-0002-0002-000000000002','B','4:30 p.m.',TRUE,2),
('bbbb0002-f007-0002-0002-000000000002','C','4:45 p.m.',FALSE,3),
('bbbb0002-f007-0002-0002-000000000002','D','5:00 p.m.',FALSE,4),
('bbbb0002-f008-0002-0002-000000000002','A','4:30 p.m.',FALSE,1),
('bbbb0002-f008-0002-0002-000000000002','B','4:45 p.m.',TRUE,2),
('bbbb0002-f008-0002-0002-000000000002','C','5:00 p.m.',FALSE,3),
('bbbb0002-f008-0002-0002-000000000002','D','5:15 p.m.',FALSE,4),
('bbbb0002-f009-0002-0002-000000000002','A','February 15th',FALSE,1),
('bbbb0002-f009-0002-0002-000000000002','B','March 15th',TRUE,2),
('bbbb0002-f009-0002-0002-000000000002','C','March 30th',FALSE,3),
('bbbb0002-f009-0002-0002-000000000002','D','April 1st',FALSE,4),
('bbbb0002-f010-0002-0002-000000000002','A','Gallery Three on the ground floor',FALSE,1),
('bbbb0002-f010-0002-0002-000000000002','B','Gallery Five on the second floor',FALSE,2),
('bbbb0002-f010-0002-0002-000000000002','C','Gallery Seven on the first floor',TRUE,3),
('bbbb0002-f010-0002-0002-000000000002','D','The Main Hall on the ground floor',FALSE,4);

-- ============================================
-- SECTION 3: Research Project Discussion (10 Qs)
-- Conversation between two students - academic
-- ============================================
INSERT INTO public.passages (id, title, content, module, audio_url, audio_duration_seconds, transcript, difficulty, exam_type) VALUES (
'bbbb0003-0003-0003-0003-000000000003',
'Section 3: Research Project Discussion',
'',
'listening', '', 420,
E'Sarah: Hi Tom, shall we go over the plan for our geography research project?\n\nTom: Yes, good idea. So our topic is the impact of deforestation on local water systems in Southeast Asia, right?\n\nSarah: That''s right. Professor Williams said we need to focus on a specific country, so I was thinking we could look at Indonesia, since it has the highest rate of deforestation in the region.\n\nTom: I agree. Indonesia lost approximately 9.8 million hectares of forest between 2001 and 2019, according to Global Forest Watch. That gives us plenty of data.\n\nSarah: Exactly. Now, for our methodology, I think we should use a mixed-methods approach — combining quantitative data from satellite imagery with qualitative interviews from local communities.\n\nTom: That sounds thorough. Where would we get the satellite data?\n\nSarah: The European Space Agency provides free Sentinel-2 satellite imagery. We can use that to track changes in forest cover over the past two decades. I''ve already downloaded some preliminary data.\n\nTom: Great. And for the interviews, are you thinking of conducting them remotely?\n\nSarah: Yes, we''d do video interviews with local environmental organisations. Dr. Rahman at the University of Jakarta has agreed to help us connect with three community groups in Kalimantan.\n\nTom: Perfect. What about our timeline? The final submission is due on April the twenty-eighth.\n\nSarah: Right. I was thinking we spend the first three weeks on data collection — that takes us to the end of February. Then we spend March on analysis, and the first two weeks of April on writing up the report.\n\nTom: That leaves two weeks as a buffer, which is sensible. How should we divide the work?\n\nSarah: I''ll take the lead on the satellite data analysis since I did the remote sensing module last semester. Would you be happy to handle the literature review and the interview analysis?\n\nTom: Absolutely. I''ll start with the literature review this week. I''ve already found about forty relevant papers on deforestation and hydrology.\n\nSarah: One more thing — Professor Williams mentioned that we should include at least two case studies of specific river systems. I was thinking the Kapuas River and the Mahakam River.\n\nTom: Good choices. The Kapuas is the longest river in Kalimantan at over a thousand kilometres, and the Mahakam has well-documented water quality issues linked to logging.\n\nSarah: Exactly. Shall we meet again next Wednesday to review progress?\n\nTom: Sure, let''s say two o''clock in the postgraduate study room.',
'hard', 'ielts'
);

INSERT INTO public.questions (id, passage_id, question_text, explanation, difficulty, sort_order) VALUES
('bbbb0003-f001-0003-0003-000000000003','bbbb0003-0003-0003-0003-000000000003','What is the research project topic?','Impact of deforestation on local water systems in Southeast Asia.','easy',1),
('bbbb0003-f002-0003-0003-000000000003','bbbb0003-0003-0003-0003-000000000003','Which country did they decide to focus on?','Indonesia.','easy',2),
('bbbb0003-f003-0003-0003-000000000003','bbbb0003-0003-0003-0003-000000000003','How much forest did Indonesia lose between 2001 and 2019?','Approximately 9.8 million hectares.','medium',3),
('bbbb0003-f004-0003-0003-000000000003','bbbb0003-0003-0003-0003-000000000003','What methodology approach will they use?','A mixed-methods approach.','medium',4),
('bbbb0003-f005-0003-0003-000000000003','bbbb0003-0003-0003-0003-000000000003','Which organisation provides free satellite imagery?','The European Space Agency.','medium',5),
('bbbb0003-f006-0003-0003-000000000003','bbbb0003-0003-0003-0003-000000000003','How many community groups will they interview?','Three community groups.','medium',6),
('bbbb0003-f007-0003-0003-000000000003','bbbb0003-0003-0003-0003-000000000003','When is the final submission due?','April the twenty-eighth.','medium',7),
('bbbb0003-f008-0003-0003-000000000003','bbbb0003-0003-0003-0003-000000000003','What will Sarah be responsible for?','Satellite data analysis.','medium',8),
('bbbb0003-f009-0003-0003-000000000003','bbbb0003-0003-0003-0003-000000000003','How many relevant papers has Tom found so far?','About forty.','hard',9),
('bbbb0003-f010-0003-0003-000000000003','bbbb0003-0003-0003-0003-000000000003','How long is the Kapuas River?','Over a thousand kilometres.','hard',10);

INSERT INTO public.options (question_id, option_label, option_text, is_correct, sort_order) VALUES
('bbbb0003-f001-0003-0003-000000000003','A','Effects of urbanisation on wildlife',FALSE,1),
('bbbb0003-f001-0003-0003-000000000003','B','Impact of deforestation on local water systems',TRUE,2),
('bbbb0003-f001-0003-0003-000000000003','C','Climate change in coastal regions',FALSE,3),
('bbbb0003-f001-0003-0003-000000000003','D','Agricultural practices in tropical forests',FALSE,4),
('bbbb0003-f002-0003-0003-000000000003','A','Malaysia',FALSE,1),
('bbbb0003-f002-0003-0003-000000000003','B','Thailand',FALSE,2),
('bbbb0003-f002-0003-0003-000000000003','C','Indonesia',TRUE,3),
('bbbb0003-f002-0003-0003-000000000003','D','Vietnam',FALSE,4),
('bbbb0003-f003-0003-0003-000000000003','A','5.2 million hectares',FALSE,1),
('bbbb0003-f003-0003-0003-000000000003','B','9.8 million hectares',TRUE,2),
('bbbb0003-f003-0003-0003-000000000003','C','12.4 million hectares',FALSE,3),
('bbbb0003-f003-0003-0003-000000000003','D','7.6 million hectares',FALSE,4),
('bbbb0003-f004-0003-0003-000000000003','A','Purely quantitative approach',FALSE,1),
('bbbb0003-f004-0003-0003-000000000003','B','Mixed-methods approach',TRUE,2),
('bbbb0003-f004-0003-0003-000000000003','C','Purely qualitative approach',FALSE,3),
('bbbb0003-f004-0003-0003-000000000003','D','Experimental approach',FALSE,4),
('bbbb0003-f005-0003-0003-000000000003','A','NASA',FALSE,1),
('bbbb0003-f005-0003-0003-000000000003','B','European Space Agency',TRUE,2),
('bbbb0003-f005-0003-0003-000000000003','C','JAXA',FALSE,3),
('bbbb0003-f005-0003-0003-000000000003','D','Global Forest Watch',FALSE,4),
('bbbb0003-f006-0003-0003-000000000003','A','Two',FALSE,1),
('bbbb0003-f006-0003-0003-000000000003','B','Three',TRUE,2),
('bbbb0003-f006-0003-0003-000000000003','C','Four',FALSE,3),
('bbbb0003-f006-0003-0003-000000000003','D','Five',FALSE,4),
('bbbb0003-f007-0003-0003-000000000003','A','March 28th',FALSE,1),
('bbbb0003-f007-0003-0003-000000000003','B','April 14th',FALSE,2),
('bbbb0003-f007-0003-0003-000000000003','C','April 28th',TRUE,3),
('bbbb0003-f007-0003-0003-000000000003','D','May 12th',FALSE,4),
('bbbb0003-f008-0003-0003-000000000003','A','Literature review',FALSE,1),
('bbbb0003-f008-0003-0003-000000000003','B','Interview analysis',FALSE,2),
('bbbb0003-f008-0003-0003-000000000003','C','Satellite data analysis',TRUE,3),
('bbbb0003-f008-0003-0003-000000000003','D','Writing the conclusion',FALSE,4),
('bbbb0003-f009-0003-0003-000000000003','A','About twenty',FALSE,1),
('bbbb0003-f009-0003-0003-000000000003','B','About thirty',FALSE,2),
('bbbb0003-f009-0003-0003-000000000003','C','About forty',TRUE,3),
('bbbb0003-f009-0003-0003-000000000003','D','About fifty',FALSE,4),
('bbbb0003-f010-0003-0003-000000000003','A','Over 500 kilometres',FALSE,1),
('bbbb0003-f010-0003-0003-000000000003','B','Over 800 kilometres',FALSE,2),
('bbbb0003-f010-0003-0003-000000000003','C','Over 1,000 kilometres',TRUE,3),
('bbbb0003-f010-0003-0003-000000000003','D','Over 1,500 kilometres',FALSE,4);

-- ============================================
-- SECTION 4: Ocean Conservation Lecture (10 Qs)
-- Academic monologue
-- ============================================
INSERT INTO public.passages (id, title, content, module, audio_url, audio_duration_seconds, transcript, difficulty, exam_type) VALUES (
'bbbb0004-0004-0004-0004-000000000004',
'Section 4: Lecture on Ocean Conservation',
'',
'listening', '', 480,
E'Good afternoon. Today I want to talk about the current state of ocean conservation and the major challenges we face in protecting marine environments.\n\nLet me start with some sobering statistics. The world''s oceans cover approximately 71 percent of the Earth''s surface and contain 97 percent of all water on the planet. They produce over 50 percent of the world''s oxygen through photosynthesis by marine plants and phytoplankton. Yet despite their critical importance, only about 8 percent of the ocean is currently protected under marine conservation areas.\n\nThe most pressing threat to ocean health is plastic pollution. An estimated 8 million tonnes of plastic enter the oceans every year. That is equivalent to dumping a rubbish truck of plastic into the sea every single minute. Research published in the journal Science estimated that by 2050, there could be more plastic than fish in the ocean by weight. Microplastics — fragments smaller than five millimetres — have been found in every ocean and at every depth, from surface waters to the deepest trenches.\n\nOverfishing represents another critical challenge. The Food and Agriculture Organisation reports that approximately 34 percent of global fish stocks are now overfished, meaning they are being harvested at unsustainable rates. This has tripled since the 1970s. The collapse of the North Atlantic cod fishery in 1992 remains one of the most dramatic examples — a fishery that had sustained communities for five hundred years was destroyed in just two decades of industrial-scale fishing.\n\nOcean acidification, which I mentioned in our previous lecture, continues to accelerate. The ocean has absorbed roughly 30 percent of the carbon dioxide produced by human activities since the Industrial Revolution. This has caused ocean pH to decrease by 0.1 units — which may sound small, but actually represents a 26 percent increase in acidity. This change is occurring approximately ten times faster than any known change in ocean chemistry in the last 50 million years.\n\nThere are, however, reasons for cautious optimism. The establishment of large-scale marine protected areas has shown promising results. The Papahānaumokuākea Marine National Monument in Hawaii, covering over 1.5 million square kilometres, has led to significant recovery of fish populations and coral reef health. Similarly, a complete fishing ban around the Chagos Islands in the Indian Ocean resulted in a 250 percent increase in fish biomass within just five years.\n\nNew technologies are also helping conservation efforts. Satellite tracking of fishing vessels, underwater drones for reef monitoring, and environmental DNA sampling are all providing researchers with unprecedented data about ocean ecosystems. Artificial intelligence is being used to process satellite imagery and detect illegal fishing operations in real time.\n\nFor next week, I would like you to read chapters seven and eight of our textbook and prepare a two-thousand-word essay on one of the conservation strategies we discussed today. The essay is due by Friday the twenty-second.',
'hard', 'ielts'
);

INSERT INTO public.questions (id, passage_id, question_text, explanation, difficulty, sort_order) VALUES
('bbbb0004-f001-0004-0004-000000000004','bbbb0004-0004-0004-0004-000000000004','What percentage of the Earth''s surface do oceans cover?','Approximately 71 percent.','easy',1),
('bbbb0004-f002-0004-0004-000000000004','bbbb0004-0004-0004-0004-000000000004','What percentage of the ocean is currently protected?','About 8 percent.','medium',2),
('bbbb0004-f003-0004-0004-000000000004','bbbb0004-0004-0004-0004-000000000004','How much plastic enters the oceans every year?','An estimated 8 million tonnes.','medium',3),
('bbbb0004-f004-0004-0004-000000000004','bbbb0004-0004-0004-0004-000000000004','What size are microplastics defined as?','Smaller than five millimetres.','medium',4),
('bbbb0004-f005-0004-0004-000000000004','bbbb0004-0004-0004-0004-000000000004','What percentage of global fish stocks are overfished?','Approximately 34 percent.','medium',5),
('bbbb0004-f006-0004-0004-000000000004','bbbb0004-0004-0004-0004-000000000004','When did the North Atlantic cod fishery collapse?','In 1992.','medium',6),
('bbbb0004-f007-0004-0004-000000000004','bbbb0004-0004-0004-0004-000000000004','What percentage of human-produced CO2 has the ocean absorbed?','Roughly 30 percent.','hard',7),
('bbbb0004-f008-0004-0004-000000000004','bbbb0004-0004-0004-0004-000000000004','How large is the Papahānaumokuākea Marine National Monument?','Over 1.5 million square kilometres.','hard',8),
('bbbb0004-f009-0004-0004-000000000004','bbbb0004-0004-0004-0004-000000000004','By how much did fish biomass increase around the Chagos Islands?','250 percent within five years.','hard',9),
('bbbb0004-f010-0004-0004-000000000004','bbbb0004-0004-0004-0004-000000000004','How long should the essay be?','Two thousand words.','easy',10);

INSERT INTO public.options (question_id, option_label, option_text, is_correct, sort_order) VALUES
('bbbb0004-f001-0004-0004-000000000004','A','61 percent',FALSE,1),
('bbbb0004-f001-0004-0004-000000000004','B','71 percent',TRUE,2),
('bbbb0004-f001-0004-0004-000000000004','C','81 percent',FALSE,3),
('bbbb0004-f001-0004-0004-000000000004','D','66 percent',FALSE,4),
('bbbb0004-f002-0004-0004-000000000004','A','About 3 percent',FALSE,1),
('bbbb0004-f002-0004-0004-000000000004','B','About 8 percent',TRUE,2),
('bbbb0004-f002-0004-0004-000000000004','C','About 15 percent',FALSE,3),
('bbbb0004-f002-0004-0004-000000000004','D','About 20 percent',FALSE,4),
('bbbb0004-f003-0004-0004-000000000004','A','4 million tonnes',FALSE,1),
('bbbb0004-f003-0004-0004-000000000004','B','8 million tonnes',TRUE,2),
('bbbb0004-f003-0004-0004-000000000004','C','12 million tonnes',FALSE,3),
('bbbb0004-f003-0004-0004-000000000004','D','15 million tonnes',FALSE,4),
('bbbb0004-f004-0004-0004-000000000004','A','Smaller than 1 millimetre',FALSE,1),
('bbbb0004-f004-0004-0004-000000000004','B','Smaller than 5 millimetres',TRUE,2),
('bbbb0004-f004-0004-0004-000000000004','C','Smaller than 10 millimetres',FALSE,3),
('bbbb0004-f004-0004-0004-000000000004','D','Smaller than 2 millimetres',FALSE,4),
('bbbb0004-f005-0004-0004-000000000004','A','About 20 percent',FALSE,1),
('bbbb0004-f005-0004-0004-000000000004','B','About 34 percent',TRUE,2),
('bbbb0004-f005-0004-0004-000000000004','C','About 45 percent',FALSE,3),
('bbbb0004-f005-0004-0004-000000000004','D','About 50 percent',FALSE,4),
('bbbb0004-f006-0004-0004-000000000004','A','1985',FALSE,1),
('bbbb0004-f006-0004-0004-000000000004','B','1992',TRUE,2),
('bbbb0004-f006-0004-0004-000000000004','C','1998',FALSE,3),
('bbbb0004-f006-0004-0004-000000000004','D','2002',FALSE,4),
('bbbb0004-f007-0004-0004-000000000004','A','About 20 percent',FALSE,1),
('bbbb0004-f007-0004-0004-000000000004','B','About 30 percent',TRUE,2),
('bbbb0004-f007-0004-0004-000000000004','C','About 40 percent',FALSE,3),
('bbbb0004-f007-0004-0004-000000000004','D','About 50 percent',FALSE,4),
('bbbb0004-f008-0004-0004-000000000004','A','Over 500,000 square kilometres',FALSE,1),
('bbbb0004-f008-0004-0004-000000000004','B','Over 1.5 million square kilometres',TRUE,2),
('bbbb0004-f008-0004-0004-000000000004','C','Over 2.5 million square kilometres',FALSE,3),
('bbbb0004-f008-0004-0004-000000000004','D','Over 1 million square kilometres',FALSE,4),
('bbbb0004-f009-0004-0004-000000000004','A','150 percent',FALSE,1),
('bbbb0004-f009-0004-0004-000000000004','B','250 percent',TRUE,2),
('bbbb0004-f009-0004-0004-000000000004','C','350 percent',FALSE,3),
('bbbb0004-f009-0004-0004-000000000004','D','200 percent',FALSE,4),
('bbbb0004-f010-0004-0004-000000000004','A','One thousand words',FALSE,1),
('bbbb0004-f010-0004-0004-000000000004','B','Two thousand words',TRUE,2),
('bbbb0004-f010-0004-0004-000000000004','C','Three thousand words',FALSE,3),
('bbbb0004-f010-0004-0004-000000000004','D','Five hundred words',FALSE,4);

