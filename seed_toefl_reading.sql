-- ============================================
-- TOEFL iBT FULL READING TEST — 20 Questions (2 Passages)
-- Run in Supabase SQL Editor
-- ============================================

-- Clean old TOEFL reading seed data
DELETE FROM public.options WHERE question_id IN (SELECT id FROM public.questions WHERE passage_id IN ('cc010001-0001-0001-0001-000000000001','cc010002-0002-0002-0002-000000000002'));
DELETE FROM public.questions WHERE passage_id IN ('cc010001-0001-0001-0001-000000000001','cc010002-0002-0002-0002-000000000002');
DELETE FROM public.passages WHERE id IN ('cc010001-0001-0001-0001-000000000001','cc010002-0002-0002-0002-000000000002');

-- ============================================
-- PASSAGE 1: The Formation of the Solar System (10 Qs)
-- ============================================
INSERT INTO public.passages (id, title, content, module, word_count, difficulty, exam_type) VALUES (
'cc010001-0001-0001-0001-000000000001',
'The Formation of the Solar System',
E'The solar system, comprising the Sun, eight planets, dwarf planets, moons, asteroids, and comets, is believed to have formed approximately 4.6 billion years ago from a giant molecular cloud of gas and dust known as the solar nebula. This theory, called the nebular hypothesis, was first proposed in the 18th century by Immanuel Kant and Pierre-Simon Laplace, and it remains the most widely accepted scientific explanation for the origin of our planetary system.\n\nAccording to the nebular hypothesis, the process began when a region of the solar nebula experienced a gravitational disturbance — possibly triggered by a nearby supernova explosion — that caused it to collapse inward. As the cloud contracted under its own gravity, it began to spin faster and flatten into a rotating disk, much like a spinning ball of pizza dough flattens as it is tossed. The dense, hot center of this disk became the protosun, which would eventually ignite through nuclear fusion to become the Sun we know today.\n\nWithin the remaining disk of gas and dust — called the protoplanetary disk — solid particles began to collide and stick together in a process known as accretion. Near the young Sun, where temperatures were extremely high, only metals and silicate minerals could remain solid. These materials formed small, rocky bodies called planetesimals, which eventually merged through repeated collisions to form the four terrestrial planets: Mercury, Venus, Earth, and Mars. This region of the disk is sometimes referred to as the "frost line" boundary, inside of which volatile compounds like water and methane could not condense into solid form.\n\nBeyond the frost line, temperatures were low enough for volatile compounds to freeze into solid ice grains. These icy particles, combined with rock and metal, accumulated into much larger cores — some reaching ten times the mass of Earth. These massive cores then attracted enormous envelopes of hydrogen and helium gas from the surrounding nebula, growing into the gas giants Jupiter and Saturn. Farther still from the Sun, Uranus and Neptune formed as ice giants, accumulating substantial amounts of frozen volatiles but comparatively less hydrogen and helium than their larger neighbors.\n\nThe formation of the giant planets had profound effects on the architecture of the solar system. Jupiter, in particular, with its immense gravitational influence, is thought to have prevented the formation of a planet in the region now occupied by the asteroid belt between Mars and Jupiter. The gravitational perturbations from Jupiter continually disrupted the accretion process in this zone, scattering planetesimals and preventing them from coalescing into a single large body.\n\nAs the Sun matured and its nuclear fusion reactions stabilized, it generated a powerful stellar wind — a stream of charged particles flowing outward from its surface. This solar wind gradually swept away the remaining gas and dust from the protoplanetary disk, effectively ending the planet-formation process. The entire sequence, from initial cloud collapse to the clearing of the disk, is estimated to have taken between 10 and 100 million years.\n\nResidual debris from the formation process persists today in several forms. The asteroid belt contains rocky remnants that never formed into a planet. The Kuiper Belt, located beyond the orbit of Neptune, is a vast region populated by icy bodies, including the dwarf planet Pluto. Even farther out, the hypothetical Oort Cloud is thought to be a spherical shell of icy objects that marks the outermost boundary of the Sun''s gravitational influence. Comets that occasionally visit the inner solar system are believed to originate from these distant reservoirs.\n\nRecent discoveries of exoplanetary systems — planetary systems orbiting other stars — have both confirmed and challenged aspects of the nebular hypothesis. While many systems exhibit patterns consistent with the theory, others contain "hot Jupiters" — gas giants orbiting extremely close to their parent stars — suggesting that planetary migration plays a more significant role than originally anticipated. These findings have prompted scientists to refine the nebular hypothesis, incorporating mechanisms such as gravitational interactions between planets and the protoplanetary disk that can cause planets to migrate inward or outward from their original formation locations.',
'reading', 680, 'medium', 'toefl'
);

-- Passage 1 Questions (10)
INSERT INTO public.questions (id, passage_id, question_text, explanation, difficulty, sort_order) VALUES
('cc010001-f001-0001-0001-000000000001','cc010001-0001-0001-0001-000000000001','According to the passage, what event may have triggered the collapse of the solar nebula?','The passage states a nearby supernova explosion may have caused the gravitational disturbance.','easy',1),
('cc010001-f002-0001-0001-000000000001','cc010001-0001-0001-0001-000000000001','The word "accretion" in paragraph 3 is closest in meaning to','Accretion refers to the process of growth by gradual accumulation — particles colliding and sticking together.','medium',2),
('cc010001-f003-0001-0001-000000000001','cc010001-0001-0001-0001-000000000001','What is the "frost line" as described in the passage?','The boundary inside of which volatile compounds could not condense into solid form.','medium',3),
('cc010001-f004-0001-0001-000000000001','cc010001-0001-0001-0001-000000000001','According to the passage, how did the gas giants Jupiter and Saturn form?','Large icy/rocky cores attracted enormous envelopes of hydrogen and helium gas.','medium',4),
('cc010001-f005-0001-0001-000000000001','cc010001-0001-0001-0001-000000000001','Why does the passage mention the asteroid belt?','To illustrate how Jupiter''s gravity prevented a planet from forming in that region.','medium',5),
('cc010001-f006-0001-0001-000000000001','cc010001-0001-0001-0001-000000000001','What ended the planet-formation process according to the passage?','The solar wind from the maturing Sun swept away remaining gas and dust from the disk.','medium',6),
('cc010001-f007-0001-0001-000000000001','cc010001-0001-0001-0001-000000000001','Which of the following best describes the organization of the passage?','The passage presents a chronological account of solar system formation, then discusses modern refinements.','hard',7),
('cc010001-f008-0001-0001-000000000001','cc010001-0001-0001-0001-000000000001','What can be inferred about Uranus and Neptune from the passage?','They are smaller than Jupiter and Saturn because they accumulated less hydrogen and helium.','hard',8),
('cc010001-f009-0001-0001-000000000001','cc010001-0001-0001-0001-000000000001','What are "hot Jupiters" as mentioned in the final paragraph?','Gas giant planets that orbit extremely close to their parent stars.','easy',9),
('cc010001-f010-0001-0001-000000000001','cc010001-0001-0001-0001-000000000001','The passage implies that the nebular hypothesis has been','Modified and refined based on new discoveries about exoplanetary systems.','hard',10);

-- Passage 1 Options (40)
INSERT INTO public.options (question_id, option_label, option_text, is_correct, sort_order) VALUES
('cc010001-f001-0001-0001-000000000001','A','A collision between two existing stars',FALSE,1),
('cc010001-f001-0001-0001-000000000001','B','A nearby supernova explosion',TRUE,2),
('cc010001-f001-0001-0001-000000000001','C','The gravitational pull of a passing comet',FALSE,3),
('cc010001-f001-0001-0001-000000000001','D','A sudden increase in solar radiation',FALSE,4),
('cc010001-f002-0001-0001-000000000001','A','Gradual accumulation',TRUE,1),
('cc010001-f002-0001-0001-000000000001','B','Rapid explosion',FALSE,2),
('cc010001-f002-0001-0001-000000000001','C','Chemical decomposition',FALSE,3),
('cc010001-f002-0001-0001-000000000001','D','Magnetic attraction',FALSE,4),
('cc010001-f003-0001-0001-000000000001','A','The point where the Sun''s gravity is weakest',FALSE,1),
('cc010001-f003-0001-0001-000000000001','B','The boundary beyond which volatile compounds could freeze into solid ice',TRUE,2),
('cc010001-f003-0001-0001-000000000001','C','The edge of the asteroid belt',FALSE,3),
('cc010001-f003-0001-0001-000000000001','D','The outer limit of the Kuiper Belt',FALSE,4),
('cc010001-f004-0001-0001-000000000001','A','They formed from collisions between existing planets',FALSE,1),
('cc010001-f004-0001-0001-000000000001','B','They were captured from another star system',FALSE,2),
('cc010001-f004-0001-0001-000000000001','C','Massive icy-rocky cores attracted large envelopes of hydrogen and helium',TRUE,3),
('cc010001-f004-0001-0001-000000000001','D','Solar wind compressed gas into spherical shapes',FALSE,4),
('cc010001-f005-0001-0001-000000000001','A','To show that all rocky debris eventually forms planets',FALSE,1),
('cc010001-f005-0001-0001-000000000001','B','To illustrate how Jupiter''s gravity prevented a planet from forming',TRUE,2),
('cc010001-f005-0001-0001-000000000001','C','To explain the origin of comets',FALSE,3),
('cc010001-f005-0001-0001-000000000001','D','To describe how Mars lost its atmosphere',FALSE,4),
('cc010001-f006-0001-0001-000000000001','A','A massive collision between Earth and another planet',FALSE,1),
('cc010001-f006-0001-0001-000000000001','B','The exhaustion of all available material in the disk',FALSE,2),
('cc010001-f006-0001-0001-000000000001','C','The solar wind swept away remaining gas and dust',TRUE,3),
('cc010001-f006-0001-0001-000000000001','D','Gravitational forces from nearby star systems',FALSE,4),
('cc010001-f007-0001-0001-000000000001','A','A comparison of competing theories about planetary formation',FALSE,1),
('cc010001-f007-0001-0001-000000000001','B','A chronological account of solar system formation followed by modern refinements',TRUE,2),
('cc010001-f007-0001-0001-000000000001','C','A series of unrelated scientific observations',FALSE,3),
('cc010001-f007-0001-0001-000000000001','D','An argument against the nebular hypothesis',FALSE,4),
('cc010001-f008-0001-0001-000000000001','A','They are composed entirely of rock and metal',FALSE,1),
('cc010001-f008-0001-0001-000000000001','B','They formed closer to the Sun than Jupiter',FALSE,2),
('cc010001-f008-0001-0001-000000000001','C','They are smaller than Jupiter and Saturn because they accumulated less hydrogen and helium',TRUE,3),
('cc010001-f008-0001-0001-000000000001','D','They were the first planets to form in the solar system',FALSE,4),
('cc010001-f009-0001-0001-000000000001','A','Small rocky planets near the Sun',FALSE,1),
('cc010001-f009-0001-0001-000000000001','B','Gas giants orbiting extremely close to their parent stars',TRUE,2),
('cc010001-f009-0001-0001-000000000001','C','Stars that have unusually high surface temperatures',FALSE,3),
('cc010001-f009-0001-0001-000000000001','D','Moons of Jupiter that have volcanic activity',FALSE,4),
('cc010001-f010-0001-0001-000000000001','A','Completely disproven by recent observations',FALSE,1),
('cc010001-f010-0001-0001-000000000001','B','Confirmed without any need for modification',FALSE,2),
('cc010001-f010-0001-0001-000000000001','C','Modified and refined based on new exoplanetary discoveries',TRUE,3),
('cc010001-f010-0001-0001-000000000001','D','Replaced by a completely different theory',FALSE,4);

-- ============================================
-- PASSAGE 2: The Rise of Behavioral Economics (10 Qs)
-- ============================================
INSERT INTO public.passages (id, title, content, module, word_count, difficulty, exam_type) VALUES (
'cc010002-0002-0002-0002-000000000002',
'The Rise of Behavioral Economics',
E'For much of the 20th century, mainstream economics was built upon a foundational assumption: that human beings are rational actors who consistently make decisions that maximize their own utility, or personal benefit. This idealized decision-maker, often referred to as Homo economicus, was assumed to have access to all relevant information, the cognitive capacity to process it perfectly, and the self-discipline to always choose the option that best serves their long-term interests. Traditional economic models, from supply and demand curves to game theory, were constructed on this premise.\n\nHowever, beginning in the 1970s, a growing body of research from psychology began to challenge this assumption in fundamental ways. The pioneering work of psychologists Daniel Kahneman and Amos Tversky demonstrated through carefully designed experiments that human judgment and decision-making are systematically subject to predictable biases and errors — what they called cognitive biases. Their research showed that people do not evaluate outcomes in absolute terms but rather relative to a reference point, and that losses loom larger than equivalent gains — a phenomenon they termed "loss aversion."\n\nKahneman and Tversky''s prospect theory, published in 1979, offered a mathematical framework for understanding these deviations from rational behavior. Unlike expected utility theory, which assumes people evaluate the probability and magnitude of outcomes consistently, prospect theory demonstrated that people overweight small probabilities (explaining why they buy lottery tickets) and underweight large probabilities (explaining why they buy insurance even for unlikely events). The theory also showed that the value function is concave for gains but convex for losses, meaning people are risk-averse when dealing with potential gains but risk-seeking when trying to avoid losses.\n\nThe integration of these psychological insights into economic analysis gave rise to the field now known as behavioral economics. Richard Thaler, an economist at the University of Chicago, played a central role in bridging the gap between psychology and economics. Thaler identified numerous examples of what he called "anomalies" — observed economic behaviors that violated the predictions of standard rational models. These included the endowment effect (people value items they own more highly than identical items they do not own), mental accounting (people treat money differently depending on its source or intended use), and the status quo bias (people tend to stick with their current situation even when better alternatives are available).\n\nOne of the most influential practical applications of behavioral economics has been the concept of "nudging," developed by Thaler and legal scholar Cass Sunstein. A nudge is a subtle change in how choices are presented — the "choice architecture" — that predictably alters people''s behavior without restricting their options or significantly changing their economic incentives. For example, automatically enrolling employees in retirement savings plans (while allowing them to opt out) dramatically increases participation rates compared to requiring employees to actively opt in. The underlying behavior hasn''t changed — people still prefer the default option — but the outcome is significantly improved.\n\nGovernments around the world have adopted nudge-based policies. The United Kingdom established the Behavioural Insights Team (often called the "Nudge Unit") in 2010, which has implemented interventions in areas ranging from tax compliance to organ donation. Similarly, the United States created the Social and Behavioral Sciences Team during the Obama administration. These initiatives have demonstrated that small, cost-effective changes to the way information is presented or defaults are set can produce substantial improvements in public welfare.\n\nCritics of behavioral economics raise several important concerns. Some argue that the field overstates the irrationality of human decision-making, pointing out that many so-called biases may actually be adaptive heuristics — mental shortcuts that work well in most real-world situations, even if they fail in contrived laboratory experiments. Others worry about the paternalistic implications of nudging, questioning whether governments and corporations should be designing choice architectures that steer people toward particular outcomes, even ostensibly beneficial ones. There are also concerns about the replicability of some behavioral economics findings, as several prominent studies have failed to replicate in subsequent experiments.\n\nDespite these criticisms, behavioral economics has fundamentally altered the landscape of economic thought. Daniel Kahneman received the Nobel Prize in Economics in 2002, and Richard Thaler followed in 2017, signaling the mainstream acceptance of psychological approaches to economic analysis. The field continues to expand, with researchers applying behavioral insights to areas including healthcare, environmental policy, education, and financial regulation. Whether one views behavioral economics as a revolutionary paradigm shift or a useful complement to traditional models, its impact on both academic economics and public policy is undeniable.',
'reading', 720, 'hard', 'toefl'
);

-- Passage 2 Questions (10)
INSERT INTO public.questions (id, passage_id, question_text, explanation, difficulty, sort_order) VALUES
('cc010002-f001-0002-0002-000000000002','cc010002-0002-0002-0002-000000000002','What is the primary purpose of paragraph 1?','To introduce the traditional economic assumption of rational decision-making that behavioral economics later challenged.','easy',1),
('cc010002-f002-0002-0002-000000000002','cc010002-0002-0002-0002-000000000002','According to the passage, what is "loss aversion"?','The phenomenon where losses feel more significant than equivalent gains.','easy',2),
('cc010002-f003-0002-0002-000000000002','cc010002-0002-0002-0002-000000000002','The word "anomalies" in paragraph 4 is closest in meaning to','Anomalies are deviations from what is expected or normal — observed behaviors that contradicted standard models.','medium',3),
('cc010002-f004-0002-0002-000000000002','cc010002-0002-0002-0002-000000000002','Which of the following is an example of the endowment effect?','Valuing an item you already own more highly than an identical item you do not own.','medium',4),
('cc010002-f005-0002-0002-000000000002','cc010002-0002-0002-0002-000000000002','According to the passage, what is a "nudge"?','A subtle change in how choices are presented that predictably alters behavior without restricting options.','medium',5),
('cc010002-f006-0002-0002-000000000002','cc010002-0002-0002-0002-000000000002','Why does the author mention automatic enrollment in retirement savings plans?','As a concrete example of how nudging can improve outcomes by changing the default option.','medium',6),
('cc010002-f007-0002-0002-000000000002','cc010002-0002-0002-0002-000000000002','What can be inferred about prospect theory from paragraph 3?','It provides a more accurate description of actual human behavior than expected utility theory.','hard',7),
('cc010002-f008-0002-0002-000000000002','cc010002-0002-0002-0002-000000000002','According to the passage, critics of behavioral economics argue that','Some cognitive biases may actually be useful mental shortcuts that work well in most real-world situations.','hard',8),
('cc010002-f009-0002-0002-000000000002','cc010002-0002-0002-0002-000000000002','The author''s attitude toward behavioral economics in the final paragraph can best be described as','Balanced — acknowledging both the field''s significant impact and the legitimate criticisms it faces.','hard',9),
('cc010002-f010-0002-0002-000000000002','cc010002-0002-0002-0002-000000000002','All of the following are mentioned as applications of behavioral economics EXCEPT','Military strategy is not mentioned in the passage.','medium',10);

-- Passage 2 Options (40)
INSERT INTO public.options (question_id, option_label, option_text, is_correct, sort_order) VALUES
('cc010002-f001-0002-0002-000000000002','A','To describe the history of psychology as a discipline',FALSE,1),
('cc010002-f001-0002-0002-000000000002','B','To introduce the traditional economic assumption that behavioral economics challenged',TRUE,2),
('cc010002-f001-0002-0002-000000000002','C','To argue that Homo economicus is the most accurate model of human behavior',FALSE,3),
('cc010002-f001-0002-0002-000000000002','D','To explain why game theory was developed',FALSE,4),
('cc010002-f002-0002-0002-000000000002','A','The tendency to prefer familiar products over new ones',FALSE,1),
('cc010002-f002-0002-0002-000000000002','B','The phenomenon where losses feel more significant than equivalent gains',TRUE,2),
('cc010002-f002-0002-0002-000000000002','C','The bias toward choosing options that are presented first',FALSE,3),
('cc010002-f002-0002-0002-000000000002','D','The preference for certain outcomes over uncertain ones',FALSE,4),
('cc010002-f003-0002-0002-000000000002','A','Predictions',FALSE,1),
('cc010002-f003-0002-0002-000000000002','B','Deviations from expected patterns',TRUE,2),
('cc010002-f003-0002-0002-000000000002','C','Mathematical formulas',FALSE,3),
('cc010002-f003-0002-0002-000000000002','D','Scientific experiments',FALSE,4),
('cc010002-f004-0002-0002-000000000002','A','Buying a lottery ticket because the jackpot is large',FALSE,1),
('cc010002-f004-0002-0002-000000000002','B','Refusing to sell a coffee mug for the same price you would pay to buy it',TRUE,2),
('cc010002-f004-0002-0002-000000000002','C','Choosing the default option on a form',FALSE,3),
('cc010002-f004-0002-0002-000000000002','D','Investing in stocks rather than bonds',FALSE,4),
('cc010002-f005-0002-0002-000000000002','A','A financial incentive to change behavior',FALSE,1),
('cc010002-f005-0002-0002-000000000002','B','A law that restricts certain choices',FALSE,2),
('cc010002-f005-0002-0002-000000000002','C','A subtle change in choice presentation that alters behavior without restricting options',TRUE,3),
('cc010002-f005-0002-0002-000000000002','D','A psychological therapy technique',FALSE,4),
('cc010002-f006-0002-0002-000000000002','A','To criticize corporate retirement policies',FALSE,1),
('cc010002-f006-0002-0002-000000000002','B','To demonstrate how nudging improves outcomes by changing the default option',TRUE,2),
('cc010002-f006-0002-0002-000000000002','C','To show that people are rational decision-makers',FALSE,3),
('cc010002-f006-0002-0002-000000000002','D','To argue against government intervention in financial planning',FALSE,4),
('cc010002-f007-0002-0002-000000000002','A','It is less mathematically rigorous than expected utility theory',FALSE,1),
('cc010002-f007-0002-0002-000000000002','B','It has been completely disproven by subsequent research',FALSE,2),
('cc010002-f007-0002-0002-000000000002','C','It provides a more accurate description of actual human behavior than expected utility theory',TRUE,3),
('cc010002-f007-0002-0002-000000000002','D','It only applies to financial decisions',FALSE,4),
('cc010002-f008-0002-0002-000000000002','A','The field has no practical applications',FALSE,1),
('cc010002-f008-0002-0002-000000000002','B','Kahneman and Tversky conducted fraudulent experiments',FALSE,2),
('cc010002-f008-0002-0002-000000000002','C','Some biases may actually be useful mental shortcuts for real-world situations',TRUE,3),
('cc010002-f008-0002-0002-000000000002','D','Traditional economic models are always superior',FALSE,4),
('cc010002-f009-0002-0002-000000000002','A','Highly critical and dismissive',FALSE,1),
('cc010002-f009-0002-0002-000000000002','B','Balanced, acknowledging both impact and legitimate criticisms',TRUE,2),
('cc010002-f009-0002-0002-000000000002','C','Unconditionally enthusiastic',FALSE,3),
('cc010002-f009-0002-0002-000000000002','D','Neutral and uninterested',FALSE,4),
('cc010002-f010-0002-0002-000000000002','A','Healthcare policy',FALSE,1),
('cc010002-f010-0002-0002-000000000002','B','Tax compliance',FALSE,2),
('cc010002-f010-0002-0002-000000000002','C','Financial regulation',FALSE,3),
('cc010002-f010-0002-0002-000000000002','D','Military strategy',TRUE,4);
