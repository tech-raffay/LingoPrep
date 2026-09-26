-- ============================================
-- IELTS FULL READING TEST — 40 Questions (3 Passages)
-- Realistic mix of official IELTS question types
-- Run in Supabase SQL Editor AFTER migration_reading_question_types.sql
-- ============================================

-- Clean old IELTS reading seed data
DELETE FROM public.options WHERE question_id IN (
  SELECT id FROM public.questions WHERE passage_id IN (
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    'aaaa0001-0001-0001-0001-000000000001',
    'aaaa0002-0002-0002-0002-000000000002',
    'aaaa0003-0003-0003-0003-000000000003',
    'bb000001-0001-0001-0001-000000000001',
    'bb000002-0002-0002-0002-000000000002',
    'bb000003-0003-0003-0003-000000000003'
  )
);
DELETE FROM public.questions WHERE passage_id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  'aaaa0001-0001-0001-0001-000000000001',
  'aaaa0002-0002-0002-0002-000000000002',
  'aaaa0003-0003-0003-0003-000000000003',
  'bb000001-0001-0001-0001-000000000001',
  'bb000002-0002-0002-0002-000000000002',
  'bb000003-0003-0003-0003-000000000003'
);
DELETE FROM public.passages WHERE id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  'aaaa0001-0001-0001-0001-000000000001',
  'aaaa0002-0002-0002-0002-000000000002',
  'aaaa0003-0003-0003-0003-000000000003',
  'bb000001-0001-0001-0001-000000000001',
  'bb000002-0002-0002-0002-000000000002',
  'bb000003-0003-0003-0003-000000000003'
);

-- ============================================
-- PASSAGE 1: The Development of the Electric Telegraph
-- Questions 1–13 (Matching Headings + TFNG + Sentence Completion)
-- ============================================

INSERT INTO public.passages (id, title, content, module, word_count, difficulty, exam_type) VALUES (
'bb000001-0001-0001-0001-000000000001',
'The Development of the Electric Telegraph',
E'A. The electric telegraph, one of the most transformative inventions of the 19th century, had its origins in the scientific discoveries of the late 18th and early 19th centuries. The Italian scientist Alessandro Volta''s invention of the voltaic pile in 1800 provided the first reliable source of continuous electric current, while Hans Christian Oersted''s 1820 demonstration that electric current could deflect a magnetic needle established the crucial link between electricity and magnetism that would make telegraphy possible.\n\nB. Several inventors in different countries worked on electromagnetic telegraph systems during the 1830s. In England, William Fothergill Cooke and Charles Wheatstone patented a five-needle telegraph system in 1837, which used deflecting needles to point to letters on a board. Meanwhile, in the United States, Samuel Morse, along with his assistant Alfred Vail, developed a simpler single-wire system that used an electromagnet to emboss marks on a paper tape. Morse''s system would ultimately prove more practical and economical than its competitors.\n\nC. The key to Morse''s success lay not just in his hardware but in his development of Morse code — an elegant system of dots and dashes representing letters and numbers. This encoding scheme was remarkably efficient: the most commonly used letters in English, such as ''E'' (a single dot) and ''T'' (a single dash), were given the shortest codes. This innovation dramatically increased the speed at which messages could be transmitted and decoded.\n\nD. The first major demonstration of the telegraph''s potential occurred on 24 May 1844, when Morse sent the message "What hath God wrought" from the US Capitol in Washington to a railway station in Baltimore, a distance of approximately 60 kilometres. This successful transmission captured the public imagination and led to a rapid expansion of telegraph networks across the United States. By 1850, more than 19,000 kilometres of telegraph wire had been strung across the country.\n\nE. The commercial impact of the telegraph was profound. For the first time in human history, information could travel faster than any physical means of transport. News agencies such as Reuters and the Associated Press were founded specifically to exploit the telegraph''s capabilities. Stock exchanges were connected by telegraph wire, enabling the creation of national and eventually international financial markets. Businesses could coordinate operations across vast distances in near real-time.\n\nF. Perhaps the most ambitious telegraph project was the laying of the first transatlantic cable. After several failed attempts, including a cable that functioned for only three weeks in 1858, a permanent connection between Europe and North America was finally established in 1866. The engineer responsible for this achievement was Cyrus Field, who spent over a decade and overcame enormous financial and technical obstacles to complete the project. The Great Eastern, the largest ship in the world at the time, was employed to lay the cable across the ocean floor.\n\nG. Although the telegraph was eventually superseded by the telephone, radio, and digital communications, its impact on society was immeasurable. It collapsed distances, accelerated the pace of commerce and journalism, and fundamentally altered how governments, militaries, and ordinary citizens communicated. Many historians regard the telegraph as the first true information technology — the ancestor of every networked communication system that followed.',
'reading', 520, 'medium', 'ielts'
);

-- ── Questions 1–5: Matching Headings ──
INSERT INTO public.questions (id, passage_id, question_text, question_type, question_group_label, question_data, correct_answer_text, explanation, difficulty, sort_order) VALUES
('bb010001-0001-0001-0001-000000000001','bb000001-0001-0001-0001-000000000001','Paragraph B','matching_headings','Questions 1–5: Matching Headings','{"headings":[{"label":"i","text":"The birth of a communication code"},{"label":"ii","text":"A lasting legacy for modern technology"},{"label":"iii","text":"Scientific foundations of the telegraph"},{"label":"iv","text":"Competing inventors and rival systems"},{"label":"v","text":"The telegraph transforms business and media"},{"label":"vi","text":"A historic first message"},{"label":"vii","text":"Connecting continents beneath the ocean"},{"label":"viii","text":"Government regulation of telegraph companies"}]}','iv','Paragraph B discusses Cooke, Wheatstone, Morse, and Vail working on competing systems.','medium',1),
('bb010002-0001-0001-0001-000000000001','bb000001-0001-0001-0001-000000000001','Paragraph C','matching_headings','Questions 1–5: Matching Headings','{"headings":[{"label":"i","text":"The birth of a communication code"},{"label":"ii","text":"A lasting legacy for modern technology"},{"label":"iii","text":"Scientific foundations of the telegraph"},{"label":"iv","text":"Competing inventors and rival systems"},{"label":"v","text":"The telegraph transforms business and media"},{"label":"vi","text":"A historic first message"},{"label":"vii","text":"Connecting continents beneath the ocean"},{"label":"viii","text":"Government regulation of telegraph companies"}]}','i','Paragraph C focuses on Morse code development.','medium',2),
('bb010003-0001-0001-0001-000000000001','bb000001-0001-0001-0001-000000000001','Paragraph D','matching_headings','Questions 1–5: Matching Headings','{"headings":[{"label":"i","text":"The birth of a communication code"},{"label":"ii","text":"A lasting legacy for modern technology"},{"label":"iii","text":"Scientific foundations of the telegraph"},{"label":"iv","text":"Competing inventors and rival systems"},{"label":"v","text":"The telegraph transforms business and media"},{"label":"vi","text":"A historic first message"},{"label":"vii","text":"Connecting continents beneath the ocean"},{"label":"viii","text":"Government regulation of telegraph companies"}]}','vi','Paragraph D describes the first public message sent on 24 May 1844.','easy',3),
('bb010004-0001-0001-0001-000000000001','bb000001-0001-0001-0001-000000000001','Paragraph E','matching_headings','Questions 1–5: Matching Headings','{"headings":[{"label":"i","text":"The birth of a communication code"},{"label":"ii","text":"A lasting legacy for modern technology"},{"label":"iii","text":"Scientific foundations of the telegraph"},{"label":"iv","text":"Competing inventors and rival systems"},{"label":"v","text":"The telegraph transforms business and media"},{"label":"vi","text":"A historic first message"},{"label":"vii","text":"Connecting continents beneath the ocean"},{"label":"viii","text":"Government regulation of telegraph companies"}]}','v','Paragraph E discusses impact on news agencies, stock exchanges, and business.','medium',4),
('bb010005-0001-0001-0001-000000000001','bb000001-0001-0001-0001-000000000001','Paragraph F','matching_headings','Questions 1–5: Matching Headings','{"headings":[{"label":"i","text":"The birth of a communication code"},{"label":"ii","text":"A lasting legacy for modern technology"},{"label":"iii","text":"Scientific foundations of the telegraph"},{"label":"iv","text":"Competing inventors and rival systems"},{"label":"v","text":"The telegraph transforms business and media"},{"label":"vi","text":"A historic first message"},{"label":"vii","text":"Connecting continents beneath the ocean"},{"label":"viii","text":"Government regulation of telegraph companies"}]}','vii','Paragraph F describes the transatlantic cable project.','medium',5);

-- ── Questions 6–9: True / False / Not Given ──
INSERT INTO public.questions (id, passage_id, question_text, question_type, question_group_label, correct_answer_text, explanation, difficulty, sort_order) VALUES
('bb010006-0001-0001-0001-000000000001','bb000001-0001-0001-0001-000000000001','Volta''s invention provided an intermittent source of electric current.','tfng','Questions 6–9: True / False / Not Given','','The passage says "reliable source of continuous electric current," so intermittent is FALSE.','medium',6),
('bb010007-0001-0001-0001-000000000001','bb000001-0001-0001-0001-000000000001','Morse code assigned shorter codes to more frequently used letters.','tfng','Questions 6–9: True / False / Not Given','','The passage states the most commonly used letters were given the shortest codes — TRUE.','easy',7),
('bb010008-0001-0001-0001-000000000001','bb000001-0001-0001-0001-000000000001','The first transatlantic cable in 1858 remained operational for several years.','tfng','Questions 6–9: True / False / Not Given','','The passage says it "functioned for only three weeks" — FALSE.','medium',8),
('bb010009-0001-0001-0001-000000000001','bb000001-0001-0001-0001-000000000001','Morse received formal training in electrical engineering before building his telegraph.','tfng','Questions 6–9: True / False / Not Given','','The passage does not mention Morse''s educational background — NOT GIVEN.','hard',9);

-- TFNG Options (Questions 6–9)
INSERT INTO public.options (question_id, option_label, option_text, is_correct, sort_order) VALUES
('bb010006-0001-0001-0001-000000000001','A','TRUE',FALSE,1),
('bb010006-0001-0001-0001-000000000001','B','FALSE',TRUE,2),
('bb010006-0001-0001-0001-000000000001','C','NOT GIVEN',FALSE,3),
('bb010007-0001-0001-0001-000000000001','A','TRUE',TRUE,1),
('bb010007-0001-0001-0001-000000000001','B','FALSE',FALSE,2),
('bb010007-0001-0001-0001-000000000001','C','NOT GIVEN',FALSE,3),
('bb010008-0001-0001-0001-000000000001','A','TRUE',FALSE,1),
('bb010008-0001-0001-0001-000000000001','B','FALSE',TRUE,2),
('bb010008-0001-0001-0001-000000000001','C','NOT GIVEN',FALSE,3),
('bb010009-0001-0001-0001-000000000001','A','TRUE',FALSE,1),
('bb010009-0001-0001-0001-000000000001','B','FALSE',FALSE,2),
('bb010009-0001-0001-0001-000000000001','C','NOT GIVEN',TRUE,3);

-- ── Questions 10–13: Sentence Completion ──
INSERT INTO public.questions (id, passage_id, question_text, question_type, question_group_label, question_data, correct_answer_text, explanation, difficulty, sort_order) VALUES
('bb010010-0001-0001-0001-000000000001','bb000001-0001-0001-0001-000000000001','Oersted showed that electric current could deflect a ______.','sentence_completion','Questions 10–13: Sentence Completion','{"max_words":2}','magnetic needle','The passage states Oersted demonstrated that current could deflect a magnetic needle.','easy',10),
('bb010011-0001-0001-0001-000000000001','bb000001-0001-0001-0001-000000000001','By 1850, over 19,000 kilometres of ______ had been installed across the United States.','sentence_completion','Questions 10–13: Sentence Completion','{"max_words":2}','telegraph wire','The passage says more than 19,000 km of telegraph wire had been strung.','easy',11),
('bb010012-0001-0001-0001-000000000001','bb000001-0001-0001-0001-000000000001','The ship used to lay the transatlantic cable was called ______.','sentence_completion','Questions 10–13: Sentence Completion','{"max_words":3}','the Great Eastern|Great Eastern','The passage identifies the Great Eastern as the ship.','medium',12),
('bb010013-0001-0001-0001-000000000001','bb000001-0001-0001-0001-000000000001','The engineer who led the transatlantic cable project was ______.','sentence_completion','Questions 10–13: Sentence Completion','{"max_words":2}','Cyrus Field','The passage names Cyrus Field as the responsible engineer.','easy',13);


-- ============================================
-- PASSAGE 2: Bioluminescence in the Deep Sea
-- Questions 14–26 (Multiple Choice + Matching Features + Table Completion)
-- ============================================

INSERT INTO public.passages (id, title, content, module, word_count, difficulty, exam_type) VALUES (
'bb000002-0002-0002-0002-000000000002',
'Bioluminescence in the Deep Sea',
E'In the perpetual darkness of the deep ocean, thousands of species have evolved the remarkable ability to produce their own light — a phenomenon known as bioluminescence. Below 200 metres, where sunlight fails to penetrate, an estimated 76 percent of all ocean creatures possess some form of bioluminescent capability. Far from being a curiosity, the production of light is arguably the most widespread form of communication in the animal kingdom.\n\nBioluminescence is a chemical process. It occurs when a molecule called luciferin reacts with oxygen in the presence of an enzyme called luciferase. This reaction produces energy in the form of light with remarkably little heat — making it one of the most efficient light-producing processes known to science. Different organisms produce different colours of light depending on the specific chemistry involved: most deep-sea creatures emit blue or green light, which travels furthest through water, while some species near the surface produce red or yellow light.\n\nOne of the most common uses of bioluminescence in the deep sea is defence. Many species use a strategy known as counterillumination, in which they produce light on their undersides to match the faint downwelling light from above. This effectively eliminates their silhouette when viewed from below, making them nearly invisible to predators swimming beneath them. The hatchetfish is a classic example of this strategy, using rows of photophores along its belly to blend with the dim light filtering from the surface.\n\nOther organisms use bioluminescence offensively, as a hunting tool. The anglerfish is perhaps the most famous example: it possesses a modified dorsal spine tipped with a luminous lure, which it dangles in front of its enormous jaws to attract prey. The bioluminescent bacteria that inhabit this lure have a symbiotic relationship with the anglerfish, receiving nutrients in exchange for providing light. Deep-sea dragonfish, by contrast, produce their own red light using a unique chemistry that most other deep-sea creatures cannot see, allowing them to illuminate and hunt prey without being detected.\n\nBioluminescence also serves as a means of communication between members of the same species. Certain species of squid and octopus use complex patterns of flashing light to signal potential mates or warn rivals. The firefly squid of Japan''s Toyama Bay is renowned for its spectacular displays during mating season, when millions of individuals create a dazzling light show visible from the shore.\n\nBeyond defence, predation, and communication, some organisms use bioluminescence as a burglar alarm. When attacked by a predator, certain jellyfish and small crustaceans release bursts of bioluminescent particles into the water. This sudden flash of light attracts the attention of larger predators, which may in turn attack the original predator — giving the prey a chance to escape. This strategy effectively turns the attacker''s aggression against it.\n\nScientists continue to find new applications for bioluminescent chemistry. The gene for green fluorescent protein (GFP), originally isolated from the jellyfish Aequorea victoria, has become one of the most important tools in modern biology. Researchers use GFP to tag and track proteins, cells, and even entire organisms, allowing them to observe biological processes in living systems in real time. The discovery and development of GFP earned Osamu Shimomura, Martin Chalfie, and Roger Tsien the Nobel Prize in Chemistry in 2008.',
'reading', 520, 'medium', 'ielts'
);

-- ── Questions 14–17: Multiple Choice ──
INSERT INTO public.questions (id, passage_id, question_text, question_type, question_group_label, correct_answer_text, explanation, difficulty, sort_order) VALUES
('bb020001-0002-0002-0002-000000000001','bb000002-0002-0002-0002-000000000002','What percentage of ocean creatures below 200 metres have bioluminescent capability?','multiple_choice','Questions 14–17: Multiple Choice','','The passage states an estimated 76 percent.','easy',14),
('bb020002-0002-0002-0002-000000000001','bb000002-0002-0002-0002-000000000002','According to the passage, what makes bioluminescence an efficient process?','multiple_choice','Questions 14–17: Multiple Choice','','The passage states it produces light with remarkably little heat.','medium',15),
('bb020003-0002-0002-0002-000000000001','bb000002-0002-0002-0002-000000000002','Why do most deep-sea creatures emit blue or green light?','multiple_choice','Questions 14–17: Multiple Choice','','Because it travels furthest through water.','medium',16),
('bb020004-0002-0002-0002-000000000001','bb000002-0002-0002-0002-000000000002','What did the discovery of GFP lead to?','multiple_choice','Questions 14–17: Multiple Choice','','It earned the Nobel Prize in Chemistry in 2008.','medium',17);

INSERT INTO public.options (question_id, option_label, option_text, is_correct, sort_order) VALUES
('bb020001-0002-0002-0002-000000000001','A','50 percent',FALSE,1),
('bb020001-0002-0002-0002-000000000001','B','66 percent',FALSE,2),
('bb020001-0002-0002-0002-000000000001','C','76 percent',TRUE,3),
('bb020001-0002-0002-0002-000000000001','D','90 percent',FALSE,4),
('bb020002-0002-0002-0002-000000000001','A','It uses solar energy',FALSE,1),
('bb020002-0002-0002-0002-000000000001','B','It produces light with very little heat',TRUE,2),
('bb020002-0002-0002-0002-000000000001','C','It requires no chemical reaction',FALSE,3),
('bb020002-0002-0002-0002-000000000001','D','It only works in cold water',FALSE,4),
('bb020003-0002-0002-0002-000000000001','A','These colours are the easiest to produce chemically',FALSE,1),
('bb020003-0002-0002-0002-000000000001','B','These colours attract the most prey',FALSE,2),
('bb020003-0002-0002-0002-000000000001','C','These colours travel furthest through water',TRUE,3),
('bb020003-0002-0002-0002-000000000001','D','Predators cannot detect these colours',FALSE,4),
('bb020004-0002-0002-0002-000000000001','A','A cure for deep-sea pollution',FALSE,1),
('bb020004-0002-0002-0002-000000000001','B','Improved fishing technology',FALSE,2),
('bb020004-0002-0002-0002-000000000001','C','A Nobel Prize in Chemistry in 2008',TRUE,3),
('bb020004-0002-0002-0002-000000000001','D','New sources of renewable energy',FALSE,4);

-- ── Questions 18–22: Matching Features ──
INSERT INTO public.questions (id, passage_id, question_text, question_type, question_group_label, question_data, correct_answer_text, explanation, difficulty, sort_order) VALUES
('bb020005-0002-0002-0002-000000000001','bb000002-0002-0002-0002-000000000002','uses a luminous lure attached to a modified spine to attract prey','matching_features','Questions 18–22: Matching Features','{"features":[{"label":"A","text":"Hatchetfish"},{"label":"B","text":"Anglerfish"},{"label":"C","text":"Deep-sea dragonfish"},{"label":"D","text":"Firefly squid"},{"label":"E","text":"Jellyfish and crustaceans"}]}','B','The passage describes the anglerfish''s modified dorsal spine tipped with a luminous lure.','easy',18),
('bb020006-0002-0002-0002-000000000001','bb000002-0002-0002-0002-000000000002','produces red light that most other deep-sea creatures cannot detect','matching_features','Questions 18–22: Matching Features','{"features":[{"label":"A","text":"Hatchetfish"},{"label":"B","text":"Anglerfish"},{"label":"C","text":"Deep-sea dragonfish"},{"label":"D","text":"Firefly squid"},{"label":"E","text":"Jellyfish and crustaceans"}]}','C','The passage says dragonfish produce red light using a unique chemistry others cannot see.','medium',19),
('bb020007-0002-0002-0002-000000000001','bb000002-0002-0002-0002-000000000002','uses rows of photophores to eliminate its silhouette from below','matching_features','Questions 18–22: Matching Features','{"features":[{"label":"A","text":"Hatchetfish"},{"label":"B","text":"Anglerfish"},{"label":"C","text":"Deep-sea dragonfish"},{"label":"D","text":"Firefly squid"},{"label":"E","text":"Jellyfish and crustaceans"}]}','A','The hatchetfish uses photophores along its belly for counterillumination.','medium',20),
('bb020008-0002-0002-0002-000000000001','bb000002-0002-0002-0002-000000000002','creates spectacular light displays during mating season','matching_features','Questions 18–22: Matching Features','{"features":[{"label":"A","text":"Hatchetfish"},{"label":"B","text":"Anglerfish"},{"label":"C","text":"Deep-sea dragonfish"},{"label":"D","text":"Firefly squid"},{"label":"E","text":"Jellyfish and crustaceans"}]}','D','The passage describes the firefly squid''s mating displays in Toyama Bay.','easy',21),
('bb020009-0002-0002-0002-000000000001','bb000002-0002-0002-0002-000000000002','releases bursts of luminescent particles to attract larger predators','matching_features','Questions 18–22: Matching Features','{"features":[{"label":"A","text":"Hatchetfish"},{"label":"B","text":"Anglerfish"},{"label":"C","text":"Deep-sea dragonfish"},{"label":"D","text":"Firefly squid"},{"label":"E","text":"Jellyfish and crustaceans"}]}','E','The passage says certain jellyfish and crustaceans use the burglar alarm strategy.','medium',22);

-- ── Questions 23–26: Table Completion ──
INSERT INTO public.questions (id, passage_id, question_text, question_type, question_group_label, question_data, correct_answer_text, explanation, difficulty, sort_order) VALUES
('bb020010-0002-0002-0002-000000000001','bb000002-0002-0002-0002-000000000002','','table_completion','Questions 23–26: Table Completion','{"max_words":2,"columns":["Function","Strategy","Example Organism"],"rows":[["Defence","__BLANK__","Hatchetfish"],["Hunting","Luminous lure","__BLANK__"],["Communication","__BLANK__","Firefly squid"],["Burglar alarm","Bioluminescent particles","__BLANK__"]]}','counterillumination','The passage describes counterillumination as the defence strategy.','medium',23),
('bb020011-0002-0002-0002-000000000001','bb000002-0002-0002-0002-000000000002','','table_completion','Questions 23–26: Table Completion','{"max_words":2,"columns":["Function","Strategy","Example Organism"],"rows":[["Defence","__BLANK__","Hatchetfish"],["Hunting","Luminous lure","__BLANK__"],["Communication","__BLANK__","Firefly squid"],["Burglar alarm","Bioluminescent particles","__BLANK__"]]}','anglerfish|Anglerfish','The anglerfish uses a luminous lure for hunting.','easy',24),
('bb020012-0002-0002-0002-000000000001','bb000002-0002-0002-0002-000000000002','','table_completion','Questions 23–26: Table Completion','{"max_words":2,"columns":["Function","Strategy","Example Organism"],"rows":[["Defence","__BLANK__","Hatchetfish"],["Hunting","Luminous lure","__BLANK__"],["Communication","__BLANK__","Firefly squid"],["Burglar alarm","Bioluminescent particles","__BLANK__"]]}','flashing light|light patterns','The firefly squid uses complex patterns of flashing light for communication.','medium',25),
('bb020013-0002-0002-0002-000000000001','bb000002-0002-0002-0002-000000000002','','table_completion','Questions 23–26: Table Completion','{"max_words":2,"columns":["Function","Strategy","Example Organism"],"rows":[["Defence","__BLANK__","Hatchetfish"],["Hunting","Luminous lure","__BLANK__"],["Communication","__BLANK__","Firefly squid"],["Burglar alarm","Bioluminescent particles","__BLANK__"]]}','jellyfish|jellyfish and crustaceans','Jellyfish and crustaceans use the burglar alarm strategy.','easy',26);


-- ============================================
-- PASSAGE 3: The Evolution of Urban Planning
-- Questions 27–40 (YNG + Summary Completion + Flowchart Completion)
-- ============================================

INSERT INTO public.passages (id, title, content, module, word_count, difficulty, exam_type) VALUES (
'bb000003-0003-0003-0003-000000000003',
'The Evolution of Urban Planning',
E'Urban planning — the deliberate shaping of cities and towns to serve their inhabitants — is as old as civilisation itself. The earliest planned cities appeared in the Indus Valley around 2600 BCE. Mohenjo-daro and Harappa featured remarkably sophisticated infrastructure: grid-patterned streets, standardised brick construction, and elaborate drainage systems that would not be matched in Europe for thousands of years. These cities provide compelling evidence that systematic urban design was a priority for some of humanity''s earliest complex societies.\n\nThe ancient Greeks and Romans took urban planning in a different direction, emphasising public spaces and civic identity. The Greek architect Hippodamus of Miletus, often called the father of European urban planning, introduced the concept of the orthogonal grid plan in the 5th century BCE. Roman cities expanded on this principle, organising themselves around two main roads — the cardo (running north-south) and the decumanus (running east-west) — with a central forum serving as the commercial and political heart of the settlement.\n\nDuring the medieval period in Europe, formal planning largely gave way to organic growth. Cities developed around castles, cathedrals, and market squares, with narrow winding streets that followed the natural topography rather than any imposed grid. Population growth within fixed city walls led to increasingly crowded and unsanitary conditions, contributing to devastating outbreaks of plague and other diseases.\n\nThe Industrial Revolution of the 18th and 19th centuries brought unprecedented challenges to urban environments. The rapid migration of workers from the countryside to factory towns created massive overcrowding, pollution, and public health crises. In response, reformers like Sir Edwin Chadwick in Britain campaigned for improved sanitation and housing standards. The Public Health Act of 1848 was among the first pieces of legislation to mandate minimum standards for urban living conditions.\n\nThe late 19th century witnessed a revolutionary new approach: the Garden City movement. Proposed by Ebenezer Howard in his 1898 book "To-morrow: A Peaceful Path to Real Reform," the Garden City concept envisioned self-contained communities surrounded by greenbelts, combining the best features of town and country living. Howard''s ideas were realised in the construction of Letchworth Garden City in 1903 and Welwyn Garden City in 1920, both in Hertfordshire, England. These settlements influenced urban planning worldwide and inspired the development of the New Town movement in Britain after the Second World War.\n\nThe 20th century saw the rise of modernist planning, dominated by the ideas of Le Corbusier and the principles set out in the Athens Charter of 1933. Modernist planners advocated for strict functional separation — dividing cities into distinct zones for living, working, recreation, and transport. They embraced high-rise housing blocks, wide motor-ways, and the systematic demolition of traditional neighbourhoods. While these ideas were implemented extensively in the post-war period, they attracted growing criticism for destroying established communities and creating impersonal, car-dependent environments.\n\nToday, urban planning has shifted towards sustainability, mixed-use development, and community participation. Contemporary planners prioritise walkability, public transport, green infrastructure, and the creation of vibrant, diverse neighbourhoods. The concept of the 15-minute city — in which all essential services are reachable within a 15-minute walk or cycle ride — has gained significant traction in cities such as Paris, Melbourne, and Barcelona. With more than half the world''s population now living in urban areas, and that proportion expected to reach 68 percent by 2050, the challenge of creating liveable, equitable, and sustainable cities has never been more urgent.',
'reading', 580, 'hard', 'ielts'
);

-- ── Questions 27–31: Yes / No / Not Given ──
INSERT INTO public.questions (id, passage_id, question_text, question_type, question_group_label, correct_answer_text, explanation, difficulty, sort_order) VALUES
('bb030001-0003-0003-0003-000000000001','bb000003-0003-0003-0003-000000000003','The writer believes that the Indus Valley cities were more advanced than contemporary European settlements.','yng','Questions 27–31: Yes / No / Not Given','','The passage says these systems "would not be matched in Europe for thousands of years" — implying agreement — YES.','medium',27),
('bb030002-0003-0003-0003-000000000001','bb000003-0003-0003-0003-000000000003','The writer suggests that medieval European cities were poorly designed.','yng','Questions 27–31: Yes / No / Not Given','','The passage describes organic growth, narrow winding streets, overcrowding, and disease — implying criticism — YES.','medium',28),
('bb030003-0003-0003-0003-000000000001','bb000003-0003-0003-0003-000000000003','The writer considers the Garden City movement to have been a complete failure.','yng','Questions 27–31: Yes / No / Not Given','','The passage says Garden Cities were realised and influenced planning worldwide — NO.','easy',29),
('bb030004-0003-0003-0003-000000000001','bb000003-0003-0003-0003-000000000003','The writer feels that Le Corbusier''s ideas were entirely positive for cities.','yng','Questions 27–31: Yes / No / Not Given','','The passage says modernist ideas attracted growing criticism — NO.','medium',30),
('bb030005-0003-0003-0003-000000000001','bb000003-0003-0003-0003-000000000003','The writer recommends that all future cities should adopt the 15-minute city model.','yng','Questions 27–31: Yes / No / Not Given','','The passage describes it gaining traction but does not make a personal recommendation — NOT GIVEN.','hard',31);

-- YNG Options (Questions 27–31)
INSERT INTO public.options (question_id, option_label, option_text, is_correct, sort_order) VALUES
('bb030001-0003-0003-0003-000000000001','A','YES',TRUE,1),
('bb030001-0003-0003-0003-000000000001','B','NO',FALSE,2),
('bb030001-0003-0003-0003-000000000001','C','NOT GIVEN',FALSE,3),
('bb030002-0003-0003-0003-000000000001','A','YES',TRUE,1),
('bb030002-0003-0003-0003-000000000001','B','NO',FALSE,2),
('bb030002-0003-0003-0003-000000000001','C','NOT GIVEN',FALSE,3),
('bb030003-0003-0003-0003-000000000001','A','YES',FALSE,1),
('bb030003-0003-0003-0003-000000000001','B','NO',TRUE,2),
('bb030003-0003-0003-0003-000000000001','C','NOT GIVEN',FALSE,3),
('bb030004-0003-0003-0003-000000000001','A','YES',FALSE,1),
('bb030004-0003-0003-0003-000000000001','B','NO',TRUE,2),
('bb030004-0003-0003-0003-000000000001','C','NOT GIVEN',FALSE,3),
('bb030005-0003-0003-0003-000000000001','A','YES',FALSE,1),
('bb030005-0003-0003-0003-000000000001','B','NO',FALSE,2),
('bb030005-0003-0003-0003-000000000001','C','NOT GIVEN',TRUE,3);

-- ── Questions 32–35: Summary Completion (with word list) ──
INSERT INTO public.questions (id, passage_id, question_text, question_type, question_group_label, question_data, correct_answer_text, explanation, difficulty, sort_order) VALUES
('bb030006-0003-0003-0003-000000000001','bb000003-0003-0003-0003-000000000003','','summary_completion','Questions 32–35: Summary Completion','{"has_word_list":true,"word_list":["greenbelts","sanitation","grid","motorways","drainage","overcrowding","walkability","zoning"],"summary_text":"The ancient Greek contribution to urban planning was the orthogonal __BLANK__ plan. During the Industrial Revolution, reformers campaigned for improved __BLANK__ standards. Ebenezer Howard proposed communities surrounded by __BLANK__ to combine town and country living. Modernist planners advocated strict functional __BLANK__ of city areas."}','grid','Hippodamus introduced the orthogonal grid plan.','easy',32),
('bb030007-0003-0003-0003-000000000001','bb000003-0003-0003-0003-000000000003','','summary_completion','Questions 32–35: Summary Completion','{"has_word_list":true,"word_list":["greenbelts","sanitation","grid","motorways","drainage","overcrowding","walkability","zoning"],"summary_text":"The ancient Greek contribution to urban planning was the orthogonal __BLANK__ plan. During the Industrial Revolution, reformers campaigned for improved __BLANK__ standards. Ebenezer Howard proposed communities surrounded by __BLANK__ to combine town and country living. Modernist planners advocated strict functional __BLANK__ of city areas."}','sanitation','Chadwick campaigned for improved sanitation and housing standards.','easy',33),
('bb030008-0003-0003-0003-000000000001','bb000003-0003-0003-0003-000000000003','','summary_completion','Questions 32–35: Summary Completion','{"has_word_list":true,"word_list":["greenbelts","sanitation","grid","motorways","drainage","overcrowding","walkability","zoning"],"summary_text":"The ancient Greek contribution to urban planning was the orthogonal __BLANK__ plan. During the Industrial Revolution, reformers campaigned for improved __BLANK__ standards. Ebenezer Howard proposed communities surrounded by __BLANK__ to combine town and country living. Modernist planners advocated strict functional __BLANK__ of city areas."}','greenbelts','Howard envisioned communities surrounded by greenbelts.','medium',34),
('bb030009-0003-0003-0003-000000000001','bb000003-0003-0003-0003-000000000003','','summary_completion','Questions 32–35: Summary Completion','{"has_word_list":true,"word_list":["greenbelts","sanitation","grid","motorways","drainage","overcrowding","walkability","zoning"],"summary_text":"The ancient Greek contribution to urban planning was the orthogonal __BLANK__ plan. During the Industrial Revolution, reformers campaigned for improved __BLANK__ standards. Ebenezer Howard proposed communities surrounded by __BLANK__ to combine town and country living. Modernist planners advocated strict functional __BLANK__ of city areas."}','zoning','Modernist planners advocated strict functional separation/zoning.','medium',35);

-- ── Questions 36–40: Flow-chart Completion ──
INSERT INTO public.questions (id, passage_id, question_text, question_type, question_group_label, question_data, correct_answer_text, explanation, difficulty, sort_order) VALUES
('bb030010-0003-0003-0003-000000000001','bb000003-0003-0003-0003-000000000003','','flowchart_completion','Questions 36–40: Flow-chart Completion','{"max_words":3,"nodes":[{"text":"Indus Valley: grid streets and drainage systems","is_blank":false},{"text":"","is_blank":true},{"text":"Medieval period: organic growth around castles","is_blank":false},{"text":"","is_blank":true},{"text":"Garden City movement: self-contained communities","is_blank":false},{"text":"","is_blank":true},{"text":"","is_blank":true},{"text":"Today: sustainability, mixed-use, 15-minute city","is_blank":false}]}','Greek and Roman|Greeks and Romans','Greeks and Romans introduced grid plans and public spaces.','medium',36),
('bb030011-0003-0003-0003-000000000001','bb000003-0003-0003-0003-000000000003','','flowchart_completion','Questions 36–40: Flow-chart Completion','{"max_words":3,"nodes":[{"text":"Indus Valley: grid streets and drainage systems","is_blank":false},{"text":"","is_blank":true},{"text":"Medieval period: organic growth around castles","is_blank":false},{"text":"","is_blank":true},{"text":"Garden City movement: self-contained communities","is_blank":false},{"text":"","is_blank":true},{"text":"","is_blank":true},{"text":"Today: sustainability, mixed-use, 15-minute city","is_blank":false}]}','Industrial Revolution','The Industrial Revolution caused overcrowding and public health crises.','easy',37),
('bb030012-0003-0003-0003-000000000001','bb000003-0003-0003-0003-000000000003','','flowchart_completion','Questions 36–40: Flow-chart Completion','{"max_words":3,"nodes":[{"text":"Indus Valley: grid streets and drainage systems","is_blank":false},{"text":"","is_blank":true},{"text":"Medieval period: organic growth around castles","is_blank":false},{"text":"","is_blank":true},{"text":"Garden City movement: self-contained communities","is_blank":false},{"text":"","is_blank":true},{"text":"","is_blank":true},{"text":"Today: sustainability, mixed-use, 15-minute city","is_blank":false}]}','modernist planning|Le Corbusier','Modernist planning with Le Corbusier''s functional separation.','medium',38),
('bb030013-0003-0003-0003-000000000001','bb000003-0003-0003-0003-000000000003','','flowchart_completion','Questions 36–40: Flow-chart Completion','{"max_words":3,"nodes":[{"text":"Indus Valley: grid streets and drainage systems","is_blank":false},{"text":"","is_blank":true},{"text":"Medieval period: organic growth around castles","is_blank":false},{"text":"","is_blank":true},{"text":"Garden City movement: self-contained communities","is_blank":false},{"text":"","is_blank":true},{"text":"","is_blank":true},{"text":"Today: sustainability, mixed-use, 15-minute city","is_blank":false}]}','New Town movement|post-war New Towns','The New Town movement followed the Garden City influence.','hard',39),
('bb030014-0003-0003-0003-000000000001','bb000003-0003-0003-0003-000000000003','What proportion of the world''s population is expected to live in urban areas by 2050?','short_answer','Question 40: Short Answer','{"max_words":2}','68 percent|68%','The passage states the proportion expected to reach 68 percent by 2050.','easy',40);


-- ============================================
-- DONE! Seed data with mixed question types complete.
-- 3 passages, 40 questions total:
--   Passage 1: Matching Headings (5) + TFNG (4) + Sentence Completion (4) = 13
--   Passage 2: Multiple Choice (4) + Matching Features (5) + Table Completion (4) = 13
--   Passage 3: YNG (5) + Summary Completion (4) + Flowchart (4) + Short Answer (1) = 14
-- ============================================
