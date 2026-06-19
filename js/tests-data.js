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

  /* ----- Placeholders for the remaining tests (add later) ----- */
  { id: "units-4-6",   name: "Units 4–6 Test",   subtitle: "Coming soon", units: "4–6",   available: false },
  { id: "units-7-9",   name: "Units 7–9 Test",   subtitle: "Coming soon", units: "7–9",   available: false },
  { id: "units-10-12", name: "Units 10–12 Test", subtitle: "Coming soon", units: "10–12", available: false }
];
