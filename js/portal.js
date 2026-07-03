/* =========================================================
   LingoVantage — Student Portal
   - Fixed shared login (config.studentPortal)
   - Tabs: Previous Sessions (recordings) + Homework (pages)
   - Data comes from window.LV_CONFIG.studentPortal.sessions
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const cfg = window.LV_CONFIG || {};
  const portal = cfg.studentPortal || {};

  const loginWrap = document.getElementById("portalLoginWrap");
  const main = document.getElementById("portalMain");
  const loginForm = document.getElementById("portalLoginForm");

  /* Already logged in this session? */
  if (sessionStorage.getItem("lv_portal_auth") === "1") {
    showPortal();
  }

  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const user = document.getElementById("portalUser").value.trim();
      const pass = document.getElementById("portalPass").value;
      const err = document.getElementById("portalLoginErr");

      if (user === portal.username && pass === portal.password) {
        sessionStorage.setItem("lv_portal_auth", "1");
        showPortal();
      } else {
        err.className = "alert show error";
        err.textContent = "❌ Wrong username or password.";
      }
    });
  }

  const logoutBtn = document.getElementById("portalLogout");
  if (logoutBtn) logoutBtn.addEventListener("click", () => {
    sessionStorage.removeItem("lv_portal_auth");
    location.reload();
  });

  /* Tabs */
  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
      document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById(btn.dataset.tab).classList.add("active");
      // Lazy-load the Tests tab the first time it's opened
      if (btn.dataset.tab === "tabTests" && typeof window.LV_initTests === "function") {
        window.LV_initTests();
      }
      // Lazy-load the interactive Homework tab
      if (btn.dataset.tab === "tabSubmit" && typeof window.LV_initHomework === "function") {
        window.LV_initHomework();
      }
    });
  });

  function showPortal() {
    if (loginWrap) loginWrap.style.display = "none";
    if (main) main.style.display = "block";
    if (logoutBtn) logoutBtn.style.display = "inline-flex";
    renderSessions();
    renderHomework();
    renderResource("presentationsList", "presentation", "🖼️ Open presentation", "Slideshow available", "Not ready yet");
    renderResource("miroList", "miro", "🧩 Open Miro board", "Board available", "Not ready yet");
  }

  /* Generic renderer for a per-unit link list (presentations, miro, …) */
  function renderResource(containerId, field, btnLabel, readyText, pendingText) {
    const wrap = document.getElementById(containerId);
    if (!wrap) return;
    const sessions = portal.sessions || [];
    wrap.innerHTML = sessions.map(s => {
      const link = s[field];
      const has = link && link.trim() !== "";
      const action = has
        ? `<a href="${link}" target="_blank" rel="noopener" class="btn btn-primary">${btnLabel}</a>`
        : `<span class="soon-pill">Coming soon</span>`;
      return `
        <div class="session-row ${has ? "" : "pending"}">
          <div class="session-num">${s.unit}</div>
          <div class="session-info">
            <strong>${s.title}</strong>
            <span>${has ? readyText : pendingText}</span>
          </div>
          <div class="session-action">${action}</div>
        </div>`;
    }).join("");
  }

  function renderSessions() {
    const wrap = document.getElementById("sessionsList");
    const sessions = portal.sessions || [];
    wrap.innerHTML = sessions.map(s => {
      const has = s.recording && s.recording.trim() !== "";
      const action = has
        ? `<a href="${s.recording}" target="_blank" rel="noopener" class="btn btn-primary">▶ Watch recording</a>`
        : `<span class="soon-pill">Coming soon</span>`;
      return `
        <div class="session-row ${has ? "" : "pending"}">
          <div class="session-num">${s.unit}</div>
          <div class="session-info">
            <strong>${s.title}</strong>
            <span>${has ? "Recording available" : "Not recorded yet"}</span>
          </div>
          <div class="session-action">${action}</div>
        </div>`;
    }).join("");
  }

  function renderHomework() {
    const wrap = document.getElementById("homeworkList");
    const sessions = portal.sessions || [];
    wrap.innerHTML = sessions.map(s => `
      <div class="hw-row">
        <div class="session-num">${s.unit}</div>
        <div class="session-info">
          <strong>${s.title}</strong>
          <span>Homework</span>
        </div>
        <div class="hw-page">📖 Page <b>${s.homeworkPage}</b></div>
      </div>`).join("");
  }
});
