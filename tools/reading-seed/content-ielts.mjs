/**
 * IELTS Academic Reading — one full test.
 *
 * Follows the real paper: three passages of roughly 750–900 words, 40
 * questions split 13 / 13 / 14, text only (the real exam prints no charts
 * inside a passage; visuals appear in the questions: a diagram to label, a
 * table, a flow chart).
 *
 * Paragraphs are lettered "A. " … so matching tasks can refer to them.
 * `__BLANK__` marks a gap inside a table cell, summary or flow-chart box.
 */

export const IELTS = [
  /* ══════════════════════════════════════════════════════════════════════
     PASSAGE 1 — Questions 1–13
     ══════════════════════════════════════════════════════════════════════ */
  {
    id: "bb000001-0001-0001-0001-000000000001",
    title: "The Development of the Electric Telegraph",
    difficulty: "medium",
    paragraphs: [
      "A. The electric telegraph, one of the most transformative inventions of the nineteenth century, had its origins in the scientific discoveries of the late eighteenth and early nineteenth centuries. The Italian scientist Alessandro Volta's invention of the voltaic pile in 1800 provided the first reliable source of continuous electric current, while the Danish physicist Hans Christian Oersted demonstrated in 1820 that an electric current could deflect a magnetic needle. This discovery established the crucial link between electricity and magnetism that would make telegraphy possible. Within a few years, experimenters across Europe were asking whether the effect could be used to send signals along a wire faster than any horse or ship could carry a letter.",
      "B. Several inventors in different countries worked on electromagnetic telegraph systems during the 1830s. In England, William Fothergill Cooke and Charles Wheatstone patented a five-needle telegraph in 1837, which used deflecting needles to point to letters on a board. It required no knowledge of any code, but it needed five separate wires, which made it costly to install. Meanwhile, in the United States, Samuel Morse was developing a simpler single-wire system with his assistant Alfred Vail. Morse's system would ultimately prove more practical and more economical than its competitors.",
      "C. The key to Morse's success lay not only in his hardware but also in the code that bears his name: a system of dots and dashes representing letters and numbers. The scheme was remarkably efficient because Vail, after counting the pieces of type in a local printing office, gave the shortest signals to the letters used most often in English. The letter E became a single dot and T a single dash, while rarely used letters such as Q received longer sequences. This arrangement greatly increased the speed at which messages could be sent and decoded.",
      "D. The first major public demonstration of the telegraph took place on 24 May 1844, when Morse sent the message \"What hath God wrought\" from the Capitol in Washington to a railway depot in Baltimore, a distance of about 60 kilometres. The experimental line had been paid for by a grant of 30,000 dollars from the United States Congress. The successful transmission captured the public imagination and led to a rapid expansion of privately built networks. By 1850, more than 19,000 kilometres of telegraph wire had been strung across the country.",
      "E. The commercial impact of the telegraph was profound. For the first time in human history, information could travel faster than any physical means of transport. News agencies such as Reuters and the Associated Press were founded specifically to exploit the new technology, and newspapers began to print reports of events that had happened only hours earlier. Stock exchanges were linked by wire, enabling the creation of national and eventually international financial markets, and railway companies used the telegraph to control the movement of trains on single tracks.",
      "F. Perhaps the most ambitious telegraph project was the laying of a cable across the Atlantic Ocean. After several failed attempts, including a cable that worked for only three weeks in 1858 before its insulation failed, a permanent connection between Europe and North America was finally established in 1866. The businessman who led the venture, Cyrus Field, spent over a decade on it and overcame enormous technical and financial obstacles. The cable was laid by the Great Eastern, at that time the largest ship in the world, and it reduced the time needed to send a message across the ocean from about ten days to a matter of minutes.",
      "G. The apparatus at each end of a Morse line was simple, which was a large part of its appeal. At the sending station, the operator pressed down a spring-loaded lever known as the key. This closed the circuit and allowed current from a battery to flow along the line wire to the distant station. There the current passed through the coils of an electromagnet, which pulled down one end of a pivoted iron bar called the armature. A steel stylus fixed to the other end of the armature was thereby pushed up against a strip of paper tape, which was drawn steadily through the instrument by a clockwork motor. A short press of the key left a dot embossed on the tape; a longer press left a dash. Experienced operators soon found that they could read a message simply by listening to the clicks of the armature, and by the 1850s most offices had abandoned the tape in favour of a simple sounder.",
      "H. The telegraph's legacy extends far beyond its own era. The principle of encoding information as electrical signals laid the groundwork for the telephone, radio and ultimately the internet. The binary nature of Morse code, with its two basic signals, anticipated the digital encoding systems that underpin modern computing. Although the last commercial telegraph services closed in the early twenty-first century, the network of submarine cables that now carries almost all intercontinental data follows routes first surveyed for the telegraph.",
    ],
    groups: [
      {
        type: "matching_headings",
        title: "Matching Headings",
        data: {
          instruction: "Reading Passage 1 has eight paragraphs, A–H. Choose the correct heading for paragraphs B–F from the list of headings below.",
          headings: [
            { label: "i", text: "A code designed around how often letters are used" },
            { label: "ii", text: "Financial losses caused by the new technology" },
            { label: "iii", text: "Competing designs in two countries" },
            { label: "iv", text: "A publicly funded line proves the idea" },
            { label: "v", text: "Linking two continents under the sea" },
            { label: "vi", text: "The effect on news, finance and transport" },
            { label: "vii", text: "Why operators stopped using paper" },
            { label: "viii", text: "The scientific basis of telegraphy" },
          ],
        },
        questions: [
          { text: "Paragraph B", answer: "iii", why: "Paragraph B contrasts Cooke and Wheatstone's five-needle telegraph in England with Morse's single-wire system in the United States." },
          { text: "Paragraph C", answer: "i", why: "Paragraph C explains that the shortest signals were given to the letters used most often in English." },
          { text: "Paragraph D", answer: "iv", why: "The experimental Washington to Baltimore line was paid for by a grant from Congress, and its success led to rapid expansion." },
          { text: "Paragraph E", answer: "vi", why: "Paragraph E describes the impact on news agencies and newspapers, stock exchanges and railways." },
          { text: "Paragraph F", answer: "v", why: "Paragraph F describes the laying of the transatlantic cable between Europe and North America." },
        ],
      },
      {
        type: "tfng",
        title: "True / False / Not Given",
        data: {
          instruction: "Do the following statements agree with the information given in Reading Passage 1? Choose TRUE if the statement agrees with the information, FALSE if the statement contradicts the information, or NOT GIVEN if there is no information on this.",
        },
        questions: [
          { text: "Volta's invention produced an electric current that was continuous.", answer: "TRUE", why: "Paragraph A: the voltaic pile 'provided the first reliable source of continuous electric current'." },
          { text: "Cooke and Wheatstone's telegraph was cheaper to install than Morse's.", answer: "FALSE", why: "Paragraph B: the five-needle system needed five wires, 'which made it costly to install', while Morse's was 'more economical'." },
          { text: "Alfred Vail had worked in the printing industry before he met Morse.", answer: "NOT GIVEN", why: "Paragraph C says Vail counted type in a printing office, but nothing is said about where he had worked." },
          { text: "The transatlantic cable of 1858 remained in service for several years.", answer: "FALSE", why: "Paragraph F: the 1858 cable 'worked for only three weeks'." },
        ],
      },
      {
        type: "diagram_label",
        title: "Diagram Label Completion",
        data: {
          instruction: "Label the diagram below. Choose NO MORE THAN TWO WORDS from the passage for each answer.",
          diagram: "morse-telegraph",
          diagram_title: "A Morse telegraph line",
          max_words: 2,
        },
        questions: [
          { text: "Spring-loaded lever pressed by the operator", answer: "key", why: "Paragraph G: 'the operator pressed down a spring-loaded lever known as the key'." },
          { text: "Its coils carry the current at the receiving station", answer: "electromagnet", why: "Paragraph G: 'the current passed through the coils of an electromagnet'." },
          { text: "Pivoted iron bar pulled down at one end", answer: "armature", why: "Paragraph G: 'a pivoted iron bar called the armature'." },
          { text: "Strip on which dots and dashes are embossed", answer: "paper tape|tape", why: "Paragraph G: the stylus was pushed up against 'a strip of paper tape'." },
        ],
      },
    ],
  },

  /* ══════════════════════════════════════════════════════════════════════
     PASSAGE 2 — Questions 14–26
     ══════════════════════════════════════════════════════════════════════ */
  {
    id: "bb000002-0002-0002-0002-000000000002",
    title: "Bioluminescence in the Deep Sea",
    difficulty: "medium",
    paragraphs: [
      "A. In the perpetual darkness of the deep ocean, thousands of species have evolved the remarkable ability to produce their own light, a phenomenon known as bioluminescence. Below 200 metres, where sunlight barely penetrates, an estimated 76 percent of all ocean creatures possess some form of bioluminescent capability. Far from being a curiosity, the production of light is arguably the most widespread form of communication on the planet, yet it remained almost unknown to science until research submersibles began to visit these depths in the twentieth century. Even today, far less is known about the animals of the deep ocean than about those of any habitat on land.",
      "B. Bioluminescence is a chemical process. It occurs when a molecule called luciferin reacts with oxygen in the presence of an enzyme called luciferase. The reaction releases energy in the form of light with remarkably little heat, which is why it is sometimes called 'cold light': whereas a traditional light bulb wastes most of its energy as heat, a bioluminescent reaction converts nearly all of it into light. Some animals manufacture luciferin themselves, while others obtain it from their food or rely on colonies of glowing bacteria that live inside their bodies.",
      "C. Different organisms produce different colours, depending on the specific chemistry involved. Most deep-sea creatures emit blue or green light, because these wavelengths travel furthest through seawater. Red light, by contrast, is absorbed within a few metres, and most deep-sea animals have lost the ability to see it at all. A small number of species have turned this limitation into an advantage, as described below.",
      "D. One of the most common uses of bioluminescence is defence. Many species practise counterillumination, producing light on their undersides to match the faint glow filtering down from the surface. This eliminates the silhouette that would otherwise be visible to predators swimming beneath them. The hatchetfish is a classic example, using rows of light organs called photophores along its belly, and it can even adjust their brightness as the light from above changes. Other animals rely on distraction instead. When attacked, certain deep-sea shrimp spit out a cloud of glowing fluid that confuses the predator while the shrimp escapes into the darkness.",
      "E. Other organisms use light offensively. The anglerfish is perhaps the most famous example: it possesses a modified dorsal spine tipped with a luminous lure, which it dangles in front of its enormous jaws to attract prey. The light is produced not by the fish itself but by bacteria living in the lure, which receive nutrients and shelter in exchange. The deep-sea dragonfish, by contrast, produces red light using a chemistry of its own. Because most other deep-sea creatures cannot see red, the dragonfish can illuminate its prey without being detected, in effect hunting with an invisible searchlight.",
      "F. Bioluminescence also serves as a means of communication between members of the same species. The firefly squid of Japan's Toyama Bay is renowned for its spectacular displays during the mating season, when millions of individuals gather near the shore and create a dazzling light show. Finally, some organisms use light as a kind of burglar alarm. When attacked, certain jellyfish release bursts of luminescence that attract the attention of even larger predators, which may in turn attack the original attacker and give the prey a chance to escape.",
      "G. Studying these displays in their natural setting is notoriously difficult. The bright lamps and noisy motors of conventional submersibles frighten many animals away and cause others to stop glowing altogether, so that for decades researchers saw only a fraction of what was there. To overcome this, the American marine biologist Edith Widder designed a camera system that works with red light, which most deep-sea animals cannot see, and fitted it with an electronic lure that imitates the burglar alarm display of a jellyfish. In 2012 the system recorded the first film of a giant squid in its natural habitat, an animal that had never before been observed alive in the deep.",
      "H. Scientists continue to find new applications for bioluminescent chemistry. Green fluorescent protein (GFP), originally isolated from the jellyfish Aequorea victoria in the 1960s, has become one of the most important tools in modern biology. By attaching the gene for GFP to other genes, researchers can tag proteins and cells and watch biological processes in living organisms in real time. The discovery and development of GFP earned Osamu Shimomura, Martin Chalfie and Roger Tsien the Nobel Prize in Chemistry in 2008. More recently, engineers have begun to investigate whether bioluminescent bacteria could one day provide low-energy lighting for streets and buildings.",
    ],
    groups: [
      {
        type: "multiple_choice",
        title: "Multiple Choice",
        data: { instruction: "Choose the correct letter, A, B, C or D." },
        questions: [
          {
            text: "What does the writer say about bioluminescence in paragraph A?",
            options: ["It is rarer in the deep sea than near the surface.", "It was studied in detail long before the twentieth century.", "It is found in the majority of animals living below 200 metres.", "It is a curiosity with little biological function."],
            answer: "C",
            why: "Paragraph A: 'an estimated 76 percent of all ocean creatures' below 200 metres can produce light.",
          },
          {
            text: "Bioluminescence is described as 'cold light' because",
            options: ["it occurs only in very cold water.", "the reaction wastes very little energy as heat.", "the light it produces is blue.", "it takes place without oxygen."],
            answer: "B",
            why: "Paragraph B: the reaction releases light 'with remarkably little heat' and converts nearly all its energy into light.",
          },
          {
            text: "Why do most deep-sea animals produce blue or green light?",
            options: ["These colours are the easiest to produce chemically.", "These colours cannot be seen by predators.", "These colours are transmitted furthest through seawater.", "Their food contains blue and green luciferin."],
            answer: "C",
            why: "Paragraph C: 'these wavelengths travel furthest through seawater'.",
          },
          {
            text: "What is said about green fluorescent protein?",
            options: ["It was first obtained from a species of squid.", "It allows scientists to observe processes inside living things.", "It is already used to light streets and buildings.", "Its discoverers were awarded a Nobel Prize in the 1960s."],
            answer: "B",
            why: "Paragraph H: researchers can 'watch biological processes in living organisms in real time'.",
          },
        ],
      },
      {
        type: "matching_features",
        title: "Matching Features",
        data: {
          instruction: "Look at the following statements and the list of animals below. Match each statement with the correct animal, A–F.",
          list_title: "List of Animals",
          features: [
            { label: "A", text: "hatchetfish" },
            { label: "B", text: "deep-sea shrimp" },
            { label: "C", text: "anglerfish" },
            { label: "D", text: "dragonfish" },
            { label: "E", text: "firefly squid" },
            { label: "F", text: "jellyfish" },
          ],
        },
        questions: [
          { text: "It depends on another organism to produce its light.", answer: "C", why: "Paragraph E: the anglerfish's light is produced 'by bacteria living in the lure'." },
          { text: "It gives out light of a colour that its prey is unable to see.", answer: "D", why: "Paragraph E: the dragonfish produces red light, which most deep-sea creatures cannot see." },
          { text: "It alters the strength of its light to match its surroundings.", answer: "A", why: "Paragraph D: the hatchetfish 'can even adjust their brightness as the light from above changes'." },
          { text: "It gathers in very large numbers to produce light displays.", answer: "E", why: "Paragraph F: 'millions of individuals gather near the shore and create a dazzling light show'." },
          { text: "Its light may cause its attacker to be attacked.", answer: "F", why: "Paragraph F: jellyfish attract 'even larger predators, which may in turn attack the original attacker'." },
        ],
      },
      {
        type: "table_completion",
        title: "Table Completion",
        data: {
          instruction: "Complete the table below. Choose ONE WORD ONLY from the passage for each answer.",
          table_title: "Uses of bioluminescence",
          max_words: 1,
          columns: ["Purpose", "How the light is used", "Example"],
          rows: [
            ["Defence", "light organs along the __BLANK__ hide the animal's outline from below", "hatchetfish"],
            ["Defence", "a __BLANK__ of glowing fluid confuses the attacker", "deep-sea shrimp"],
            ["Hunting", "a luminous lure on a modified __BLANK__ attracts prey", "anglerfish"],
            ["Communication", "light displays take place during the __BLANK__ season", "firefly squid"],
          ],
        },
        questions: [
          { answer: "belly|underside|undersides", why: "Paragraph D: 'rows of light organs called photophores along its belly'." },
          { answer: "cloud", why: "Paragraph D: shrimp 'spit out a cloud of glowing fluid'." },
          { answer: "spine", why: "Paragraph E: 'a modified dorsal spine tipped with a luminous lure'." },
          { answer: "mating", why: "Paragraph F: 'spectacular displays during the mating season'." },
        ],
      },
    ],
  },

  /* ══════════════════════════════════════════════════════════════════════
     PASSAGE 3 — Questions 27–40
     ══════════════════════════════════════════════════════════════════════ */
  {
    id: "bb000003-0003-0003-0003-000000000003",
    title: "The Evolution of Urban Planning",
    difficulty: "hard",
    paragraphs: [
      "A. The way in which cities are designed has profound effects on the health, prosperity and happiness of those who live in them, yet for most of history cities were not designed at all. Where planning did occur in the ancient world, it was often impressively sophisticated. The cities of the Indus Valley civilisation, built around 2600 BCE, had streets laid out on a grid and covered drainage systems that would not be equalled in Europe for thousands of years. The ancient Greeks, particularly Hippodamus of Miletus, later developed the orthogonal grid plan, and Roman engineers spread it across their empire, placing a forum at the heart of each new town.",
      "B. During the medieval period in Europe, formal planning largely gave way to organic growth. Towns developed around castles, cathedrals and market squares, with narrow, winding streets that followed the natural landscape rather than any imposed pattern. It has become fashionable to praise such places for their charm, but this is a view that could only be held by people who never had to live in them. Population growth within fixed city walls led to crowded and insanitary conditions, which contributed to devastating outbreaks of plague.",
      "C. The Industrial Revolution of the eighteenth and nineteenth centuries brought unprecedented challenges. The rapid migration of workers from the countryside to factory towns created massive overcrowding, pollution and public health crises. In response, reformers such as Sir Edwin Chadwick in Britain campaigned for improved sanitation and housing standards. The Public Health Act of 1848, among the first pieces of legislation to set minimum standards for urban living conditions, was the result. It was, in my view, the moment at which modern planning truly began, since it established the principle that the condition of a city was a matter of public responsibility.",
      "D. Elsewhere, change was imposed from above. Between 1853 and 1870, Baron Haussmann rebuilt the centre of Paris on the orders of Napoleon III, cutting wide boulevards through the medieval street pattern and installing new sewers, parks and aqueducts. The scheme displaced tens of thousands of poorer residents, and historians still argue about whether its main purpose was public health or the easier movement of troops. Whatever the motive, the result became a model that cities from Vienna to Buenos Aires hurried to copy.",
      "E. The late nineteenth century witnessed a revolutionary new approach: the Garden City movement. In his 1898 book To-morrow: A Peaceful Path to Real Reform, Ebenezer Howard envisaged self-contained communities surrounded by greenbelts, combining the best features of town and country. His ideas were realised at Letchworth in 1903 and at Welwyn Garden City in 1920. Only these two garden cities were ever built in England, and critics have sometimes dismissed the movement as a failure on those grounds. This is unfair. Howard's ideas shaped the New Towns built in Britain after the Second World War, and they continue to influence planners across the world.",
      "F. The twentieth century saw the rise of modernist planning, dominated by the ideas of the Swiss-French architect Le Corbusier. His concept of the 'Radiant City' envisaged high-rise towers set in open parkland and connected by motorways, with strict zoning to separate the places where people lived, worked and shopped. These principles were adopted with enthusiasm in the decades after 1945. The intentions were admirable, for the towers offered light, space and sanitation to families who had known only slums. The results, however, were frequently disastrous: neighbourhoods were demolished, communities were scattered, and residents were left dependent on the car.",
      "G. The most influential critic of this approach was the American writer Jane Jacobs, whose 1961 book The Death and Life of Great American Cities argued that lively streets, a mixture of uses and buildings of different ages were what made urban neighbourhoods safe and successful. Jacobs had no professional training in planning, a fact her opponents used against her, but time has shown that her observations were sounder than their theories.",
      "H. Today, urban planning is increasingly concerned with sustainability and resilience. Concepts such as transit-oriented development and the '15-minute city', in which all daily necessities can be reached within a short walk or cycle ride, are gaining support, and Paris, Melbourne and a number of other cities have written versions of the idea into their official plans. With 68 percent of the world's population projected to live in urban areas by 2050, the decisions that planners make now will matter for generations. Whether the 15-minute city will prove to be the right model everywhere remains to be seen, but the principle behind it, that cities should be built around people rather than vehicles, deserves to endure.",
    ],
    groups: [
      {
        type: "yng",
        title: "Yes / No / Not Given",
        data: {
          instruction: "Do the following statements agree with the views of the writer in Reading Passage 3? Choose YES if the statement agrees with the views of the writer, NO if the statement contradicts the views of the writer, or NOT GIVEN if it is impossible to say what the writer thinks about this.",
        },
        questions: [
          { text: "The drainage of Indus Valley cities was superior to anything in Europe for a very long time.", answer: "YES", why: "Paragraph A: their drainage systems 'would not be equalled in Europe for thousands of years'." },
          { text: "Medieval towns deserve the admiration they receive today.", answer: "NO", why: "Paragraph B: the writer says this view 'could only be held by people who never had to live in them'." },
          { text: "The Garden City movement should be regarded as a failure.", answer: "NO", why: "Paragraph E: critics have called it a failure, but the writer says 'This is unfair'." },
          { text: "Le Corbusier's ideas were adopted more widely in Europe than in America.", answer: "NOT GIVEN", why: "Paragraph F says the principles were adopted with enthusiasm after 1945, but does not compare regions." },
          { text: "Jane Jacobs understood cities better than the planners who criticised her.", answer: "YES", why: "Paragraph G: 'time has shown that her observations were sounder than their theories'." },
        ],
      },
      {
        type: "summary_completion",
        title: "Summary Completion",
        data: {
          instruction: "Complete the summary using the list of words below. Choose ONE WORD ONLY from the list for each answer.",
          summary_title: "Modernist planning",
          has_word_list: true,
          word_list: ["greenbelts", "sanitation", "legislation", "parkland", "communities", "pollution", "zoning", "markets"],
          summary_text: "Le Corbusier proposed a city of tall towers standing in __BLANK__ and linked by motorways. Each district was to have a single function, a system known as __BLANK__. The new housing gave many families better __BLANK__ than the slums they had left, but the schemes broke up existing __BLANK__ and made residents rely on cars.",
        },
        questions: [
          { answer: "parkland", why: "Paragraph F: 'high-rise towers set in open parkland'." },
          { answer: "zoning", why: "Paragraph F: 'strict zoning to separate the places where people lived, worked and shopped'." },
          { answer: "sanitation", why: "Paragraph F: the towers 'offered light, space and sanitation'." },
          { answer: "communities", why: "Paragraph F: 'communities were scattered'." },
        ],
      },
      {
        type: "flowchart_completion",
        title: "Flow-chart Completion",
        data: {
          instruction: "Complete the flow chart below. Choose NO MORE THAN THREE WORDS AND/OR A NUMBER from the passage for each answer.",
          flowchart_title: "The development of urban planning",
          max_words: 3,
          nodes: [
            { text: "Indus Valley cities are built with grid streets and covered __BLANK__ systems" },
            { text: "Greeks develop the grid plan; Romans place a __BLANK__ at the centre of each new town" },
            { text: "Medieval towns grow without a plan inside their walls" },
            { text: "Overcrowding in industrial towns leads to the __BLANK__ of 1848" },
            { text: "1898: Howard proposes communities surrounded by __BLANK__" },
            { text: "After 1945: modernist towers and motorways" },
            { text: "Today: the 15-minute city; __BLANK__ percent of people expected to live in cities by 2050" },
          ],
        },
        questions: [
          { answer: "drainage", why: "Paragraph A: 'covered drainage systems'." },
          { answer: "forum", why: "Paragraph A: 'placing a forum at the heart of each new town'." },
          { answer: "Public Health Act", why: "Paragraph C: 'The Public Health Act of 1848'." },
          { answer: "greenbelts|green belts", why: "Paragraph E: 'self-contained communities surrounded by greenbelts'." },
          { answer: "68", why: "Paragraph H: '68 percent of the world's population projected to live in urban areas by 2050'." },
        ],
      },
    ],
  },
];
