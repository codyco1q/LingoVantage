/* =========================================================
   LingoVantage — Simple Admin Dashboard
   - Lightweight password gate (frontend only — see config)
   - Reads registrations from the Supabase "student" table
   - Shows stats + a searchable table + CSV export
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

  const searchInput = document.getElementById("dashSearch");
  if (searchInput) searchInput.addEventListener("input", () => filterTable(searchInput.value));

  const exportBtn = document.getElementById("dashExport");
  if (exportBtn) exportBtn.addEventListener("click", exportCSV);

  function showDashboard() {
    loginWrap.style.display = "none";
    dashMain.style.display = "block";
    loadData();
  }
});

let LV_rows = [];

async function loadData() {
  const tbody = document.getElementById("dashTbody");
  const cfg = window.LV_CONFIG || {};

  if (!window.LV_Supabase || !window.LV_Supabase.ready()) {
    document.getElementById("dashState").innerHTML =
      '<div class="dash-empty">⚠️ Supabase is not configured yet.<br>Add your URL & anon key in <b>js/config.js</b> to see live registrations.</div>';
    return;
  }

  document.getElementById("dashState").innerHTML = '<div class="dash-empty"><span class="spinner" style="border-top-color:var(--teal-400)"></span> Loading registrations…</div>';

  try {
    LV_rows = await window.LV_Supabase.select(cfg.supabase.table || "student", { order: "created_at.desc" });
    renderStats(LV_rows);
    renderTable(LV_rows);
    document.getElementById("dashState").innerHTML = "";
  } catch (err) {
    console.error(err);
    document.getElementById("dashState").innerHTML =
      '<div class="dash-empty">❌ Could not load data.<br><small>' + (err.message || "") + '</small></div>';
  }
}

function renderStats(rows) {
  const total = rows.length;
  const fluency = rows.filter(r => (r.package || "").toLowerCase().includes("fluency")).length;
  const business = rows.filter(r => (r.package || "").toLowerCase().includes("business")).length;
  const today = rows.filter(r => {
    if (!r.created_at) return false;
    const d = new Date(r.created_at);
    const n = new Date();
    return d.toDateString() === n.toDateString();
  }).length;

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
  const filtered = LV_rows.filter(r =>
    JSON.stringify(r).toLowerCase().includes(term)
  );
  renderTable(filtered);
}

function exportCSV() {
  if (!LV_rows.length) return alert("No data to export.");
  const cols = ["full_name", "age", "whatsapp", "email", "current_level", "goal", "package", "created_at"];
  const head = cols.join(",");
  const body = LV_rows.map(r =>
    cols.map(c => `"${String(r[c] ?? "").replace(/"/g, '""')}"`).join(",")
  ).join("\n");
  const blob = new Blob([head + "\n" + body], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `lingovantage-students-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function esc(s) {
  return String(s ?? "—").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
}
