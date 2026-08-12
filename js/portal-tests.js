/* =========================================================
   LingoVantage — Student Portal: Tests tab (fully automatic)
   - Lists tests (from js/tests-data.js)
   - One attempt per IP per test (checked against Supabase)
   - Auto-grades 100% (MCQ + Right/Wrong) -> instant final score
   - Saves results to Supabase table "test_results"
   - Shows the student their saved result when they return

   Supabase table expected (see README): test_results
     id uuid (default gen_random_uuid())
     created_at timestamptz (default now())
     test_id text
     test_name text
     ip text
     score int4          -- marks earned
     total_max int4       -- marks possible
     percent int4         -- score / total_max * 100
     grade text           -- A / B / C / D / -
     answers jsonb        -- the student's chosen answers
   ========================================================= */

(function () {
  let CURRENT_IP = null;
  let initialized = false;

  /* Called by portal.js when the Tests tab is first shown */
  window.LV_initTests = async function () {
    if (initialized) return;
    initialized = true;
    await ensureIP();
    renderTestList();
  };

  /* ---------- Get visitor IP (free, no key) ---------- */
  async function ensureIP() {
    if (CURRENT_IP) return CURRENT_IP;
    try {
      const res = await fetch("https://api.ipify.org?format=json");
      const j = await res.json();
      CURRENT_IP = j.ip || "unknown";
    } catch (e) {
      CURRENT_IP = "unknown";
    }
    return CURRENT_IP;
  }

  /* ---------- Grade from score (out of total) ---------- */
  function gradeFromScore(score, max) {
    const pct = Math.round((score / max) * 100);
    // thresholds scale with total (answer key is based on /30)
    if (pct >= 90) return { grade: "A", label: "Excellent — ready for the next units", pct };
    if (pct >= 80) return { grade: "B", label: "Very good", pct };
    if (pct >= 70) return { grade: "C", label: "Good — minor review needed", pct };
    if (pct >= 60) return { grade: "D", label: "Pass — review weak areas", pct };
    return { grade: "—", label: "Needs more practice — revisit the units", pct };
  }

  function el(html) {
    const d = document.createElement("div");
    d.innerHTML = html.trim();
    return d.firstElementChild;
  }
  function escapeHtml(s) {
    return String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  }
  function maxOf(t) { return (t.partA ? t.partA.length : 0) + (t.partB ? t.partB.length : 0); }

  /* A manual-review exam (writing and/or speaking) is not auto-graded:
     the teacher reviews it on the dashboard and delivers the result. */
  function isReviewTest(t) { return !!(t && (t.hasWritingTask || t.hasVoiceTask)); }

  function unitBadge(unit) { return `<span class="unit-tag">${escapeHtml(unit)}</span>`; }

  /* ---------- Voice recorder state (per speaking task) ---------- */
  let voiceRecordings = {}; // task -> { blob, mime }
  let voiceStreams = {};    // task -> MediaStream
  let voiceTimers = {};     // task -> interval id

  function fmtTime(s) { s = Math.max(0, s); return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); }

  function pickVoiceMime() {
    const opts = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg"];
    for (const m of opts) { if (window.MediaRecorder && MediaRecorder.isTypeSupported(m)) return m; }
    return "";
  }

  function stopVoiceStream(task) {
    if (voiceStreams[task]) { voiceStreams[task].getTracks().forEach(tr => tr.stop()); delete voiceStreams[task]; }
    if (voiceTimers[task]) { clearInterval(voiceTimers[task]); delete voiceTimers[task]; }
  }
  function stopAllVoices() { Object.keys(voiceStreams).forEach(k => stopVoiceStream(k)); }

  /* ---------- Build an answer-review breakdown (right/wrong) ---------- */
  function buildReview(t, answers) {
    if (!answers) return "";
    if (typeof answers === "string") { try { answers = JSON.parse(answers); } catch (e) { return ""; } }
    const A = answers.A || {}, B = answers.B || {};
    let html = '<div class="answer-review"><h3 style="margin:26px 0 12px;">Your answers</h3>';

    const row = (num, text, chosen, correct) => {
      const ok = String(chosen) === String(correct);
      return `<div class="ans-row ${ok ? "ok" : "bad"}">
        <div class="ans-q">${num}. ${escapeHtml(text)}</div>
        <div class="ans-detail">
          <span class="ans-badge ${ok ? "ok" : "bad"}">${ok ? "✓" : "✗"}</span>
          <span>Your answer: <b>${escapeHtml(chosen == null ? "—" : chosen)}</b></span>
          ${ok ? "" : `<span class="ans-correct">Correct: <b>${escapeHtml(correct)}</b></span>`}
        </div>
      </div>`;
    };

    (t.partA || []).forEach(i => { html += row(i.q, i.text, A[i.q], i.answer); });
    (t.partB || []).forEach(i => { html += row(i.q, i.text, B[i.q], i.answer); });
    html += "</div>";
    return html;
  }

  /* ---------- Render the list of tests ---------- */
  async function renderTestList() {
    const wrap = document.getElementById("testsList");
    if (!wrap) return;
    wrap.innerHTML = '<div class="dash-empty"><span class="spinner" style="border-top-color:var(--teal-400)"></span> Loading tests…</div>';

    const tests = window.LV_TESTS || [];
    const sbReady = window.LV_Supabase && window.LV_Supabase.ready();

    // Fetch this student's previous results once
    let myResults = [];
    const myName = (sessionStorage.getItem("lv_portal_name") || "").trim();
    if (sbReady && myName.length >= 2) {
      try {
        myResults = await window.LV_Supabase.selectWhere(
          "test_results", `student_name=ilike.${encodeURIComponent(myName)}`
        );
      } catch (e) { console.warn("Could not load past results:", e); }
    }

    wrap.innerHTML = "";
    tests.forEach(t => {
      const prev = myResults.find(r => r.test_id === t.id);
      wrap.appendChild(buildTestCard(t, prev, sbReady));
    });
  }

  function buildTestCard(t, prev, sbReady) {
    if (!t.available) {
      return el(`
        <div class="session-row pending">
          <div class="session-num">${t.units}</div>
          <div class="session-info"><strong>${t.name}</strong><span>Coming soon</span></div>
          <div class="session-action"><span class="soon-pill">Coming soon</span></div>
        </div>`);
    }

    const total = t.totalMarks || maxOf(t);
    const review = isReviewTest(t);
    const prevGrade = review && prev ? prev.grade : null;

    let actionHTML, statusHTML = escapeHtml(t.subtitle) + " · " + total + " marks";

    if (review && prev) {
      if (prevGrade === "Passed") {
        statusHTML += ' · <span style="color:var(--success);font-weight:700;">✅ Passed</span>';
        actionHTML = `<button class="btn btn-ghost" data-view="${t.id}">View submission</button>`;
      } else if (prevGrade === "Failed") {
        statusHTML += ' · <span style="color:#f87171;font-weight:700;">❌ Needs retake</span>';
        actionHTML = `<button class="btn btn-primary" data-retake="${t.id}">↻ Retake exam →</button>
          <button class="btn btn-ghost" data-view="${t.id}">View submission</button>`;
      } else {
        statusHTML += ' · <span style="color:var(--text-dim);font-weight:600;">Submitted · awaiting result</span>';
        actionHTML = `<button class="btn btn-ghost" data-view="${t.id}">View submission</button>`;
      }
    } else if (prev) {
      statusHTML += " · ✅ completed";
      actionHTML = `<button class="btn btn-ghost" data-view="${t.id}">View result (${prev.score}/${prev.total_max} · ${prev.grade})</button>`;
    } else {
      actionHTML = `<button class="btn btn-primary" data-start="${t.id}">${review ? "Start exam →" : "Start test →"}</button>`;
    }

    const card = el(`
      <div class="session-row">
        <div class="session-num">${t.units}</div>
        <div class="session-info">
          <strong>${t.name}</strong>
          <span>${statusHTML}</span>
        </div>
        <div class="session-action">${actionHTML}</div>
      </div>`);

    const startBtn = card.querySelector("[data-start]");
    if (startBtn) startBtn.addEventListener("click", () => startTest(t, sbReady));
    const retakeBtn = card.querySelector("[data-retake]");
    if (retakeBtn) retakeBtn.addEventListener("click", () => startTest(t, sbReady));
    const viewBtn = card.querySelector("[data-view]");
    if (viewBtn) viewBtn.addEventListener("click", () => showStoredResult(t, prev));
    return card;
  }

  /* ---------- Start a test (re-check one-attempt rule) ---------- */
  async function startTest(t, sbReady) {
    const myName = (sessionStorage.getItem("lv_portal_name") || "").trim();
    if (sbReady && myName.length >= 2) {
      try {
        const existing = await window.LV_Supabase.selectWhere(
          "test_results", `student_name=ilike.${encodeURIComponent(myName)}&test_id=eq.${t.id}`
        );
        if (existing && existing.length) {
          // Manual-review exams: a retake is allowed when the latest attempt was failed
          if (isReviewTest(t) && existing[0].grade === "Failed") {
            /* retake allowed */
          } else {
            alert("You have already taken this test. Only one attempt is allowed.");
            initialized = false; renderTestList();
            return;
          }
        }
      } catch (e) { /* if check fails, still allow */ }
    }
    // If the student logged in with a personal account, use their name directly
    const loggedName = (typeof sessionStorage !== "undefined") ? sessionStorage.getItem("lv_portal_name") : "";
    if (loggedName && loggedName.trim().length >= 2) {
      renderQuiz(t, sbReady, loggedName.trim());
    } else {
      renderNamePrompt(t, sbReady);
    }
  }

  /* ---------- Ask for the student's name (required) ---------- */
  function renderNamePrompt(t, sbReady) {
    const view = document.getElementById("testsView");
    const list = document.getElementById("testsList");
    list.style.display = "none";
    view.style.display = "block";

    view.innerHTML = `
      <button class="btn btn-ghost" id="backToTests" style="margin-bottom:20px;">← Back to tests</button>
      <div class="form-card" style="max-width:480px;margin:0 auto;">
        <div style="text-align:center;font-size:2.2rem;margin-bottom:8px;">📝</div>
        <h2 style="text-align:center;margin-bottom:6px;">${escapeHtml(t.name)}</h2>
        <p style="color:var(--text-soft);text-align:center;margin-bottom:20px;">Enter your name to begin. You can take this test only once.</p>
        <div id="nameAlert" class="alert"></div>
        <form id="nameForm">
          <div class="form-row">
            <label>Your full name <span class="req">*</span></label>
            <input class="input" type="text" id="studentNameInput" placeholder="e.g. Ahmed Mohamed" autocomplete="name" />
            <div class="field-error">Please enter your name.</div>
          </div>
          <button type="submit" class="btn btn-primary btn-block btn-lg">${isReviewTest(t) ? "Start exam →" : "Start test →"}</button>
        </form>
      </div>`;

    document.getElementById("backToTests").addEventListener("click", () => {
      view.style.display = "none"; view.innerHTML = "";
      list.style.display = "block";
    });

    document.getElementById("nameForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const input = document.getElementById("studentNameInput");
      const name = (input.value || "").trim();
      if (name.length < 2) {
        document.getElementById("nameAlert").className = "alert show error";
        document.getElementById("nameAlert").textContent = "⚠️ Please enter your full name to start.";
        return;
      }
      renderQuiz(t, sbReady, name);
    });
  }

  /* ---------- Render the quiz form ---------- */
  function renderQuiz(t, sbReady, studentName) {
    const view = document.getElementById("testsView");
    const list = document.getElementById("testsList");
    list.style.display = "none";
    view.style.display = "block";

    const marks = t.totalMarks || maxOf(t);
    const review = isReviewTest(t);
    voiceRecordings = {};

    let html = `
      <button class="btn btn-ghost" id="backToTests" style="margin-bottom:20px;">← Back to tests</button>
      <div class="question-card">
        <div class="q-level">${t.name} · ${escapeHtml(t.subtitle)}</div>
        <h2 style="margin-bottom:6px;">${marks}-mark ${review ? "final exam" : "progress test"}</h2>
        <p style="color:var(--text-soft);margin-bottom:8px;">Student: <b>${escapeHtml(studentName)}</b> · Answer all sections.</p>
        <div id="testAlert" class="alert"></div>
        <form id="quizForm">`;

    // Part A — Multiple Choice
    html += `<h3 style="margin:24px 0 14px;">Part A — Multiple Choice <span style="color:var(--text-dim);font-weight:500;">(${t.partA.length} questions)</span></h3>`;
    t.partA.forEach(item => {
      html += `<div class="quiz-q"><p class="quiz-q-text">${item.q}. ${item.unit ? unitBadge(item.unit) : ""}${escapeHtml(item.text)}</p><div class="quiz-opts">`;
      item.options.forEach(([key, label]) => {
        html += `<label class="quiz-opt"><input type="radio" name="A${item.q}" value="${key}"><span>${key}) ${escapeHtml(label)}</span></label>`;
      });
      html += `</div></div>`;
    });

    // Part B — Right or Wrong
    html += `<h3 style="margin:28px 0 14px;">Part B — Right or Wrong <span style="color:var(--text-dim);font-weight:500;">(${t.partB.length} questions)</span></h3>`;
    t.partB.forEach(item => {
      html += `<div class="quiz-q"><p class="quiz-q-text">${item.q}. ${item.unit ? unitBadge(item.unit) : ""}${escapeHtml(item.text)}</p><div class="quiz-opts row">
        <label class="quiz-opt"><input type="radio" name="B${item.q}" value="RIGHT"><span>✓ Right</span></label>
        <label class="quiz-opt"><input type="radio" name="B${item.q}" value="WRONG"><span>✗ Wrong</span></label>
      </div></div>`;
    });

    // Section III — Functional Writing
    if (t.hasWritingTask && t.writingTask) {
      const wt = t.writingTask;
      html += `<h3 style="margin:28px 0 14px;">${escapeHtml(wt.title)}</h3>`;
      html += `<div class="writing-card">`;
      html += `<div class="msg-bubble"><strong>${escapeHtml(wt.incomingMessage.sender)}:</strong><p>${escapeHtml(wt.incomingMessage.text)}</p></div>`;
      html += `<p style="margin:14px 0 8px;font-weight:600;">Your reply must:</p><ul class="writing-list">`;
      wt.instructions.forEach(i => { html += `<li>${escapeHtml(i)}</li>`; });
      html += `</ul>`;
      html += `<textarea id="writingText" class="writing-ta" rows="5" placeholder="${escapeHtml(wt.placeholder)}"></textarea>`;
      html += `<div class="words-counter" id="wordsCounter"></div>`;
      html += `</div>`;
    }

    // Component 2 — Speaking capstone
    if (t.hasVoiceTask && t.voicePrompts && t.voicePrompts.length) {
      html += `<h3 style="margin:28px 0 14px;">Component 2 — Speaking Capstone <span style="color:var(--text-dim);font-weight:500;">(30 marks)</span></h3>`;
      t.voicePrompts.forEach(vp => {
        html += `<div class="task-card">
          <strong style="font-size:1rem;">${escapeHtml(vp.title)}</strong>
          <p style="color:var(--text-soft);margin:8px 0 6px;">${escapeHtml(vp.prompt)}</p>
          <p class="criteria">${escapeHtml(vp.criteria)}</p>
          <div class="recorder">
            <div class="rec-controls">
              <button type="button" class="btn btn-primary" id="vt${vp.task}Start">● Record</button>
              <button type="button" class="btn btn-ghost" id="vt${vp.task}Stop" disabled>■ Stop</button>
              <span class="rec-timer" id="vt${vp.task}Timer">0:00</span>
            </div>
            <div class="rec-status" id="vt${vp.task}Status">No recording yet.</div>
            <audio id="vt${vp.task}Playback" controls style="display:none;width:100%;margin-top:12px;"></audio>
          </div>
        </div>`;
      });
    }

    html += `<button type="submit" class="btn btn-primary btn-lg btn-block" style="margin-top:24px;">${review ? "Submit exam for teacher review" : "Submit test"}</button>
        </form>
      </div>`;

    view.innerHTML = html;

    document.getElementById("backToTests").addEventListener("click", () => {
      stopAllVoices();
      view.style.display = "none"; view.innerHTML = "";
      list.style.display = "block";
    });

    if (t.hasWritingTask) setupWordCounter(t);
    if (t.hasVoiceTask) (t.voicePrompts || []).forEach(vp => setupVoiceRecorder(t, vp.task));

    document.getElementById("quizForm").addEventListener("submit", (e) => {
      e.preventDefault();
      if (review) submitFinalExam(t, sbReady, studentName);
      else submitQuiz(t, sbReady, studentName);
    });
  }

  /* ---------- Word counter for the writing task ---------- */
  function setupWordCounter(t) {
    const ta = document.getElementById("writingText");
    const counter = document.getElementById("wordsCounter");
    if (!ta || !counter) return;
    const update = () => {
      const n = (ta.value.trim().match(/\S+/g) || []).length;
      const min = t.writingTask.minWords, max = t.writingTask.maxWords;
      counter.textContent = `${n} / ${min}–${max} words`;
      counter.className = "words-counter " + (n < min ? "too-short" : n > max ? "too-long" : "ok");
    };
    ta.addEventListener("input", update);
    update();
  }

  /* ---------- Per-task voice recorder (MediaRecorder) ---------- */
  function setupVoiceRecorder(t, task) {
    const startBtn = document.getElementById("vt" + task + "Start");
    const stopBtn = document.getElementById("vt" + task + "Stop");
    const status = document.getElementById("vt" + task + "Status");
    const timerEl = document.getElementById("vt" + task + "Timer");
    const playback = document.getElementById("vt" + task + "Playback");
    const maxSec = t.voiceSeconds || 60;

    if (!navigator.mediaDevices || !window.MediaRecorder) {
      if (status) status.textContent = "⚠️ Your browser doesn't support recording. Try Chrome or Safari.";
      if (startBtn) startBtn.disabled = true;
      return;
    }

    let recorder = null, chunks = [], secondsLeft = 0;

    startBtn.addEventListener("click", async () => {
      try {
        voiceStreams[task] = await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch (e) {
        status.textContent = "⚠️ Microphone permission denied. Please allow mic access and try again.";
        return;
      }
      chunks = [];
      const mime = pickVoiceMime() || "audio/webm";
      recorder = mime ? new MediaRecorder(voiceStreams[task], { mimeType: mime }) : new MediaRecorder(voiceStreams[task]);
      recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };
      recorder.onstop = () => {
        voiceRecordings[task] = { blob: new Blob(chunks, { type: mime }), mime: mime };
        playback.src = URL.createObjectURL(voiceRecordings[task].blob);
        playback.style.display = "block";
        status.textContent = "✓ Recording ready. You can play it back or re-record.";
        stopVoiceStream(task);
      };
      recorder.start();
      secondsLeft = maxSec;
      timerEl.textContent = fmtTime(secondsLeft);
      status.textContent = "🔴 Recording…";
      startBtn.disabled = true; stopBtn.disabled = false;
      startBtn.textContent = "● Record";
      voiceTimers[task] = setInterval(() => {
        secondsLeft--;
        timerEl.textContent = fmtTime(secondsLeft);
        if (secondsLeft <= 0) stopRec();
      }, 1000);
    });

    stopBtn.addEventListener("click", stopRec);

    function stopRec() {
      if (recorder && recorder.state !== "inactive") recorder.stop();
      if (voiceTimers[task]) { clearInterval(voiceTimers[task]); delete voiceTimers[task]; }
      startBtn.disabled = false; stopBtn.disabled = true;
      startBtn.textContent = "● Re-record";
    }
  }

  /* ---------- Grade + submit ---------- */
  async function submitQuiz(t, sbReady, studentName) {
    const form = document.getElementById("quizForm");
    const alertBox = document.getElementById("testAlert");

    // Require all answers
    let unanswered = 0;
    t.partA.forEach(i => { if (!form.querySelector(`input[name="A${i.q}"]:checked`)) unanswered++; });
    t.partB.forEach(i => { if (!form.querySelector(`input[name="B${i.q}"]:checked`)) unanswered++; });
    if (unanswered > 0) {
      alertBox.className = "alert show error";
      alertBox.textContent = `⚠️ Please answer all questions (${unanswered} left).`;
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // Grade
    let score = 0;
    const answers = { A: {}, B: {} };
    t.partA.forEach(i => {
      const v = form.querySelector(`input[name="A${i.q}"]:checked`).value;
      answers.A[i.q] = v;
      if (v === i.answer) score++;
    });
    t.partB.forEach(i => {
      const v = form.querySelector(`input[name="B${i.q}"]:checked`).value;
      answers.B[i.q] = v;
      if (v === i.answer) score++;
    });

    const total = maxOf(t);
    const g = gradeFromScore(score, total);

    const record = {
      student_name: studentName.trim(),
      test_id: t.id,
      test_name: t.name,
      ip: CURRENT_IP || "unknown",
      score: score,
      total_max: total,
      percent: g.pct,
      grade: g.grade,
      answers: answers
    };

    let saved = false;
    if (sbReady) {
      try { await window.LV_Supabase.insert("test_results", record); saved = true; }
      catch (e) { console.error("Save failed:", e); }
    }

    showResult(t, record, saved, g);
  }

  /* ---------- Final exam: submit WITHOUT revealing a result ----------
     The teacher reviews answers + writing + voice notes on the dashboard
     and delivers the result to the student. */
  async function submitFinalExam(t, sbReady, studentName) {
    const form = document.getElementById("quizForm");
    const alertBox = document.getElementById("testAlert");

    // Require all multiple-choice and right/wrong answers
    let unanswered = 0;
    t.partA.forEach(i => { if (!form.querySelector(`input[name="A${i.q}"]:checked`)) unanswered++; });
    t.partB.forEach(i => { if (!form.querySelector(`input[name="B${i.q}"]:checked`)) unanswered++; });
    if (unanswered > 0) {
      alertBox.className = "alert show error";
      alertBox.textContent = `⚠️ Please answer all questions (${unanswered} left).`;
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const answers = { A: {}, B: {} };
    t.partA.forEach(i => { answers.A[i.q] = form.querySelector(`input[name="A${i.q}"]:checked`).value; });
    t.partB.forEach(i => { answers.B[i.q] = form.querySelector(`input[name="B${i.q}"]:checked`).value; });

    // Writing task validation
    let writing = null;
    if (t.hasWritingTask && t.writingTask) {
      const ta = document.getElementById("writingText");
      const text = ta.value.trim();
      const wc = (text.match(/\S+/g) || []).length;
      const min = t.writingTask.minWords, max = t.writingTask.maxWords;
      if (wc < min || wc > max) {
        alertBox.className = "alert show error";
        alertBox.textContent = `⚠️ Your writing must be ${min}–${max} words (currently ${wc}).`;
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      writing = { text: text, wordCount: wc };
    }

    // Voice tasks validation
    if (t.hasVoiceTask) {
      for (const vp of (t.voicePrompts || [])) {
        if (!voiceRecordings[vp.task]) {
          alertBox.className = "alert show error";
          alertBox.textContent = `⚠️ Please record your answer for ${vp.title}.`;
          window.scrollTo({ top: 0, behavior: "smooth" });
          return;
        }
      }
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true; const orig = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span class="spinner"></span> Uploading…';

    // Upload both voice notes to the voicenotes bucket
    const voiceUrls = {};
    if (sbReady) {
      const safeName = studentName.replace(/[^a-z0-9]/gi, "_").slice(0, 30);
      for (const vp of (t.voicePrompts || [])) {
        const rec = voiceRecordings[vp.task];
        try {
          const ext = rec.mime.includes("mp4") ? "mp4" : (rec.mime.includes("ogg") ? "ogg" : "webm");
          const path = `a1final/${safeName}_${Date.now()}_task${vp.task}.${ext}`;
          voiceUrls[vp.task] = await window.LV_Supabase.uploadFile("voicenotes", path, rec.blob, rec.mime);
        } catch (e) {
          console.error("Voice upload failed:", e);
          alertBox.className = "alert show error";
          alertBox.textContent = `❌ Could not upload voice note for ${vp.title}. Please try again.`;
          submitBtn.disabled = false; submitBtn.innerHTML = orig;
          return;
        }
      }
    }

    // score / percent / grade stay empty until the teacher grades it
    const record = {
      student_name: studentName.trim(),
      test_id: t.id,
      test_name: t.name,
      ip: CURRENT_IP || "unknown",
      score: null,
      total_max: t.totalMarks || 100,
      percent: null,
      grade: null,
      answers: { A: answers.A, B: answers.B, writing: writing, voice: voiceUrls }
    };

    let saved = false;
    if (sbReady) {
      try { await window.LV_Supabase.insert("test_results", record); saved = true; }
      catch (e) { console.error("Save failed:", e); }
    }

    submitBtn.disabled = false; submitBtn.innerHTML = orig;
    showExamSubmitted(t, record, saved);
  }

  /* ---------- Confirmation screen (no score, no answer review) ---------- */
  function showExamSubmitted(t, record, saved) {
    const view = document.getElementById("testsView");
    view.innerHTML = `
      <div class="result-card">
        <div style="font-size:3rem;text-align:center;margin-bottom:10px;">🎓</div>
        <h2 class="result-title" style="text-align:center;">Exam submitted!</h2>
        <p class="result-desc" style="text-align:center;">Your A1 Level Final Examination has been received — your answers, your writing and both voice notes.</p>
        <p style="text-align:center;color:var(--text-soft);margin-top:14px;">Your teacher will review everything and <b>deliver your result to you</b>.</p>
        ${saved
          ? '<p style="color:var(--success);font-size:.9rem;text-align:center;">✓ Submitted successfully.</p>'
          : '<p style="color:var(--warn);font-size:.9rem;text-align:center;">⚠️ Could not save online — please tell your teacher.</p>'}
        <div class="result-actions" style="margin-top:24px;">
          <button class="btn btn-primary" id="resBack">Back to tests</button>
        </div>
      </div>`;
    document.getElementById("resBack").addEventListener("click", () => {
      view.style.display = "none"; view.innerHTML = "";
      document.getElementById("testsList").style.display = "block";
      initialized = false;
      window.LV_initTests();
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  /* ---------- Result screen (right after submitting) ---------- */
  function showResult(t, record, saved, g) {
    const view = document.getElementById("testsView");
    view.innerHTML = `
      <div class="result-card">
        <div class="result-ring" style="--deg:${g.pct * 3.6}deg;">
          <div class="rr-inner">
            <div class="rr-level">${record.score}/${record.total_max}</div>
            <div class="rr-score">${g.pct}%</div>
          </div>
        </div>
        <h2 class="result-title">Grade ${record.grade} ${record.grade === "A" ? "🏆" : "🎉"}</h2>
        <p class="result-desc">${escapeHtml(g.label)}<br>You scored <b>${record.score} out of ${record.total_max}</b> (${g.pct}%).</p>
        ${saved
          ? '<p style="color:var(--success);font-size:.9rem;">✓ Your result has been saved.</p>'
          : '<p style="color:var(--warn);font-size:.9rem;">⚠️ Could not save online — please screenshot your score.</p>'}
        <div class="result-actions" style="margin-top:24px;">
          <button class="btn btn-primary" id="resBack">Back to tests</button>
        </div>
      </div>
      ${buildReview(t, record.answers)}`;
    document.getElementById("resBack").addEventListener("click", () => {
      view.style.display = "none"; view.innerHTML = "";
      document.getElementById("testsList").style.display = "block";
      initialized = false;
      window.LV_initTests();
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  /* ---------- Stored result (returning student) ---------- */
  function showStoredResult(t, prev) {
    const view = document.getElementById("testsView");
    const list = document.getElementById("testsList");
    list.style.display = "none";
    view.style.display = "block";

    if (isReviewTest(t)) { renderStoredSubmission(t, prev); return; }

    const pct = prev.percent != null ? prev.percent : Math.round((prev.score / prev.total_max) * 100);
    view.innerHTML = `
      <div class="result-card">
        <div class="result-ring" style="--deg:${pct * 3.6}deg;">
          <div class="rr-inner">
            <div class="rr-level">${prev.score}/${prev.total_max}</div>
            <div class="rr-score">${pct}%</div>
          </div>
        </div>
        <h2 class="result-title">Your result · Grade ${prev.grade}</h2>
        <p class="result-desc">You scored <b>${prev.score}/${prev.total_max}</b> (${pct}%) on ${escapeHtml(t.name)}.</p>
        <div class="result-actions" style="margin-top:24px;">
          <button class="btn btn-primary" id="resBack2">Back to tests</button>
        </div>
      </div>
      ${buildReview(t, prev.answers)}`;
    document.getElementById("resBack2").addEventListener("click", () => {
      view.style.display = "none"; view.innerHTML = "";
      list.style.display = "block";
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  /* ---------- Stored exam submission: student's own answers only
     (no marking, no correct answers, no score — teacher delivers) ---------- */
  function renderStoredSubmission(t, prev) {
    const view = document.getElementById("testsView");
    let ans = prev.answers;
    if (typeof ans === "string") { try { ans = JSON.parse(ans); } catch (e) { ans = {}; } }
    ans = ans || {};
    const A = ans.A || {}, B = ans.B || {};

    const statusLine = prev.grade === "Passed"
      ? '<p style="text-align:center;font-weight:700;color:var(--success);margin-top:8px;">✅ Passed</p>'
      : prev.grade === "Failed"
        ? '<p style="text-align:center;font-weight:700;color:#f87171;margin-top:8px;">❌ Needs retake — you can take the exam again from the tests list.</p>'
        : '<p style="text-align:center;font-weight:700;color:var(--warn);margin-top:8px;">⏳ Awaiting teacher grading</p>';

    let html = `
      <button class="btn btn-ghost" id="resBack3" style="margin-bottom:20px;">← Back to tests</button>
      <div class="result-card">
        <div style="font-size:2.6rem;text-align:center;margin-bottom:8px;">🎓</div>
        <h2 class="result-title" style="text-align:center;">Your exam submission</h2>
        <p class="result-desc" style="text-align:center;">${prev.created_at ? "Submitted on " + new Date(prev.created_at).toLocaleString() : "Submitted"}.</p>
        ${statusLine}
      </div>`;

    const showItem = (num, text, val) => `<div class="ans-row" style="opacity:.95;">
      <div class="ans-q">${num}. ${text}</div>
      <div class="ans-detail"><span>Your answer: <b>${escapeHtml(val == null ? "—" : val)}</b></span></div>
    </div>`;

    html += `<h3 style="margin:24px 0 10px;">Part A — Multiple Choice</h3>`;
    (t.partA || []).forEach(i => {
      const chosen = A[i.q];
      const opt = (i.options || []).find(([k]) => k === chosen);
      html += showItem(i.q, `${i.unit ? unitBadge(i.unit) : ""}${escapeHtml(i.text)}`, opt ? `${chosen}) ${opt[1]}` : chosen);
    });

    html += `<h3 style="margin:24px 0 10px;">Part B — Right or Wrong</h3>`;
    (t.partB || []).forEach(i => {
      html += showItem(i.q, `${i.unit ? unitBadge(i.unit) : ""}${escapeHtml(i.text)}`, B[i.q]);
    });

    if (ans.writing) {
      html += `<h3 style="margin:24px 0 10px;">${escapeHtml((t.writingTask || {}).title || "Writing")}</h3>`;
      html += `<div class="writing-card"><div style="white-space:pre-wrap;line-height:1.7;">${escapeHtml(ans.writing.text || "—")}</div><div class="words-counter ok">${ans.writing.wordCount} words</div></div>`;
    }

    if (t.voicePrompts && t.voicePrompts.length) {
      html += `<h3 style="margin:24px 0 10px;">Component 2 — Speaking</h3>`;
      (t.voicePrompts || []).forEach(vp => {
        const url = ans.voice ? ans.voice[vp.task] : null;
        html += `<div class="task-card">
          <strong>${escapeHtml(vp.title)}</strong>
          ${url ? `<audio controls src="${escapeHtml(url)}" style="width:100%;margin-top:10px;"></audio>`
                : '<p style="color:var(--text-dim);margin-top:8px;">No recording.</p>'}
        </div>`;
      });
    }

    view.innerHTML = html;
    document.getElementById("resBack3").addEventListener("click", () => {
      view.style.display = "none"; view.innerHTML = "";
      document.getElementById("testsList").style.display = "block";
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
})();
