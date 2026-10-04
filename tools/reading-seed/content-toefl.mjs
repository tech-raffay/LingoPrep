/**
 * TOEFL iBT Reading — one practice form in the format used since
 * 21 January 2026 (ETS "TOEFL iBT Test: 2026 Update, Test Blueprint and
 * Specifications"):
 *
 *   Complete the Words      30 items  (3 paragraphs × 10 missing-letter words)
 *   Read in Daily Life      10 items  (2-item and 3-item sets on short
 *                                      everyday texts)
 *   Read an Academic Passage 10 items (2 passages of about 200 words × 5)
 *                           ── 50 items, about 30 minutes
 *
 * The real section is two-stage adaptive (a first module, then an easier or
 * harder second module). This practice form is linear: Module 1 is tasks
 * 1–5 (30 items), Module 2 is tasks 6–9 (20 items).
 *
 * Complete the Words: the first sentence is left intact; after that the
 * second half of every second word is removed (build.mjs does this).
 *
 * Everyday texts start with a tag line, then optional "Key: value" header
 * lines, a blank line, and the body:  [NOTICE] [EMAIL] [MESSAGES] [POST]
 */

const mc = (text, options, answer, why) => ({ text, options, answer, why });

export const TOEFL = [
  /* ── Module 1 ──────────────────────────────────────────────────────── */
  {
    id: "cc020001-0001-0001-0001-000000000001",
    title: "Complete the Words: Sleep and Memory",
    difficulty: "medium",
    task: "complete_words",
    text: "Scientists have long suspected that sleep does more than rest the body. During deep sleep, the brain replays the events of the day and moves important information into permanent storage. Students who sleep after studying usually remember more than those who stay awake. Even a short nap can improve the recall of new facts. For this reason, researchers advise against studying all night before an examination. A regular sleep schedule may therefore be as valuable as extra hours of revision.",
  },
  {
    id: "cc020002-0002-0002-0002-000000000002",
    title: "Complete the Words: Urban Heat",
    difficulty: "medium",
    task: "complete_words",
    text: "Cities are usually warmer than the countryside around them. Dark surfaces such as roads and roofs absorb heat during the day and release it slowly at night. Tall buildings also block the wind that would otherwise carry warm air away. Planting trees and creating parks can lower temperatures by several degrees. Some cities now paint roofs white so that they reflect sunlight instead of storing it. Such simple measures are cheaper than air conditioning and use no energy.",
  },
  {
    id: "cc020003-0003-0003-0003-000000000003",
    title: "Library Notice",
    difficulty: "easy",
    task: "daily_life",
    content: [
      "[NOTICE]",
      "Title: Main Library: Summer Opening Hours",
      "",
      "From 1 June to 31 August, the Main Library will close at 6 p.m. on weekdays and will not open on Sundays.",
      "",
      "The 24-hour study room on the ground floor remains open to students with a valid ID card.",
      "",
      "Books borrowed before 1 June may be returned to the drop box beside the main entrance at any time.",
    ].join("\n"),
    questions: [
      mc("What is the main purpose of the notice?",
        ["To announce a change in the library's hours", "To introduce a new study room", "To remind students to renew their ID cards", "To explain how to borrow books"],
        "A", "The notice gives the library's reduced summer opening hours."),
      mc("What should a student do to return a book on a Sunday in July?",
        ["Hand it to a member of staff at the desk", "Wait until the library opens on Monday", "Leave it in the drop box near the entrance", "Take it to the 24-hour study room"],
        "C", "The library is closed on Sundays, but books 'may be returned to the drop box beside the main entrance at any time'."),
    ],
  },
  {
    id: "cc020004-0004-0004-0004-000000000004",
    title: "Email from a Professor",
    difficulty: "medium",
    task: "daily_life",
    content: [
      "[EMAIL]",
      "From: Dr. Elena Marsh",
      "To: BIO 210 students",
      "Subject: Thursday's lab session moved",
      "",
      "Dear students,",
      "",
      "The heating system in Room 114 is being repaired this week, so Thursday's lab will take place in Room 220 of the Science Annex instead. The start time has not changed.",
      "",
      "Please bring your own lab coat and goggles, as the Annex has no spare equipment.",
      "",
      "If you cannot attend, email me before noon on Wednesday so that I can arrange a place for you in Friday's group.",
      "",
      "Best regards,",
      "Dr. Marsh",
    ].join("\n"),
    questions: [
      mc("Why has the lab session been moved?",
        ["Room 114 is too small for the class.", "Repairs are being carried out in the usual room.", "The Annex has better equipment.", "Friday's group is already full."],
        "B", "The heating system in Room 114 'is being repaired this week'."),
      mc("What are students told to bring?",
        ["Their own safety equipment", "A spare lab coat for a partner", "Their student ID card", "A printed copy of the email"],
        "A", "Students must bring their own lab coat and goggles because the Annex has no spare equipment."),
      mc("What can be inferred about students who cannot attend on Thursday?",
        ["They will lose marks for the session.", "They may be able to join another session.", "They must repeat the course.", "They should go to Room 114 on Friday."],
        "B", "Dr. Marsh offers to 'arrange a place for you in Friday's group'."),
    ],
  },
  {
    id: "cc020005-0005-0005-0005-000000000005",
    title: "How Bees Share Information",
    difficulty: "medium",
    task: "academic",
    content: [
      "When a honeybee finds a rich source of nectar, she does not keep the discovery to herself. Returning to the hive, she performs what biologists call the waggle dance, a series of movements that tells other workers where the food is. The dancer runs in a straight line while shaking her body, then circles back and repeats the run. The angle of the straight run on the vertical surface of the comb indicates the direction of the food in relation to the sun, while the duration of the run conveys distance: the longer the waggle, the farther the flowers.",
      "The Austrian scientist Karl von Frisch decoded this behaviour in the 1940s, and his conclusions were initially met with scepticism. Many researchers believed that bees simply followed the scent carried by the dancer. Later experiments using robotic bees, which could dance but carried no odour, showed that recruits do use the information in the dance itself. Scent nevertheless plays a supporting role, helping bees to pinpoint the flowers once they have arrived in the right area.",
    ].join("\n\n"),
    questions: [
      mc("What is the passage mainly about?",
        ["How bees find their way back to the hive", "How bees communicate the location of food", "Why bees prefer certain flowers", "How scientists build robotic insects"],
        "B", "The passage explains the waggle dance, which 'tells other workers where the food is'."),
      mc("According to paragraph 1, what does the length of the straight run indicate?",
        ["The quality of the nectar", "The position of the sun", "How far away the food is", "The number of bees that are needed"],
        "C", "'The duration of the run conveys distance: the longer the waggle, the farther the flowers.'"),
      mc("The word \"scepticism\" in the passage is closest in meaning to",
        ["doubt", "excitement", "anger", "curiosity"],
        "A", "Scepticism means doubt: many researchers did not at first accept von Frisch's conclusions."),
      mc("Why does the author mention robotic bees?",
        ["To describe a new way of pollinating crops", "To give evidence that the dance itself carries information", "To show that bees are easily fooled by machines", "To explain how von Frisch carried out his research"],
        "B", "Robotic bees carried no odour, yet recruits still found the food, so the dance must carry the information."),
      mc("What can be inferred about scent from the passage?",
        ["It is more important than the dance.", "It plays no part in finding food.", "It is most useful once bees are close to the flowers.", "Robotic bees used it to recruit workers."],
        "C", "Scent helps bees 'pinpoint the flowers once they have arrived in the right area'."),
    ],
  },

  /* ── Module 2 ──────────────────────────────────────────────────────── */
  {
    id: "cc020006-0006-0006-0006-000000000006",
    title: "Complete the Words: The Printing Press",
    difficulty: "medium",
    task: "complete_words",
    text: "The invention of the printing press changed how knowledge spread across Europe. Before printing, each book had to be copied by hand, which took months and made books extremely expensive. Printed books were cheaper and could be produced in large numbers. As a result, more people learned to read, and new ideas travelled quickly from one country to another. Scholars could now compare the same text in different cities, which made errors easier to find and correct.",
  },
  {
    id: "cc020007-0007-0007-0007-000000000007",
    title: "Group Chat",
    difficulty: "easy",
    task: "daily_life",
    content: [
      "[MESSAGES]",
      "Title: Marketing project group",
      "",
      "Priya: Has anyone booked a room for tomorrow's rehearsal?",
      "Tom: I tried, but everything in the business school is taken until 5.",
      "Priya: What about the study rooms in the student centre?",
      "Tom: Good idea. I'll check now.",
      "Tom: Done. Room 3B, 2 to 4 p.m.",
      "Priya: Perfect. I'll bring the slides. Can you bring the handouts?",
      "Tom: Sure. I'll print them tonight.",
    ].join("\n"),
    questions: [
      mc("What problem do the students have at first?",
        ["Their slides are not finished.", "The rooms in one building are unavailable.", "The rehearsal has been cancelled.", "The student centre is closed."],
        "B", "Tom says everything in the business school 'is taken until 5'."),
      mc("What will Tom probably do this evening?",
        ["Book another room", "Finish the slides", "Print the handouts", "Meet Priya at the business school"],
        "C", "Tom agrees to bring the handouts and says, 'I'll print them tonight.'"),
    ],
  },
  {
    id: "cc020008-0008-0008-0008-000000000008",
    title: "Club Announcement",
    difficulty: "medium",
    task: "daily_life",
    content: [
      "[POST]",
      "From: Riverside University Cycling Club",
      "",
      "Our autumn bike sale is this Saturday, 9 a.m. to 1 p.m., outside the sports hall.",
      "",
      "All bikes have been repaired and safety-checked by club volunteers, and prices start at $40. Payment is by card only.",
      "",
      "Arrive early: last year every bike was gone by 11. The money raised pays for free repair workshops during the term.",
    ].join("\n"),
    questions: [
      mc("What is the post mainly about?",
        ["A workshop on repairing bicycles", "An event at which used bicycles are sold", "A cycling race around the campus", "The cost of joining the club"],
        "B", "The post announces the club's autumn bike sale."),
      mc("Why does the writer mention last year's sale?",
        ["To show that prices have gone up", "To encourage readers to come early", "To explain why fewer bikes are available", "To thank the volunteers"],
        "B", "'Arrive early: last year every bike was gone by 11.'"),
      mc("Which of the following is NOT true of the sale?",
        ["It takes place in the morning.", "The bikes have been checked for safety.", "Buyers can pay in cash.", "The money supports club activities."],
        "C", "The post says 'Payment is by card only', so cash is not accepted."),
    ],
  },
  {
    id: "cc020009-0009-0009-0009-000000000009",
    title: "The Little Ice Age",
    difficulty: "hard",
    task: "academic",
    content: [
      "Between roughly 1300 and 1850, much of the Northern Hemisphere experienced a period of cooler temperatures known as the Little Ice Age. The cooling was modest, perhaps one degree Celsius on average, but its consequences were considerable. Glaciers in the Alps advanced and destroyed mountain villages, rivers such as the Thames froze hard enough for fairs to be held on the ice, and shorter growing seasons led to repeated crop failures.",
      "Scientists have proposed several explanations. A series of large volcanic eruptions filled the upper atmosphere with particles that reflected sunlight back into space. At the same time, the sun itself appears to have been less active, a pattern suggested by the scarcity of sunspots recorded by astronomers of the period. Neither factor alone seems sufficient, and most researchers now believe that the two acted together.",
      "Societies responded in different ways. Farmers in northern Europe turned to hardier crops such as the potato, while Dutch engineers took advantage of frozen canals to move goods by sledge. The period thus illustrates both the vulnerability of human communities to climate and their capacity to adapt.",
    ].join("\n\n"),
    questions: [
      mc("According to paragraph 1, which of the following was an effect of the Little Ice Age?",
        ["Harvests failed more often.", "Sea levels rose.", "Villages in the Alps grew larger.", "Growing seasons became longer."],
        "A", "'Shorter growing seasons led to repeated crop failures.'"),
      mc("The word \"modest\" in the passage is closest in meaning to",
        ["sudden", "small", "uneven", "permanent"],
        "B", "The cooling was only about one degree Celsius, so 'modest' means small."),
      mc("What do most researchers now believe caused the cooling?",
        ["Volcanic eruptions alone", "A decline in solar activity alone", "A combination of eruptions and reduced solar activity", "The advance of glaciers in the Alps"],
        "C", "'Neither factor alone seems sufficient, and most researchers now believe that the two acted together.'"),
      mc("Why does the author mention sunspots?",
        ["To provide evidence that the sun was less active", "To explain how astronomers measured temperature", "To show that volcanic particles blocked the view of the sky", "To argue that early records are unreliable"],
        "A", "The scarcity of sunspots is given as the sign that the sun 'appears to have been less active'."),
      mc("What is the main point of paragraph 3?",
        ["People were unable to cope with the colder climate.", "Communities both suffered from the cold and adjusted to it.", "Dutch engineers were more inventive than farmers.", "The potato caused the population to grow."],
        "B", "The period shows 'both the vulnerability of human communities to climate and their capacity to adapt'."),
    ],
  },
];
