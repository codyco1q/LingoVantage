/* =========================================================
   LingoVantage — Homework Bank
   Each unit = 10 auto-graded questions + 1 voice note (≤60s).
   ---------------------------------------------------------
   Question types:
   1) Fill-in-the-blank (text):
        { q, text, accept: [ ["am","m"] ] }
      - "accept" is an array of BLANKS; each blank is a list of
        acceptable answers. Multi-blank questions have >1 entry.
      - Answers are matched case-insensitively, ignoring
        punctuation & apostrophes (so "aren't" == "arent").
      - 1 mark per question (all blanks must be correct).
   2) Multiple choice: { q, text, options:[["a","…"]], answer:"a" }
   3) Right/Wrong:     { q, text, type:"rw", answer:"RIGHT"|"WRONG" }

   Set "available: false" to show a unit as "Coming soon".
   ========================================================= */

window.LV_HOMEWORK = [
  {
    unit: 1, title: "Unit 1 Homework", subtitle: "Hello!", available: true, voiceSeconds: 60,
    voicePrompt: "Introduce yourself: say your name, where you're from, your nationality, and one thing about you. Speak for up to 60 seconds.",
    questions: [
      { q: 1,  text: "\"I ____ a student.\"", accept: [["am", "m"]] },
      { q: 2,  text: "\"We ____ from the UK.\" (contracted negative)", accept: [["arent", "are not"]] },
      { q: 3,  text: "A: \"____ you Berkay?\"  B: \"Yes, I ____.\"", accept: [["are"], ["am"]] },
      { q: 4,  text: "\"He ____ Japanese.\"", accept: [["is", "s"]] },
      { q: 5,  text: "\"They ____ American. They are Canadian.\" (negative)", accept: [["arent", "are not"]] },
      { q: 6,  text: "\"My name's Harumi. I'm from Tokyo, in ____.\"", accept: [["japan"]] },
      { q: 7,  text: "\"Hi, I'm Pablo. I'm from Puebla, in ____.\"", accept: [["mexico"]] },
      { q: 8,  text: "\"I'm from Brazil. I'm ____.\" (nationality)", accept: [["brazilian"]] },
      { q: 9,  text: "\"They are from Spain. They are ____.\" (nationality)", accept: [["spanish"]] },
      { q: 10, text: "A: \"Who is ____?\"  B: \"He's my friend Lee.\" (this/these)", accept: [["this"]] }
    ]
  },
  {
    unit: 2, title: "Unit 2 Homework", subtitle: "All About Me", available: true, voiceSeconds: 60,
    voicePrompt: "Describe your home and something you have (or don't have). Use possessive adjectives (my, his, her…). Speak for up to 60 seconds.",
    questions: [
      { q: 1,  text: "\"Javier is from Barcelona. ____ home is in a nice part of the city.\"", accept: [["his"]] },
      { q: 2,  text: "\"Sarah is from England. ____ town is near Hastings.\"", accept: [["her"]] },
      { q: 3,  text: "Make it negative (contracted): \"It's a big flat.\" → \"____ a big flat.\"", accept: [["it isnt", "it is not"]] },
      { q: 4,  text: "\"I ____ a phone in my bag, but I don't have a computer.\" (have)", accept: [["have", "ve"]] },
      { q: 5,  text: "\"____ you ____ an umbrella at home?\" (auxiliary + verb)", accept: [["do"], ["have"]] },
      { q: 6,  text: "Opposite adjective: \"My flat isn't small. It is very ____.\"", accept: [["big", "large"]] },
      { q: 7,  text: "Plural: \"I have two ____ (watch) in my pocket.\"", accept: [["watches"]] },
      { q: 8,  text: "Plural: \"Are these your ____ (knife)?\"", accept: [["knives"]] },
      { q: 9,  text: "\"You use this to open a door or a lock. It is a ____.\"", accept: [["key", "keys"]] },
      { q: 10, text: "Form fields: \"____: Sophia   /   ____: Taylor\" (First name / Surname)", accept: [["first name"], ["surname"]] }
    ]
  },
  {
    unit: 3, title: "Unit 3 Homework", subtitle: "Food and Drink", available: true, voiceSeconds: 60,
    voicePrompt: "Talk about food: what you like and don't like, and what you eat at what time. Use frequency adverbs. Speak for up to 60 seconds.",
    questions: [
      { q: 1,  text: "\"I like rice, but I ____ like bread.\"", accept: [["dont", "do not"]] },
      { q: 2,  text: "\"____ you eat meat?\"  \"Yes, we do.\"", accept: [["do"]] },
      { q: 3,  text: "\"We ____ fruit every day.\"", accept: [["eat", "like"]] },
      { q: 4,  text: "Put in order: \"sometimes / we / eat / at / fish / dinner\"", accept: [["we sometimes eat fish at dinner"]] },
      { q: 5,  text: "\"My friends and I ____ have lunch at work. We always go to the café.\" (frequency)", accept: [["usually", "always"]] },
      { q: 6,  text: "\"Apples, oranges, and bananas are all types of ____.\"", accept: [["fruit"]] },
      { q: 7,  text: "\"A ____ is made with two pieces of bread, with cheese, meat, or salad.\"", accept: [["sandwich"]] },
      { q: 8,  text: "\"02:15 is '(a) ____ past two'.\"", accept: [["quarter"]] },
      { q: 9,  text: "\"____ time do you have breakfast?\"  \"At 7:30.\"", accept: [["what"]] },
      { q: 10, text: "Café: \"Can I ____ a chocolate cake and a tea, please?\"", accept: [["have", "order", "get"]] }
    ]
  },
  {
    unit: 4, title: "Unit 4 Homework", subtitle: "My Life and My Family", available: true, voiceSeconds: 60,
    voicePrompt: "Describe your family or a photo of them using 'this/these' and present simple verbs. Speak for up to 60 seconds.",
    questions: [
      { q: 1,  text: "\"Where ____ you live?\" (do/does/are)", accept: [["do"]] },
      { q: 2,  text: "Put in order: \"study at / university / do you / what\"", accept: [["what university do you study at"]] },
      { q: 3,  text: "\"Our daughter ____ (eat) rice every day.\"", accept: [["eats"]] },
      { q: 4,  text: "Correct the spelling: \"My brother studys Spanish.\" → \"My brother ____ Spanish.\"", accept: [["studies"]] },
      { q: 5,  text: "\"What time ____ you go to school?\" (do/does/is)", accept: [["do"]] },
      { q: 6,  text: "Which is NOT possible? \"I meet my friends for coffee / to the gym / people at work.\"", accept: [["to the gym"]] },
      { q: 7,  text: "Spell the number: \"75 = seventy-____\"", accept: [["five"]] },
      { q: 8,  text: "Spell the number: \"48 = ____-eight\"", accept: [["forty"]] },
      { q: 9,  text: "Plural: \"She is a woman, but they are ____.\"", accept: [["women"]] },
      { q: 10, text: "\"____ are my friends.\" (This/These)", accept: [["these"]] }
    ]
  },
  {
    unit: 5, title: "Unit 5 Homework", subtitle: "Places", available: true, voiceSeconds: 60,
    voicePrompt: "Describe a place you know (your town, a hotel, or a hostel) using 'there is / there are'. Speak for up to 60 seconds.",
    questions: [
      { q: 1,  text: "\"In Timbuktu, there ____ a large market.\" (is/are)", accept: [["is"]] },
      { q: 2,  text: "\"There ____ any blankets or pillows on the beds.\" (isn't/aren't)", accept: [["arent", "are not"]] },
      { q: 3,  text: "\"____ there a swimming pool at the hotel?\" (Is/Are)", accept: [["is"]] },
      { q: 4,  text: "A: \"Are there any cafés near here?\"  B: \"Yes, there ____.\"", accept: [["are"]] },
      { q: 5,  text: "Correct it: \"Is there a hotel on this street? Yes, there's.\" → \"Yes, there ____.\"", accept: [["is"]] },
      { q: 6,  text: "Place: \"We go here to keep or withdraw our money.\"", accept: [["bank"]] },
      { q: 7,  text: "Place: \"Children go here to learn and study with teachers.\"", accept: [["school"]] },
      { q: 8,  text: "Unscramble (i p o w l l): \"You put your head on this in bed.\"", accept: [["pillow"]] },
      { q: 9,  text: "Unscramble (w e r h o s): \"You stand under this to wash in the bathroom.\"", accept: [["shower"]] },
      { q: 10, text: "\"There is a beautiful park near the hotel, ____ it is very small.\" (and/but)", accept: [["but"]] }
    ]
  },
  {
    unit: 6, title: "Unit 6 Homework", subtitle: "Work and Routines", available: true, voiceSeconds: 60,
    voicePrompt: "Describe your daily routine and your job (or someone's job) with times. Speak for up to 60 seconds.",
    questions: [
      { q: 1,  text: "\"My sister ____ (not live) at home.\"", accept: [["doesnt live", "does not live"]] },
      { q: 2,  text: "Correct it: \"She don't like cake.\" → \"____\"", accept: [["she doesnt like cake", "she does not like cake"]] },
      { q: 3,  text: "A: \"____ your sister work in a bank?\"  B: \"No, she ____.\"", accept: [["does"], ["doesnt", "does not"]] },
      { q: 4,  text: "Put in order: \"where / your brother / work\"", accept: [["where does your brother work"]] },
      { q: 5,  text: "\"I sleep ____ 11:00 pm ____ 7:00 am.\" (for/from/to/until)", accept: [["from"], ["to"]] },
      { q: 6,  text: "Job: \"She works in a hospital and helps sick people. She is a ____.\"", accept: [["doctor"]] },
      { q: 7,  text: "Job: \"He drives people around a city. He is a ____.\"", accept: [["taxi driver"]] },
      { q: 8,  text: "\"I always ____ home at 6:30 in the evening after work.\" (get/go/have)", accept: [["get"]] },
      { q: 9,  text: "\"I usually have ____ at 8:00 am, and then I have a ____ at my desk.\"", accept: [["breakfast"], ["coffee"]] },
      { q: 10, text: "\"I walk to work every day ____ my flat is near the office.\" (because/also)", accept: [["because"]] }
    ]
  },
  {
    unit: 7, title: "Unit 7 Homework", subtitle: "Shopping and Fashion", available: true, voiceSeconds: 60,
    voicePrompt: "Talk about your favorite clothes or a recent shopping trip. Describe colors, prices, and what you or others are wearing using demonstratives (this/that/these/those). Speak for up to 60 seconds.",
    questions: [
      { q: 1,  text: "\"Excuse me, how much is ___________ lamp over there?\" (pointing to a lamp far away)", accept: [["that"]] },
      { q: 2,  text: "\"I love ___________ flowers here in my hand.\"", accept: [["these"]] },
      { q: 3,  text: "\"This is ___________ phone.\" (belonging to Kate)", options: [["a","Kates'"],["b","Kate's"],["c","Kates"]], answer: "b" },
      { q: 4,  text: "\"The ___________ lesson starts at nine.\" (belonging to two or more girls)", options: [["a","girl's"],["b","girls'"],["c","girls"]], answer: "b" },
      { q: 5,  text: "\"My ___________ are dark blue.\"", options: [["a","brother's jeans"],["b","jeans of my brother"],["c","brother jeans"]], answer: "a" },
      { q: 6,  text: "\"You use a ___________ to carry your clothes when you travel.\"", accept: [["suitcase", "bag"]] },
      { q: 7,  text: "Write the price in words as spoken: \"€13.50\" → \"___________\"", accept: [["thirteen euros fifty", "thirteen fifty"]] },
      { q: 8,  text: "\"He is wearing a light green shirt and dark blue ___________.\"", accept: [["trousers", "jeans", "shoes"]] },
      { q: 9,  text: "Complete the opposite pair: \"light blue\" ↔ \"___________ blue\"", accept: [["dark"]] },
      { q: 10, text: "Rewrite with punctuation (commas/full stops): \"I need to buy a bag a lamp and a chair\" → \"___________\"", accept: [["i need to buy a bag a lamp and a chair"]] }
    ]
  },
{
    unit: 8, title: "Unit 8 Homework", subtitle: "Past Events", available: true, voiceSeconds: 60,
    voicePrompt: "Talk about a memorable holiday or a specific day last week. Describe where you went, who you talked to, and what you did using the past simple form of regular and irregular verbs. Speak for up to 60 seconds.",
    questions: [
      { q: 1,  text: "\"Last week my family and I ___________ in Dublin for a holiday.\" (was/were)", accept: [["were"]] },
      { q: 2,  text: "\"James ___________ at work this morning because he was sick.\" (wasn't/weren't)", accept: [["wasnt", "was not"]] },
      { q: 3,  text: "\"Yesterday, I ___________ (talk) to my friend Katie on the phone for an hour.\"", accept: [["talked"]] },
      { q: 4,  text: "\"We ___________ (go) to a really nice Italian restaurant last night.\"", accept: [["went"]] },
      { q: 5,  text: "\"Where ___________ you yesterday afternoon at 3:00? I called you but you didn't answer.\" (was/were)", accept: [["were"]] },
      { q: 6,  text: "\"I went to a big museum in Paris three years ___________.\" (yesterday/ago/last)", accept: [["ago"]] },
      { q: 7,  text: "Write the past simple form of the irregular verb 'have': \"We ___________ sandwiches for lunch yesterday.\"", accept: [["had"]] },
      { q: 8,  text: "\"On Saturday, I decided to stay at home and ___________ a book.\" (read)", accept: [["read"]] },
      { q: 9,  text: "\"I usually go ___________ a walk in the park on Sunday mornings.\" (preposition)", accept: [["for"]] },
      { q: 10, text: "Complete the suggestion: A: \"We ___________ go to the cinema tonight.\" B: \"Yes, that's a great idea!\" (Let's/Shall/could)", accept: [["could"]] }
    ]
  },
  {
    unit: 9, title: "Unit 9 Homework", subtitle: "Holidays", available: true, voiceSeconds: 60,
    voicePrompt: "Talk about your last holiday or a trip you took. Explain how you traveled there (by plane, train, etc.), what the weather was like, and what you did during the trip. Speak for up to 60 seconds.",
    questions: [
      { q: 1,  text: "\"We had a great holiday, but we _______________ in a hotel. We camped in a garden.\" (stay - past simple negative)", accept: [["didnt stay", "did not stay"]] },
      { q: 2,  text: "\"I _______________ any photos from my trip because I lost my phone.\" (have - past simple negative)", accept: [["didnt have", "did not have"]] },
      { q: 3,  text: "\"___________ you enjoy your holiday in Greece last year?\" (helper verb)", accept: [["did"]] },
      { q: 4,  text: "Rearrange the words to make a correct question: 'did / stay / where / you / in London / ?' ➔ \"___________\"", accept: [["where did you stay in london"]] },
      { q: 5,  text: "A: \"Did you see Youssef's place?\" B: \"No, I didn't. We _______________ there.\"", options: [["a","didn't went"],["b","didn't go"],["c","wasn't go"]], answer: "b" },
      { q: 6,  text: "\"We usually go to Alexandria ___________ train because it is fast and comfortable.\"", accept: [["by"]] },
      { q: 7,  text: "Complete the weather adjective: \"It was a ___________ day, so we stayed inside and watched a movie.\" (rain)", accept: [["rainy"]] },
      { q: 8,  text: "\"March, April, and May are the months of ___________ in Egypt.\"", accept: [["spring"]] },
      { q: 9,  text: "\"What was the weather ___________ during your trip to London?\"", accept: [["like"]] },
      { q: 10, text: "\"___________ you help me carry this suitcase, please?\" (Making requests)", accept: [["could", "can"]] }
    ]
  },
  {
    unit: 10, title: "Unit 10 Homework", subtitle: "Here and Now", available: true, voiceSeconds: 60,
    voicePrompt: "Describe what you or your family members are doing right now in different rooms of your house. Use the present continuous (e.g., I am studying, my mom is cooking). Speak for up to 60 seconds.",
    questions: [
      { q: 1,  text: "\"Shhh! Be quiet. I _______________ (study) really hard for my English exam in my bedroom right now.\"", accept: [["am studying", "m studying"]] },
      { q: 2,  text: "\"Look out of the window! _______________ outside, so we can't play football.\" (It rains / It's raining)", accept: [["its raining", "it is raining"]] },
      { q: 3,  text: "Correct the error: \"I am not like cooking tonight.\" ➔ \"I _______________ cooking tonight.\"", accept: [["am not", "m not"]] },
      { q: 4,  text: "A: \"Hi Juan, are you at the cinema?\" B: \"No, I'm at the bus stop. I _______________ (wait) for the bus.\"", accept: [["am waiting", "m waiting"]] },
      { q: 5,  text: "Put in order: 'wearing / you / shoes / black / why / are / ?' ➔ \"___________\"", accept: [["why are you wearing black shoes"]] },
      { q: 6,  text: "\"My mother is cooking dinner in the _______________, so there is a wonderful smell in the house.\"", accept: [["kitchen"]] },
      { q: 7,  text: "\"Where is Khalid? He is ___________ holiday in Barcelona this week.\" (at/on/in)", accept: [["on"]] },
      { q: 8,  text: "\"Don't leave your book on the floor. Put it _______________ the table in the living room.\" (preposition of place)", accept: [["on", "onto"]] },
      { q: 9,  text: "Passenger: \"Excuse me, which ___________ does the train to London leave from?\" Station Agent: \"It leaves from number 3.\"", accept: [["platform"]] },
      { q: 10, text: "Put in order to make a question: 'find / I / a / where / taxi / can / ?' ➔ \"___________\"", accept: [["where can i find a taxi"]] }
    ]
  },
  {
    unit: 11, title: "Unit 11 Homework", subtitle: "Achievers", available: true, voiceSeconds: 60,
    voicePrompt: "Talk about your abilities and life events. Describe what you can or can't do well (e.g., speak languages, play sports) and mention important years in your life using object pronouns. Speak for up to 60 seconds.",
    questions: [
      { q: 1,  text: "\"I love my parents very much, and I think they love ________ too.\" (me/my/mine)", accept: [["me"]] },
      { q: 2,  text: "\"Those shoes in the window are beautiful! I really want to buy ________.\" (it/them/they)", accept: [["them"]] },
      { q: 3,  text: "\"Sarah is a very good friend. I met ________ when we were at university.\" (she/her/hers)", accept: [["her"]] },
      { q: 4,  text: "\"Beto is an amazing piano player, but he ________ play guitar at all—he doesn't know how.\" (can/can't)", accept: [["cant", "can not"]] },
      { q: 5,  text: "\"________ you drive a car?\" \"Yes, I can, but not very well.\"", accept: [["can"]] },
      { q: 6,  text: "Complete the life event sequence: be born ➔ go to school ➔ finish school ➔ ________ a job ➔ get married.", accept: [["get"]] },
      { q: 7,  text: "How do you speak the year 1998 in words? ➔ \"___________\"", accept: [["nineteen ninety eight"]] },
      { q: 8,  text: "A: \"Can Leila sing?\" B: \"Yes, quite ________. She has a nice voice.\" (good/well/at all)", accept: [["well"]] },
      { q: 9,  text: "\"What do you ________ of Central Park?\" (think/like/agree)", accept: [["think"]] },
      { q: 10, text: "A: \"I think London Zoo is very nice.\" B: \"Maybe you're ________, but I think it's very expensive.\" (agree/right/think)", accept: [["right"]] }
    ]
  },
  {
    unit: 12, title: "Unit 12 Homework", subtitle: "Plans", available: true, voiceSeconds: 60,
    voicePrompt: "Talk about your future plans and intentions. Mention what you are going to do next week or during your next holiday, including dates and activities (e.g., travel, clean your room, visit friends). Speak for up to 60 seconds.",
    questions: [
      { q: 1,  text: "\"I am very tired tonight. I ________________________ (have) a long hot bath and sleep early.\" (be going to)", accept: [["m going to have", "am going to have"]] },
      { q: 2,  text: "\"We ________________________ (not watch) any TV this evening because we want to finish our homework.\" (be going to negative)", accept: [["arent going to watch", "are not going to watch"]] },
      { q: 3,  text: "\"___________ you ___________ (visit) your friend in London next weekend?\" (be going to question)", accept: [["are / going to visit", "are going to visit"]] },
      { q: 4,  text: "\"What time ___________ he ___________ (arrive) at the airport tomorrow morning?\" (be going to question)", accept: [["is / going to arrive", "is going to arrive"]] },
      { q: 5,  text: "Correct the error: 'He is going to plays football with us next Saturday.' ➔ \"He is going to ___________ football with us next Saturday.\"", accept: [["play"]] },
      { q: 6,  text: "Write the ordinal number in words: \"My birthday is on the 22nd of January.\" ➔ \"twenty-___________ of January.\"", accept: [["second"]] },
      { q: 7,  text: "Complete with the correct preposition (or type 'none' if no preposition is needed): \"They are going to travel to Spain ___________ next week.\"", accept: [["none", "x", "-"]] },
      { q: 8,  text: "\"I need to ___________ my bedroom because it is very messy.\" (do / make / clean / go)", accept: [["clean"]] },
      { q: 9,  text: "Which word contains the voiced /v/ sound? (week / window / visit / homework / warm)", accept: [["visit"]] },
      { q: 10, text: "A: \"Would you ___________ to come for coffee tomorrow?\" B: \"I'd ___________ to, but I'm busy.\"", accept: [["like / love", "like love"]] }
    ]
  },
];

/* Shared answer-normalizer (used by portal + dashboard) */
window.LV_normAnswer = function (s) {
  return String(s == null ? "" : s)
    .toLowerCase()
    .replace(/[''`]/g, "")          // drop apostrophes: aren't -> arent
    .replace(/[^a-z0-9 ]/g, " ")    // other punctuation -> space
    .replace(/\s+/g, " ")
    .trim();
};
