/**
 * IELTS Listening — one full test, as the real paper is built:
 *
 *   Part 1  a conversation between two people in an everyday social context
 *   Part 2  a monologue in an everyday social context
 *   Part 3  a conversation (up to four people) in an educational context
 *   Part 4  a monologue on an academic subject (a lecture)
 *
 * 40 questions, 10 per part, in the order the recording gives them. Each
 * recording is heard once. The recording itself carries the exam's spoken
 * directions and the pauses for reading the questions.
 *
 * Transcript conventions (read by tools/listening-seed/build.mjs and by the
 * backend's speech synthesis):
 *   "Name (f): …" / "Name (m): …"   a line of dialogue, with the speaker's
 *                                    voice gender; a line with no name is
 *                                    the announcer
 *   "[pause 20]"                      twenty seconds of silence
 *   "__BLANK__"                       a gap in a form, flow chart or notes
 */

export const IELTS = [
  /* ══════════════════════════════════════════════════════════════════════
     PART 1 — Questions 1–10 · Volunteering at a community library
     ══════════════════════════════════════════════════════════════════════ */
  {
    id: "bb100001-0001-0001-0001-000000000001",
    title: "Part 1: Volunteering at Riverside Library",
    kind: "conversation",
    setting: "A phone call to a community library",
    speakers: [{ role: "Hannah, a caller", gender: "f" }, { role: "Tom, the volunteer coordinator", gender: "m" }],
    photo: { src: "/media/listening/ielts-1-library.jpg", alt: "Rows of library bookshelves" },
    difficulty: "easy",
    transcript: `Part 1. You will hear a woman called Hannah telephoning a community library to ask about volunteering. First you have some time to look at questions 1 to 6.
[pause 20]
Now listen carefully and answer questions 1 to 6.
Tom (m): Good morning, Riverside Community Library, Tom speaking. How can I help?
Hannah (f): Oh, hello. I saw a poster in the window saying you're looking for volunteers, and I'd like to find out a bit more.
Tom (m): That's great to hear. I'm the volunteer coordinator, so you've come to the right person. Would you mind if I took a few details first?
Hannah (f): Not at all.
Tom (m): Lovely. Can I start with your full name?
Hannah (f): It's Hannah Whitfield.
Tom (m): Could you spell the surname for me?
Hannah (f): Yes, it's W-H-I-T-F-I-E-L-D.
Tom (m): W-H-I-T-F-I-E-L-D. Thank you. And your address?
Hannah (f): It's 47 Mill Lane. That's here in Riverside.
Tom (m): 47 Mill Lane. And is there a phone number we can reach you on during the day?
Hannah (f): My mobile is best. It's 07911 254683.
Tom (m): 07911 254683. Got that. Now, we like to know a little about our volunteers' backgrounds. What do you do at the moment?
Hannah (f): I'm a nurse, actually, at the hospital on the other side of town. I used to be a teaching assistant, which is partly why the children's activities appealed to me.
Tom (m): A nurse, right. That's useful, because we always need someone with first aid knowledge around. And when would you be free to come in?
Hannah (f): Well, I work shifts, so it changes, but I'm always off on Tuesday mornings. I thought Thursday afternoons might work too, but I've just taken on an extra shift then.
Tom (m): Tuesday mornings would be perfect. That's when we're busiest with the under-fives. Is there a particular role you had in mind? We have people helping on the desk, shelving returned books, running the computer sessions for older residents, and helping with the homework club after school.
Hannah (f): I did wonder about the computer sessions, but I think the homework club would suit me best. I enjoy working with children.
Tom (m): The homework club it is. We're especially short of helpers there, so that's ideal.
Before you hear the rest of the conversation, you have some time to look at questions 7 to 10.
[pause 15]
Now listen and answer questions 7 to 10.
Hannah (f): Is there any training involved?
Tom (m): There is, yes. Every new volunteer attends one training session. It used to take a whole day, but we've condensed it, so it now lasts three hours. We cover safeguarding, the library computer system and what to do in an emergency.
Hannah (f): That sounds manageable. Where does it take place?
Tom (m): Here in the library. We have a meeting room on the first floor, just past the local history section. There's a lift if you need it.
Hannah (f): Fine. And is there anything volunteers get in return? I'm not expecting to be paid, obviously.
Tom (m): No, it's unpaid, but there are a few perks. You get a free parking permit for the council car park behind the building, which is renewed every year, and you can borrow up to twelve books at a time instead of the usual eight. We also hold a volunteers' lunch in December.
Hannah (f): A parking permit would be really helpful. The hospital charges a fortune.
Tom (m): I thought it might be. So, what happens next is that I'll put together a welcome pack for you, with the training dates and a short form to fill in, and I'll send it to you by email. Could I have your email address?
Hannah (f): Of course. It's hannah dot whitfield at mailbox dot com.
Tom (m): Perfect. You should have the welcome pack by tomorrow. Thanks so much for getting in touch, Hannah.
Hannah (f): Thank you. I'm looking forward to it.
That is the end of Part 1. You now have half a minute to check your answers.
[pause 15]`,
    groups: [
      {
        type: "note_completion",
        title: "Form Completion",
        data: {
          instruction: "Complete the form below. Write NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.",
          max_words: 2,
          notes: [
            {
              heading: "Riverside Community Library: Volunteer Application",
              items: [
                "Name: Hannah __BLANK__",
                "Address: __BLANK__ Mill Lane, Riverside",
                "Mobile number: __BLANK__",
                "Current job: __BLANK__",
                "Available: __BLANK__ mornings",
                "Preferred role: helping with the __BLANK__",
              ],
            },
          ],
        },
        questions: [
          { answer: "Whitfield", why: "Hannah spells her surname: W-H-I-T-F-I-E-L-D." },
          { answer: "47", why: "'It's 47 Mill Lane.'" },
          { answer: "07911 254683|07911254683|07911 254 683", why: "'My mobile is best. It's 07911 254683.'" },
          { answer: "nurse", why: "'I'm a nurse, actually.' She used to be a teaching assistant, which is a distractor." },
          { answer: "Tuesday", why: "'I'm always off on Tuesday mornings.' Thursday afternoons are no longer possible." },
          { answer: "homework club", why: "'I think the homework club would suit me best.' The computer sessions are rejected." },
        ],
      },
      {
        type: "sentence_completion",
        title: "Sentence Completion",
        data: {
          instruction: "Complete the sentences below. Write NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.",
          max_words: 2,
        },
        questions: [
          { text: "The training session now lasts ___ hours.", answer: "3|three", why: "'It used to take a whole day, but we've condensed it, so it now lasts three hours.'" },
          { text: "Training takes place in the ___ on the first floor.", answer: "meeting room", why: "'We have a meeting room on the first floor, just past the local history section.'" },
          { text: "Volunteers are given a free ___ every year.", answer: "parking permit|car park permit", why: "'You get a free parking permit for the council car park... which is renewed every year.'" },
          { text: "Tom will email Hannah a ___.", answer: "welcome pack", why: "'I'll put together a welcome pack for you... and I'll send it to you by email.'" },
        ],
      },
    ],
  },

  /* ══════════════════════════════════════════════════════════════════════
     PART 2 — Questions 11–20 · A guide's welcome talk at a museum
     ══════════════════════════════════════════════════════════════════════ */
  {
    id: "bb100002-0002-0002-0002-000000000002",
    title: "Part 2: Welcome to the Harbourside Maritime Museum",
    kind: "monologue",
    setting: "A guide welcoming a group of visitors",
    speakers: [{ role: "Museum guide", gender: "f" }],
    photo: { src: "/media/listening/ielts-2-museum.jpg", alt: "Museum gallery wall of framed paintings" },
    difficulty: "medium",
    transcript: `Part 2. You will hear a guide welcoming a group of visitors to a maritime museum. First you have some time to look at questions 11 to 15.
[pause 20]
Now listen carefully and answer questions 11 to 15.
Guide (f): Good morning, everyone, and welcome to the Harbourside Maritime Museum. My name's Claire and I'll be looking after you today. Before we start the tour, let me explain the layout of the building, because it's easy to lose your way in here.
Guide (f): We're standing just inside the main entrance, and directly in front of you is the information desk, where you can collect a free map. Beyond the desk is the main hall, which runs right through the middle of the building, and the staircase to the upper floor is at the far end of the hall.
Guide (f): Now, if you turn to your left as you come in, the first door you reach, in the front corner, is the café. It serves hot food until three o'clock and drinks and cakes until we close. Next to the café, further along the left-hand side of the hall, you'll find the gift shop. It used to be at the back of the building, near the stairs, but we moved it last year so that it's easier to find on your way out.
Guide (f): On the right-hand side of the hall, the first room you come to, in the front corner opposite the café, is the toilets, and beyond those, halfway along the right-hand side, is the lecture theatre, where there's a short film about the history of the harbour every hour. Then at the far end on the right, just before the stairs, is the children's discovery room, with model boats to sail and costumes to try on. It's very popular, so you may have to wait at busy times.
Guide (f): Our permanent galleries are all upstairs. Downstairs, in the back corner on the left, opposite the children's room, is the temporary exhibition gallery. This month it's showing photographs of the fishing fleet in the nineteen fifties. Finally, right at the back of the hall, between the discovery room and the exhibition gallery, is the staircase I mentioned, and there's a lift beside it.
Before you hear the rest of the talk, you have some time to look at questions 16 to 20.
[pause 15]
Now listen and answer questions 16 to 20.
Guide (f): A few practical points before we set off. The museum is open from ten until five every day except Monday, when we're closed for cleaning. During the summer holidays we stay open an hour later, until six.
Guide (f): Your ticket is valid for the whole day, so you're welcome to go out for lunch and come back in. Just keep the ticket with you, because you'll be asked to show it at the desk. Unfortunately it can't be used again on another day, even if you haven't seen everything.
Guide (f): This afternoon, at two o'clock, there's a special event in the lecture theatre. We'd planned a talk by a retired lighthouse keeper, but he's unwell, so instead one of our curators will be demonstrating how sailors tied the knots you'll see in the rope gallery. There's no need to book; just turn up a few minutes early.
Guide (f): You're welcome to take photographs anywhere in the museum, including the temporary exhibition, but please don't use a flash, as it damages the older paintings and textiles. Video recording is only allowed in the children's room.
Guide (f): Lastly, large bags and rucksacks aren't permitted in the galleries. There are free lockers next to the information desk. You'll need a one-pound coin to operate them, but you get the coin back when you open the locker again. Right, if everyone's ready, let's begin with the main hall.
That is the end of Part 2. You now have half a minute to check your answers.
[pause 15]`,
    groups: [
      {
        type: "diagram_label",
        title: "Plan Labelling",
        data: {
          instruction: "Label the plan below. Write the correct letter, A–H, next to questions 11–15.",
          diagram: "museum-plan",
          diagram_title: "Harbourside Maritime Museum: ground floor",
          choices: ["A", "B", "C", "D", "E", "F", "G", "H"],
        },
        questions: [
          { text: "Café", answer: "A", why: "'If you turn to your left as you come in, the first door you reach, in the front corner, is the café.'" },
          { text: "Gift shop", answer: "B", why: "'Next to the café, further along the left-hand side of the hall, you'll find the gift shop.'" },
          { text: "Lecture theatre", answer: "F", why: "'Beyond those (the toilets), halfway along the right-hand side, is the lecture theatre.'" },
          { text: "Children's discovery room", answer: "G", why: "'At the far end on the right, just before the stairs, is the children's discovery room.'" },
          { text: "Temporary exhibition gallery", answer: "C", why: "'In the back corner on the left, opposite the children's room, is the temporary exhibition gallery.'" },
        ],
      },
      {
        type: "multiple_choice",
        title: "Multiple Choice",
        data: { instruction: "Choose the correct letter, A, B or C." },
        questions: [
          { text: "On which day is the museum closed?", options: ["Sunday", "Monday", "Saturday"], answer: "B", why: "'Every day except Monday, when we're closed for cleaning.'" },
          { text: "What does the guide say about tickets?", options: ["They can be used again the following day.", "They must be shown when re-entering the museum.", "They include a free map of the building."], answer: "B", why: "'Just keep the ticket with you, because you'll be asked to show it at the desk.'" },
          { text: "What will happen in the lecture theatre at two o'clock?", options: ["a talk by a lighthouse keeper", "a film about the harbour", "a demonstration of knots"], answer: "C", why: "The lighthouse keeper is unwell, so a curator will demonstrate knots instead." },
          { text: "Visitors must not", options: ["photograph the temporary exhibition.", "use flash photography.", "film in the children's room."], answer: "B", why: "'Please don't use a flash, as it damages the older paintings and textiles.'" },
          { text: "To use a locker, visitors need", options: ["a one-pound coin.", "to ask at the information desk.", "to leave their ticket."], answer: "A", why: "'You'll need a one-pound coin to operate them, but you get the coin back.'" },
        ],
      },
    ],
  },

  /* ══════════════════════════════════════════════════════════════════════
     PART 3 — Questions 21–30 · Two students and their tutor plan a project
     ══════════════════════════════════════════════════════════════════════ */
  {
    id: "bb100003-0003-0003-0003-000000000003",
    title: "Part 3: Planning a research project on bike sharing",
    kind: "conversation",
    setting: "A tutorial about a group research project",
    speakers: [{ role: "Priya, a student", gender: "f" }, { role: "Daniel, a student", gender: "m" }, { role: "Dr Lee, their tutor", gender: "m" }],
    photo: { src: "/media/listening/ielts-3-research.jpg", alt: "Students discussing a project at their laptops" },
    difficulty: "medium",
    transcript: `Part 3. You will hear two geography students, Priya and Daniel, discussing their research project with their tutor, Dr Lee. First you have some time to look at questions 21 to 25.
[pause 20]
Now listen carefully and answer questions 21 to 25.
Dr Lee (m): So, Priya, Daniel, you've decided to look at the new campus bike-share scheme. Have you worked out who's doing what?
Priya (f): More or less. We thought we'd start with a questionnaire for students who've used the bikes. I've done one before, for my first-year methods module, so I'll design that.
Daniel (m): And I was going to help with it, but honestly Priya's much better at wording questions than I am, so I'll leave it to her.
Dr Lee (m): Fine. You'll also need the company's own figures. They track every journey through the app.
Daniel (m): That's my job. I've already found the name of their operations manager, so I'll contact the bike company this week and ask whether they'll share the data.
Priya (f): And then somebody has to make sense of all those numbers once we get them.
Daniel (m): I assumed that would be me too, since I'd have the contact.
Dr Lee (m): Actually, I'd suggest Priya takes the usage statistics. She's done the statistics module, and you'll be busy with the interviews, Daniel.
Daniel (m): Fair enough. Priya analyses the statistics, then.
Priya (f): Speaking of the interviews, we'll need somewhere quiet to hold them. Could you book one of the rooms in the department for us, Dr Lee? Students can't do it online.
Dr Lee (m): I could, but it's quicker if you ask Mrs Hart in the office. Daniel, since you're running the interviews, you book the interview room.
Daniel (m): Will do.
Priya (f): There's also the ethics form. We filled it in last night, but I'm not sure we've described the interviews properly.
Dr Lee (m): Send it to me. Checking the ethics form is something I have to sign off anyway, so I'll go through it before you submit it.
Priya (f): Thanks, that's a relief.
Before you hear the rest of the conversation, you have some time to look at questions 26 to 30.
[pause 15]
Now listen and answer questions 26 to 30.
Dr Lee (m): Let's go through the stages, so you have a timetable. What comes first?
Priya (f): The questionnaire. But before we send it to everyone, we want to try it out on a small group. We'll run a pilot survey with about twenty first-year students, because they're the ones who use the bikes most.
Dr Lee (m): Good. And when the questionnaire is final?
Daniel (m): By then the company should have replied, so the next stage is collecting the usage data. We're hoping for a full term's journeys, with times and distances.
Dr Lee (m): Then the interviews.
Daniel (m): Yes. We did think about interviewing other students, but we've decided on staff instead, because nobody has asked them about the scheme and quite a few of them cycle in.
Priya (f): Ten staff interviews, we thought, about twenty minutes each.
Dr Lee (m): Sensible. After that you write a draft report. Who's going to read that?
Priya (f): We'd like you to, of course, but we've also arranged for the draft to be reviewed by the council's transport officer, since they fund part of the scheme and know what questions they want answered.
Dr Lee (m): Excellent. That's exactly the kind of contact that strengthens a project. And at the end?
Daniel (m): The department wants a final presentation at the research fair in May, rather than a written report. We'll have fifteen minutes and then questions.
Dr Lee (m): Then work backwards from May and you have your timetable. Well done, both of you.
That is the end of Part 3. You now have half a minute to check your answers.
[pause 15]`,
    groups: [
      {
        type: "matching_features",
        title: "Matching",
        data: {
          instruction: "Who will do each of the following tasks? Choose the correct answer for each task. You may choose any letter more than once.",
          list_title: "People",
          features: [
            { label: "A", text: "Priya" },
            { label: "B", text: "Daniel" },
            { label: "C", text: "Dr Lee" },
          ],
        },
        questions: [
          { text: "design the questionnaire", answer: "A", why: "'I've done one before... so I'll design that,' says Priya, and Daniel agrees to leave it to her." },
          { text: "contact the bike company", answer: "B", why: "'That's my job... I'll contact the bike company this week,' says Daniel." },
          { text: "analyse the usage statistics", answer: "A", why: "Dr Lee suggests Priya takes the statistics, and Daniel agrees." },
          { text: "book the interview room", answer: "B", why: "'Daniel, since you're running the interviews, you book the interview room.'" },
          { text: "check the ethics form", answer: "C", why: "'Checking the ethics form is something I have to sign off anyway, so I'll go through it,' says Dr Lee." },
        ],
      },
      {
        type: "flowchart_completion",
        title: "Flow-chart Completion",
        data: {
          instruction: "Complete the flow chart below. Write NO MORE THAN TWO WORDS for each answer.",
          flowchart_title: "Stages of the project",
          max_words: 2,
          nodes: [
            { text: "Pilot survey with a small group of __BLANK__ students" },
            { text: "Collect a term's __BLANK__ from the bike company" },
            { text: "Ten interviews with __BLANK__" },
            { text: "Draft report reviewed by the council's __BLANK__" },
            { text: "Final __BLANK__ at the research fair in May" },
          ],
        },
        questions: [
          { answer: "first-year|first year", why: "'We'll run a pilot survey with about twenty first-year students.'" },
          { answer: "usage data", why: "'The next stage is collecting the usage data.'" },
          { answer: "staff", why: "'We've decided on staff instead.' Other students are rejected." },
          { answer: "transport officer", why: "'The draft to be reviewed by the council's transport officer.'" },
          { answer: "presentation", why: "'The department wants a final presentation at the research fair in May, rather than a written report.'" },
        ],
      },
    ],
  },

  /* ══════════════════════════════════════════════════════════════════════
     PART 4 — Questions 31–40 · A lecture on seagrass meadows
     ══════════════════════════════════════════════════════════════════════ */
  {
    id: "bb100004-0004-0004-0004-000000000004",
    title: "Part 4: Seagrass meadows",
    kind: "lecture",
    setting: "A university lecture in marine biology",
    speakers: [{ role: "Lecturer", gender: "m" }],
    photo: { src: "/media/listening/ielts-4-ocean.jpg", alt: "Aerial view of ocean waves meeting the shore" },
    difficulty: "hard",
    transcript: `Part 4. You will hear a lecturer talking about seagrass meadows. First you have some time to look at questions 31 to 40.
[pause 30]
Now listen carefully and answer questions 31 to 40.
Lecturer (m): Good afternoon. Today I want to talk about a habitat that most people have never heard of, even though it may be one of the most valuable on the planet: the seagrass meadow.
Lecturer (m): Let's begin with what seagrasses are, because they're often confused with seaweed. Seaweeds are algae. Seagrasses, on the other hand, are flowering plants. They have leaves, stems and roots, they produce seeds, and their ancestors lived on land before moving back into the sea around a hundred million years ago. There are about seventy species, and they grow in shallow, sheltered coastal water on every continent except Antarctica, where the ice and the cold winters make it impossible for them to survive.
Lecturer (m): So why should we care about a few underwater fields of grass? The first reason is carbon. Seagrass meadows cover less than a fifth of one per cent of the ocean floor, yet they're responsible for around ten per cent of the carbon the ocean buries each year. Studies suggest that they can absorb carbon up to thirty-five times faster than tropical forests, and because the carbon ends up locked in the seabed, it can stay there for thousands of years.
Lecturer (m): The second benefit is physical. Seagrasses have a dense network of roots, and these roots hold the seabed in place. Where meadows are healthy, the shoreline is protected from storms, and far less sand is washed away. Thirdly, the meadows are a nursery. Young fish, including many species that we catch commercially, spend the first months of their lives hiding among the leaves, where larger predators can't reach them. And finally, the leaves slow the movement of the water, so that sediment that would otherwise cloud the sea sinks to the bottom and is trapped. That's why the water above a seagrass meadow is often strikingly clear.
Lecturer (m): Unfortunately, we're losing these meadows at an alarming rate: around seven per cent a year worldwide, according to the most recent survey. The causes are mostly local. Fertiliser washed off farms into rivers and then into the sea causes algae to grow so thickly that it blocks the sunlight the grass needs. Boats do damage too. It's not so much the hulls as the anchors, which tear up the roots when they're dropped and dragged, leaving bare scars that can take decades to recover. And over all of this sits climate change. Seagrasses are sensitive to heat, and rising sea temperatures have already wiped out meadows in parts of Australia and the Mediterranean.
Lecturer (m): The good news is that restoration works, and it's surprisingly low-tech. In one project on the south coast of England, volunteers collect seeds in the summer, and in the autumn they pack them into small hessian bags, which are dropped onto the seabed from boats. The bags rot away within a few months, leaving the seeds to germinate in place. In the first three years, more than a million seeds were planted in this way. Next week we'll look at how the success of projects like this one is measured, and at why some replanted meadows fail.
That is the end of Part 4. You now have two minutes to check your answers.`,
    groups: [
      {
        type: "note_completion",
        title: "Note Completion",
        data: {
          instruction: "Complete the notes below. Write ONE WORD ONLY for each answer.",
          max_words: 1,
          notes: [
            {
              heading: "Seagrass meadows",
              items: [
                "Seagrasses are flowering __BLANK__, not seaweeds (which are algae)",
                "Found in shallow coastal water on every continent except __BLANK__",
              ],
            },
            {
              heading: "Benefits",
              items: [
                "Absorb carbon up to 35 times faster than tropical __BLANK__",
                "Their __BLANK__ hold the seabed in place and protect the shoreline",
                "A nursery for young __BLANK__",
                "Trap __BLANK__, so the water stays clear",
              ],
            },
            {
              heading: "Threats",
              items: [
                "Fertiliser from farms causes __BLANK__ to block the light",
                "Boat __BLANK__ tear up the roots",
                "Rising sea __BLANK__",
              ],
            },
            {
              heading: "Restoration",
              items: [
                "Volunteers pack seeds into __BLANK__ bags and drop them onto the seabed",
              ],
            },
          ],
        },
        questions: [
          { answer: "plants", why: "'Seagrasses, on the other hand, are flowering plants.'" },
          { answer: "Antarctica", why: "'On every continent except Antarctica.'" },
          { answer: "forests", why: "'Absorb carbon up to thirty-five times faster than tropical forests.'" },
          { answer: "roots", why: "'Seagrasses have a dense network of roots, and these roots hold the seabed in place.'" },
          { answer: "fish", why: "'Young fish... spend the first months of their lives hiding among the leaves.'" },
          { answer: "sediment", why: "'Sediment that would otherwise cloud the sea sinks to the bottom and is trapped.'" },
          { answer: "algae", why: "'Fertiliser... causes algae to grow so thickly that it blocks the sunlight.'" },
          { answer: "anchors", why: "'It's not so much the hulls as the anchors, which tear up the roots.'" },
          { answer: "temperatures", why: "'Rising sea temperatures have already wiped out meadows.'" },
          { answer: "hessian", why: "'They pack them into small hessian bags, which are dropped onto the seabed.'" },
        ],
      },
    ],
  },
];
