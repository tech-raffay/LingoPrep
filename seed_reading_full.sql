-- ============================================
-- IELTS FULL READING TEST — 40 Questions (3 Sections)
-- Run in Supabase SQL Editor
-- ============================================

-- Clean old reading seed data
DELETE FROM public.options WHERE question_id IN (SELECT id FROM public.questions WHERE passage_id IN ('11111111-1111-1111-1111-111111111111','22222222-2222-2222-2222-222222222222','aaaa0001-0001-0001-0001-000000000001','aaaa0002-0002-0002-0002-000000000002','aaaa0003-0003-0003-0003-000000000003'));
DELETE FROM public.questions WHERE passage_id IN ('11111111-1111-1111-1111-111111111111','22222222-2222-2222-2222-222222222222','aaaa0001-0001-0001-0001-000000000001','aaaa0002-0002-0002-0002-000000000002','aaaa0003-0003-0003-0003-000000000003');
DELETE FROM public.passages WHERE id IN ('11111111-1111-1111-1111-111111111111','22222222-2222-2222-2222-222222222222','aaaa0001-0001-0001-0001-000000000001','aaaa0002-0002-0002-0002-000000000002','aaaa0003-0003-0003-0003-000000000003');

-- ============================================
-- SECTION 1: The History of Timekeeping (13 Qs)
-- ============================================
INSERT INTO public.passages (id, title, content, module, word_count, difficulty, exam_type) VALUES (
'aaaa0001-0001-0001-0001-000000000001',
'The History of Timekeeping',
E'The measurement of time has been a fundamental concern of human civilisation since its earliest days. Ancient peoples tracked the passage of time by observing natural phenomena: the movement of the sun across the sky, the changing phases of the moon, and the shifting patterns of stars. These observations gave rise to the first calendars and rudimentary timekeeping devices.\n\nThe earliest known timekeeping instruments were sundials, which appeared in ancient Egypt around 1500 BCE. These devices cast a shadow on a marked surface, allowing observers to divide the daylight hours into segments. However, sundials had obvious limitations — they were useless at night and on cloudy days, and their accuracy varied with latitude and season.\n\nTo overcome these drawbacks, the ancient Egyptians also developed water clocks, known as clepsydrae, around 1400 BCE. These devices measured time by the regulated flow of water from one vessel to another. Water clocks could function regardless of weather or time of day, making them a significant advancement. The Greeks and Romans later refined these instruments, and elaborate water clocks were used in courts and public buildings throughout the ancient world.\n\nThe invention of mechanical clocks in medieval Europe, around the 13th century, represented a revolutionary leap in timekeeping technology. The earliest mechanical clocks used a verge-and-foliot escapement mechanism to regulate the release of energy from a wound spring or falling weight. These clocks were large, expensive, and initially accurate only to within about 15 minutes per day. They were typically installed in church towers and public squares, serving entire communities rather than individuals.\n\nThe introduction of the pendulum clock by Dutch scientist Christiaan Huygens in 1656 dramatically improved accuracy. By using the regular oscillation of a pendulum to regulate the clock mechanism, Huygens reduced timekeeping errors to less than one minute per day — and later models achieved accuracy within seconds. This innovation made precise timekeeping available to wealthy households for the first time.\n\nThe 18th century brought the marine chronometer, developed by English carpenter and clockmaker John Harrison. The inability to determine longitude at sea had caused numerous maritime disasters, and the British government offered a substantial prize for a practical solution. Harrison spent decades perfecting a series of increasingly accurate sea clocks. His H4 chronometer, completed in 1761, lost only five seconds during a 81-day voyage to Jamaica, finally solving the longitude problem and revolutionising ocean navigation.\n\nThe 20th century witnessed the development of quartz clocks in the 1920s and atomic clocks in the 1950s. Quartz clocks use the vibration of a quartz crystal under electrical stimulation to keep time, achieving accuracy within a few seconds per month. Atomic clocks, which measure the oscillation frequency of atoms — typically caesium-133 — are accurate to within one second over millions of years. Today, a network of atomic clocks around the world maintains Coordinated Universal Time (UTC), the standard by which all civil time is regulated.\n\nThe quest for ever-greater precision continues. Optical lattice clocks, currently under development, use laser-trapped atoms and could be accurate to within one second over the entire age of the universe. Such extraordinary precision has practical applications in satellite navigation, telecommunications, and fundamental physics research, demonstrating that the ancient human desire to measure time remains as vital as ever.',
'reading', 520, 'medium', 'ielts'
);

-- Section 1 Questions (13)
INSERT INTO public.questions (id, passage_id, question_text, explanation, difficulty, sort_order) VALUES
('aaaa0001-f001-0001-0001-000000000001','aaaa0001-0001-0001-0001-000000000001','What were the earliest timekeeping instruments mentioned in the passage?','The passage states sundials appeared in ancient Egypt around 1500 BCE as the earliest known instruments.','easy',1),
('aaaa0001-f002-0001-0001-000000000001','aaaa0001-0001-0001-0001-000000000001','What was a major limitation of sundials?','The passage mentions sundials were useless at night and on cloudy days.','easy',2),
('aaaa0001-f003-0001-0001-000000000001','aaaa0001-0001-0001-0001-000000000001','What advantage did water clocks have over sundials?','Water clocks could function regardless of weather or time of day.','easy',3),
('aaaa0001-f004-0001-0001-000000000001','aaaa0001-0001-0001-0001-000000000001','When did mechanical clocks first appear in Europe?','The passage states around the 13th century.','medium',4),
('aaaa0001-f005-0001-0001-000000000001','aaaa0001-0001-0001-0001-000000000001','What mechanism did early mechanical clocks use?','The verge-and-foliot escapement mechanism is mentioned.','medium',5),
('aaaa0001-f006-0001-0001-000000000001','aaaa0001-0001-0001-0001-000000000001','How accurate were the earliest mechanical clocks?','They were accurate only to within about 15 minutes per day.','medium',6),
('aaaa0001-f007-0001-0001-000000000001','aaaa0001-0001-0001-0001-000000000001','Who invented the pendulum clock?','Christiaan Huygens in 1656.','easy',7),
('aaaa0001-f008-0001-0001-000000000001','aaaa0001-0001-0001-0001-000000000001','What problem did John Harrison''s marine chronometer solve?','It solved the longitude problem for ocean navigation.','medium',8),
('aaaa0001-f009-0001-0001-000000000001','aaaa0001-0001-0001-0001-000000000001','How much time did Harrison''s H4 chronometer lose during its test voyage?','It lost only five seconds during an 81-day voyage to Jamaica.','hard',9),
('aaaa0001-f010-0001-0001-000000000001','aaaa0001-0001-0001-0001-000000000001','What type of atom is typically used in atomic clocks?','Caesium-133 atoms are mentioned.','medium',10),
('aaaa0001-f011-0001-0001-000000000001','aaaa0001-0001-0001-0001-000000000001','How accurate are atomic clocks according to the passage?','Accurate to within one second over millions of years.','medium',11),
('aaaa0001-f012-0001-0001-000000000001','aaaa0001-0001-0001-0001-000000000001','What does UTC stand for?','Coordinated Universal Time.','easy',12),
('aaaa0001-f013-0001-0001-000000000001','aaaa0001-0001-0001-0001-000000000001','What technology do optical lattice clocks use?','They use laser-trapped atoms.','hard',13);

-- Section 1 Options
INSERT INTO public.options (question_id, option_label, option_text, is_correct, sort_order) VALUES
('aaaa0001-f001-0001-0001-000000000001','A','Water clocks',FALSE,1),
('aaaa0001-f001-0001-0001-000000000001','B','Sundials',TRUE,2),
('aaaa0001-f001-0001-0001-000000000001','C','Mechanical clocks',FALSE,3),
('aaaa0001-f001-0001-0001-000000000001','D','Pendulum clocks',FALSE,4),
('aaaa0001-f002-0001-0001-000000000001','A','They were too expensive to build',FALSE,1),
('aaaa0001-f002-0001-0001-000000000001','B','They could only measure hours, not minutes',FALSE,2),
('aaaa0001-f002-0001-0001-000000000001','C','They were useless at night and on cloudy days',TRUE,3),
('aaaa0001-f002-0001-0001-000000000001','D','They required constant maintenance',FALSE,4),
('aaaa0001-f003-0001-0001-000000000001','A','They were more portable',FALSE,1),
('aaaa0001-f003-0001-0001-000000000001','B','They could function regardless of weather or time of day',TRUE,2),
('aaaa0001-f003-0001-0001-000000000001','C','They were cheaper to produce',FALSE,3),
('aaaa0001-f003-0001-0001-000000000001','D','They measured time more accurately',FALSE,4),
('aaaa0001-f004-0001-0001-000000000001','A','The 11th century',FALSE,1),
('aaaa0001-f004-0001-0001-000000000001','B','The 12th century',FALSE,2),
('aaaa0001-f004-0001-0001-000000000001','C','The 13th century',TRUE,3),
('aaaa0001-f004-0001-0001-000000000001','D','The 14th century',FALSE,4),
('aaaa0001-f005-0001-0001-000000000001','A','A pendulum system',FALSE,1),
('aaaa0001-f005-0001-0001-000000000001','B','A quartz crystal vibration',FALSE,2),
('aaaa0001-f005-0001-0001-000000000001','C','A verge-and-foliot escapement mechanism',TRUE,3),
('aaaa0001-f005-0001-0001-000000000001','D','An atomic oscillation system',FALSE,4),
('aaaa0001-f006-0001-0001-000000000001','A','Within about 1 minute per day',FALSE,1),
('aaaa0001-f006-0001-0001-000000000001','B','Within about 5 minutes per day',FALSE,2),
('aaaa0001-f006-0001-0001-000000000001','C','Within about 15 minutes per day',TRUE,3),
('aaaa0001-f006-0001-0001-000000000001','D','Within about 30 minutes per day',FALSE,4),
('aaaa0001-f007-0001-0001-000000000001','A','John Harrison',FALSE,1),
('aaaa0001-f007-0001-0001-000000000001','B','Galileo Galilei',FALSE,2),
('aaaa0001-f007-0001-0001-000000000001','C','Christiaan Huygens',TRUE,3),
('aaaa0001-f007-0001-0001-000000000001','D','Isaac Newton',FALSE,4),
('aaaa0001-f008-0001-0001-000000000001','A','The problem of measuring ocean depth',FALSE,1),
('aaaa0001-f008-0001-0001-000000000001','B','The longitude problem for ocean navigation',TRUE,2),
('aaaa0001-f008-0001-0001-000000000001','C','The problem of predicting tides',FALSE,3),
('aaaa0001-f008-0001-0001-000000000001','D','The challenge of measuring wind speed at sea',FALSE,4),
('aaaa0001-f009-0001-0001-000000000001','A','One second',FALSE,1),
('aaaa0001-f009-0001-0001-000000000001','B','Five seconds',TRUE,2),
('aaaa0001-f009-0001-0001-000000000001','C','Fifteen seconds',FALSE,3),
('aaaa0001-f009-0001-0001-000000000001','D','One minute',FALSE,4),
('aaaa0001-f010-0001-0001-000000000001','A','Hydrogen',FALSE,1),
('aaaa0001-f010-0001-0001-000000000001','B','Rubidium',FALSE,2),
('aaaa0001-f010-0001-0001-000000000001','C','Caesium-133',TRUE,3),
('aaaa0001-f010-0001-0001-000000000001','D','Strontium',FALSE,4),
('aaaa0001-f011-0001-0001-000000000001','A','Within one second per year',FALSE,1),
('aaaa0001-f011-0001-0001-000000000001','B','Within one second per century',FALSE,2),
('aaaa0001-f011-0001-0001-000000000001','C','Within one second over millions of years',TRUE,3),
('aaaa0001-f011-0001-0001-000000000001','D','Within one second per decade',FALSE,4),
('aaaa0001-f012-0001-0001-000000000001','A','Central Universal Timing',FALSE,1),
('aaaa0001-f012-0001-0001-000000000001','B','Coordinated Universal Time',TRUE,2),
('aaaa0001-f012-0001-0001-000000000001','C','Calibrated Unified Timescale',FALSE,3),
('aaaa0001-f012-0001-0001-000000000001','D','Collective Universal Timing',FALSE,4),
('aaaa0001-f013-0001-0001-000000000001','A','Radio wave detection',FALSE,1),
('aaaa0001-f013-0001-0001-000000000001','B','Magnetic field measurement',FALSE,2),
('aaaa0001-f013-0001-0001-000000000001','C','Laser-trapped atoms',TRUE,3),
('aaaa0001-f013-0001-0001-000000000001','D','Gravitational wave sensing',FALSE,4);

-- ============================================
-- SECTION 2: The Rise of Urbanisation (13 Qs)
-- ============================================
INSERT INTO public.passages (id, title, content, module, word_count, difficulty, exam_type) VALUES (
'aaaa0002-0002-0002-0002-000000000002',
'The Rise of Urbanisation and Its Global Impact',
E'For most of human history, people lived in small rural communities. As recently as 1800, only three percent of the world''s population resided in urban areas. Today, that figure exceeds 56 percent, and by 2050, the United Nations projects that nearly 70 percent of humanity will live in cities. This dramatic shift — urbanisation — is one of the most transformative trends in modern history.\n\nThe first major wave of urbanisation accompanied the Industrial Revolution in 18th and 19th century Europe. Factories concentrated in cities, drawing workers from the countryside with promises of employment and higher wages. Manchester, England, grew from a modest market town of 25,000 in 1772 to over 300,000 by 1850. Such rapid growth often outpaced the development of infrastructure, leading to overcrowded housing, poor sanitation, and the spread of diseases such as cholera and typhoid.\n\nA second wave of urbanisation occurred in North America during the late 19th and early 20th centuries, driven by industrialisation and mass immigration. Cities like New York and Chicago became centres of economic opportunity, attracting millions of immigrants from Europe and rural Americans seeking better lives. This period saw the rise of skyscrapers, subway systems, and planned urban parks — innovations that defined the modern city.\n\nToday, the fastest urbanisation is occurring in Asia and Africa. China alone has seen over 500 million people move from rural to urban areas since 1980, the largest migration in human history. Lagos, Nigeria, is projected to become the world''s largest city by 2100, with a population potentially exceeding 80 million. These mega-cities face enormous challenges: providing clean water, electricity, transportation, and housing for rapidly growing populations.\n\nUrbanisation brings significant economic benefits. Cities generate approximately 80 percent of global GDP. The concentration of people, businesses, and institutions creates economies of scale, facilitates innovation through the exchange of ideas, and provides access to specialised services such as healthcare and education. Research consistently shows that urban workers earn significantly more than their rural counterparts, even after adjusting for the higher cost of living.\n\nHowever, rapid urbanisation also creates serious environmental challenges. Cities consume over 75 percent of global energy production and produce more than 70 percent of carbon dioxide emissions. Urban sprawl destroys natural habitats and agricultural land. Many cities in developing countries struggle with air pollution levels that far exceed World Health Organisation guidelines, contributing to millions of premature deaths annually.\n\nUrban planners and policymakers are increasingly focused on creating sustainable cities. Concepts such as the 15-minute city — where residents can access all essential services within a 15-minute walk or bicycle ride — aim to reduce car dependency and improve quality of life. Green building standards, expanded public transportation, and urban green spaces are all part of the toolkit for making cities more liveable and environmentally responsible.\n\nThe future of urbanisation will likely be shaped by technology. Smart city initiatives use sensors, data analytics, and artificial intelligence to optimise traffic flow, reduce energy consumption, and improve public services. While the challenges of urbanisation are immense, cities remain humanity''s greatest engine of economic growth, cultural exchange, and social progress.',
'reading', 480, 'medium', 'ielts'
);

INSERT INTO public.questions (id, passage_id, question_text, explanation, difficulty, sort_order) VALUES
('aaaa0002-f001-0002-0002-000000000002','aaaa0002-0002-0002-0002-000000000002','What percentage of the world''s population lived in urban areas in 1800?','The passage states only three percent.','easy',1),
('aaaa0002-f002-0002-0002-000000000002','aaaa0002-0002-0002-0002-000000000002','What drove the first major wave of urbanisation?','The Industrial Revolution in 18th-19th century Europe.','easy',2),
('aaaa0002-f003-0002-0002-000000000002','aaaa0002-0002-0002-0002-000000000002','What was the population of Manchester in 1850?','Over 300,000 according to the passage.','medium',3),
('aaaa0002-f004-0002-0002-000000000002','aaaa0002-0002-0002-0002-000000000002','What problems did rapid urban growth cause in early industrial cities?','Overcrowded housing, poor sanitation, and disease.','medium',4),
('aaaa0002-f005-0002-0002-000000000002','aaaa0002-0002-0002-0002-000000000002','What innovations defined North American cities during the second wave of urbanisation?','Skyscrapers, subway systems, and planned urban parks.','medium',5),
('aaaa0002-f006-0002-0002-000000000002','aaaa0002-0002-0002-0002-000000000002','How many people moved from rural to urban areas in China since 1980?','Over 500 million people.','medium',6),
('aaaa0002-f007-0002-0002-000000000002','aaaa0002-0002-0002-0002-000000000002','Which city is projected to become the world''s largest by 2100?','Lagos, Nigeria.','medium',7),
('aaaa0002-f008-0002-0002-000000000002','aaaa0002-0002-0002-0002-000000000002','What percentage of global GDP do cities generate?','Approximately 80 percent.','easy',8),
('aaaa0002-f009-0002-0002-000000000002','aaaa0002-0002-0002-0002-000000000002','What percentage of global energy do cities consume?','Over 75 percent.','medium',9),
('aaaa0002-f010-0002-0002-000000000002','aaaa0002-0002-0002-0002-000000000002','What is the concept of the ''15-minute city''?','Residents can access all essential services within a 15-minute walk or bicycle ride.','medium',10),
('aaaa0002-f011-0002-0002-000000000002','aaaa0002-0002-0002-0002-000000000002','What percentage of carbon dioxide emissions do cities produce?','More than 70 percent.','medium',11),
('aaaa0002-f012-0002-0002-000000000002','aaaa0002-0002-0002-0002-000000000002','Where is the fastest urbanisation currently occurring?','In Asia and Africa.','easy',12),
('aaaa0002-f013-0002-0002-000000000002','aaaa0002-0002-0002-0002-000000000002','What technologies do smart city initiatives use?','Sensors, data analytics, and artificial intelligence.','hard',13);

INSERT INTO public.options (question_id, option_label, option_text, is_correct, sort_order) VALUES
('aaaa0002-f001-0002-0002-000000000002','A','10 percent',FALSE,1),
('aaaa0002-f001-0002-0002-000000000002','B','3 percent',TRUE,2),
('aaaa0002-f001-0002-0002-000000000002','C','15 percent',FALSE,3),
('aaaa0002-f001-0002-0002-000000000002','D','25 percent',FALSE,4),
('aaaa0002-f002-0002-0002-000000000002','A','The discovery of new continents',FALSE,1),
('aaaa0002-f002-0002-0002-000000000002','B','The Industrial Revolution',TRUE,2),
('aaaa0002-f002-0002-0002-000000000002','C','World War I',FALSE,3),
('aaaa0002-f002-0002-0002-000000000002','D','The development of railways',FALSE,4),
('aaaa0002-f003-0002-0002-000000000002','A','Over 100,000',FALSE,1),
('aaaa0002-f003-0002-0002-000000000002','B','Over 200,000',FALSE,2),
('aaaa0002-f003-0002-0002-000000000002','C','Over 300,000',TRUE,3),
('aaaa0002-f003-0002-0002-000000000002','D','Over 500,000',FALSE,4),
('aaaa0002-f004-0002-0002-000000000002','A','Overcrowded housing, poor sanitation, and spread of diseases',TRUE,1),
('aaaa0002-f004-0002-0002-000000000002','B','Lack of entertainment and cultural venues',FALSE,2),
('aaaa0002-f004-0002-0002-000000000002','C','Unemployment and economic recession',FALSE,3),
('aaaa0002-f004-0002-0002-000000000002','D','Political instability and civil unrest',FALSE,4),
('aaaa0002-f005-0002-0002-000000000002','A','Canals, bridges, and fortifications',FALSE,1),
('aaaa0002-f005-0002-0002-000000000002','B','Skyscrapers, subway systems, and planned urban parks',TRUE,2),
('aaaa0002-f005-0002-0002-000000000002','C','Factories, warehouses, and dockyards',FALSE,3),
('aaaa0002-f005-0002-0002-000000000002','D','Universities, hospitals, and libraries',FALSE,4),
('aaaa0002-f006-0002-0002-000000000002','A','Over 100 million',FALSE,1),
('aaaa0002-f006-0002-0002-000000000002','B','Over 250 million',FALSE,2),
('aaaa0002-f006-0002-0002-000000000002','C','Over 500 million',TRUE,3),
('aaaa0002-f006-0002-0002-000000000002','D','Over 1 billion',FALSE,4),
('aaaa0002-f007-0002-0002-000000000002','A','Mumbai, India',FALSE,1),
('aaaa0002-f007-0002-0002-000000000002','B','Shanghai, China',FALSE,2),
('aaaa0002-f007-0002-0002-000000000002','C','Lagos, Nigeria',TRUE,3),
('aaaa0002-f007-0002-0002-000000000002','D','Jakarta, Indonesia',FALSE,4),
('aaaa0002-f008-0002-0002-000000000002','A','50 percent',FALSE,1),
('aaaa0002-f008-0002-0002-000000000002','B','65 percent',FALSE,2),
('aaaa0002-f008-0002-0002-000000000002','C','80 percent',TRUE,3),
('aaaa0002-f008-0002-0002-000000000002','D','90 percent',FALSE,4),
('aaaa0002-f009-0002-0002-000000000002','A','Over 50 percent',FALSE,1),
('aaaa0002-f009-0002-0002-000000000002','B','Over 60 percent',FALSE,2),
('aaaa0002-f009-0002-0002-000000000002','C','Over 75 percent',TRUE,3),
('aaaa0002-f009-0002-0002-000000000002','D','Over 90 percent',FALSE,4),
('aaaa0002-f010-0002-0002-000000000002','A','A city with only 15 neighbourhoods',FALSE,1),
('aaaa0002-f010-0002-0002-000000000002','B','A city built in 15 years',FALSE,2),
('aaaa0002-f010-0002-0002-000000000002','C','A city where essential services are within a 15-minute walk or cycle',TRUE,3),
('aaaa0002-f010-0002-0002-000000000002','D','A city that operates on a 15-hour schedule',FALSE,4),
('aaaa0002-f011-0002-0002-000000000002','A','More than 40 percent',FALSE,1),
('aaaa0002-f011-0002-0002-000000000002','B','More than 55 percent',FALSE,2),
('aaaa0002-f011-0002-0002-000000000002','C','More than 70 percent',TRUE,3),
('aaaa0002-f011-0002-0002-000000000002','D','More than 85 percent',FALSE,4),
('aaaa0002-f012-0002-0002-000000000002','A','South America and Europe',FALSE,1),
('aaaa0002-f012-0002-0002-000000000002','B','Asia and Africa',TRUE,2),
('aaaa0002-f012-0002-0002-000000000002','C','North America and Australia',FALSE,3),
('aaaa0002-f012-0002-0002-000000000002','D','Europe and the Middle East',FALSE,4),
('aaaa0002-f013-0002-0002-000000000002','A','Drones, robots, and 3D printing',FALSE,1),
('aaaa0002-f013-0002-0002-000000000002','B','Virtual reality, holograms, and quantum computing',FALSE,2),
('aaaa0002-f013-0002-0002-000000000002','C','Sensors, data analytics, and artificial intelligence',TRUE,3),
('aaaa0002-f013-0002-0002-000000000002','D','Blockchain, cryptocurrency, and smart contracts',FALSE,4);

-- ============================================
-- SECTION 3: Neuroscience of Language Acquisition (14 Qs)
-- ============================================
INSERT INTO public.passages (id, title, content, module, word_count, difficulty, exam_type) VALUES (
'aaaa0003-0003-0003-0003-000000000003',
'The Neuroscience of Language Acquisition',
E'The human capacity for language is one of the most remarkable features of our species. While other animals communicate through calls, gestures, and chemical signals, only humans possess the ability to generate and comprehend an infinite number of novel sentences using a finite set of rules — what linguist Noam Chomsky termed ''generative grammar.'' Understanding how the brain acquires this extraordinary ability has been a central question in neuroscience for decades.\n\nResearch has identified two brain regions that are critical for language processing. Broca''s area, located in the left frontal lobe, is primarily associated with speech production and grammatical processing. Wernicke''s area, situated in the left temporal lobe, is mainly involved in language comprehension. Damage to Broca''s area typically results in slow, effortful speech with preserved comprehension, while damage to Wernicke''s area produces fluent but often meaningless speech. These findings, first described in the 19th century, established that language is not processed by a single brain region but involves a distributed network.\n\nModern neuroimaging techniques, particularly functional magnetic resonance imaging (fMRI) and positron emission tomography (PET), have revealed that language processing involves far more brain areas than the classical model suggested. Studies show activation in the prefrontal cortex for working memory during sentence processing, the angular gyrus for semantic integration, and the cerebellum for speech timing and fluency. The picture that emerges is of a complex, interconnected neural network rather than a simple two-area system.\n\nOne of the most fascinating aspects of language acquisition is the existence of a ''critical period'' — a window of time during which the brain is optimally receptive to learning language. This concept, first proposed by neurologist Eric Lenneberg in 1967, suggests that first language acquisition must occur before puberty to achieve native-level proficiency. Evidence comes from tragic cases of children raised in extreme isolation, such as the case of ''Genie,'' who was discovered in 1970 at age 13 having been confined to a single room for nearly her entire life. Despite years of intensive language therapy, Genie never fully acquired grammatical competence, supporting the critical period hypothesis.\n\nSecond language acquisition research has added nuance to this picture. While adults can certainly learn new languages, they rarely achieve the grammatical intuition and accent-free pronunciation of native speakers. Brain imaging studies show that when people learn a second language after puberty, it activates partially different neural circuits compared to the first language. However, individuals who learn a second language before age seven show nearly identical brain activation patterns for both languages, suggesting that early exposure integrates languages into the same neural substrate.\n\nThe bilingual brain has become a major focus of research in recent years. Studies indicate that bilingual individuals develop enhanced executive function — the set of mental skills that includes working memory, flexible thinking, and self-control. Bilingualism has also been associated with a delayed onset of dementia symptoms by approximately four to five years compared to monolinguals, suggesting that managing two language systems provides ongoing cognitive exercise that builds neural reserve.\n\nRecent advances in computational neuroscience have begun to model how the brain processes language at the level of individual neurons and neural circuits. Deep learning models, particularly large language models based on transformer architectures, have shown surprising parallels with human language processing. Researchers have found that the internal representations of these artificial neural networks correlate significantly with brain activity patterns measured during natural language comprehension, raising intriguing questions about whether the brain and artificial intelligence converge on similar computational solutions for processing language.\n\nDespite these advances, many fundamental questions remain unanswered. How does the infant brain extract grammatical rules from the continuous stream of speech it hears? Why are humans uniquely capable of language among all species? How do genetic factors interact with environmental input to shape language development? These questions continue to drive research at the intersection of neuroscience, linguistics, and artificial intelligence.',
'reading', 620, 'hard', 'ielts'
);

INSERT INTO public.questions (id, passage_id, question_text, explanation, difficulty, sort_order) VALUES
('aaaa0003-f001-0003-0003-000000000003','aaaa0003-0003-0003-0003-000000000003','What did Noam Chomsky call the human ability to produce infinite sentences from finite rules?','Generative grammar.','easy',1),
('aaaa0003-f002-0003-0003-000000000003','aaaa0003-0003-0003-0003-000000000003','Where is Broca''s area located in the brain?','In the left frontal lobe.','easy',2),
('aaaa0003-f003-0003-0003-000000000003','aaaa0003-0003-0003-0003-000000000003','What function is Wernicke''s area primarily associated with?','Language comprehension.','easy',3),
('aaaa0003-f004-0003-0003-000000000003','aaaa0003-0003-0003-0003-000000000003','What happens when Broca''s area is damaged?','Slow, effortful speech with preserved comprehension.','medium',4),
('aaaa0003-f005-0003-0003-000000000003','aaaa0003-0003-0003-0003-000000000003','Which imaging techniques have advanced our understanding of language processing?','fMRI and PET scans.','medium',5),
('aaaa0003-f006-0003-0003-000000000003','aaaa0003-0003-0003-0003-000000000003','What role does the cerebellum play in language according to the passage?','Speech timing and fluency.','hard',6),
('aaaa0003-f007-0003-0003-000000000003','aaaa0003-0003-0003-0003-000000000003','Who first proposed the critical period hypothesis for language acquisition?','Eric Lenneberg in 1967.','medium',7),
('aaaa0003-f008-0003-0003-000000000003','aaaa0003-0003-0003-0003-000000000003','What does the case of Genie support?','The critical period hypothesis.','medium',8),
('aaaa0003-f009-0003-0003-000000000003','aaaa0003-0003-0003-0003-000000000003','At what age does second language learning show nearly identical brain patterns to the first language?','Before age seven.','medium',9),
('aaaa0003-f010-0003-0003-000000000003','aaaa0003-0003-0003-0003-000000000003','What cognitive benefit has been associated with bilingualism?','Enhanced executive function.','medium',10),
('aaaa0003-f011-0003-0003-000000000003','aaaa0003-0003-0003-0003-000000000003','By how many years has bilingualism been associated with delaying dementia symptoms?','Approximately four to five years.','hard',11),
('aaaa0003-f012-0003-0003-000000000003','aaaa0003-0003-0003-0003-000000000003','What type of AI architecture shows parallels with human language processing?','Transformer architectures.','hard',12),
('aaaa0003-f013-0003-0003-000000000003','aaaa0003-0003-0003-0003-000000000003','What does damage to Wernicke''s area typically produce?','Fluent but often meaningless speech.','medium',13),
('aaaa0003-f014-0003-0003-000000000003','aaaa0003-0003-0003-0003-000000000003','According to the passage, what does bilingualism build that may delay dementia?','Neural reserve.','hard',14);

INSERT INTO public.options (question_id, option_label, option_text, is_correct, sort_order) VALUES
('aaaa0003-f001-0003-0003-000000000003','A','Universal grammar',FALSE,1),
('aaaa0003-f001-0003-0003-000000000003','B','Generative grammar',TRUE,2),
('aaaa0003-f001-0003-0003-000000000003','C','Structural linguistics',FALSE,3),
('aaaa0003-f001-0003-0003-000000000003','D','Cognitive grammar',FALSE,4),
('aaaa0003-f002-0003-0003-000000000003','A','Right temporal lobe',FALSE,1),
('aaaa0003-f002-0003-0003-000000000003','B','Left frontal lobe',TRUE,2),
('aaaa0003-f002-0003-0003-000000000003','C','Right frontal lobe',FALSE,3),
('aaaa0003-f002-0003-0003-000000000003','D','Left occipital lobe',FALSE,4),
('aaaa0003-f003-0003-0003-000000000003','A','Speech production',FALSE,1),
('aaaa0003-f003-0003-0003-000000000003','B','Motor coordination',FALSE,2),
('aaaa0003-f003-0003-0003-000000000003','C','Language comprehension',TRUE,3),
('aaaa0003-f003-0003-0003-000000000003','D','Visual processing',FALSE,4),
('aaaa0003-f004-0003-0003-000000000003','A','Complete loss of all language ability',FALSE,1),
('aaaa0003-f004-0003-0003-000000000003','B','Slow, effortful speech with preserved comprehension',TRUE,2),
('aaaa0003-f004-0003-0003-000000000003','C','Fluent but meaningless speech',FALSE,3),
('aaaa0003-f004-0003-0003-000000000003','D','Inability to read or write',FALSE,4),
('aaaa0003-f005-0003-0003-000000000003','A','X-ray and ultrasound',FALSE,1),
('aaaa0003-f005-0003-0003-000000000003','B','fMRI and PET',TRUE,2),
('aaaa0003-f005-0003-0003-000000000003','C','CT scan and EEG',FALSE,3),
('aaaa0003-f005-0003-0003-000000000003','D','MRI and blood tests',FALSE,4),
('aaaa0003-f006-0003-0003-000000000003','A','Emotional processing of language',FALSE,1),
('aaaa0003-f006-0003-0003-000000000003','B','Long-term memory storage of vocabulary',FALSE,2),
('aaaa0003-f006-0003-0003-000000000003','C','Speech timing and fluency',TRUE,3),
('aaaa0003-f006-0003-0003-000000000003','D','Visual recognition of written words',FALSE,4),
('aaaa0003-f007-0003-0003-000000000003','A','Noam Chomsky',FALSE,1),
('aaaa0003-f007-0003-0003-000000000003','B','Eric Lenneberg',TRUE,2),
('aaaa0003-f007-0003-0003-000000000003','C','Steven Pinker',FALSE,3),
('aaaa0003-f007-0003-0003-000000000003','D','Paul Broca',FALSE,4),
('aaaa0003-f008-0003-0003-000000000003','A','That language is entirely learned through imitation',FALSE,1),
('aaaa0003-f008-0003-0003-000000000003','B','The critical period hypothesis',TRUE,2),
('aaaa0003-f008-0003-0003-000000000003','C','That adults learn languages faster than children',FALSE,3),
('aaaa0003-f008-0003-0003-000000000003','D','That grammar is innate and needs no input',FALSE,4),
('aaaa0003-f009-0003-0003-000000000003','A','Before age three',FALSE,1),
('aaaa0003-f009-0003-0003-000000000003','B','Before age seven',TRUE,2),
('aaaa0003-f009-0003-0003-000000000003','C','Before age twelve',FALSE,3),
('aaaa0003-f009-0003-0003-000000000003','D','Before age fifteen',FALSE,4),
('aaaa0003-f010-0003-0003-000000000003','A','Improved musical ability',FALSE,1),
('aaaa0003-f010-0003-0003-000000000003','B','Enhanced executive function',TRUE,2),
('aaaa0003-f010-0003-0003-000000000003','C','Better mathematical reasoning',FALSE,3),
('aaaa0003-f010-0003-0003-000000000003','D','Increased emotional intelligence',FALSE,4),
('aaaa0003-f011-0003-0003-000000000003','A','One to two years',FALSE,1),
('aaaa0003-f011-0003-0003-000000000003','B','Four to five years',TRUE,2),
('aaaa0003-f011-0003-0003-000000000003','C','Seven to eight years',FALSE,3),
('aaaa0003-f011-0003-0003-000000000003','D','Ten or more years',FALSE,4),
('aaaa0003-f012-0003-0003-000000000003','A','Recurrent neural networks',FALSE,1),
('aaaa0003-f012-0003-0003-000000000003','B','Transformer architectures',TRUE,2),
('aaaa0003-f012-0003-0003-000000000003','C','Convolutional neural networks',FALSE,3),
('aaaa0003-f012-0003-0003-000000000003','D','Bayesian networks',FALSE,4),
('aaaa0003-f013-0003-0003-000000000003','A','Complete silence and inability to speak',FALSE,1),
('aaaa0003-f013-0003-0003-000000000003','B','Slow but grammatically correct speech',FALSE,2),
('aaaa0003-f013-0003-0003-000000000003','C','Fluent but often meaningless speech',TRUE,3),
('aaaa0003-f013-0003-0003-000000000003','D','Normal speech with impaired reading',FALSE,4),
('aaaa0003-f014-0003-0003-000000000003','A','Linguistic creativity',FALSE,1),
('aaaa0003-f014-0003-0003-000000000003','B','Neural reserve',TRUE,2),
('aaaa0003-f014-0003-0003-000000000003','C','Brain plasticity',FALSE,3),
('aaaa0003-f014-0003-0003-000000000003','D','Synaptic pruning',FALSE,4);
