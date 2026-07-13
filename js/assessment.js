/* =========================================================
   LingoVantage — Assessment Engine
   - 30 questions across A1, A2, B1 (10 each)
   - Single-answer multiple choice
   - Scoring: each correct answer = 1 point (max 30)
   - Level determination from total score AND per-level mastery
   - Optional timer (display only, non-blocking)
   ========================================================= */

/* ---------- QUESTION BANK (30 questions) ----------
   Each: { level, q, options[4], answer (index) }
   q may contain ___ which is styled as a blank.       */
const LV_QUESTIONS = [
  /* ----- A1 (1-10) ----- */
  { level: "A1", q: "She ___ a teacher.", options: ["is", "are", "am", "be"], answer: 0 },
  { level: "A1", q: "I ___ from Egypt.", options: ["is", "are", "am", "be"], answer: 2 },
  { level: "A1", q: "They ___ students.", options: ["is", "am", "be", "are"], answer: 3 },
  { level: "A1", q: "This is ___ apple.", options: ["a", "an", "the", "—"], answer: 1 },
  { level: "A1", q: "Choose the correct: ___ name is Sara.", options: ["She", "Her", "Hers", "Him"], answer: 1 },
  { level: "A1", q: "We ___ TV every evening.", options: ["watch", "watches", "watching", "watched"], answer: 0 },
  { level: "A1", q: "How ___ apples are there?", options: ["much", "many", "long", "old"], answer: 1 },
  { level: "A1", q: "There ___ a book on the table.", options: ["is", "are", "am", "be"], answer: 0 },
  { level: "A1", q: "He ___ like coffee.", options: ["don't", "doesn't", "isn't", "aren't"], answer: 1 },
  { level: "A1", q: "What time ___ it?", options: ["is", "are", "do", "does"], answer: 0 },

  /* ----- A2 (11-20) ----- */
  { level: "A2", q: "Yesterday I ___ to the cinema.", options: ["go", "going", "went", "gone"], answer: 2 },
  { level: "A2", q: "She is ___ than her sister.", options: ["tall", "taller", "tallest", "more tall"], answer: 1 },
  { level: "A2", q: "I ___ play tennis when I was a child.", options: ["use to", "used to", "using to", "uses to"], answer: 1 },
  { level: "A2", q: "We ___ dinner when you called.", options: ["have", "had", "were having", "are having"], answer: 2 },
  { level: "A2", q: "He has lived here ___ 2010.", options: ["since", "for", "during", "from"], answer: 0 },
  { level: "A2", q: "If it rains, we ___ at home.", options: ["stay", "will stay", "stayed", "staying"], answer: 1 },
  { level: "A2", q: "There aren't ___ eggs in the fridge.", options: ["some", "any", "much", "a"], answer: 1 },
  { level: "A2", q: "You ___ wear a seatbelt. It's the law.", options: ["can", "must", "might", "could"], answer: 1 },
  { level: "A2", q: "This is the ___ film I've ever seen.", options: ["good", "better", "best", "well"], answer: 2 },
  { level: "A2", q: "I'm interested ___ learning English.", options: ["on", "at", "in", "for"], answer: 2 },

  /* ----- B1 (21-30) ----- */
  { level: "B1", q: "If I ___ more time, I would travel the world.", options: ["have", "had", "will have", "having"], answer: 1 },
  { level: "B1", q: "The report ___ by the team last week.", options: ["wrote", "was written", "is writing", "has wrote"], answer: 1 },
  { level: "B1", q: "She asked me where I ___ from.", options: ["come", "came", "coming", "comes"], answer: 1 },
  { level: "B1", q: "I've been studying English ___ three years.", options: ["since", "for", "during", "ago"], answer: 1 },
  { level: "B1", q: "By the time we arrived, the show ___.", options: ["started", "has started", "had started", "starts"], answer: 2 },
  { level: "B1", q: "He suggested ___ a break.", options: ["to take", "take", "taking", "took"], answer: 2 },
  { level: "B1", q: "You ___ have told me earlier — I would have helped.", options: ["should", "must", "can", "will"], answer: 0 },
  { level: "B1", q: "The man ___ car was stolen called the police.", options: ["who", "which", "whose", "whom"], answer: 2 },
  { level: "B1", q: "I'd rather you ___ smoke in here.", options: ["don't", "didn't", "won't", "not"], answer: 1 },
  { level: "B1", q: "Despite ___ hard, he failed the exam.", options: ["study", "to study", "studying", "studied"], answer: 2 }
];

/* ---------- STATE ---------- */
let LV_current = 0;
let LV_answers = new Array(LV_QUESTIONS.length).fill(null);
let LV_timerSec = 0;
let LV_timerId = null;

/* ---------- DOM ---------- */
document.addEventListener("DOMContentLoaded", () => {
  initTestLogin();
  const startBtn = document.getElementById("startTestBtn");
  if (startBtn) startBtn.addEventListener("click", startTest);
});

/* ---------- LOGIN GATE ---------- */
function initTestLogin() {
  const loginWrap = document.getElementById("testLoginWrap");
  const intro = document.getElementById("testIntro");
  const form = document.getElementById("testLoginForm");
  if (!form) return;

  const auth = (window.LV_CONFIG || {}).assessmentAuth || {};

  // Already unlocked this session?
  if (sessionStorage.getItem("lv_test_auth") === "1") {
    if (loginWrap) loginWrap.style.display = "none";
    if (intro) intro.style.display = "block";
    return;
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const user = document.getElementById("testUser").value.trim();
    const pass = document.getElementById("testPassInput").value;
    const err = document.getElementById("testLoginErr");

    if (user === auth.username && pass === auth.password) {
      sessionStorage.setItem("lv_test_auth", "1");
      if (loginWrap) loginWrap.style.display = "none";
      if (intro) intro.style.display = "block";
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      err.className = "alert show error";
      err.textContent = "❌ Wrong username or password.";
    }
  });
}

function startTest() {
  document.getElementById("testIntro").style.display = "none";
  document.getElementById("testQuiz").style.display = "block";
  LV_current = 0;
  LV_answers = new Array(LV_QUESTIONS.length).fill(null);
  startTimer();
  renderQuestion();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function startTimer() {
  LV_timerSec = 0;
  const el = document.getElementById("quizTimer");
  LV_timerId = setInterval(() => {
    LV_timerSec++;
    const m = String(Math.floor(LV_timerSec / 60)).padStart(2, "0");
    const s = String(LV_timerSec % 60).padStart(2, "0");
    if (el) el.textContent = `⏱ ${m}:${s}`;
  }, 1000);
}

function renderQuestion() {
  const total = LV_QUESTIONS.length;
  const item = LV_QUESTIONS[LV_current];

  // progress
  document.getElementById("quizNow").textContent = LV_current + 1;
  document.getElementById("quizTotal").textContent = total;
  document.getElementById("quizBar").style.width = ((LV_current) / total * 100) + "%";

  // question
  const qText = item.q.replace("___", '<span class="blank">?</span>');
  document.getElementById("qLevel").textContent = "Section " + item.level;
  document.getElementById("qText").innerHTML = qText;

  // options
  const optWrap = document.getElementById("qOptions");
  optWrap.innerHTML = "";
  const keys = ["A", "B", "C", "D"];
  item.options.forEach((opt, i) => {
    const div = document.createElement("div");
    div.className = "option" + (LV_answers[LV_current] === i ? " selected" : "");
    div.innerHTML = `<span class="opt-key">${keys[i]}</span><span>${opt}</span>`;
    div.addEventListener("click", () => {
      LV_answers[LV_current] = i;
      renderQuestion();
    });
    optWrap.appendChild(div);
  });

  // nav buttons
  document.getElementById("prevBtn").style.visibility = LV_current === 0 ? "hidden" : "visible";
  const nextBtn = document.getElementById("nextBtn");
  nextBtn.textContent = LV_current === total - 1 ? "Finish & See Result" : "Next →";
}

function goPrev() {
  if (LV_current > 0) { LV_current--; renderQuestion(); }
}

function goNext() {
  if (LV_answers[LV_current] === null) {
    flashHint("Please pick an answer to continue 🙂");
    return;
  }
  if (LV_current < LV_QUESTIONS.length - 1) {
    LV_current++;
    renderQuestion();
    document.querySelector(".test-shell").scrollIntoView({ behavior: "smooth", block: "start" });
  } else {
    finishTest();
  }
}

function flashHint(msg) {
  const hint = document.getElementById("quizHint");
  if (!hint) return;
  hint.textContent = msg;
  hint.style.opacity = "1";
  clearTimeout(hint._t);
  hint._t = setTimeout(() => (hint.style.opacity = "0"), 2200);
}

/* ---------- SCORING & LEVEL ---------- */
function computeResult() {
  const perLevel = { A1: { correct: 0, total: 0 }, A2: { correct: 0, total: 0 }, B1: { correct: 0, total: 0 } };
  let totalCorrect = 0;

  LV_QUESTIONS.forEach((item, i) => {
    perLevel[item.level].total++;
    if (LV_answers[i] === item.answer) {
      perLevel[item.level].correct++;
      totalCorrect++;
    }
  });

  const score = totalCorrect;                 // out of 30
  const percent = Math.round((score / LV_QUESTIONS.length) * 100);

  /* Level logic:
     - Must "pass" lower sections (>=60%) to claim higher level.
     - Otherwise capped at the highest fully-mastered level. */
  const passA1 = perLevel.A1.correct / perLevel.A1.total >= 0.6;
  const passA2 = perLevel.A2.correct / perLevel.A2.total >= 0.6;
  const passB1 = perLevel.B1.correct / perLevel.B1.total >= 0.6;

  let level, label, desc, recommend;

  if (passA1 && passA2 && passB1) {
    level = "B1"; label = "Intermediate";
    desc = "Excellent! You handle everyday and more complex English well. You're ready to push toward B2 and beyond.";
    recommend = "business";
  } else if (passA1 && passA2) {
    level = "A2"; label = "Elementary";
    desc = "Good job! You have a solid foundation. With focused speaking practice you'll reach B1 quickly.";
    recommend = "fluency";
  } else if (passA1 || score >= 8) {
    level = "A1"; label = "Beginner";
    desc = "You're getting started! We'll build your foundations step by step so you gain confidence fast.";
    recommend = "fluency";
  } else {
    level = "A1"; label = "Beginner";
    desc = "Everyone starts somewhere! Our beginner-friendly path will get you speaking from day one.";
    recommend = "fluency";
  }

  return { score, percent, level, label, desc, recommend, perLevel, total: LV_QUESTIONS.length };
}

function finishTest() {
  if (LV_timerId) clearInterval(LV_timerId);
  const r = computeResult();

  document.getElementById("testQuiz").style.display = "none";
  const res = document.getElementById("testResult");
  res.style.display = "block";

  // ring
  const ring = document.getElementById("resultRing");
  ring.style.setProperty("--deg", (r.percent * 3.6) + "deg");
  document.getElementById("resultLevel").textContent = r.level;
  document.getElementById("resultScore").textContent = `${r.score}/${r.total} • ${r.percent}%`;

  document.getElementById("resultTitle").textContent = `You're at ${r.level} — ${r.label}`;
  document.getElementById("resultDesc").textContent = r.desc;

  // breakdown
  document.getElementById("rbA1").textContent = `${r.perLevel.A1.correct}/${r.perLevel.A1.total}`;
  document.getElementById("rbA2").textContent = `${r.perLevel.A2.correct}/${r.perLevel.A2.total}`;
  document.getElementById("rbB1").textContent = `${r.perLevel.B1.correct}/${r.perLevel.B1.total}`;

  // CTA: prefill signup with recommended package + level
  const levelMap = { A1: "Beginner (A1)", A2: "Elementary (A2)", B1: "Intermediate (B1)" };
  const signupUrl = `signup.html?package=${r.recommend}&level=${encodeURIComponent(levelMap[r.level])}`;
  document.getElementById("resultSignup").href = signupUrl;

  // share result on WhatsApp (admin)
  const cfg = window.LV_CONFIG || {};
  const msg = encodeURIComponent(
    `📝 LingoVantage Level Test Result\nLevel: ${r.level} (${r.label})\nScore: ${r.score}/${r.total} (${r.percent}%)`
  );
  const waBtn = document.getElementById("resultWhatsapp");
  if (waBtn) waBtn.href = `https://wa.me/${cfg.whatsappNumber}?text=${msg}`;

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function restartTest() {
  document.getElementById("testResult").style.display = "none";
  document.getElementById("testIntro").style.display = "block";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

document.getElementById("prevBtn").addEventListener("click", goPrev);
document.getElementById("nextBtn").addEventListener("click", goNext);
const restartBtn = document.getElementById("restartBtn");
if (restartBtn) restartBtn.addEventListener("click", restartTest);
