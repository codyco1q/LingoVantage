/* =========================================================
   LingoVantage — Student Portal: Homework (interactive)
   Per unit = 10 auto-graded questions + 1 voice note (≤60s).
   - Name + Batch required before starting
   - One attempt per IP per unit (checked against Supabase)
   - Records audio via MediaRecorder, uploads to Supabase Storage
   - Auto-grades quiz, saves everything to "homework_submissions"
   - Returning students see their saved result

   Supabase table: homework_submissions (see README)
     id, created_at, student_name, batch, unit, unit_title, ip,
     score, total_max, percent, answers jsonb, voice_url text
   Storage bucket: "voicenotes" (public)
   ========================================================= */

(function () {
  let CURRENT_IP = null;
  let initialized = false;
  let activeLevel = "A1";

  // recorder state
  let mediaRecorder = null, chunks = [], audioBlob = null, audioMime = "audio/webm";
  let timerId = null, secondsLeft = 0;

  window.LV_initHomework = async function (level = "A1") {
    if (initialized && activeLevel === level) return;
    activeLevel = level;
    initialized = true;
    await ensureIP();
    renderList();
  };

  async function ensureIP() {
    if (CURRENT_IP) return CURRENT_IP;
    try {
      const r = await fetch("https://api.ipify.org?format=json");
      const j = await r.json();
      CURRENT_IP = j.ip || "unknown";
    } catch (e) { CURRENT_IP = "unknown"; }
    return CURRENT_IP;
  }

  function el(html) { const d = document.createElement("div"); d.innerHTML = html.trim(); return d.firstElementChild; }
  function esc(s) { return String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }

  /* ---------- Build an answer-review breakdown (right/wrong) ---------- */
  function buildReview(u, answers) {
    if (!u || !u.questions || !answers) return "";
    if (typeof answers === "string") { try { answers = JSON.parse(answers); } catch (e) { return ""; } }
    const norm = window.LV_normAnswer || (s => String(s || "").toLowerCase().trim());
    let html = '<div class="answer-review"><h3 style="margin:26px 0 12px;">Your answers</h3>';

    u.questions.forEach(item => {
      const chosen = answers[item.q];
      let ok, chosenText, correctText;
      if (item.accept) {
        const vals = Array.isArray(chosen) ? chosen : [chosen];
        ok = item.accept.every((blank, bi) => blank.some(a => norm(a) === norm(vals[bi])));
        chosenText = vals.map(v => (v == null || v === "") ? "—" : v).join(" | ");
        correctText = item.accept.map(blank => blank[0]).join(" | ");
      } else {
        ok = String(chosen) === String(item.answer);
        chosenText = chosen == null ? "—" : chosen;
        correctText = item.answer;
      }
      html += `<div class="ans-row ${ok ? "ok" : "bad"}">
        <div class="ans-q">${item.q}. ${esc(item.text)}</div>
        <div class="ans-detail">
          <span class="ans-badge ${ok ? "ok" : "bad"}">${ok ? "✓" : "✗"}</span>
          <span>Your answer: <b>${esc(chosenText)}</b></span>
          ${ok ? "" : `<span class="ans-correct">Correct: <b>${esc(correctText)}</b></span>`}
        </div>
      </div>`;
    });
    html += "</div>";
    return html;
  }

  /* ---------- List units ---------- */
  async function renderList() {
    const wrap = document.getElementById("hwList");
    if (!wrap) return;
    wrap.innerHTML = '<div class="dash-empty"><span class="spinner" style="border-top-color:var(--teal-400)"></span> Loading homework…</div>';

    const units = activeLevel === "A2" ? (window.LV_HOMEWORK_A2 || []) : (window.LV_HOMEWORK || []);
    const sbReady = window.LV_Supabase && window.LV_Supabase.ready();

    let mine = [];
    const myName = (sessionStorage.getItem("lv_portal_name") || "").trim();
    if (sbReady && myName.length >= 2) {
      try {
        mine = await window.LV_Supabase.selectWhere("homework_submissions", `student_name=ilike.${encodeURIComponent(myName)}`);
      } catch (e) { console.warn("Could not load past homework:", e); }
    }

    wrap.innerHTML = "";
    units.forEach(u => {
      const prev = mine.find(m =>
        (m.unit_title && m.unit_title === u.title) ||
        (!m.unit_title && activeLevel !== "A2" && String(m.unit) === String(u.unit)));
      wrap.appendChild(buildCard(u, prev, sbReady));
    });
  }

  function buildCard(u, prev, sbReady) {
    if (!u.available) {
      return el(`
        <div class="session-row pending">
          <div class="session-num">${u.unit}</div>
          <div class="session-info"><strong>${esc(u.title)}</strong><span>Coming soon</span></div>
          <div class="session-action"><span class="soon-pill">Coming soon</span></div>
        </div>`);
    }
    const total = (u.questions || []).length;
    let action;
    if (prev) {
      action = `<button class="btn btn-ghost" data-view="${u.unit}">View result (${prev.score}/${prev.total_max})</button>`;
    } else {
      action = `<button class="btn btn-primary" data-start="${u.unit}">Start homework →</button>`;
    }
    const card = el(`
      <div class="session-row">
        <div class="session-num">${u.unit}</div>
        <div class="session-info">
          <strong>${esc(u.title)}</strong>
          <span>${total} questions + voice note${prev ? " · ✅ done" : ""}</span>
        </div>
        <div class="session-action">${action}</div>
      </div>`);
    const s = card.querySelector("[data-start]");
    if (s) s.addEventListener("click", () => startFlow(u, sbReady));
    const v = card.querySelector("[data-view]");
    if (v) v.addEventListener("click", () => showStored(u, prev));
    return card;
  }

  /* ---------- Start: re-check attempt, then name prompt ---------- */
  async function startFlow(u, sbReady) {
    const myName = (sessionStorage.getItem("lv_portal_name") || "").trim();
    if (sbReady && myName.length >= 2) {
      try {
        const ex = await window.LV_Supabase.selectWhere("homework_submissions",
          `student_name=ilike.${encodeURIComponent(myName)}&unit_title=eq.${encodeURIComponent(u.title)}`);
        if (ex && ex.length) {
          alert("You have already submitted this unit's homework. Only one attempt is allowed.");
          initialized = false; renderList();
          return;
        }
      } catch (e) { /* allow */ }
    }
    renderNamePrompt(u, sbReady);
  }

  function renderNamePrompt(u, sbReady) {
    const view = document.getElementById("hwView");
    document.getElementById("hwList").style.display = "none";
    view.style.display = "block";
    const loggedName = (typeof sessionStorage !== "undefined") ? (sessionStorage.getItem("lv_portal_name") || "") : "";
    const nameLocked = loggedName.trim().length >= 2;
    view.innerHTML = `
      <button class="btn btn-ghost" id="hwBack" style="margin-bottom:20px;">← Back</button>
      <div class="form-card" style="max-width:480px;margin:0 auto;">
        <div style="text-align:center;font-size:2.2rem;margin-bottom:8px;">📤</div>
        <h2 style="text-align:center;margin-bottom:6px;">${esc(u.title)}</h2>
        <p style="color:var(--text-soft);text-align:center;margin-bottom:20px;">Confirm your details to begin. One attempt only.</p>
        <div id="hwNameAlert" class="alert"></div>
        <form id="hwNameForm">
          <div class="form-row">
            <label>Your full name <span class="req">*</span></label>
            <input class="input" type="text" id="hwName" placeholder="e.g. Ahmed Mohamed" autocomplete="name" value="${esc(loggedName)}" ${nameLocked ? "readonly" : ""}/>
          </div>
          <div class="form-row">
            <label>Batch <span class="req">*</span></label>
            <select class="select" id="hwBatch"><option value="Batch 1">Batch 1</option></select>
          </div>
          <button type="submit" class="btn btn-primary btn-block btn-lg">Start →</button>
        </form>
      </div>`;
    document.getElementById("hwBack").addEventListener("click", backToList);
    document.getElementById("hwNameForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("hwName").value.trim();
      const batch = document.getElementById("hwBatch").value;
      if (name.length < 2) {
        document.getElementById("hwNameAlert").className = "alert show error";
        document.getElementById("hwNameAlert").textContent = "⚠️ Please enter your name.";
        return;
      }
      renderQuiz(u, sbReady, name, batch);
    });
  }

  /* ---------- Quiz + voice recorder ---------- */
  function renderQuiz(u, sbReady, name, batch) {
    const view = document.getElementById("hwView");
    audioBlob = null;
    const total = (u.questions || []).length;

    let html = `
      <button class="btn btn-ghost" id="hwBack" style="margin-bottom:20px;">← Back</button>
      <div class="question-card">
        <div class="q-level">${esc(u.title)}${u.subtitle ? " · " + esc(u.subtitle) : ""}</div>
        <h2 style="margin-bottom:6px;">Homework</h2>
        <p style="color:var(--text-soft);margin-bottom:8px;">Student: <b>${esc(name)}</b> · ${esc(batch)}</p>
        <div id="hwAlert" class="alert"></div>
        <form id="hwQuizForm">
          <h3 style="margin:20px 0 12px;">Questions <span style="color:var(--text-dim);font-weight:500;">(${total} marks)</span></h3>`;

    u.questions.forEach(item => {
      html += `<div class="quiz-q"><p class="quiz-q-text">${item.q}. ${esc(item.text)}</p>`;
      if (item.type === "rw") {
        html += `<div class="quiz-opts row">
          <label class="quiz-opt"><input type="radio" name="q${item.q}" value="RIGHT"><span>✓ Right</span></label>
          <label class="quiz-opt"><input type="radio" name="q${item.q}" value="WRONG"><span>✗ Wrong</span></label>
        </div>`;
      } else if (item.options) {
        html += `<div class="quiz-opts">`;
        item.options.forEach(([k, label]) => {
          html += `<label class="quiz-opt"><input type="radio" name="q${item.q}" value="${k}"><span>${k}) ${esc(label)}</span></label>`;
        });
        html += `</div>`;
      } else if (item.accept) {
        // Fill-in-the-blank: one input per blank
        html += `<div class="blank-inputs">`;
        item.accept.forEach((blank, bi) => {
          const ph = item.accept.length > 1 ? `Answer ${bi + 1}` : "Your answer";
          html += `<input class="input hw-blank" type="text" name="q${item.q}_${bi}" placeholder="${ph}" autocomplete="off">`;
        });
        html += `</div>`;
      }
      html += `</div>`;
    });

    // Voice note section
    html += `
      <h3 style="margin:26px 0 12px;">🎙️ Voice note <span style="color:var(--text-dim);font-weight:500;">(up to ${u.voiceSeconds || 60}s)</span></h3>
      <p style="color:var(--text-soft);margin-bottom:14px;">${esc(u.voicePrompt || "Record your spoken answer.")}</p>
      <div class="recorder" id="recorder">
        <div class="rec-controls">
          <button type="button" class="btn btn-primary" id="recStart">● Record</button>
          <button type="button" class="btn btn-ghost" id="recStop" disabled>■ Stop</button>
          <span class="rec-timer" id="recTimer">0:00</span>
        </div>
        <div class="rec-status" id="recStatus">No recording yet.</div>
        <audio id="recPlayback" controls style="display:none;width:100%;margin-top:12px;"></audio>
      </div>
      <button type="submit" class="btn btn-primary btn-lg btn-block" id="hwSubmitBtn" style="margin-top:24px;">Submit homework</button>
        </form>
      </div>`;

    view.innerHTML = html;
    document.getElementById("hwBack").addEventListener("click", () => { stopStream(); backToList(); });
    setupRecorder(u);
    document.getElementById("hwQuizForm").addEventListener("submit", (e) => {
      e.preventDefault();
      submit(u, sbReady, name, batch);
    });
  }

  /* ---------- Recorder logic ---------- */
  let activeStream = null;
  function stopStream() { if (activeStream) { activeStream.getTracks().forEach(t => t.stop()); activeStream = null; } if (timerId) clearInterval(timerId); }

  function pickMime() {
    const opts = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg"];
    for (const m of opts) { if (window.MediaRecorder && MediaRecorder.isTypeSupported(m)) return m; }
    return "";
  }

  function setupRecorder(u) {
    const startBtn = document.getElementById("recStart");
    const stopBtn = document.getElementById("recStop");
    const status = document.getElementById("recStatus");
    const timerEl = document.getElementById("recTimer");
    const playback = document.getElementById("recPlayback");
    const maxSec = u.voiceSeconds || 60;

    if (!navigator.mediaDevices || !window.MediaRecorder) {
      status.textContent = "⚠️ Your browser doesn't support recording. Try Chrome or Safari.";
      startBtn.disabled = true;
      return;
    }

    startBtn.addEventListener("click", async () => {
      try {
        activeStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch (e) {
        status.textContent = "⚠️ Microphone permission denied. Please allow mic access and try again.";
        return;
      }
      chunks = [];
      const mime = pickMime();
      audioMime = mime || "audio/webm";
      mediaRecorder = mime ? new MediaRecorder(activeStream, { mimeType: mime }) : new MediaRecorder(activeStream);
      mediaRecorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };
      mediaRecorder.onstop = () => {
        audioBlob = new Blob(chunks, { type: audioMime });
        playback.src = URL.createObjectURL(audioBlob);
        playback.style.display = "block";
        status.textContent = "✓ Recording ready. You can play it back or re-record.";
        stopStream();
      };
      mediaRecorder.start();
      secondsLeft = maxSec;
      timerEl.textContent = fmt(secondsLeft);
      status.textContent = "🔴 Recording…";
      startBtn.disabled = true; stopBtn.disabled = false;
      startBtn.textContent = "● Record";
      timerId = setInterval(() => {
        secondsLeft--;
        timerEl.textContent = fmt(secondsLeft);
        if (secondsLeft <= 0) stopRec();
      }, 1000);
    });

    stopBtn.addEventListener("click", stopRec);

    function stopRec() {
      if (mediaRecorder && mediaRecorder.state !== "inactive") mediaRecorder.stop();
      if (timerId) clearInterval(timerId);
      startBtn.disabled = false; stopBtn.disabled = true;
      startBtn.textContent = "● Re-record";
    }
  }
  function fmt(s) { s = Math.max(0, s); return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); }

  /* ---------- Submit ---------- */
  async function submit(u, sbReady, name, batch) {
    const form = document.getElementById("hwQuizForm");
    const alertBox = document.getElementById("hwAlert");

    // require all questions answered
    let missing = 0;
    u.questions.forEach(i => {
      if (i.accept) {
        i.accept.forEach((blank, bi) => {
          const f = form.querySelector(`input[name="q${i.q}_${bi}"]`);
          if (!f || f.value.trim() === "") missing++;
        });
      } else {
        if (!form.querySelector(`input[name="q${i.q}"]:checked`)) missing++;
      }
    });
    if (missing > 0) {
      alertBox.className = "alert show error";
      alertBox.textContent = `⚠️ Please answer all questions (${missing} blank${missing > 1 ? "s" : ""} left).`;
      window.scrollTo({ top: 0, behavior: "smooth" }); return;
    }
    if (!audioBlob) {
      alertBox.className = "alert show error";
      alertBox.textContent = "⚠️ Please record your voice note before submitting.";
      return;
    }

    // grade
    const norm = window.LV_normAnswer || (s => String(s || "").toLowerCase().trim());
    let score = 0; const answers = {};
    u.questions.forEach(i => {
      if (i.accept) {
        // fill-in-the-blank: every blank must match one of its accepted answers
        const vals = i.accept.map((blank, bi) => form.querySelector(`input[name="q${i.q}_${bi}"]`).value.trim());
        answers[i.q] = vals.length === 1 ? vals[0] : vals;
        const allOk = i.accept.every((blank, bi) => blank.some(a => norm(a) === norm(vals[bi])));
        if (allOk) score++;
      } else {
        const v = form.querySelector(`input[name="q${i.q}"]:checked`).value;
        answers[i.q] = v;
        if (v === i.answer) score++;
      }
    });
    const total = u.questions.length;
    const pct = Math.round((score / total) * 100);

    const btn = document.getElementById("hwSubmitBtn");
    btn.disabled = true; const orig = btn.innerHTML;
    btn.innerHTML = '<span class="spinner"></span> Uploading…';

    // upload voice note
    let voiceUrl = "";
    if (sbReady) {
      try {
        const ext = audioMime.includes("mp4") ? "mp4" : (audioMime.includes("ogg") ? "ogg" : "webm");
        const safeName = name.replace(/[^a-z0-9]/gi, "_").slice(0, 30);
        const path = `${activeLevel.toLowerCase()}/unit${u.unit}/${safeName}_${Date.now()}.${ext}`;
        voiceUrl = await window.LV_Supabase.uploadFile("voicenotes", path, audioBlob, audioMime);
      } catch (e) {
        console.error("Voice upload failed:", e);
        alertBox.className = "alert show error";
        alertBox.textContent = "❌ Could not upload your voice note. Please try again.";
        btn.disabled = false; btn.innerHTML = orig;
        return;
      }
    }

    const record = {
      student_name: name.trim(), batch: batch,
      unit: u.unit, unit_title: u.title,
      ip: CURRENT_IP || "unknown",
      score: score, total_max: total, percent: pct,
      answers: answers, voice_url: voiceUrl
    };

    let saved = false;
    if (sbReady) {
      try { await window.LV_Supabase.insert("homework_submissions", record); saved = true; }
      catch (e) { console.error("Save failed:", e); }
    }

    btn.disabled = false; btn.innerHTML = orig;
    showResult(u, record, saved);
  }

  function showResult(u, record, saved) {
    const view = document.getElementById("hwView");
    view.innerHTML = `
      <div class="result-card">
        <div class="result-ring" style="--deg:${record.percent * 3.6}deg;">
          <div class="rr-inner">
            <div class="rr-level">${record.score}/${record.total_max}</div>
            <div class="rr-score">${record.percent}%</div>
          </div>
        </div>
        <h2 class="result-title">Homework submitted! 🎉</h2>
        <p class="result-desc">You scored <b>${record.score}/${record.total_max}</b> on the quiz (${record.percent}%). Your voice note was sent to your teacher for review.</p>
        ${saved ? '<p style="color:var(--success);font-size:.9rem;">✓ Saved successfully.</p>'
                : '<p style="color:var(--warn);font-size:.9rem;">⚠️ Could not save online — please tell your teacher.</p>'}
        <div class="result-actions" style="margin-top:24px;">
          <button class="btn btn-primary" id="hwDone">Back to homework</button>
        </div>
      </div>
      ${buildReview(u, record.answers)}`;
    document.getElementById("hwDone").addEventListener("click", () => { initialized = false; backToList(); window.LV_initHomework(); });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function showStored(u, prev) {
    const view = document.getElementById("hwView");
    document.getElementById("hwList").style.display = "none";
    view.style.display = "block";
    const pct = prev.percent != null ? prev.percent : Math.round((prev.score / prev.total_max) * 100);
    view.innerHTML = `
      <button class="btn btn-ghost" id="hwBack" style="margin-bottom:20px;">← Back</button>
      <div class="result-card">
        <div class="result-ring" style="--deg:${pct * 3.6}deg;">
          <div class="rr-inner"><div class="rr-level">${prev.score}/${prev.total_max}</div><div class="rr-score">${pct}%</div></div>
        </div>
        <h2 class="result-title">Your result</h2>
        <p class="result-desc">${esc(u.title)}: <b>${prev.score}/${prev.total_max}</b> (${pct}%). Your voice note was submitted. ✅</p>
      </div>
      ${buildReview(u, prev.answers)}`;
    document.getElementById("hwBack").addEventListener("click", backToList);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function backToList() {
    const view = document.getElementById("hwView");
    view.style.display = "none"; view.innerHTML = "";
    document.getElementById("hwList").style.display = "block";
  }
})();
