/* =========================================================
   LingoVantage — Test Bank
   Each test = 3 units. Add new tests by pushing to LV_TESTS.
   ---------------------------------------------------------
   Scoring (fully automatic):
     • Part A — Multiple choice  (1 mark each)
     • Part B — Right / Wrong    (1 mark each)
     totalMax = partA.length + partB.length
   Set "available: false" to show a test as "Coming soon".
   ========================================================= */

window.LV_TESTS = [
  {
    id: "units-1-3",
    name: "Units 1–3 Test",
    subtitle: "Hello! · All About Me · Food and Drink",
    units: "1–3",
    available: true,
    timeMinutes: 15,

    /* ---- PART A: multiple choice (answer = correct option key) ---- */
    partA: [
      { q: 1,  text: "Hello, I ____ Ahmed.", options: [["a","is"],["b","am"],["c","are"]], answer: "b" },
      { q: 2,  text: "____ from Italy. (he)", options: [["a","His"],["b","He"],["c","He's"]], answer: "c" },
      { q: 3,  text: "\"Are you a student?\" \"Yes, I ____.\"", options: [["a","am"],["b","is"],["c","are"]], answer: "a" },
      { q: 4,  text: "Maria is from Spain. She's ____.", options: [["a","Spain"],["b","Spanish"],["c","Spainish"]], answer: "b" },
      { q: 5,  text: "\"____ they from Japan?\" \"Yes, they are.\"", options: [["a","Is"],["b","Am"],["c","Are"]], answer: "c" },
      { q: 6,  text: "It's 8 o'clock in the morning. \"____!\"", options: [["a","Good evening"],["b","Good morning"],["c","Good night"]], answer: "b" },
      { q: 7,  text: "Tokyo is a city ____ Japan.", options: [["a","on"],["b","in"],["c","near"]], answer: "b" },
      { q: 8,  text: "I have ____ umbrella.", options: [["a","a"],["b","an"],["c","the"]], answer: "b" },
      { q: 9,  text: "What's the plural of \"knife\"?", options: [["a","knifes"],["b","knifies"],["c","knives"]], answer: "c" },
      { q: 10, text: "\"____ you have a phone?\" \"Yes, I do.\"", options: [["a","Are"],["b","Do"],["c","Is"]], answer: "b" },
      { q: 11, text: "Sarah is from England. ____ home is near London.", options: [["a","Her"],["b","His"],["c","She"]], answer: "a" },
      { q: 12, text: "Cairo isn't a small town. ____ a big city.", options: [["a","Its"],["b","It's"],["c","It"]], answer: "b" },
      { q: 13, text: "\"What's your ____?\" \"It's sara@mail.com.\"", options: [["a","phone number"],["b","surname"],["c","email address"]], answer: "c" },
      { q: 14, text: "I ____ eat meat. I'm a vegetarian.", options: [["a","doesn't"],["b","not"],["c","don't"]], answer: "c" },
      { q: 15, text: "I ____ have breakfast. (100% of the time)", options: [["a","never"],["b","sometimes"],["c","always"]], answer: "c" },
      { q: 16, text: "\"____ you like fish?\" \"No, I don't.\"", options: [["a","Do"],["b","Are"],["c","Is"]], answer: "a" },
      { q: 17, text: "\"Can I have a ____ of tea, please?\"", options: [["a","glass"],["b","piece"],["c","cup"]], answer: "c" },
      { q: 18, text: "It's 4:30. \"It's ____ four.\"", options: [["a","quarter past"],["b","half past"],["c","quarter to"]], answer: "b" },
      { q: 19, text: "To order in a café: \"I'd ____ a coffee, please.\"", options: [["a","like"],["b","want"],["c","have got"]], answer: "a" },
      { q: 20, text: "A: \"Here you are.\" B: \"____ you.\"", options: [["a","Please"],["b","Thank"],["c","Sorry"]], answer: "b" }
    ],

    /* ---- PART B: right / wrong (answer = "RIGHT" | "WRONG") ---- */
    partB: [
      { q: 21, text: "She is from Mexico. He's Mexican.", answer: "WRONG" },
      { q: 22, text: "They're students.", answer: "RIGHT" },
      { q: 23, text: "I am not Italian.", answer: "RIGHT" },
      { q: 24, text: "It not a big city.", answer: "WRONG" },
      { q: 25, text: "I have two watches.", answer: "RIGHT" },
      { q: 26, text: "This is my keys.", answer: "WRONG" },
      { q: 27, text: "Do you like coffee?", answer: "RIGHT" },
      { q: 28, text: "We eat not bread.", answer: "WRONG" },
      { q: 29, text: "I usually have dinner at 8 o'clock.", answer: "RIGHT" },
      { q: 30, text: "Can I have a piece of cake, please?", answer: "RIGHT" }
    ]
  },

  {
    id: "units-4-6",
    name: "Units 4–6 Test",
    subtitle: "My Life and My Family · Places · Work and Routines",
    units: "4–6",
    available: true,
    timeMinutes: 15,

    /* ---- PART A: multiple choice (answer = correct option key) ---- */
    partA: [
      /* Unit 4: Wh-questions, Common verbs, Family, Age */
      { q: 1,  text: "\"Where ____ you live?\" \"I live in Málaga.\"", options: [["a","are"],["b","does"],["c","do"]], answer: "c" },
      { q: 2,  text: "\"What ____ he study at university?\" \"He studies art.\"", options: [["a","do"],["b","does"],["c","is"]], answer: "b" },
      { q: 3,  text: "My brother ____ in a large office in Cairo.", options: [["a","work"],["b","works"],["c","working"]], answer: "b" },
      { q: 4,  text: "My father's sister is my ____.", options: [["a","daughter"],["b","cousin"],["c","aunt"]], answer: "c" },
      { q: 5,  text: "How old ____ her children?", options: [["a","have"],["b","are"],["c","is"]], answer: "b" },
      { q: 6,  text: "My sister is twenty-five. She ____ 25.", options: [["a","has"],["b","is"],["c","is having"]], answer: "b" },
      { q: 7,  text: "This is a picture ____ my international family.", options: [["a","of"],["b","for"],["c","in"]], answer: "a" },

      /* Unit 5: There is/are positive & negative, Quantifiers, Prepositions, Questions */
      { q: 8,  text: "Timbuktu is a small town. There ____ a large market.", options: [["a","are"],["b","is"],["c","isn't"]], answer: "b" },
      { q: 9,  text: "There are ____ shops here—only three or four.", options: [["a","a lot of"],["b","lots of"],["c","a few"]], answer: "c" },
      { q: 10, text: "We can't stay there. There ____ any free rooms in the hotel.", options: [["a","isn't"],["b","aren't"],["c","not are"]], answer: "b" },
      { q: 11, text: "I'm sorry, there ____ a swimming pool at the hostel.", options: [["a","not is"],["b","aren't"],["c","isn't"]], answer: "c" },
      { q: 12, text: "\"____ there a supermarket near here?\" \"Yes, in the next street.\"", options: [["a","Is"],["b","Are"],["c","Do"]], answer: "a" },
      { q: 13, text: "\"Are there ____ cafés near the station?\" \"No, there aren't.\"", options: [["a","a"],["b","any"],["c","one"]], answer: "b" },
      { q: 14, text: "Our flat is great ____ it is in a nice part of town.", options: [["a","but"],["b","because"],["c","and"]], answer: "c" },

      /* Unit 6: Present simple he/she/it negative & questions, Time linkers, Offers */
      { q: 15, text: "Diana works in a shop, but she ____ work at night.", options: [["a","don't"],["b","doesn't"],["c","not"]], answer: "b" },
      { q: 16, text: "Matteo is a waiter. He ____ work on Mondays.", options: [["a","doesn't"],["b","not works"],["c","doesn't works"]], answer: "a" },
      { q: 17, text: "I sleep ____ eight hours every night.", options: [["a","until"],["b","for"],["c","from"]], answer: "b" },
      { q: 18, text: "We watch TV ____ 3 o'clock in the morning, then we sleep.", options: [["a","for"],["b","until"],["c","from"]], answer: "b" },
      { q: 19, text: "\"Would you ____ a cup of tea?\" \"Yes, please.\"", options: [["a","have"],["b","like"],["c","want"]], answer: "b" },
      { q: 20, text: "A: \"I need to go to the shop.\" B: \"____ go with you.\"", options: [["a","I'll"],["b","I am"],["c","I can to"]], answer: "a" }
    ],

    /* ---- PART B: right / wrong (answer = "RIGHT" | "WRONG") ---- */
    partB: [
      /* Unit 4 */
      { q: 21, text: "Where do you work?", answer: "RIGHT" },
      { q: 22, text: "My brother teachs Spanish at a language school.", answer: "WRONG" }, // Correct: teaches
      { q: 23, text: "She has 30 years old.", answer: "WRONG" }, // Correct: She is 30 years old
      /* Unit 5 */
      { q: 24, text: "There is a hotel on this street?", answer: "WRONG" }, // Correct: Is there a hotel...
      { q: 25, text: "There aren't any blankets in the room.", answer: "RIGHT" },
      { q: 26, text: "My flat is near the office, but there is a park nearby.", answer: "WRONG" }, // Correct: uses "and" for addition, not "but"
      /* Unit 6 */
      { q: 27, text: "Marcus doesn't meets many people in his job.", answer: "WRONG" }, // Correct: doesn't meet
      { q: 28, text: "When does he get up in the morning?", answer: "RIGHT" },
      { q: 29, text: "We go out to a café because the office coffee machine isn't very good.", answer: "RIGHT" },
      { q: 30, text: "Would you like a piece of cake?", answer: "RIGHT" }
    ]
  },

  {
    id: "units-7-9",
    name: "Units 7–9 Test",
    subtitle: "Units 7–9 · Past Events, Shopping & Holidays",
    units: "7-9",
    available: true,
    timeMinutes: 15,

    /* ---- PART A: Multiple Choice (Answer = correct option key) ---- */
    partA: [
      // Unit 7: Shopping and Fashion
      { 
        q: 1,  
        text: "Look at ________ picture in my hand. It is beautiful!", 
        options: [["a","those"],["b","these"],["c","this"],["d","that"]], 
        answer: "c" 
      },
      { 
        q: 2,  
        text: "I want to buy ________ blue jeans over here.", 
        options: [["a","this"],["b","these"],["c","that"],["d","a"]], 
        answer: "b" 
      },
      { 
        q: 3,  
        text: "Look at those birds far away in the sky! ________ are beautiful.", 
        options: [["a","This"],["b","That"],["c","These"],["d","Those"]], 
        answer: "d" 
      },
      { 
        q: 4,  
        text: "My ________ car is parked outside. It is dark blue.", 
        options: [["a","brothers's"],["b","brother's"],["c","brothers"],["d","brother"]], 
        answer: "b" 
      },
      { 
        q: 5,  
        text: "All of the ________ dresses are white and light blue.", 
        options: [["a","girls'"],["b","girl's"],["c","girls's"],["d","girls"]], 
        answer: "a" 
      },
      { 
        q: 6,  
        text: "Customer: Excuse me, how much is this suitcase? \nShop Assistant: It is ________ (£3.80).", 
        options: [["a","three pounds eighty"],["b","three eighty pounds"],["c","three point eighty pounds"],["d","three eighty pence"]], 
        answer: "a" 
      },
      { 
        q: 7,  
        text: "I have a white shirt, dark blue trousers, and a black ________.", 
        options: [["a","picture"],["b","speaker"],["c","jacket"],["d","lamp"]], 
        answer: "c" 
      },
      // Unit 8: Past Events
      { 
        q: 8,  
        text: "Last week, my family and I ________ on holiday in Spain.", 
        options: [["a","was"],["b","were"],["c","are"],["d","did"]], 
        answer: "b" 
      },
      { 
        q: 9,  
        text: "My brother ________ at work yesterday morning because he was sick.", 
        options: [["a","wasn't"],["b","weren't"],["c","didn't"],["d","isn't"]], 
        answer: "a" 
      },
      { 
        q: 10, 
        text: "________ you at home last night at 9:00 PM?", 
        options: [["a","Was"],["b","Did"],["c","Were"],["d","Are"]], 
        answer: "c" 
      },
      { 
        q: 11, 
        text: "Yesterday afternoon, we ________ to a great new French café.", 
        options: [["a","go"],["b","went"],["c","goes"],["d","gone"]], 
        answer: "b" 
      },
      { 
        q: 12, 
        text: "I ________ a very strange sound outside my bedroom window last night.", 
        options: [["a","hear"],["b","heared"],["c","heard"],["d","was hear"]], 
        answer: "c" 
      },
      { 
        q: 13, 
        text: "They moved to Dubai three years ________.", 
        options: [["a","ago"],["b","last"],["c","yesterday"],["d","past"]], 
        answer: "a" 
      },
      { 
        q: 14, 
        text: "Host: It is late. What shall we do? \nGuest: We ________ go to the cinema tonight.", 
        options: [["a","was"],["b","had"],["c","were"],["d","could"]], 
        answer: "d" 
      },
      // Unit 9: Holidays
      { 
        q: 15, 
        text: "We ________ in a hotel during our last holiday. We stayed in a small tent.", 
        options: [["a","didn't stayed"],["b","didn't stay"],["c","wasn't stay"],["d","don't stay"]], 
        answer: "b" 
      },
      { 
        q: 16, 
        text: "________ you watch the football match on TV last night?", 
        options: [["a","Were"],["b","Was"],["c","Did"],["d","Do"]], 
        answer: "c" 
      },
      { 
        q: 17, 
        text: "Where ________ on holiday last summer?", 
        options: [["a","you went"],["b","did you went"],["c","did you go"],["d","were you went"]], 
        answer: "c" 
      },
      { 
        q: 18, 
        text: "I hate rainy days, but I really love ________ weather.", 
        options: [["a","snow"],["b","sunny"],["c","wind"],["d","cloud"]], 
        answer: "b" 
      },
      { 
        q: 19, 
        text: "In London, people often go to work ________ bus.", 
        options: [["a","by"],["b","on"],["c","in"],["d","with"]], 
        answer: "a" 
      },
      { 
        q: 20, 
        text: "Guest: ________ you help me with my suitcase, please? \nReceptionist: Yes, of course.", 
        options: [["a","Was"],["b","Did"],["c","Could"],["d","Were"]], 
        answer: "c" 
      }
    ],

    /* ---- PART B: Right / Wrong (Answer = "RIGHT" | "WRONG") ---- */
    partB: [
      { q: 21, text: "I really like this jeans you are wearing today.", answer: "WRONG" },
      { q: 22, text: "This is my sister's clock on the wall.", answer: "RIGHT" },
      { q: 23, text: "The room of Zoe is very small but clean.", answer: "WRONG" },
      { q: 24, text: "My friends was at a party last Saturday night.", answer: "WRONG" },
      { q: 25, text: "We walked by the river two hours ago.", answer: "RIGHT" },
      { q: 26, text: "I didn't went to school yesterday morning.", answer: "WRONG" },
      { q: 27, text: "Did they enjoy their holiday last winter?", answer: "RIGHT" },
      { q: 28, text: "First we went to Paris, next we visited London.", answer: "RIGHT" },
      { q: 29, text: "Can you pass me that plate, please?", answer: "RIGHT" },
      { q: 30, text: "They didn't had a big breakfast this morning.", answer: "WRONG" }
    ]
  },
  {
    id: "units-10-12-progress",
    name: "Progress Review Exam",
    subtitle: "Units 10–12 · Here & Now, Achievers & Plans",
    units: "10-12",
    available: true,
    timeMinutes: 45,

    /* ---- PART A: Multiple Choice (Answer = correct option key) ---- */
    partA: [
      // Unit 10: Here and Now
      { 
        q: 1,  
        text: "Which sentence correctly describes what someone is doing right now?", 
        options: [["a","He sitting in the car outside the house."],["b","He is sitting in the car outside the house."],["c","He sits in the car outside the house now."],["d","He is sit in the car outside the house."]], 
        answer: "b" 
      },
      { 
        q: 2,  
        text: "A: \"Can I have some coffee, please?\"\nB: \"Sorry, I ________ dinner right now. Can you wait?\"", 
        options: [["a","cook"],["b","cooking"],["c","am cooking"],["d","'m cook"]], 
        answer: "c" 
      },
      { 
        q: 3,  
        text: "Complete the sentence with the correct prepositions:\n\"There is a beautiful picture ________ the wall ________ the living room.\"", 
        options: [["a","in / on"],["b","at / in"],["c","on / in"],["d","on / at"]], 
        answer: "c" 
      },
      { 
        q: 4,  
        text: "Which preposition of place correctly completes the collocation in this sentence?\n\"John is not at home today. He is ________ work in London.\"", 
        options: [["a","on"],["b","in"],["c","at"],["d","to"]], 
        answer: "c" 
      },
      { 
        q: 5,  
        text: "Which is the correct Present Continuous negative sentence?", 
        options: [["a","We aren't staying in a hotel; we are camping in a garden."],["b","We not staying in a hotel; we are camping in a garden."],["c","We don't staying in a hotel; we are camping in a garden."],["d","We are no staying in a hotel; we are camping in a garden."]], 
        answer: "a" 
      },
      { 
        q: 6,  
        text: "Which question has the correct word order for asking about travel information?", 
        options: [["a","Where I can find a taxi?"],["b","Where can I find a taxi?"],["c","Where can find I a taxi?"],["d","Where find can I a taxi?"]], 
        answer: "b" 
      },
      { 
        q: 7,  
        text: "Passenger: \"Excuse me, which ________ is the next train to London?\"\nOfficial: \"It's Platform 3. It leaves ________ five minutes.\"", 
        options: [["a","bus stop / in"],["b","platform / at"],["c","platform / in"],["d","station / at"]], 
        answer: "c" 
      },
      // Unit 11: Achievers
      { 
        q: 8,  
        text: "Choose the correct chronological sequence of life events:", 
        options: [["a","finish school ➔ be born ➔ go to university ➔ get a job"],["b","be born ➔ finish school ➔ go to university ➔ get a job"],["c","go to university ➔ be born ➔ finish school ➔ get a job"],["d","finish school ➔ go to university ➔ get a job ➔ be born"]], 
        answer: "b" 
      },
      { 
        q: 9,  
        text: "How do you say the year \"1998\" in English?", 
        options: [["a","Nineteen hundred ninety-eight"],["b","One thousand nine hundred ninety-eight"],["c","Nineteen ninety-eight"],["d","One nine nine eight"]], 
        answer: "c" 
      },
      { 
        q: 10, 
        text: "Complete the sentence with the correct pronoun:\n\"Sarah is a very good friend of mine. I met ________ at university last year.\"", 
        options: [["a","she"],["b","her"],["c","him"],["d","us"]], 
        answer: "b" 
      },
      { 
        q: 11, 
        text: "A: \"Can you play the guitar?\"\nB: \"No, I can't play ________. I am a terrible musician!\"", 
        options: [["a","very well"],["b","quite well"],["c","not at all"],["d","at all"]], 
        answer: "d" 
      },
      { 
        q: 12, 
        text: "Which sentence correctly expresses a physical ability?", 
        options: [["a","My brother can't dance very well."],["b","My brother can't to dance very well."],["c","My brother can't dancing very well."],["d","My brother doesn't can dance very well."]], 
        answer: "a" 
      },
      { 
        q: 13, 
        text: "A: \"I think London Zoo is very nice.\"\nB: \"________. It's a wonderful place to visit.\"", 
        options: [["a","Maybe you're right"],["b","Yes, I agree"],["c","I don't think so"],["d","I'm not so sure"]], 
        answer: "b" 
      },
      { 
        q: 14, 
        text: "Replace the repeated nouns with the correct pronouns:\n\"Seema Bhadoria is a very strong woman. Seema can pull a truck with Seema's teeth!\"", 
        options: [["a","She / her"],["b","Her / she"],["c","She / his"],["d","He / her"]], 
        answer: "a" 
      },
      // Unit 12: Plans
      { 
        q: 15, 
        text: "Complete the positive future plan:\n\"Joel has had a very long day. He ________ to sleep for a long time tonight.\"", 
        options: [["a","is going"],["b","goes"],["c","is going to"],["d","going to"]], 
        answer: "c" 
      },
      { 
        q: 16, 
        text: "Complete the negative future plan:\n\"We are too tired. We ________ do any housework at the weekend.\"", 
        options: [["a","aren't going to"],["b","are not going"],["c","going to not"],["d","don't going to"]], 
        answer: "a" 
      },
      { 
        q: 17, 
        text: "What is the correct question structure for asking about weekend plans?", 
        options: [["a","What you are going to do this weekend?"],["b","What are you going to do this weekend?"],["c","What do you going to do this weekend?"],["d","What are you going to doing this weekend?"]], 
        answer: "b" 
      },
      { 
        q: 18, 
        text: "Complete the date phrase with the correct ordinal number spelling:\n\"Our next English class is on Tuesday, the ________ (22nd) of November.\"", 
        options: [["a","twenty-two"],["b","twenty-second"],["c","twentieth-second"],["d","twenty-twoth"]], 
        answer: "b" 
      },
      { 
        q: 19, 
        text: "Which sentence contains the correct future time expression?", 
        options: [["a","I am going to visit my parents at next week."],["b","I am going to visit my parents next week."],["c","I am going to visit my parents in next week."],["d","I am going to visit my parents on next week."]], 
        answer: "b" 
      },
      { 
        q: 20, 
        text: "Choose the most polite and natural response to decline an invitation:\nHost: \"Would you like to come to my house for dinner on Saturday?\"\nGuest: \"________\"", 
        options: [["a","No, I wouldn't."],["b","I'd love to, but I'm busy."],["c","Yes, I would."],["d","No, I am too tired."]], 
        answer: "b" 
      }
    ],

    /* ---- PART B: Right / Wrong (Answer = "RIGHT" | "WRONG") ---- */
    partB: [
      { q: 21, text: "I am writeing an email to my friend in Canada right now.", answer: "WRONG" },
      { q: 22, text: "Look! It's raining outside, so we can't play football in the garden.", answer: "RIGHT" },
      { q: 23, text: "My sister is having coffee in a café, but my husband is at work.", answer: "RIGHT" },
      { q: 24, text: "Those shoes are very beautiful. Can I buy they, please?", answer: "WRONG" },
      { q: 25, text: "She can swim quite well, but she can't to drive a car.", answer: "WRONG" },
      { q: 26, text: "He was born in nineteen ninety-eight (1998).", answer: "RIGHT" },
      { q: 27, text: "We going to make a cake for Melissa's birthday tomorrow.", answer: "WRONG" },
      { q: 28, text: "Mick is going to have a long hot bath after the TV programme.", answer: "RIGHT" },
      { q: 29, text: "We are going to go to a restaurant for lunch on tomorrow.", answer: "WRONG" },
      { q: 30, text: "Would you like to go for a walk at the weekend?", answer: "RIGHT" }
    ]
  },
];