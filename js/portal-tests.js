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

    // Fetch this IP's previous results once
    let myResults = [];
    if (sbReady && CURRENT_IP) {
      try {
        myResults = await window.LV_Supabase.selectWhere(
          "test_results", `ip=eq.${encodeURIComponent(CURRENT_IP)}`
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

    const total = maxOf(t);
    let actionHTML;
    if (prev) {
      actionHTML = `<button class="btn btn-ghost" data-view="${t.id}">View result (${prev.score}/${prev.total_max} · ${prev.grade})</button>`;
    } else {
      actionHTML = `<button class="btn btn-primary" data-start="${t.id}">Start test →</button>`;
    }

    const card = el(`
      <div class="session-row">
        <div class="session-num">${t.units}</div>
        <div class="session-info">
          <strong>${t.name}</strong>
          <span>${escapeHtml(t.subtitle)} · ${total} marks${prev ? " · ✅ completed" : ""}</span>
        </div>
        <div class="session-action">${actionHTML}</div>
      </div>`);

    const startBtn = card.querySelector("[data-start]");
    if (startBtn) startBtn.addEventListener("click", () => startTest(t, sbReady));
    const viewBtn = card.querySelector("[data-view]");
    if (viewBtn) viewBtn.addEventListener("click", () => showStoredResult(t, prev));
    return card;
  }

  /* ---------- Start a test (re-check one-attempt rule) ---------- */
  async function startTest(t, sbReady) {
    if (sbReady && CURRENT_IP && CURRENT_IP !== "unknown") {
      try {
        const existing = await window.LV_Supabase.selectWhere(
          "test_results", `ip=eq.${encodeURIComponent(CURRENT_IP)}&test_id=eq.${t.id}`
        );
        if (existing && existing.length) {
          alert("You have already taken this test. Only one attempt is allowed per device/network.");
          initialized = false; renderTestList();
          return;
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
          <button type="submit" class="btn btn-primary btn-block btn-lg">Start test →</button>
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

    const total = maxOf(t);
    let html = `
      <button class="btn btn-ghost" id="backToTests" style="margin-bottom:20px;">← Back to tests</button>
      <div class="question-card">
        <div class="q-level">${t.name} · ${escapeHtml(t.subtitle)}</div>
        <h2 style="margin-bottom:6px;">${total}-mark progress test</h2>
        <p style="color:var(--text-soft);margin-bottom:8px;">Student: <b>${escapeHtml(studentName)}</b> · Answer all questions.</p>
        <div id="testAlert" class="alert"></div>
        <form id="quizForm">`;

    // Part A
    html += `<h3 style="margin:24px 0 14px;">Part A — Multiple Choice <span style="color:var(--text-dim);font-weight:500;">(${t.partA.length} marks)</span></h3>`;
    t.partA.forEach(item => {
      html += `<div class="quiz-q"><p class="quiz-q-text">${item.q}. ${escapeHtml(item.text)}</p><div class="quiz-opts">`;
      item.options.forEach(([key, label]) => {
        html += `<label class="quiz-opt"><input type="radio" name="A${item.q}" value="${key}"><span>${key}) ${escapeHtml(label)}</span></label>`;
      });
      html += `</div></div>`;
    });

    // Part B
    html += `<h3 style="margin:28px 0 14px;">Part B — Right or Wrong <span style="color:var(--text-dim);font-weight:500;">(${t.partB.length} marks)</span></h3>`;
    t.partB.forEach(item => {
      html += `<div class="quiz-q"><p class="quiz-q-text">${item.q}. ${escapeHtml(item.text)}</p><div class="quiz-opts row">
        <label class="quiz-opt"><input type="radio" name="B${item.q}" value="RIGHT"><span>✓ Right</span></label>
        <label class="quiz-opt"><input type="radio" name="B${item.q}" value="WRONG"><span>✗ Wrong</span></label>
      </div></div>`;
    });

    html += `<button type="submit" class="btn btn-primary btn-lg btn-block" style="margin-top:24px;">Submit test</button>
        </form>
      </div>`;

    view.innerHTML = html;

    document.getElementById("backToTests").addEventListener("click", () => {
      view.style.display = "none"; view.innerHTML = "";
      list.style.display = "block";
    });
    document.getElementById("quizForm").addEventListener("submit", (e) => {
      e.preventDefault();
      submitQuiz(t, sbReady, studentName);
    });
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
      student_name: studentName,
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
})();
