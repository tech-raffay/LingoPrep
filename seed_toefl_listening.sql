-- ============================================
-- TOEFL iBT FULL LISTENING TEST — 17 Questions (3 Sections)
-- 1 Conversation + 2 Academic Lectures
-- Run in Supabase SQL Editor
-- ============================================

-- Clean old TOEFL listening seed data
DELETE FROM public.options WHERE question_id IN (SELECT id FROM public.questions WHERE passage_id IN ('dd010001-0001-0001-0001-000000000001','dd010002-0002-0002-0002-000000000002','dd010003-0003-0003-0003-000000000003'));
DELETE FROM public.questions WHERE passage_id IN ('dd010001-0001-0001-0001-000000000001','dd010002-0002-0002-0002-000000000002','dd010003-0003-0003-0003-000000000003');
DELETE FROM public.passages WHERE id IN ('dd010001-0001-0001-0001-000000000001','dd010002-0002-0002-0002-000000000002','dd010003-0003-0003-0003-000000000003');

-- ============================================
-- SECTION 1: Campus Conversation — Student and Librarian (5 Qs)
-- ============================================
INSERT INTO public.passages (id, title, content, module, audio_url, audio_duration_seconds, transcript, difficulty, exam_type) VALUES (
'dd010001-0001-0001-0001-000000000001',
'Conversation: Library Research Assistance',
'',
'listening', '', 180,
E'Student: Excuse me, I was wondering if you could help me. I need to find some sources for my research paper, and I''m having trouble with the online database.\n\nLibrarian: Of course. What subject is your paper on?\n\nStudent: It''s for my Environmental Science class. I''m writing about the effects of microplastics on freshwater ecosystems. My professor wants us to use at least five peer-reviewed journal articles.\n\nLibrarian: That''s a great topic. Have you tried using our main academic database, EcoSearch?\n\nStudent: I tried, but I kept getting thousands of results, and most of them weren''t really relevant to freshwater specifically. A lot of them were about ocean pollution.\n\nLibrarian: That''s a common problem. The key is to use more specific search terms. Instead of just searching for "microplastics," try combining terms like "microplastics" AND "freshwater" AND "ecosystem effects." You can also use the advanced search filters to limit results to articles published in the last ten years and only peer-reviewed sources.\n\nStudent: Oh, I didn''t know about the advanced filters. Can you show me where those are?\n\nLibrarian: Sure. See this panel on the left side? You can filter by date range, publication type, and even specific journals. For your topic, I''d recommend also checking the Journal of Environmental Quality and Freshwater Biology — they publish a lot of relevant research.\n\nStudent: That''s really helpful. One more question — my professor mentioned something about interlibrary loans. What exactly is that?\n\nLibrarian: If you find an article that our library doesn''t have full access to, you can request it through interlibrary loan. We''ll borrow it from another university''s library. It usually takes about three to five business days.\n\nStudent: That''s great. And is there a limit on how many I can request?\n\nLibrarian: No limit for students. Just submit the request through your library account online, and we''ll email you when it arrives. Also, I should mention that we offer research workshops every Tuesday afternoon. The next one covers advanced database searching techniques — it might be useful for you.\n\nStudent: That sounds perfect. I''ll definitely sign up for that. Thanks so much for your help!',
'medium', 'toefl'
);

INSERT INTO public.questions (id, passage_id, question_text, explanation, difficulty, sort_order) VALUES
('dd010001-f001-0001-0001-000000000001','dd010001-0001-0001-0001-000000000001','Why does the student visit the librarian?','The student needs help finding sources for a research paper and is having trouble with the database.','easy',1),
('dd010001-f002-0001-0001-000000000001','dd010001-0001-0001-0001-000000000001','What problem did the student have when searching the database?','The search returned too many irrelevant results, mostly about ocean pollution instead of freshwater.','easy',2),
('dd010001-f003-0001-0001-000000000001','dd010001-0001-0001-0001-000000000001','What does the librarian suggest to narrow the search results?','Use more specific search terms combined with AND operators and advanced filters.','medium',3),
('dd010001-f004-0001-0001-000000000001','dd010001-0001-0001-0001-000000000001','How long does an interlibrary loan typically take?','Three to five business days.','easy',4),
('dd010001-f005-0001-0001-000000000001','dd010001-0001-0001-0001-000000000001','What does the librarian recommend the student attend?','A research workshop on advanced database searching techniques held on Tuesdays.','medium',5);

INSERT INTO public.options (question_id, option_label, option_text, is_correct, sort_order) VALUES
('dd010001-f001-0001-0001-000000000001','A','To return an overdue book',FALSE,1),
('dd010001-f001-0001-0001-000000000001','B','To get help finding sources for a research paper',TRUE,2),
('dd010001-f001-0001-0001-000000000001','C','To register for a library card',FALSE,3),
('dd010001-f001-0001-0001-000000000001','D','To complain about the database being offline',FALSE,4),
('dd010001-f002-0001-0001-000000000001','A','The database was offline',FALSE,1),
('dd010001-f002-0001-0001-000000000001','B','She could not log into her account',FALSE,2),
('dd010001-f002-0001-0001-000000000001','C','The search returned too many irrelevant results about ocean pollution',TRUE,3),
('dd010001-f002-0001-0001-000000000001','D','All the articles required payment',FALSE,4),
('dd010001-f003-0001-0001-000000000001','A','Search in a different database entirely',FALSE,1),
('dd010001-f003-0001-0001-000000000001','B','Ask the professor for a list of articles',FALSE,2),
('dd010001-f003-0001-0001-000000000001','C','Use combined specific search terms and advanced filters',TRUE,3),
('dd010001-f003-0001-0001-000000000001','D','Browse the physical bookshelves instead',FALSE,4),
('dd010001-f004-0001-0001-000000000001','A','One to two days',FALSE,1),
('dd010001-f004-0001-0001-000000000001','B','Three to five business days',TRUE,2),
('dd010001-f004-0001-0001-000000000001','C','One to two weeks',FALSE,3),
('dd010001-f004-0001-0001-000000000001','D','It depends on the professor''s approval',FALSE,4),
('dd010001-f005-0001-0001-000000000001','A','A writing center consultation',FALSE,1),
('dd010001-f005-0001-0001-000000000001','B','A campus tour',FALSE,2),
('dd010001-f005-0001-0001-000000000001','C','A research workshop on advanced database searching',TRUE,3),
('dd010001-f005-0001-0001-000000000001','D','A meeting with the department chair',FALSE,4);

-- ============================================
-- SECTION 2: Academic Lecture — Plate Tectonics (6 Qs)
-- ============================================
INSERT INTO public.passages (id, title, content, module, audio_url, audio_duration_seconds, transcript, difficulty, exam_type) VALUES (
'dd010002-0002-0002-0002-000000000002',
'Lecture: Plate Tectonics and Continental Drift',
'',
'listening', '', 300,
E'Professor: Good morning, everyone. Today we''re going to continue our discussion of geological processes by looking at one of the most important theories in Earth science — plate tectonics. Now, the idea that continents move is something we take for granted today, but it was actually quite controversial when it was first proposed.\n\nThe story really begins with Alfred Wegener, a German meteorologist, who in 1912 proposed what he called "continental drift." Wegener noticed that the coastlines of South America and Africa fit together like pieces of a jigsaw puzzle. He also found identical fossil species on continents separated by vast oceans — for example, the fossil of a freshwater reptile called Mesosaurus was found in both Brazil and South Africa. These couldn''t have swum across the Atlantic Ocean, so Wegener argued that the continents must have once been joined together in a single supercontinent he called Pangaea.\n\nNow, here''s the problem. Wegener couldn''t explain HOW the continents moved. He suggested they plowed through the ocean floor like ships through water, but geologists quickly pointed out that continental rock isn''t strong enough to do that. Without a convincing mechanism, most scientists rejected his theory for decades.\n\nThe breakthrough came in the 1950s and 1960s with the discovery of seafloor spreading. Scientists using sonar to map the ocean floor discovered a massive underwater mountain chain — the Mid-Atlantic Ridge — running down the center of the Atlantic Ocean. Harry Hess, a Princeton geologist, proposed that new oceanic crust was being created at these ridges as magma rose from the Earth''s mantle, pushed apart the existing seafloor, and solidified. This meant the ocean floor wasn''t permanent — it was constantly being created and destroyed.\n\nThe evidence for this was compelling. Researchers found that the rocks closest to the mid-ocean ridges were younger, and they got progressively older the farther they were from the ridge. They also discovered that the magnetic orientation of minerals in the seafloor formed symmetrical striped patterns on either side of the ridge, matching reversals in Earth''s magnetic field recorded in the rock.\n\nSo by the late 1960s, these discoveries were synthesized into the theory of plate tectonics. The Earth''s outer shell — the lithosphere — is divided into about fifteen major tectonic plates that float on the partially molten asthenosphere below. These plates move at rates of about two to ten centimeters per year — roughly the speed at which your fingernails grow.\n\nThere are three types of plate boundaries. At divergent boundaries, plates move apart, and new crust is formed — like at the Mid-Atlantic Ridge. At convergent boundaries, plates collide. When an oceanic plate meets a continental plate, the denser oceanic plate is forced beneath the continental plate in a process called subduction, which creates deep ocean trenches and volcanic mountain chains like the Andes. At transform boundaries, plates slide past each other horizontally — the San Andreas Fault in California is a famous example.\n\nWhat drives this movement? The most widely accepted explanation is convection currents in the mantle. Heat from the Earth''s core causes the semi-liquid rock in the mantle to circulate slowly — hot material rises, spreads laterally, cools, and sinks back down. These convection cells drag the tectonic plates along with them. However, recent research suggests that the weight of subducting plates — what we call "slab pull" — may actually be a more significant driving force than convection alone.\n\nPlate tectonics explains an enormous range of geological phenomena — earthquakes, volcanoes, mountain formation, the distribution of fossils, and even long-term climate change. It''s truly one of the unifying theories of Earth science.',
'hard', 'toefl'
);

INSERT INTO public.questions (id, passage_id, question_text, explanation, difficulty, sort_order) VALUES
('dd010002-f001-0002-0002-000000000002','dd010002-0002-0002-0002-000000000002','What evidence did Alfred Wegener use to support his continental drift hypothesis?','Matching coastlines of South America and Africa, and identical fossils found on both continents.','easy',1),
('dd010002-f002-0002-0002-000000000002','dd010002-0002-0002-0002-000000000002','Why was Wegener''s theory rejected by most scientists initially?','He could not explain the mechanism — how continents actually moved.','medium',2),
('dd010002-f003-0002-0002-000000000002','dd010002-0002-0002-0002-000000000002','What is seafloor spreading?','The process where new oceanic crust is created at mid-ocean ridges as magma rises and solidifies.','medium',3),
('dd010002-f004-0002-0002-000000000002','dd010002-0002-0002-0002-000000000002','What evidence supported the theory of seafloor spreading?','Rocks near ridges were younger, and magnetic stripe patterns were symmetrical on both sides.','hard',4),
('dd010002-f005-0002-0002-000000000002','dd010002-0002-0002-0002-000000000002','What happens at a convergent boundary when an oceanic plate meets a continental plate?','The denser oceanic plate is forced beneath the continental plate in a process called subduction.','medium',5),
('dd010002-f006-0002-0002-000000000002','dd010002-0002-0002-0002-000000000002','According to the professor, what may be a more significant driving force of plate movement than convection?','Slab pull — the weight of subducting plates pulling the rest of the plate with them.','hard',6);

INSERT INTO public.options (question_id, option_label, option_text, is_correct, sort_order) VALUES
('dd010002-f001-0002-0002-000000000002','A','Earthquake patterns along coastlines',FALSE,1),
('dd010002-f001-0002-0002-000000000002','B','Matching coastlines and identical fossils on separated continents',TRUE,2),
('dd010002-f001-0002-0002-000000000002','C','Satellite measurements of continental movement',FALSE,3),
('dd010002-f001-0002-0002-000000000002','D','Chemical analysis of ocean water',FALSE,4),
('dd010002-f002-0002-0002-000000000002','A','The fossil evidence was shown to be incorrect',FALSE,1),
('dd010002-f002-0002-0002-000000000002','B','The coastlines did not actually fit together',FALSE,2),
('dd010002-f002-0002-0002-000000000002','C','He could not explain the mechanism of how continents moved',TRUE,3),
('dd010002-f002-0002-0002-000000000002','D','Other scientists had already proposed the same theory',FALSE,4),
('dd010002-f003-0002-0002-000000000002','A','The erosion of continental coastlines by ocean waves',FALSE,1),
('dd010002-f003-0002-0002-000000000002','B','New oceanic crust being created at mid-ocean ridges as magma rises',TRUE,2),
('dd010002-f003-0002-0002-000000000002','C','The sinking of continental shelves into the ocean',FALSE,3),
('dd010002-f003-0002-0002-000000000002','D','Volcanic islands forming in the middle of oceans',FALSE,4),
('dd010002-f004-0002-0002-000000000002','A','Fossils of marine creatures found on mountain tops',FALSE,1),
('dd010002-f004-0002-0002-000000000002','B','The temperature of water near ocean ridges',FALSE,2),
('dd010002-f004-0002-0002-000000000002','C','Younger rocks near ridges and symmetrical magnetic stripe patterns',TRUE,3),
('dd010002-f004-0002-0002-000000000002','D','The depth of the ocean at various points',FALSE,4),
('dd010002-f005-0002-0002-000000000002','A','They merge to form a larger plate',FALSE,1),
('dd010002-f005-0002-0002-000000000002','B','The oceanic plate is forced beneath the continental plate through subduction',TRUE,2),
('dd010002-f005-0002-0002-000000000002','C','Both plates are destroyed and new ones form',FALSE,3),
('dd010002-f005-0002-0002-000000000002','D','The continental plate slides under the oceanic plate',FALSE,4),
('dd010002-f006-0002-0002-000000000002','A','Tidal forces from the Moon',FALSE,1),
('dd010002-f006-0002-0002-000000000002','B','Wind erosion on exposed rock surfaces',FALSE,2),
('dd010002-f006-0002-0002-000000000002','C','Solar radiation heating the Earth''s surface',FALSE,3),
('dd010002-f006-0002-0002-000000000002','D','Slab pull — the weight of subducting plates',TRUE,4);

-- ============================================
-- SECTION 3: Academic Lecture — Psychology of Decision-Making (6 Qs)
-- ============================================
INSERT INTO public.passages (id, title, content, module, audio_url, audio_duration_seconds, transcript, difficulty, exam_type) VALUES (
'dd010003-0003-0003-0003-000000000003',
'Lecture: The Psychology of Decision-Making',
'',
'listening', '', 300,
E'Professor: Today I want to talk about something that affects every single one of you, every day — how you make decisions. And specifically, I want to discuss why the decisions we make are often not as rational as we think they are.\n\nLet''s start with a concept called the anchoring effect. Here''s a classic experiment. Researchers asked participants to spin a wheel that was rigged to land on either 10 or 65. Then they asked: "Is the percentage of African countries in the United Nations higher or lower than the number you just saw?" And then: "What is the actual percentage?" Now, the number on the wheel was completely random and irrelevant to the question. But participants who saw the number 65 consistently gave higher estimates — around 45 percent — while those who saw 10 estimated around 25 percent. The arbitrary number anchored their judgment.\n\nThis happens in everyday life constantly. Real estate agents show you an overpriced house first, and suddenly the next house — which is still expensive — seems like a bargain. Stores mark up prices and then offer "50 percent off," anchoring your perception of value to the inflated original price.\n\nAnother powerful bias is the availability heuristic. We tend to judge the probability of events based on how easily examples come to mind. After seeing news coverage of a plane crash, people dramatically overestimate the risk of flying, even though statistically, driving is far more dangerous. The vivid, emotional nature of the plane crash makes it readily available in memory, distorting our risk assessment.\n\nThen there''s confirmation bias — our tendency to seek out, interpret, and remember information that confirms what we already believe, while ignoring or dismissing evidence that contradicts our existing views. This is particularly relevant in the age of social media, where algorithms feed us content that aligns with our preferences, creating what researchers call "echo chambers" or "filter bubbles."\n\nNow, here''s where it gets really interesting. These biases don''t just affect individuals — they affect groups, organizations, and even entire societies. Groupthink is a phenomenon where the desire for conformity in a group leads to irrational or dysfunctional decision-making. Members suppress dissenting opinions, fail to critically evaluate alternatives, and develop an illusion of invulnerability. The Bay of Pigs invasion and the Challenger space shuttle disaster are frequently cited as examples of catastrophic decisions driven by groupthink.\n\nSo, can we overcome these biases? The research suggests that simply knowing about them isn''t enough. Awareness helps, but it doesn''t eliminate the biases. What does help is implementing structural safeguards — things like requiring devil''s advocates in group meetings, using checklists and standardized procedures for important decisions, and deliberately seeking out disconfirming evidence before making judgments.\n\nOne particularly effective technique is called "pre-mortem analysis." Before making a decision, you imagine that the decision has already been implemented and has failed catastrophically. Then you work backward to identify what could have gone wrong. This technique leverages our natural ability to generate explanations for events and helps teams identify potential problems they might otherwise overlook due to overconfidence or groupthink.',
'hard', 'toefl'
);

INSERT INTO public.questions (id, passage_id, question_text, explanation, difficulty, sort_order) VALUES
('dd010003-f001-0003-0003-000000000003','dd010003-0003-0003-0003-000000000003','What does the anchoring effect experiment with the spinning wheel demonstrate?','That arbitrary initial numbers influence subsequent numerical estimates, even when irrelevant.','medium',1),
('dd010003-f002-0003-0003-000000000003','dd010003-0003-0003-0003-000000000003','Why does the professor mention real estate agents and store pricing?','As real-world examples of how the anchoring effect is used in everyday commercial situations.','medium',2),
('dd010003-f003-0003-0003-000000000003','dd010003-0003-0003-0003-000000000003','According to the lecture, what is the availability heuristic?','Judging probability based on how easily examples come to mind, which can distort risk assessment.','medium',3),
('dd010003-f004-0003-0003-000000000003','dd010003-0003-0003-0003-000000000003','What does the professor say about confirmation bias and social media?','Algorithms create echo chambers by feeding content that confirms existing beliefs.','medium',4),
('dd010003-f005-0003-0003-000000000003','dd010003-0003-0003-0003-000000000003','According to the professor, what is NOT an effective way to overcome cognitive biases?','Simply being aware of biases is not enough to eliminate them.','hard',5),
('dd010003-f006-0003-0003-000000000003','dd010003-0003-0003-0003-000000000003','What is a "pre-mortem analysis" as described in the lecture?','Imagining a decision has already failed and working backward to identify what went wrong.','hard',6);

INSERT INTO public.options (question_id, option_label, option_text, is_correct, sort_order) VALUES
('dd010003-f001-0003-0003-000000000003','A','People are good at estimating percentages accurately',FALSE,1),
('dd010003-f001-0003-0003-000000000003','B','Random initial numbers influence subsequent estimates even when irrelevant',TRUE,2),
('dd010003-f001-0003-0003-000000000003','C','Spinning wheels produce biased results',FALSE,3),
('dd010003-f001-0003-0003-000000000003','D','Knowledge of African geography varies by age group',FALSE,4),
('dd010003-f002-0003-0003-000000000003','A','To show that salespeople are dishonest',FALSE,1),
('dd010003-f002-0003-0003-000000000003','B','As real-world examples of the anchoring effect in commercial situations',TRUE,2),
('dd010003-f002-0003-0003-000000000003','C','To argue that consumers should avoid stores',FALSE,3),
('dd010003-f002-0003-0003-000000000003','D','To explain how housing prices are determined',FALSE,4),
('dd010003-f003-0003-0003-000000000003','A','A mathematical formula for calculating risk',FALSE,1),
('dd010003-f003-0003-0003-000000000003','B','Judging probability based on how easily examples come to mind',TRUE,2),
('dd010003-f003-0003-0003-000000000003','C','A technique for improving memory recall',FALSE,3),
('dd010003-f003-0003-0003-000000000003','D','The tendency to avoid making any decisions',FALSE,4),
('dd010003-f004-0003-0003-000000000003','A','Social media helps people overcome their biases',FALSE,1),
('dd010003-f004-0003-0003-000000000003','B','Confirmation bias does not apply to digital content',FALSE,2),
('dd010003-f004-0003-0003-000000000003','C','Algorithms create echo chambers by feeding content that confirms existing beliefs',TRUE,3),
('dd010003-f004-0003-0003-000000000003','D','People are more critical of information they read online',FALSE,4),
('dd010003-f005-0003-0003-000000000003','A','Requiring devil''s advocates in group meetings',FALSE,1),
('dd010003-f005-0003-0003-000000000003','B','Using checklists for important decisions',FALSE,2),
('dd010003-f005-0003-0003-000000000003','C','Simply being aware that biases exist',TRUE,3),
('dd010003-f005-0003-0003-000000000003','D','Deliberately seeking disconfirming evidence',FALSE,4),
('dd010003-f006-0003-0003-000000000003','A','Analyzing a decision after it has already been implemented',FALSE,1),
('dd010003-f006-0003-0003-000000000003','B','Imagining a decision has already failed and working backward to identify causes',TRUE,2),
('dd010003-f006-0003-0003-000000000003','C','Voting on whether a decision is likely to succeed',FALSE,3),
('dd010003-f006-0003-0003-000000000003','D','Comparing the decision to similar past situations',FALSE,4);
