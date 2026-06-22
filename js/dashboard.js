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

  // Already authenticated this session?
  if (sessionStorage.getItem("lv_dash_auth") === "1") {
    showDashboard();
  }

  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const pass = document.getElementById("dashPass").value;
      const err = document.getElementById("dashLoginErr");
      if (pass === (window.LV_CONFIG.dashboardPassword || "")) {
        sessionStorage.setItem("lv_dash_auth", "1");
        showDashboard();
      } else {
        err.className = "alert show error";
        err.textContent = "❌ Wrong password.";
      }
    });
  }

  const logoutBtn = document.getElementById("dashLogout");
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

  // Tabs
  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
      document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById(btn.dataset.tab).classList.add("active");
      if (btn.dataset.tab === "tabResults" && !LV_resultsLoaded) loadResults();
    });
  });

  function showDashboard() {
    loginWrap.style.display = "none";
    dashMain.style.display = "block";
    if (logoutBtn) logoutBtn.style.display = "inline-flex";
    loadData();
  }
});

/* Refresh both tabs */
function loadData() {
  loadRegistrations();
  LV_resultsLoaded = false;
  // if results tab is currently visible, reload it too
  const rt = document.getElementById("tabResults");
  if (rt && rt.classList.contains("active")) loadResults();
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
    LV_rows = await window.LV_Supabase.select(cfg.supabase.table || "students", { order: "created_at.desc" });
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

function renderResultStats(rows) {
  const total = rows.length;
  const avg = total ? Math.round(rows.reduce((s, r) => s + (r.percent || 0), 0) / total) : 0;
  const passed = rows.filter(r => (r.percent || 0) >= 60).length;
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
  tbody.innerHTML = rows.map(r => {
    const date = r.created_at ? new Date(r.created_at).toLocaleString() : "—";
    const pct = r.percent != null ? r.percent : "—";
    return `<tr>
      <td>${esc(r.student_name)}</td>
      <td>${esc(r.test_name)}</td>
      <td>${esc(r.score)}/${esc(r.total_max)}</td>
      <td>${pct}%</td>
      <td><span class="pill" style="${gradeStyle(r.grade)}">${esc(r.grade)}</span></td>
      <td style="white-space:nowrap">${date}</td>
    </tr>`;
  }).join("");
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
