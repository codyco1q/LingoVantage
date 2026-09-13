/* =========================================================
   LingoVantage — Admin Dashboard
   - Lightweight password gate (frontend only — see config)
   - Tab 1: Registrations  (Supabase "students" table)
   - Tab 2: Test Results   (Supabase "test_results" table)
   - Stats + searchable tables + CSV export for each
   NOTE: For production security use Supabase Auth + RLS.
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("dashLoginForm");
  const dashMain = document.getElementById("dashMain");
  const loginWrap = document.getElementById("dashLoginWrap");
  const logoutBtn = document.getElementById("dashLogout");

  // Already authenticated this session?
  if (sessionStorage.getItem("lv_dash_auth") === "1") {
    showDashboard();
  }

  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const pass = document.getElementById("dashPass").value;
      const err = document.getElementById("dashLoginErr");
      try {
        const res = await fetch("/api/auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password: pass })
        });
        const data = await res.json();
        if (data.ok) {
          sessionStorage.setItem("lv_dash_auth", "1");
          showDashboard();
        } else {
          err.className = "alert show error";
          err.textContent = "❌ Wrong password.";
        }
      } catch (err2) {
        err.className = "alert show error";
        err.textContent = "❌ Could not verify password. Try again.";
      }
    });
  }

  if (logoutBtn) logoutBtn.addEventListener("click", () => {
    sessionStorage.removeItem("lv_dash_auth");
    location.reload();
  });

  // Registrations search + export
  const searchInput = document.getElementById("dashSearch");
  if (searchInput) searchInput.addEventListener("input", () => filterTable(searchInput.value));
  const exportBtn = document.getElementById("dashExport");
  if (exportBtn) exportBtn.addEventListener("click", exportCSV);

  // Test results search + export
  const resSearch = document.getElementById("resSearch");
  if (resSearch) resSearch.addEventListener("input", () => filterResults(resSearch.value));
  const resExport = document.getElementById("resExport");
  if (resExport) resExport.addEventListener("click", exportResultsCSV);

  // Homework submissions search + export
  const hwSearch = document.getElementById("hwSearch");
  if (hwSearch) hwSearch.addEventListener("input", () => filterHw(hwSearch.value));
  const hwExport = document.getElementById("hwExport");
  if (hwExport) hwExport.addEventListener("click", exportHwCSV);

  // Modal close
  const modalClose = document.getElementById("modalClose");
  if (modalClose) modalClose.addEventListener("click", closeModal);
  const overlay = document.getElementById("dashModal");
  if (overlay) overlay.addEventListener("click", (e) => { if (e.target === overlay) closeModal(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });

  // Tabs
  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
      document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById(btn.dataset.tab).classList.add("active");
      if (btn.dataset.tab === "tabResults" && !LV_resultsLoaded) loadResults();
      if (btn.dataset.tab === "tabHwSubs" && !LV_hwLoaded) loadHw();
      if (btn.dataset.tab === "tabStudents" && !LV_stuLoaded) loadStudents();
    });
  });

  // Student accounts search
  const stuSearch = document.getElementById("stuSearch");
  if (stuSearch) stuSearch.addEventListener("input", () => filterStudents(stuSearch.value));

  // Refresh buttons
  const refreshBtn = document.getElementById("refreshBtn");
  if (refreshBtn) refreshBtn.addEventListener("click", loadData);
  const stuRefreshBtn = document.getElementById("stuRefreshBtn");
  if (stuRefreshBtn) stuRefreshBtn.addEventListener("click", loadStudents);

  function showDashboard() {
    loginWrap.style.display = "none";
    dashMain.style.display = "block";
    if (logoutBtn) logoutBtn.style.display = "inline-flex";
    loadData();
  }
});

/* Refresh all tabs */
function loadData() {
  loadRegistrations();
  LV_resultsLoaded = false;
  LV_hwLoaded = false;
  LV_stuLoaded = false;
  const rt = document.getElementById("tabResults");
  if (rt && rt.classList.contains("active")) loadResults();
  const ht = document.getElementById("tabHwSubs");
  if (ht && ht.classList.contains("active")) loadHw();
  const st = document.getElementById("tabStudents");
  if (st && st.classList.contains("active")) loadStudents();
}

/* =========================================================
   TAB 1 — REGISTRATIONS
   ========================================================= */
let LV_rows = [];

async function loadRegistrations() {
  const cfg = window.LV_CONFIG || {};
  const state = document.getElementById("dashState");

  if (!window.LV_Supabase || !window.LV_Supabase.ready()) {
    state.innerHTML = '<div class="dash-empty">⚠️ Supabase is not configured yet.<br>Add your URL & anon key in <b>js/config.js</b>.</div>';
    return;
  }
  state.innerHTML = '<div class="dash-empty"><span class="spinner" style="border-top-color:var(--teal-400)"></span> Loading registrations…</div>';

  try {
    LV_rows = await window.LV_Supabase.select("students", { order: "created_at.desc" });
    renderStats(LV_rows);
    renderTable(LV_rows);
    state.innerHTML = "";
  } catch (err) {
    console.error(err);
    state.innerHTML = '<div class="dash-empty">❌ Could not load data.<br><small>' + (err.message || "") + '</small></div>';
  }
}

function renderStats(rows) {
  const total = rows.length;
  const fluency = rows.filter(r => (r.package || "").toLowerCase().includes("group")).length;
  const business = rows.filter(r => (r.package || "").toLowerCase().includes("private")).length;
  const today = rows.filter(r => sameDay(r.created_at)).length;
  document.getElementById("statTotal").textContent = total;
  document.getElementById("statFluency").textContent = fluency;
  document.getElementById("statBusiness").textContent = business;
  document.getElementById("statToday").textContent = today;
}

function renderTable(rows) {
  const tbody = document.getElementById("dashTbody");
  if (!rows.length) {
    tbody.innerHTML = '<tr><td colspan="8"><div class="dash-empty">No registrations yet.</div></td></tr>';
    return;
  }
  tbody.innerHTML = rows.map(r => {
    const date = r.created_at ? new Date(r.created_at).toLocaleString() : "—";
    const wa = (r.whatsapp || "").replace(/[^0-9]/g, "");
    return `<tr>
      <td>${esc(r.full_name)}</td>
      <td>${esc(r.age)}</td>
      <td>${wa ? `<a href="https://wa.me/${wa}" target="_blank" rel="noopener" style="color:var(--teal-300)">${esc(r.whatsapp)}</a>` : esc(r.whatsapp)}</td>
      <td>${esc(r.email)}</td>
      <td>${esc(r.current_level)}</td>
      <td>${esc(r.goal)}</td>
      <td><span class="pill">${esc(r.package)}</span></td>
      <td style="white-space:nowrap">${date}</td>
    </tr>`;
  }).join("");
}

function filterTable(term) {
  term = term.toLowerCase().trim();
  if (!term) return renderTable(LV_rows);
  renderTable(LV_rows.filter(r => JSON.stringify(r).toLowerCase().includes(term)));
}

function exportCSV() {
  if (!LV_rows.length) return alert("No data to export.");
  const cols = ["full_name", "age", "whatsapp", "email", "current_level", "goal", "package", "created_at"];
  downloadCSV(cols, LV_rows, "lingovantage-students");
}

/* =========================================================
   TAB 2 — TEST RESULTS
   ========================================================= */
let LV_results = [];
let LV_resultsLoaded = false;

async function loadResults() {
  const state = document.getElementById("resState");
  if (!window.LV_Supabase || !window.LV_Supabase.ready()) {
    state.innerHTML = '<div class="dash-empty">⚠️ Supabase is not configured yet.</div>';
    return;
  }
  state.innerHTML = '<div class="dash-empty"><span class="spinner" style="border-top-color:var(--teal-400)"></span> Loading test results…</div>';

  try {
    LV_results = await window.LV_Supabase.select("test_results", { order: "created_at.desc" });
    LV_resultsLoaded = true;
    renderResultStats(LV_results);
    renderResultsTable(LV_results);
    state.innerHTML = "";
  } catch (err) {
    console.error(err);
    state.innerHTML = '<div class="dash-empty">❌ Could not load test results.<br><small>' + (err.message || "") + '</small><br>Make sure the <b>test_results</b> table exists (see README).</div>';
  }
}

/* A submission for a manual-review exam (writing and/or speaking).
   It has no score yet — the teacher grades it by hand. */
function isReviewRow(r) {
  const t = (window.LV_TESTS || []).find(x => x.id === r.test_id);
  return !!(t && (t.hasWritingTask || t.hasVoiceTask));
}

function renderResultStats(rows) {
  const graded = rows.filter(r => r.percent != null);
  const total = rows.length;
  const avg = graded.length ? Math.round(graded.reduce((s, r) => s + (r.percent || 0), 0) / graded.length) : 0;
  const passed = graded.filter(r => (r.percent || 0) >= 60).length;
  const today = rows.filter(r => sameDay(r.created_at)).length;
  document.getElementById("statResTotal").textContent = total;
  document.getElementById("statResAvg").textContent = avg + "%";
  document.getElementById("statResPass").textContent = passed;
  document.getElementById("statResToday").textContent = today;
}

function renderResultsTable(rows) {
  const tbody = document.getElementById("resTbody");
  if (!rows.length) {
    tbody.innerHTML = '<tr><td colspan="6"><div class="dash-empty">No test results yet.</div></td></tr>';
    return;
  }
  tbody.innerHTML = rows.map((r, i) => {
    const date = r.created_at ? new Date(r.created_at).toLocaleString() : "—";
    const review = isReviewRow(r);
    const score = r.score != null ? `${esc(r.score)}/${esc(r.total_max)}` : "—";
    const pct = r.percent != null ? r.percent + "%" : "—";
    let grade;
    if (review && r.score != null) grade = '<span class="pill" style="background:rgba(52,211,153,.15);color:#34d399;border-color:rgba(52,211,153,.3)">Passed</span>';
    else if (review && (r.grade === "Failed" || (r.grade === "—" && r.score == null))) grade = '<span class="pill" style="background:rgba(248,113,113,.15);color:#f87171;border-color:rgba(248,113,113,.3)">Failed</span>';
    else if (review) grade = '<span class="pill" style="background:rgba(251,191,36,.15);color:#fbbf24;border-color:rgba(251,191,36,.3)">To grade</span>';
    else grade = `<span class="pill" style="${gradeStyle(r.grade)}">${esc(r.grade)}</span>`;
    return `<tr class="clickable" data-res="${i}">
      <td>${esc(r.student_name)}</td>
      <td>${esc(r.test_name)}</td>
      <td>${score}</td>
      <td>${pct}</td>
      <td>${grade}</td>
      <td style="white-space:nowrap">${date}</td>
    </tr>`;
  }).join("");
  // row click -> show answers (uses the currently displayed rows)
  tbody.querySelectorAll("tr[data-res]").forEach(tr => {
    tr.addEventListener("click", () => showResultAnswers(rows[+tr.dataset.res]));
  });
}

/* ---- Modal: show a student's test answers with correct/wrong ---- */
function showResultAnswers(r) {
  if (isReviewRow(r)) { showExamReview(r); return; }

  const test = (window.LV_TESTS || []).find(t => t.id === r.test_id);
  let ans = r.answers;
  if (typeof ans === "string") { try { ans = JSON.parse(ans); } catch (e) { ans = {}; } }
  ans = ans || {};

  let html = `<h2 style="margin-bottom:4px;">${esc(r.student_name)}</h2>
    <p style="color:var(--text-soft);margin-bottom:16px;">${esc(r.test_name)} · Score <b>${esc(r.score)}/${esc(r.total_max)}</b> (${r.percent}%) · Grade ${esc(r.grade)}</p>`;

  if (!test) {
    html += `<pre class="raw-json">${esc(JSON.stringify(ans, null, 2))}</pre>`;
    openModal(html);
    return;
  }

  const rowHtml = (num, questionText, studentVal, correctVal) => {
    const ok = String(studentVal) === String(correctVal);
    return `<div class="ans-row ${ok ? "ok" : "bad"}">
      <div class="ans-q">${num}. ${esc(questionText)}</div>
      <div class="ans-detail">
        <span class="ans-badge ${ok ? "ok" : "bad"}">${ok ? "✓" : "✗"}</span>
        <span>Their answer: <b>${esc(studentVal ?? "—")}</b></span>
        ${ok ? "" : `<span class="ans-correct">Correct: <b>${esc(correctVal)}</b></span>`}
      </div>
    </div>`;
  };

  html += `<h3 style="margin:18px 0 10px;">Part A — Multiple Choice</h3>`;
  (test.partA || []).forEach(item => {
    const chosen = ans.A ? ans.A[item.q] : undefined;
    html += rowHtml(item.q, item.text, chosen, item.answer);
  });
  html += `<h3 style="margin:18px 0 10px;">Part B — Right or Wrong</h3>`;
  (test.partB || []).forEach(item => {
    const chosen = ans.B ? ans.B[item.q] : undefined;
    html += rowHtml(item.q, item.text, chosen, item.answer);
  });

  openModal(html);
}

/* ---- Modal: full A1 final-exam review (Q&A + writing + voice notes) ----
   The teacher grades manually; score/grade are not stored yet. */
function showExamReview(r) {
  const test = (window.LV_TESTS || []).find(t => t.id === r.test_id);
  let ans = r.answers;
  if (typeof ans === "string") { try { ans = JSON.parse(ans); } catch (e) { ans = {}; } }
  ans = ans || {};
  const A = ans.A || {}, B = ans.B || {};
  const date = r.created_at ? new Date(r.created_at).toLocaleString() : "—";

  const gradedStatus = r.score != null;
  const statusPill = gradedStatus
    ? '<span class="pill" style="background:rgba(52,211,153,.15);color:#34d399;border-color:rgba(52,211,153,.3)">✓ Graded</span>'
    : '<span class="pill" style="background:rgba(251,191,36,.15);color:#fbbf24;border-color:rgba(251,191,36,.3)">Awaiting teacher grading</span>';

  let html = `
    <h2 style="margin-bottom:4px;">${esc(r.student_name)}</h2>
    <p style="color:var(--text-soft);margin-bottom:16px;">${esc(r.test_name)} · ${date}<br>${statusPill}</p>`;

  if (!test) {
    html += `<pre class="raw-json">${esc(JSON.stringify(ans, null, 2))}</pre>`;
    openModal(html);
    return;
  }

  const optText = (item, key) => {
    const opt = (item.options || []).find(([k]) => k === key);
    return opt ? `${key}) ${opt[1]}` : (key == null ? "—" : key);
  };

  // Section I — Multiple choice
  html += `<h3 style="margin:18px 0 10px;">Section I — Multiple Choice <span style="color:var(--text-dim);font-weight:500;">(${test.partA.length} Qs)</span></h3>`;
  (test.partA || []).forEach(item => {
    const chosen = A[item.q];
    const ok = String(chosen) === String(item.answer);
    html += `<div class="ans-row ${ok ? "ok" : "bad"}">
      <div class="ans-q">${item.q}. ${item.unit ? `<span class="unit-tag">${esc(item.unit)}</span>` : ""}${esc(item.text)}</div>
      <div class="ans-detail">
        <span class="ans-badge ${ok ? "ok" : "bad"}">${ok ? "✓" : "✗"}</span>
        <span>Student: <b>${esc(optText(item, chosen))}</b></span>
        ${ok ? "" : `<span class="ans-correct">Correct: <b>${esc(optText(item, item.answer))}</b></span>`}
      </div>
    </div>`;
  });

  // Section II — Right or Wrong
  html += `<h3 style="margin:24px 0 10px;">Section II — Right or Wrong <span style="color:var(--text-dim);font-weight:500;">(${test.partB.length} Qs)</span></h3>`;
  (test.partB || []).forEach(item => {
    const chosen = B[item.q];
    const ok = String(chosen) === String(item.answer);
    html += `<div class="ans-row ${ok ? "ok" : "bad"}">
      <div class="ans-q">${item.q}. ${item.unit ? `<span class="unit-tag">${esc(item.unit)}</span>` : ""}${esc(item.text)}</div>
      <div class="ans-detail">
        <span class="ans-badge ${ok ? "ok" : "bad"}">${ok ? "✓" : "✗"}</span>
        <span>Student: <b>${esc(chosen == null ? "—" : chosen)}</b></span>
        ${ok ? "" : `<span class="ans-correct">Correct: <b>${esc(item.answer)}</b> — ${esc(item.correction || "")}</span>`}
      </div>
    </div>`;
  });

  // Section III — Writing
  if (test.hasWritingTask && test.writingTask) {
    const wt = test.writingTask;
    html += `<h3 style="margin:24px 0 10px;">Section III — Functional Writing <span style="color:var(--text-dim);font-weight:500;">(20 marks)</span></h3>`;
    html += `<div class="writing-card">
      <div class="msg-bubble"><strong>${esc(wt.incomingMessage.sender)}:</strong><p>${esc(wt.incomingMessage.text)}</p></div>
      <h4 style="margin:16px 0 8px;color:var(--teal-300);">Student's reply</h4>
      <div style="white-space:pre-wrap;line-height:1.7;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-sm);padding:14px;">${esc((ans.writing && ans.writing.text) || "—")}</div>
      <div class="words-counter">${ans.writing && ans.writing.wordCount != null ? esc(ans.writing.wordCount) : "—"} words · target ${wt.minWords}–${wt.maxWords}</div>
    </div>`;
  }

  // Component 2 — Speaking (voice notes)
  if (test.hasVoiceTask && test.voicePrompts && test.voicePrompts.length) {
    html += `<h3 style="margin:24px 0 10px;">Component 2 — Speaking <span style="color:var(--text-dim);font-weight:500;">(30 marks)</span></h3>`;
    (test.voicePrompts || []).forEach(vp => {
      const url = ans.voice ? ans.voice[vp.task] : null;
      html += `<div class="task-card">
        <strong>${esc(vp.title)}</strong>
        <p style="color:var(--text-soft);font-size:.88rem;margin:6px 0;">${esc(vp.prompt)}</p>
        <p class="criteria">${esc(vp.criteria)}</p>
        ${url
          ? `<audio controls src="${esc(url)}" style="width:100%;"></audio>
             <p style="margin-top:6px;"><a href="${esc(url)}" target="_blank" rel="noopener" style="color:var(--teal-300);font-size:.85rem;">Open / download voice note ↗</a></p>`
          : '<p style="color:var(--text-dim);">No voice note submitted.</p>'}
      </div>`;
    });
  }

  // Grading panel (manual-review exams only)
  html += `<div class="grade-panel">
    <h3 style="margin-bottom:4px;">Grade result</h3>
    <p style="color:var(--text-soft);font-size:.85rem;margin-bottom:14px;">Check the answers above, then mark this exam as passed or failed. A failed exam lets the student retake it from the portal.</p>`;

  if (gradedStatus) {
    const isPassed = r.score != null;
    html += `<p style="font-size:1.05rem;font-weight:800;color:${isPassed ? "var(--success)" : "#f87171"};margin-bottom:14px;">
        ${isPassed ? "✓ Passed" : "✗ Failed"}${r.score != null ? ` — <b>${r.score}/${r.total_max}</b> (${r.percent}%)` : ""}</p>
      <button class="btn btn-ghost" id="reGradeBtn">↻ Re-grade</button>`;
  } else {
    html += `<div class="grade-actions">
        <div class="pass-row">
          <input class="input" id="gradeMark" type="number" min="0" max="${r.total_max || 100}" placeholder="Mark (0–${r.total_max || 100})" />
          <button class="btn btn-primary" id="passBtn">✓ Pass</button>
        </div>
        <button class="btn btn-danger" id="failBtn">✗ Fail — allow retake</button>
      </div>`;
  }
  html += `</div>`;

  openModal(html);

  if (gradedStatus) {
    document.getElementById("reGradeBtn").addEventListener("click", () => showResultAnswers(r));
  } else {
    document.getElementById("passBtn").addEventListener("click", async () => {
      const markInput = document.getElementById("gradeMark");
      const raw = markInput.value.trim();
      const mark = Math.round(Number(raw));
      const totalMax = r.total_max || 100;
      if (raw === "" || isNaN(mark) || mark < 0 || mark > totalMax) {
        markInput.classList.add("input-err");
        alert(`Please enter a valid mark from 0 to ${totalMax}.`);
        return;
      }
      await saveGrade(r, { score: mark, total_max: totalMax, percent: Math.round((mark / totalMax) * 100) });
    });
    document.getElementById("failBtn").addEventListener("click", async () => {
      if (!confirm("Fail this exam? The student will be able to retake it.")) return;
      let ok = false;
      /* Strategy 1: DELETE the record so student sees "Start exam →" */
      try {
        await window.LV_Supabase.remove("test_results", `id=eq.${encodeURIComponent(r.id)}`);
        ok = true;
        console.log("[Lingo] DELETE succeeded for", r.id);
      } catch (e) { console.warn("[Lingo] DELETE failed, trying _retake flag:", e.message); }
      /* Strategy 2: set _retake flag in answers JSONB (bypasses grade CHECK) */
      if (!ok) {
        try {
          const answers = typeof r.answers === "string" ? JSON.parse(r.answers || "{}") : (r.answers || {});
          answers._retake = true;
          await window.LV_Supabase.update("test_results", `id=eq.${encodeURIComponent(r.id)}`, { answers });
          ok = true;
          console.log("[Lingo] _retake flag set for", r.id);
        } catch (e) { console.warn("[Lingo] _retake flag failed, trying grade dash:", e.message); }
      }
      /* Strategy 3: set grade to "—" which IS allowed by the CHECK constraint */
      if (!ok) {
        try {
          await window.LV_Supabase.update("test_results", `id=eq.${encodeURIComponent(r.id)}`, { grade: "—" });
          ok = true;
          console.log("[Lingo] grade dash set for", r.id);
        } catch (e) { console.error("[Lingo] ALL fail strategies failed for", r.id, e.message); }
      }
      if (ok) {
        closeModal();
        loadResults();
      } else {
        alert("Could not mark this exam as failed. Check the browser console (F12) for details and contact support.");
      }
    });
  }
}

/* Save the teacher's pass/fail grade for a manual-review exam. */
async function saveGrade(r, patch) {
  try {
    await window.LV_Supabase.update("test_results", `id=eq.${encodeURIComponent(r.id)}`, patch);
    closeModal();
    loadResults();
  } catch (err) {
    alert("Could not save grade: " + (err.message || ""));
  }
}

function gradeStyle(g) {
  const map = {
    "A": "background:rgba(52,211,153,.15);color:#34d399;border-color:rgba(52,211,153,.3)",
    "B": "background:rgba(34,211,196,.15);color:#22d3c4;border-color:rgba(34,211,196,.3)",
    "C": "background:rgba(251,191,36,.15);color:#fbbf24;border-color:rgba(251,191,36,.3)",
    "D": "background:rgba(251,146,60,.15);color:#fb923c;border-color:rgba(251,146,60,.3)"
  };
  return map[g] || "background:rgba(248,113,113,.15);color:#f87171;border-color:rgba(248,113,113,.3)";
}

function filterResults(term) {
  term = term.toLowerCase().trim();
  if (!term) return renderResultsTable(LV_results);
  renderResultsTable(LV_results.filter(r => JSON.stringify(r).toLowerCase().includes(term)));
}

function exportResultsCSV() {
  if (!LV_results.length) return alert("No test results to export.");
  const cols = ["student_name", "test_name", "score", "total_max", "percent", "grade", "ip", "created_at"];
  downloadCSV(cols, LV_results, "lingovantage-test-results");
}

/* =========================================================
   TAB 3 — HOMEWORK SUBMISSIONS
   ========================================================= */
let LV_hw = [];
let LV_hwLoaded = false;

async function loadHw() {
  const state = document.getElementById("hwState");
  if (!window.LV_Supabase || !window.LV_Supabase.ready()) {
    state.innerHTML = '<div class="dash-empty">⚠️ Supabase is not configured yet.</div>';
    return;
  }
  state.innerHTML = '<div class="dash-empty"><span class="spinner" style="border-top-color:var(--teal-400)"></span> Loading homework…</div>';
  try {
    LV_hw = await window.LV_Supabase.select("homework_submissions", { order: "created_at.desc" });
    LV_hwLoaded = true;
    renderHwStats(LV_hw);
    renderHwTable(LV_hw);
    state.innerHTML = "";
  } catch (err) {
    console.error(err);
    state.innerHTML = '<div class="dash-empty">❌ Could not load homework.<br><small>' + (err.message || "") + '</small><br>Make sure the <b>homework_submissions</b> table exists (see README).</div>';
  }
}

function renderHwStats(rows) {
  const total = rows.length;
  const students = new Set(rows.map(r => (r.student_name || "").toLowerCase().trim())).size;
  const today = rows.filter(r => sameDay(r.created_at)).length;
  const units = new Set(rows.map(r => r.unit)).size;
  document.getElementById("statHwTotal").textContent = total;
  document.getElementById("statHwStudents").textContent = students;
  document.getElementById("statHwToday").textContent = today;
  document.getElementById("statHwUnits").textContent = units;
}

function renderHwTable(rows) {
  const tbody = document.getElementById("hwTbody");
  if (!rows.length) {
    tbody.innerHTML = '<tr><td colspan="6"><div class="dash-empty">No homework submitted yet.</div></td></tr>';
    return;
  }
  tbody.innerHTML = rows.map((r, i) => {
    const date = r.created_at ? new Date(r.created_at).toLocaleString() : "—";
    const unitLabel = r.unit_title ? r.unit_title : ("Unit " + esc(r.unit));
    const quiz = (r.score != null && r.total_max != null) ? `${esc(r.score)}/${esc(r.total_max)}` : "—";
    const voice = r.voice_url ? "🎙️ Yes" : "—";
    return `<tr class="clickable" data-hw="${i}">
      <td>${esc(r.student_name)}</td>
      <td><span class="pill">${esc(r.batch)}</span></td>
      <td>${esc(unitLabel)}</td>
      <td>${quiz}</td>
      <td>${voice}</td>
      <td style="white-space:nowrap">${date}</td>
    </tr>`;
  }).join("");
  tbody.querySelectorAll("tr[data-hw]").forEach(tr => {
    tr.addEventListener("click", () => showHwContent(rows[+tr.dataset.hw]));
  });
}

function showHwContent(r) {
  const date = r.created_at ? new Date(r.created_at).toLocaleString() : "—";
  const unitLabel = r.unit_title ? r.unit_title : ("Unit " + r.unit);
  const pct = r.percent != null ? r.percent : (r.total_max ? Math.round((r.score / r.total_max) * 100) : "—");

  let html = `
    <h2 style="margin-bottom:4px;">${esc(r.student_name)}</h2>
    <p style="color:var(--text-soft);margin-bottom:16px;">${esc(r.batch)} · ${esc(unitLabel)} · ${date}</p>`;

  // Voice note player
  if (r.voice_url) {
    html += `<h3 style="margin:6px 0 10px;">🎙️ Voice note</h3>
      <audio controls src="${esc(r.voice_url)}" style="width:100%;margin-bottom:8px;"></audio>
      <p style="margin-bottom:18px;"><a href="${esc(r.voice_url)}" target="_blank" rel="noopener" style="color:var(--teal-300);font-size:.88rem;">Open / download voice note ↗</a></p>`;
  } else {
    html += `<p style="color:var(--text-dim);margin-bottom:18px;">No voice note.</p>`;
  }

  // Quiz answers with correct/wrong
  if (r.score != null && r.total_max != null) {
    html += `<h3 style="margin:6px 0 10px;">Quiz — ${esc(r.score)}/${esc(r.total_max)} (${pct}%)</h3>`;
    const hw = findHwUnit(r);
    let ans = r.answers;
    if (typeof ans === "string") { try { ans = JSON.parse(ans); } catch (e) { ans = {}; } }
    ans = ans || {};
    if (hw && hw.questions) {
      const norm = window.LV_normAnswer || (s => String(s || "").toLowerCase().trim());
      hw.questions.forEach(item => {
        const chosen = ans[item.q];
        let ok, chosenText, correctText;
        if (item.accept) {
          // fill-in-the-blank (possibly multi-blank)
          const vals = Array.isArray(chosen) ? chosen : [chosen];
          ok = item.accept.every((blank, bi) => blank.some(a => norm(a) === norm(vals[bi])));
          chosenText = vals.map(v => v == null || v === "" ? "—" : v).join(" | ");
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
            <span>Their answer: <b>${esc(chosenText)}</b></span>
            ${ok ? "" : `<span class="ans-correct">Accepted: <b>${esc(correctText)}</b></span>`}
          </div>
        </div>`;
      });
    } else {
      html += `<pre class="raw-json">${esc(JSON.stringify(ans, null, 2))}</pre>`;
    }
  }

  openModal(html);
}

/* Look up a homework bank (A1 or A2) for a submission.
   A2 checkpoints are identified by "Session N Checkpoint" titles
   (older ones used "A2 Unit N — Session N Checkpoint"), so match
   A2 by title or by checkpoint pattern + unit number; match A1 by
   exact title, falling back to unit number for legacy rows. */
function findHwUnit(r) {
  const a2 = window.LV_HOMEWORK_A2 || [];
  const a1 = window.LV_HOMEWORK || [];
  const title = String(r.unit_title || "");
  const byUnit = arr => arr.find(u => String(u.unit) === String(r.unit));

  if (title && /checkpoint/i.test(title)) {
    const t = title.toLowerCase();
    const byTitle = a2.find(u => String(u.title).toLowerCase() === t);
    if (byTitle) return byTitle;
    const byNo = byUnit(a2);
    if (byNo) return byNo;
  }
  if (title) {
    const t = title.toLowerCase();
    const a1ByTitle = a1.find(u => String(u.title).toLowerCase() === t);
    if (a1ByTitle) return a1ByTitle;
  }
  return byUnit(a1);
}

function filterHw(term) {
  term = term.toLowerCase().trim();
  if (!term) return renderHwTable(LV_hw);
  renderHwTable(LV_hw.filter(r => JSON.stringify(r).toLowerCase().includes(term)));
}

function exportHwCSV() {
  if (!LV_hw.length) return alert("No homework to export.");
  const cols = ["student_name", "batch", "unit", "unit_title", "score", "total_max", "percent", "voice_url", "created_at"];
  downloadCSV(cols, LV_hw, "lingovantage-homework");
}

/* =========================================================
   TAB 4 — STUDENT ACCOUNTS (Supabase Auth + approval)
   Reads the "student_profiles" table. Students sign up
   themselves; you approve/revoke them here.
   ========================================================= */
let LV_students = [];
let LV_stuLoaded = false;

async function loadStudents() {
  const state = document.getElementById("stuState");
  if (!window.LV_Supabase || !window.LV_Supabase.ready()) {
    state.innerHTML = '<div class="dash-empty">⚠️ Supabase is not configured yet.</div>';
    return;
  }
  state.innerHTML = '<div class="dash-empty"><span class="spinner" style="border-top-color:var(--teal-400)"></span> Loading student accounts…</div>';
  try {
    LV_students = await window.LV_Supabase.select("student_profiles", { order: "created_at.desc" });
    LV_stuLoaded = true;
    renderStudents(LV_students);
    state.innerHTML = "";
  } catch (err) {
    console.error(err);
    state.innerHTML = '<div class="dash-empty">❌ Could not load student accounts.<br><small>' + (err.message || "") + '</small><br>Make sure the <b>student_profiles</b> table exists (see README).</div>';
  }
}

function renderStudentStats(rows) {
  const total = rows.length;
  const approved = rows.filter(r => r.approved === true).length;
  const pending = total - approved;
  const today = rows.filter(r => sameDay(r.created_at)).length;
  document.getElementById("statStuTotal").textContent = total;
  document.getElementById("statStuApproved").textContent = approved;
  document.getElementById("statStuPending").textContent = pending;
  document.getElementById("statStuToday").textContent = today;
}

function renderStudents(rows) {
  renderStudentStats(rows);
  const tbody = document.getElementById("stuTbody");
  if (!rows.length) {
    tbody.innerHTML = '<tr><td colspan="6"><div class="dash-empty">No student accounts yet.</div></td></tr>';
    return;
  }
  tbody.innerHTML = rows.map((r, i) => {
    const date = r.created_at ? new Date(r.created_at).toLocaleDateString() : "—";
    const approved = r.approved === true;
    const a2 = hasA2(r);
    const btn = `<button class="btn ${approved ? "btn-ghost" : "btn-primary"}" data-toggle="${i}" style="padding:6px 14px;font-size:.82rem;">${approved ? "Revoke" : "Approve"}</button>`;
    const a2Btn = `<button class="btn ${a2 ? "btn-ghost" : ""}" data-a2="${i}" style="padding:6px 14px;font-size:.82rem;${a2 ? "color:var(--success);border-color:rgba(52,211,153,.4);" : ""}">${a2 ? "✓ A2" : "＋ A2"}</button>`;
    return `<tr>
      <td>${esc(r.full_name)}</td>
      <td>${esc(r.email)}</td>
      <td>${approved ? '<span style="color:var(--success)">● Approved</span>' : '<span style="color:var(--warn)">● Pending</span>'}</td>
      <td>${a2Btn}</td>
      <td style="white-space:nowrap">${date}</td>
      <td>${btn}</td>
    </tr>`;
  }).join("");
  tbody.querySelectorAll("[data-toggle]").forEach(b => {
    b.addEventListener("click", () => toggleStudent(rows[+b.dataset.toggle]));
  });
  tbody.querySelectorAll("[data-a2]").forEach(b => {
    b.addEventListener("click", () => toggleA2Access(rows[+b.dataset.a2]));
  });
}

/* Does this profile have A2 access? (A1 is always granted to approved students) */
function hasA2(r) {
  const a = r.access_levels;
  if (Array.isArray(a)) return a.indexOf("A2") !== -1;
  if (typeof a === "string") { try { return JSON.parse(a).indexOf("A2") !== -1; } catch (e) { return false; } }
  return false;
}

/* Grant / revoke A2 access for a student (persisted to access_levels) */
async function toggleA2Access(s) {
  const cur = Array.isArray(s.access_levels) ? s.access_levels.slice() : ["A1"];
  let next;
  if (cur.indexOf("A2") !== -1) {
    next = cur.filter(x => x !== "A2");
    if (!next.length) next = ["A1"];
  } else {
    if (cur.indexOf("A1") === -1) cur.unshift("A1");
    next = cur.concat("A2");
  }
  try {
    await window.LV_Supabase.update("student_profiles", `id=eq.${encodeURIComponent(s.id)}`, { access_levels: next });
    s.access_levels = next;
    renderStudents(LV_students);
  } catch (err) {
    alert("Could not update A2 access: " + (err.message || ""));
  }
}

async function toggleStudent(s) {
  const newApproved = s.approved !== true; // flip
  try {
    await window.LV_Supabase.update("student_profiles", `id=eq.${encodeURIComponent(s.id)}`, { approved: newApproved });
    s.approved = newApproved;
    renderStudents(LV_students);
  } catch (err) {
    alert("Could not update: " + (err.message || ""));
  }
}

function filterStudents(term) {
  term = term.toLowerCase().trim();
  if (!term) return renderStudents(LV_students);
  renderStudents(LV_students.filter(r => JSON.stringify(r).toLowerCase().includes(term)));
}

/* =========================================================
   MODAL
   ========================================================= */
function openModal(html) {
  const modal = document.getElementById("dashModal");
  document.getElementById("modalBody").innerHTML = html;
  modal.style.display = "flex";
  document.body.style.overflow = "hidden";
}
function closeModal() {
  const modal = document.getElementById("dashModal");
  if (modal) modal.style.display = "none";
  document.body.style.overflow = "";
}

/* =========================================================
   SHARED HELPERS
   ========================================================= */
function sameDay(ts) {
  if (!ts) return false;
  return new Date(ts).toDateString() === new Date().toDateString();
}

function downloadCSV(cols, rows, prefix) {
  const head = cols.join(",");
  const body = rows.map(r =>
    cols.map(c => `"${String(r[c] ?? "").replace(/"/g, '""')}"`).join(",")
  ).join("\n");
  const blob = new Blob([head + "\n" + body], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${prefix}-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function esc(s) {
  return String(s ?? "—").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
}
