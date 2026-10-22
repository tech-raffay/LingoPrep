/**
 * TOEFL iBT Listening — one practice form in the format ETS introduced in
 * January 2026 (ETS "TOEFL iBT Test Specifications 2026"):
 *
 *   Listen and Choose a Response   15–19 items  a single spoken exchange
 *   Listen to a Conversation       10 items     short campus conversations
 *   Listen to an Announcement      6–10 items   classroom or campus notices
 *   Listen to an Academic Talk     8–16 items   short talks by a lecturer
 *
 * 47 items in all. Every recording is played once and is accompanied by a
 * visual representation of the speaker(s); the questions appear after the
 * audio, with printed stems and four options. This practice form is linear
 * (the real section is adaptive).
 *
 * Here: 16 responses, 5 conversations × 2, 3 announcements × 3,
 * 3 academic talks × 4 = 47.
 *
 * Transcript conventions: "Name (f): …" / "Name (m): …" lines of speech;
 * the name is the speaker's role as shown on screen.
 */

const mc = (text, options, answer, why) => ({ text, options, answer, why });

/* A single utterance, then four possible replies. */
const response = (n, speaker, gender, line, options, answer, why) => ({
  id: `cc100${String(n).padStart(3, "0")}-${String(n).padStart(4, "0")}-0001-0001-${String(n).padStart(12, "0")}`,
  title: `Choose a Response ${n}`,
  task: "response",
  setting: speaker.setting,
  speakers: [{ role: speaker.role, gender }],
  difficulty: n <= 6 ? "easy" : n <= 12 ? "medium" : "hard",
  transcript: `${speaker.role} (${gender}): ${line}`,
  questions: [mc("", options, answer, why)],
});

export const TOEFL = [
  /* ══ Listen and Choose a Response · Questions 1–16 ══════════════════════ */
  response(1, { role: "Student", setting: "Outside a lecture hall" }, "f",
    "Excuse me, do you know if this is the room for the chemistry lecture?",
    ["Yes, it starts in about ten minutes.", "No, I don't take chemistry this year.", "The lecture was very interesting.", "It's on the third floor of the library."],
    "A", "The speaker is asking whether this is the right room; the only reply that answers is the one confirming it and saying when the lecture starts."),
  response(2, { role: "Receptionist", setting: "At the student services desk" }, "m",
    "The advisor is with another student right now. Would you like to wait, or come back later?",
    ["I'll wait, if it won't be too long.", "I've already met the advisor.", "Yes, I came back yesterday.", "The office is on the second floor."],
    "A", "The receptionist offers two choices; the reply chooses one of them."),
  response(3, { role: "Student", setting: "In a dormitory corridor" }, "m",
    "Hey, are you coming to the study group tonight?",
    ["I studied in the library last night.", "I'd like to, but I have a shift at work.", "The group has about eight members.", "Tonight the weather should be clear."],
    "B", "A yes-or-no invitation; the reply explains why the speaker can't come."),
  response(4, { role: "Librarian", setting: "At the library counter" }, "f",
    "These two books are due back next Friday, but you can renew them online if you need more time.",
    ["Thanks, I'll probably need them a bit longer.", "I didn't know the library was open on Fridays.", "I've already read both of them.", "The website is very easy to use."],
    "A", "The librarian is giving information about the loan; the natural reply acknowledges it and refers to needing more time."),
  response(5, { role: "Professor", setting: "After class" }, "m",
    "I noticed you weren't in class on Tuesday. Is everything all right?",
    ["Tuesday's lecture was about volcanoes.", "Yes, I'm fine, I had a dentist's appointment.", "Class usually ends at eleven.", "I'll be in the office all afternoon."],
    "B", "The professor asks about a missed class; the reply answers the question and gives a reason."),
  response(6, { role: "Student", setting: "In the cafeteria" }, "f",
    "Could you pass me the salt?",
    ["Sure, here you go.", "No, I don't like salt.", "The soup is quite good today.", "I passed the exam, thanks."],
    "A", "A simple request; the reply agrees and hands it over."),
  response(7, { role: "Teaching assistant", setting: "In a laboratory" }, "m",
    "Before you leave, make sure all the equipment is switched off and the bench is wiped down.",
    ["The experiment took longer than I expected.", "Will do. Where do we put the used gloves?", "I switched to a different lab section last week.", "Yes, the bench by the window is free."],
    "B", "An instruction; the reply agrees to it and asks a related follow-up question."),
  response(8, { role: "Student", setting: "In a seminar room" }, "f",
    "I'm not sure I follow the second part of the reading. Did you get it?",
    ["I read it twice, and I think the author is contradicting herself.", "The second seminar is on Thursday.", "I got a copy from the bookshop.", "Yes, the reading room closes at nine."],
    "A", "The speaker asks whether the other person understood the reading; the reply comments on the reading's content."),
  response(9, { role: "Housing officer", setting: "In the housing office" }, "m",
    "I'm afraid there are no single rooms left for next semester, but I can put your name on the waiting list.",
    ["Please do. How long is the list usually?", "I'd prefer a room with a view.", "The semester starts in September.", "I live in a single room at the moment."],
    "A", "The officer offers to add the student to a waiting list; the reply accepts and asks about it."),
  response(10, { role: "Student", setting: "On the campus bus" }, "f",
    "This bus does stop at the medical school, doesn't it?",
    ["It did last year, but now you have to change at the main gate.", "The medical school has a new building.", "I'm studying medicine as well.", "The bus was late this morning."],
    "A", "A question seeking confirmation about the route; only one reply answers it."),
  response(11, { role: "Professor", setting: "In a professor's office" }, "f",
    "Your draft is promising, but the argument in the third section needs more evidence.",
    ["I'll add the survey results I collected in the spring.", "Section three is the longest in the book.", "Thank you, I enjoyed writing the introduction.", "The deadline is the end of the month."],
    "A", "Feedback on a draft; the reply responds to the point about evidence."),
  response(12, { role: "Student", setting: "In the computer lab" }, "m",
    "Mind if I use this printer? Mine keeps jamming.",
    ["Go ahead, I'm just about finished.", "I don't have a printer at home.", "Jam is in the fridge in the kitchen.", "This computer is faster than the old ones."],
    "A", "A request for permission; the reply grants it."),
  response(13, { role: "Career advisor", setting: "At a careers fair" }, "f",
    "If you're interested in the internship, the application has to be in by the fifteenth, and you'll need two references.",
    ["That's tight, but I think I can get the references in time.", "I've done two internships already.", "The fair finishes at four o'clock.", "My reference book is in my bag."],
    "A", "The advisor gives a deadline and a requirement; the reply reacts to both."),
  response(14, { role: "Student", setting: "In a dormitory kitchen" }, "m",
    "Whoever used the kitchen last night left a real mess. Was it you?",
    ["Not me. I was at the gym until it closed.", "The kitchen is bigger than the one in my old dorm.", "Yes, last night's dinner was really good.", "I'll be using it tonight at seven."],
    "A", "A direct accusation in the form of a question; the reply denies it and gives an alibi."),
  response(15, { role: "Lecturer", setting: "At the end of a lecture" }, "m",
    "I've posted the slides online, so don't worry if you didn't get everything down.",
    ["Great, I missed the last few points about trade routes.", "The slides were a little too bright.", "I always sit at the back of the room.", "The website was down yesterday afternoon."],
    "A", "The lecturer reassures students about notes; the reply shows relief and refers to what was missed."),
  response(16, { role: "Student", setting: "Outside the sports centre" }, "f",
    "Any chance you could cover my shift at the pool on Saturday? Something's come up.",
    ["I would, but I'm away this weekend. Have you asked Marco?", "The pool is open until eight on Saturdays.", "I swim every Saturday morning.", "Yes, something came up for me too last week."],
    "A", "A request for a favour; the reply declines with a reason and suggests an alternative."),

  /* ══ Listen to a Conversation · Questions 17–26 ═════════════════════════ */
  {
    id: "cc200001-0001-0002-0002-000000000001",
    title: "Conversation 1: Changing a paper topic",
    task: "conversation",
    setting: "A student visits her history professor during office hours",
    speakers: [{ role: "Student", gender: "f" }, { role: "Professor", gender: "m" }],
    difficulty: "medium",
    transcript: `Student (f): Professor Alvarez, do you have a minute? It's about my research paper.
Professor (m): Of course, come in. You were going to write about the building of the transcontinental railroad, weren't you?
Student (f): That was the plan, but when I started looking for sources, there was just too much. Every book I opened took me in a different direction.
Professor (m): That's a common problem with big topics. Did you find anything in particular that caught your interest?
Student (f): Actually, yes. I kept coming across references to the Chinese workers who built the western section, and how little was written about them at the time.
Professor (m): Then there's your paper. Narrowing it down to one group of workers gives you a question to answer, rather than a story to retell.
Student (f): Would it be a problem that most of the sources are quite recent? The older histories hardly mention them.
Professor (m): Not at all. In fact, you could make that silence part of your argument. Just make sure you use at least two primary sources, such as payroll records or newspaper reports from the eighteen sixties.
Student (f): The library has some newspapers on microfilm. I'll start there.
Professor (m): Good. Send me a one-page outline by Friday and we'll go from there.`,
    questions: [
      mc("Why does the student visit the professor?", ["To ask for an extension on her paper", "To discuss a problem with her chosen topic", "To borrow a book about the railroad", "To find out her grade on an outline"], "B",
        "She explains that her original topic was too broad and that every source 'took me in a different direction'."),
      mc("What does the professor tell the student to do?", ["Use only sources written in the nineteenth century", "Return to her original topic", "Include at least two primary sources", "Submit the finished paper on Friday"], "C",
        "'Just make sure you use at least two primary sources, such as payroll records or newspaper reports.' Only the outline is due on Friday."),
    ],
  },
  {
    id: "cc200002-0002-0002-0002-000000000002",
    title: "Conversation 2: A problem with a meal plan",
    task: "conversation",
    setting: "A student speaks to a staff member at the dining services office",
    speakers: [{ role: "Student", gender: "m" }, { role: "Dining services staff", gender: "f" }],
    difficulty: "easy",
    transcript: `Student (m): Hi, I think there's a mistake with my meal plan. My card was refused at breakfast this morning.
Dining services staff (f): Let me have a look. Can I see your student ID? Thanks. Ah, I see what's happened. You're on the ten-meals-a-week plan, and you'd already used all ten by Sunday night.
Student (m): Really? I only eat on campus a few times a week.
Dining services staff (f): According to the system, your card was used twice at lunchtime on Thursday and twice on Friday, within a few minutes each time.
Student (m): Oh. That'll be my roommate. I lent him my card when his was being replaced. I didn't realise it would count against my plan.
Dining services staff (f): It does, I'm afraid. The plan resets on Monday morning, so you'll be fine from tomorrow. In the meantime you can pay cash in the dining hall.
Student (m): Is there a plan with more meals? I'd rather not run out again.
Dining services staff (f): There's a fifteen-meal plan, and the difference in price is only about forty dollars a semester. If you fill in this form, the change takes effect next week.
Student (m): I'll do that now. Thanks for your help.`,
    questions: [
      mc("Why was the student's card refused?", ["The card had expired", "He had used all his meals for the week", "His roommate's card was being replaced", "He had not paid for the semester"], "B",
        "'You're on the ten-meals-a-week plan, and you'd already used all ten by Sunday night.'"),
      mc("What will the student probably do next?", ["Pay cash for his breakfast", "Ask for a new card", "Change to a plan with more meals", "Report his roommate"], "C",
        "He asks about a plan with more meals and says 'I'll do that now' when given the form."),
    ],
  },
  {
    id: "cc200003-0003-0002-0002-000000000003",
    title: "Conversation 3: Preparing a class presentation",
    task: "conversation",
    setting: "Two students plan a joint presentation in the library",
    speakers: [{ role: "Maya, a student", gender: "f" }, { role: "Ben, a student", gender: "m" }],
    difficulty: "medium",
    transcript: `Maya (f): Ben, we need to decide how we're splitting the presentation. It's on Thursday and we've barely started.
Ben (m): I know. I was thinking you could do the background on renewable energy policy, since that's your area, and I'll take the case study on the wind farm.
Maya (f): That makes sense. But Dr Kim said last week that he doesn't want more than fifteen minutes in total. The background alone could take that long.
Ben (m): Then let's cut it to five minutes. Just the main policies since twenty ten. Nobody needs the whole history.
Maya (f): Fine. And the slides? Last time we used two different templates and it looked a mess.
Ben (m): I'll set up a shared file tonight with one design, and we both add our slides to it. That way we can see each other's parts as we go.
Maya (f): Good idea. Can we do a practice run on Wednesday afternoon? I'm free after two.
Ben (m): Two thirty works. I'll book one of the group study rooms on the third floor so we can use the screen.
Maya (f): Perfect. If we time it on Wednesday, we won't get caught out on Thursday.`,
    questions: [
      mc("What does Maya say about the background section?", ["It is the part she finds most difficult", "It might take too long", "It should be left out entirely", "Ben should present it instead"], "B",
        "'The background alone could take that long,' she says, referring to the fifteen-minute limit."),
      mc("What will Ben do tonight?", ["Write his part of the presentation", "Email Dr Kim about the time limit", "Create a shared slide file", "Book a study room"], "C",
        "'I'll set up a shared file tonight with one design.' The room booking is for Wednesday."),
    ],
  },
  {
    id: "cc200004-0004-0002-0002-000000000004",
    title: "Conversation 4: A late lab report",
    task: "conversation",
    setting: "A student talks to a teaching assistant after a lab session",
    speakers: [{ role: "Student", gender: "m" }, { role: "Teaching assistant", gender: "f" }],
    difficulty: "medium",
    transcript: `Student (m): Hi, I wanted to ask about the lab report that was due yesterday. I know I'm late.
Teaching assistant (f): You're not the only one. What happened?
Student (m): The data file I saved on the lab computer was gone when I came back on Monday. I had to rerun the whole experiment.
Teaching assistant (f): The lab computers are wiped every weekend. There's a notice on the door, but nobody reads it. Did you finish the rerun?
Student (m): Yes, I have the results now, and the write-up is nearly done. Could I hand it in tomorrow?
Teaching assistant (f): The policy is ten per cent off for each day it's late. But since you have a genuine reason, I can ask Professor Novak to waive the penalty. I can't promise she'll agree.
Student (m): I'd really appreciate that. Is there anything I should do?
Teaching assistant (f): Email me a short explanation, so I have it in writing, and from now on save your files to your university drive, not the desktop.
Student (m): I will. Thanks.`,
    questions: [
      mc("Why is the student's report late?", ["He was ill over the weekend", "His data was deleted from a lab computer", "He did not know the due date", "The professor changed the assignment"], "B",
        "'The data file I saved on the lab computer was gone... I had to rerun the whole experiment.'"),
      mc("What does the teaching assistant offer to do?", ["Extend the deadline for the whole class", "Grade the report herself", "Ask the professor not to apply the penalty", "Recover the student's lost file"], "C",
        "'I can ask Professor Novak to waive the penalty. I can't promise she'll agree.'"),
    ],
  },
  {
    id: "cc200005-0005-0002-0002-000000000005",
    title: "Conversation 5: Joining the orchestra",
    task: "conversation",
    setting: "A student asks the music department secretary about auditions",
    speakers: [{ role: "Student", gender: "f" }, { role: "Department secretary", gender: "m" }],
    difficulty: "hard",
    transcript: `Student (f): Hello, I'm interested in joining the university orchestra. Is it only for music majors?
Department secretary (m): Not at all. About half the players study something else entirely. You do have to audition, though. What do you play?
Student (f): The cello. I've been playing for nine years, but I haven't had lessons since high school.
Department secretary (m): That shouldn't be a problem. Auditions are next Tuesday and Wednesday, in the recital hall. You prepare one piece of your own choice, and then the conductor gives you a short passage to sight-read.
Student (f): Sight-reading is my weak point, to be honest.
Department secretary (m): Most people say that. The conductor is more interested in how you recover from a mistake than in whether you make one. Rehearsals are Monday evenings, seven to nine thirty, and there are two concerts a semester.
Student (f): Monday evenings might clash with my lab. Could I still join if I missed the occasional rehearsal?
Department secretary (m): Occasionally, yes, but not regularly. If you're serious, talk to your lab instructor about moving to the Tuesday section. Several orchestra members have done that.
Student (f): I'll ask. Can I sign up for an audition now?
Department secretary (m): Just put your name, instrument and email on this sheet, and we'll confirm a time by Friday.`,
    questions: [
      mc("What does the secretary say about the audition?", ["It is only open to music majors", "It includes a piece the student has not seen before", "It takes place on Monday evening", "It requires a letter from a teacher"], "B",
        "'The conductor gives you a short passage to sight-read,' meaning a passage she has not prepared."),
      mc("What does the secretary suggest the student do about her lab?", ["Miss the rehearsals when necessary", "Ask to change to a different lab section", "Speak to the conductor about it", "Drop the lab for a semester"], "B",
        "'Talk to your lab instructor about moving to the Tuesday section. Several orchestra members have done that.'"),
    ],
  },

  /* ══ Listen to an Announcement · Questions 27–35 ════════════════════════ */
  {
    id: "cc300001-0001-0003-0003-000000000001",
    title: "Announcement 1: Library closure",
    task: "announcement",
    setting: "An announcement over the library's public address system",
    speakers: [{ role: "Library staff", gender: "f" }],
    difficulty: "easy",
    transcript: `Library staff (f): May I have your attention, please. Because of essential electrical work, the main library will close early today, at six o'clock instead of midnight, and will remain closed all day tomorrow. Books can still be returned using the drop box outside the main entrance, and any loans due during the closure will be extended automatically by two days. Students who need a study space tomorrow can use the science library, which will stay open until midnight as usual. We apologise for the inconvenience.`,
    questions: [
      mc("What is the purpose of the announcement?", ["To announce new opening hours for the year", "To inform users about a temporary closure", "To remind users to return overdue books", "To introduce a new study space"], "B",
        "The library is closing early today and all day tomorrow because of electrical work."),
      mc("What will happen to books due during the closure?", ["They must be returned to the science library", "A fine will be charged", "The due date will be extended", "They must be renewed online"], "C",
        "'Any loans due during the closure will be extended automatically by two days.'"),
      mc("What are students advised to do tomorrow if they need somewhere to study?", ["Use the drop box", "Wait until the library reopens", "Go to the science library", "Study in the main entrance"], "C",
        "'Students who need a study space tomorrow can use the science library.'"),
    ],
  },
  {
    id: "cc300002-0002-0003-0003-000000000002",
    title: "Announcement 2: Change to the field trip",
    task: "announcement",
    setting: "A professor makes an announcement at the start of class",
    speakers: [{ role: "Professor", gender: "m" }],
    difficulty: "medium",
    transcript: `Professor (m): Before we begin, a quick announcement about Friday's geology field trip. The forecast is for heavy rain, and the trail to the quarry becomes dangerous when it's wet, so we're postponing the trip to the following Friday, the twenty-first. The bus will still leave from the car park behind the science building, but at eight o'clock rather than nine, because we'll be stopping at a second site on the way back. Anyone who can't make the new date should see me after class so we can arrange an alternative assignment. And please, this time, bring proper boots. Trainers are not suitable for the quarry.`,
    questions: [
      mc("Why has the field trip been postponed?", ["The bus is not available", "The weather is expected to be bad", "The quarry is closed", "Too few students signed up"], "B",
        "'The forecast is for heavy rain, and the trail to the quarry becomes dangerous when it's wet.'"),
      mc("What has changed about the departure?", ["The bus will leave from a different place", "The bus will leave an hour earlier", "Students must find their own transport", "The trip will last two days"], "B",
        "'At eight o'clock rather than nine.' The departure point is the same."),
      mc("What should students who cannot attend on the new date do?", ["Email the department", "Join a later trip", "Speak to the professor after class", "Complete the assignment online"], "C",
        "'Anyone who can't make the new date should see me after class so we can arrange an alternative assignment.'"),
    ],
  },
  {
    id: "cc300003-0003-0003-0003-000000000003",
    title: "Announcement 3: Student elections",
    task: "announcement",
    setting: "A message from the student union played in the student centre",
    speakers: [{ role: "Student union officer", gender: "f" }],
    difficulty: "hard",
    transcript: `Student union officer (f): Hello, everyone. This is a reminder from the student union that nominations for next year's union officers close this Thursday at five. If you'd like to stand, collect a nomination form from the union office on the ground floor of the student centre, get it signed by ten students, and return it before the deadline. Late forms will not be accepted, however good the excuse. Voting will take place online during the first week of November, and every registered student will receive a link by email. Even if you're not standing, please vote. Last year fewer than a third of students did, and the union's funding partly depends on turnout.`,
    questions: [
      mc("What is the deadline for nominations?", ["Thursday at five o'clock", "The end of October", "The first week of November", "Friday at noon"], "A",
        "'Nominations for next year's union officers close this Thursday at five.'"),
      mc("What must a student do to stand for election?", ["Pay a registration fee", "Collect signatures from other students", "Attend a meeting in the student centre", "Send an email to the union"], "B",
        "'Get it signed by ten students, and return it before the deadline.'"),
      mc("Why does the speaker encourage everyone to vote?", ["Voting is compulsory for registered students", "The results will be announced in the student centre", "The union's funding is affected by how many people vote", "There are more candidates than last year"], "C",
        "'The union's funding partly depends on turnout.'"),
    ],
  },

  /* ══ Listen to an Academic Talk · Questions 36–47 ═══════════════════════ */
  {
    id: "cc400001-0001-0004-0004-000000000001",
    title: "Academic Talk 1: Why the Romans built straight roads",
    task: "talk",
    setting: "A short talk in an ancient history class",
    speakers: [{ role: "Professor", gender: "m" }],
    difficulty: "medium",
    transcript: `Professor (m): You've probably heard that Roman roads were straight, and in general that's true. But the reason isn't the one most people give. It wasn't that the Romans loved straight lines for their own sake. It was that their roads were built by and for the army. A legion marching to a frontier needed the shortest route, and surveyors could lay out a straight line between two high points using nothing more than a wooden instrument called a groma: a cross with weighted strings hanging from each arm. By sighting along the strings, a surveyor could keep a line straight for miles.
Professor (m): Of course, the land didn't always cooperate. When a road met a marsh, the engineers didn't go around it. They drove wooden piles into the mud and built the road on top. When it met a steep hill, they cut a zigzag, but only on the slope itself, returning to the original line at the top. That's why, on a map, a Roman road looks like a series of long straight stretches joined by short kinks, rather than a smooth curve.
Professor (m): The roads lasted because of how they were layered. First a trench, then large stones, then gravel packed hard, and on the main routes a surface of fitted paving slabs with a slight curve, so that rain ran off into ditches on either side. Some of these roads carried traffic for fifteen hundred years. Next time, we'll look at what happened to the network after the legions left.`,
    questions: [
      mc("What is the main point the professor makes about Roman roads?", ["They were built mainly to serve the army", "They were the first paved roads in Europe", "They were curved to drain rainwater", "They were built by local people"], "A",
        "'Their roads were built by and for the army. A legion marching to a frontier needed the shortest route.'"),
      mc("What was the groma used for?", ["Measuring the depth of a trench", "Keeping the road in a straight line", "Cutting paving slabs", "Testing the ground in a marsh"], "B",
        "'By sighting along the strings, a surveyor could keep a line straight for miles.'"),
      mc("According to the professor, how did engineers deal with a marsh?", ["They built a bridge over it", "They changed the direction of the road", "They supported the road on wooden piles", "They drained it with ditches"], "C",
        "'They drove wooden piles into the mud and built the road on top.'"),
      mc("Why does the professor describe the layers of a road?", ["To explain why the roads were so expensive", "To explain why the roads lasted so long", "To compare Roman roads with modern ones", "To show how the roads were repaired"], "B",
        "'The roads lasted because of how they were layered.'"),
    ],
  },
  {
    id: "cc400002-0002-0004-0004-000000000002",
    title: "Academic Talk 2: How birds navigate",
    task: "talk",
    setting: "A short talk in a biology class",
    speakers: [{ role: "Professor", gender: "f" }],
    difficulty: "medium",
    transcript: `Professor (f): Every autumn, the Arctic tern leaves its nesting grounds near the North Pole and flies to the Antarctic, a round trip of around seventy thousand kilometres. The obvious question is how it finds the way. For a long time the answer was thought to be the sun and the stars, and birds do use both. Young birds raised under a planetarium sky, with the stars rotated, set off in the wrong direction.
Professor (f): But the sun and stars can't be the whole story, because many birds migrate on cloudy nights. In the nineteen seventies, researchers attached small magnets to the heads of homing pigeons. On sunny days the pigeons found their way home as usual. On overcast days, the pigeons with magnets became lost, while pigeons wearing non-magnetic brass bars did not. The conclusion was that birds can sense the Earth's magnetic field, and that they rely on it when they can't see the sky.
Professor (f): Where this sense is located is still debated. One theory points to tiny crystals of iron in the beak. Another, which has gained support recently, involves a protein in the eye called cryptochrome, which reacts to light in a way that is affected by magnetic fields. If that theory is right, a migrating bird might literally see the magnetic field as a pattern across its vision. What's clear is that birds use several systems at once, and switch between them as conditions change.`,
    questions: [
      mc("What is the talk mainly about?", ["Why the Arctic tern migrates so far", "The methods birds use to find their way", "How pigeons were trained to carry messages", "The effect of weather on bird populations"], "B",
        "The talk moves through the sun and stars, the magnetic sense and where that sense may be located."),
      mc("What did the experiment with the planetarium show?", ["Young birds can navigate without any training", "Birds use the pattern of the stars to choose a direction", "Birds cannot fly in artificial light", "Birds prefer to migrate during the day"], "B",
        "'Young birds raised under a planetarium sky, with the stars rotated, set off in the wrong direction.'"),
      mc("Why did the researchers give some pigeons brass bars?", ["To make the magnets heavier", "To protect the pigeons' heads", "To compare them with the pigeons wearing magnets", "To help the pigeons fly in a straight line"], "C",
        "The brass bars were non-magnetic, so they served as a comparison group."),
      mc("What does the professor say about cryptochrome?", ["It is found in the beak", "It has been proved to be the source of the magnetic sense", "It may allow birds to see the magnetic field", "It only works on cloudy days"], "C",
        "'A migrating bird might literally see the magnetic field as a pattern across its vision.'"),
    ],
  },
  {
    id: "cc400003-0003-0004-0004-000000000003",
    title: "Academic Talk 3: The invention of canned food",
    task: "talk",
    setting: "A short talk in a history of technology class",
    speakers: [{ role: "Lecturer", gender: "m" }],
    difficulty: "hard",
    transcript: `Lecturer (m): In seventeen ninety-five, the French government offered a prize of twelve thousand francs to anyone who could find a way of preserving food for the army. Napoleon's troops were losing more men to hunger and scurvy than to battle. The prize was eventually won by a confectioner named Nicolas Appert, who had noticed that food sealed in glass jars and then heated in boiling water stayed fresh for months. He had no idea why it worked. Louis Pasteur wouldn't explain the role of bacteria for another fifty years. Appert simply knew that it did.
Lecturer (m): Glass, however, was heavy and broke easily on the march, so within a year an English merchant, Peter Durand, had patented the same process using containers of tinned iron. The first cans were made by hand, at a rate of about six an hour, and were so thick that soldiers opened them with a hammer and chisel, or, famously, with their bayonets. The can opener wasn't invented until eighteen fifty-five, almost half a century later.
Lecturer (m): The real change came with mass production. By the eighteen seventies, machines could make thousands of cans an hour, and canned meat, fish and milk became cheap enough for ordinary families. In the process, the diet of cities was transformed. For the first time, a factory worker in Manchester could eat beef raised in Argentina. So when you open a can of soup, you're using a technology that began as a military secret and ended by changing what the whole world eats.`,
    questions: [
      mc("Why did the French government offer a prize?", ["To improve the quality of army food", "To find a way to keep food from going bad", "To encourage the glass industry", "To reward Nicolas Appert for his work"], "B",
        "The prize was for 'a way of preserving food for the army'."),
      mc("What does the lecturer say about Nicolas Appert?", ["He understood why heating preserved food", "He was a scientist who worked with Pasteur", "He did not know why his method worked", "He invented the tin can"], "C",
        "'He had no idea why it worked... Appert simply knew that it did.'"),
      mc("Why does the lecturer mention bayonets?", ["To show how thick early cans were", "To explain why glass jars were replaced", "To describe how cans were made", "To show that soldiers disliked canned food"], "A",
        "The cans 'were so thick that soldiers opened them with a hammer and chisel, or, famously, with their bayonets'."),
      mc("According to the lecturer, what was the effect of mass production?", ["Cans became thicker and stronger", "Canned food became affordable for ordinary people", "The army stopped using canned food", "Glass jars came back into use"], "B",
        "'Canned meat, fish and milk became cheap enough for ordinary families.'"),
    ],
  },
];
