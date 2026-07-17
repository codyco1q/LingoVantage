/* =========================================================
   LingoVantage — Student Portal
   - Session data served from /api/portal-config after auth
   - Tabs: Previous Sessions (recordings) + Homework (pages)
   - Session data fetched from /api/portal-config after auth
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const cfg = window.LV_CONFIG || {};

  const loginWrap = document.getElementById("portalLoginWrap");
  const pendingWrap = document.getElementById("portalPending");
  const main = document.getElementById("portalMain");
  const loginForm = document.getElementById("portalLoginForm");
  const signupForm = document.getElementById("portalSignupForm");
  const logoutBtn = document.getElementById("portalLogout");
  const err = document.getElementById("portalLoginErr");

  let portalSessions = [];

  function setErr(type, msg) {
    if (!err) return;
    err.className = "alert show " + type;
    err.innerHTML = msg;
  }
  function clearErr() { if (err) err.className = "alert"; }

  /* ---- Auth mode switch (Log in / Sign up) ---- */
  document.querySelectorAll(".auth-switch-btn").forEach(b => {
    b.addEventListener("click", () => {
      document.querySelectorAll(".auth-switch-btn").forEach(x => x.classList.remove("active"));
      b.classList.add("active");
      clearErr();
      const mode = b.dataset.mode;
      loginForm.style.display = mode === "login" ? "block" : "none";
      signupForm.style.display = mode === "signup" ? "block" : "none";
    });
  });

  /* ---- Resume an existing session on load ---- */
  (async function resume() {
    if (window.LV_Auth && window.LV_Auth.currentUser()) {
      await enterIfApproved(true);
    }
  })();

  /* ---- Check approval, then show portal or pending screen ---- */
  async function enterIfApproved(silent) {
    if (!window.LV_Auth) return;
    let profile = null;
    try { profile = await window.LV_Auth.getProfile(); } catch (e) {}
    const user = window.LV_Auth.currentUser();
    const name = (profile && profile.full_name) || (user && user.user_metadata && user.user_metadata.full_name) || "";

    if (profile && profile.approved === true) {
      sessionStorage.setItem("lv_portal_name", name);
      sessionStorage.setItem("lv_portal_email", (user && user.email) || "");
      showPortal();
    } else {
      // authenticated but not approved (or no profile yet)
      if (loginWrap) loginWrap.style.display = "none";
      if (main) main.style.display = "none";
      if (pendingWrap) pendingWrap.style.display = "block";
    }
  }

  /* ---- LOGIN ---- */
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      clearErr();
      const email = document.getElementById("loginEmail").value.trim();
      const pass = document.getElementById("loginPass").value;
      const btn = loginForm.querySelector('button[type="submit"]');
      const orig = btn.innerHTML; btn.disabled = true; btn.innerHTML = '<span class="spinner"></span> Logging in…';
      try {
        await window.LV_Auth.signIn(email, pass);
        await enterIfApproved();
      } catch (e2) {
        const m = (e2.message || "").toLowerCase();
        if (m.includes("confirm")) setErr("error", "📧 Please confirm your email first (check your inbox), then log in.");
        else setErr("error", "❌ Wrong email or password.");
      }
      btn.disabled = false; btn.innerHTML = orig;
    });
  }

  /* ---- SIGN UP ---- */
  if (signupForm) {
    signupForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      clearErr();
      const name = document.getElementById("suName").value.trim();
      const email = document.getElementById("suEmail").value.trim();
      const pass = document.getElementById("suPass").value;
      if (name.length < 2) return setErr("error", "⚠️ Please enter your full name.");
      if (pass.length < 6) return setErr("error", "⚠️ Password must be at least 6 characters.");
      const btn = signupForm.querySelector('button[type="submit"]');
      const orig = btn.innerHTML; btn.disabled = true; btn.innerHTML = '<span class="spinner"></span> Creating…';
      try {
        await window.LV_Auth.signUp(email, pass, name);
        // show pending screen
        if (loginWrap) loginWrap.style.display = "none";
        if (pendingWrap) pendingWrap.style.display = "block";
      } catch (e2) {
        const m = (e2.message || "").toLowerCase();
        if (m.includes("registered") || m.includes("already")) setErr("error", "⚠️ This email is already registered. Try logging in.");
        else setErr("error", "❌ " + (e2.message || "Could not sign up."));
      }
      btn.disabled = false; btn.innerHTML = orig;
    });
  }

  /* ---- Forgot password ---- */
  const forgot = document.getElementById("forgotLink");
  if (forgot) forgot.addEventListener("click", async (e) => {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value.trim();
    if (!email) return setErr("error", "Enter your email above first, then click 'Forgot your password?'.");
    try { await window.LV_Auth.resetPassword(email); setErr("success", "📧 Password reset email sent — check your inbox."); }
    catch (e2) { setErr("error", "Could not send reset email."); }
  });

  /* ---- Logout (both from portal and pending screen) ---- */
  function doLogout() {
    if (window.LV_Auth) window.LV_Auth.signOut();
    sessionStorage.removeItem("lv_portal_name");
    sessionStorage.removeItem("lv_portal_email");
    location.reload();
  }
  if (logoutBtn) logoutBtn.addEventListener("click", doLogout);
  const pendingLogout = document.getElementById("pendingLogout");
  if (pendingLogout) pendingLogout.addEventListener("click", doLogout);

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

  async function loadPortalConfig() {
    const token = window.LV_Auth && window.LV_Auth.accessToken();
    if (!token) return;
    try {
      const res = await fetch("/api/portal-config", {
        headers: { "Authorization": "Bearer " + token }
      });
      if (res.ok) {
        const data = await res.json();
        portalSessions = data.sessions || [];
      }
    } catch (e) { /* silent */ }
  }

  async function showPortal() {
    if (loginWrap) loginWrap.style.display = "none";
    if (main) main.style.display = "block";
    if (logoutBtn) logoutBtn.style.display = "inline-flex";
    const nm = sessionStorage.getItem("lv_portal_name");
    const greetEl = document.getElementById("portalGreeting");
    if (greetEl) greetEl.textContent = nm ? `Welcome back, ${nm.split(" ")[0]}! 👋` : "Welcome back! 👋";
    await loadPortalConfig();
    renderSessions();
    renderHomework();
    renderResource("presentationsList", "presentation", "🖼️ Open presentation", "Slideshow available", "Not ready yet");
    renderResource("miroList", "mindmap", "🧩 Open mind map", "Mind map available", "Not ready yet");
  }

  /* Generic renderer for a per-unit link list (presentations, miro, …) */
  function renderResource(containerId, field, btnLabel, readyText, pendingText) {
    const wrap = document.getElementById(containerId);
    if (!wrap) return;
    wrap.innerHTML = portalSessions.map(s => {
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
    wrap.innerHTML = portalSessions.map(s => {
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
    wrap.innerHTML = portalSessions.map(s => `
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
