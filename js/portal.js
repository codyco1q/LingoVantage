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
  let portalRevisions = [];
  let a2Data = null;          // { sessions, units, revisions, hasTests, hasHomework }
  let accessLevels = ["A1"];  // levels the logged-in student may view
  let currentLevel = "A1";

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
      // Re-validate the stored session first: if the access token has expired
      // (they're only valid ~1h), refresh it so the portal content still loads.
      // If refresh fails, the session is cleared and the login screen is shown.
      await window.LV_Auth.ensureValidSession();
      if (window.LV_Auth.currentUser()) {
        await enterIfApproved(true);
      }
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
  function activateTab(tabName, btn) {
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));
    if (btn) btn.classList.add("active");
    const panel = document.getElementById(tabName);
    if (panel) panel.classList.add("active");
    refreshTabContent(tabName);
  }

  /* Re-render a tab's content for the selected level. Called both when a
     tab button is clicked and whenever the level is switched. */
  function refreshTabContent(tabName) {
    const isA2 = currentLevel === "A2";

    // Tests tab — A2 content not provided yet
    if (tabName === "tabTests") {
      const testsList = document.getElementById("testsList");
      const testsView = document.getElementById("testsView");
      const soon = document.getElementById("testsComingSoon");
      const intro = document.getElementById("testsIntro");
      if (isA2) {
        if (soon) soon.style.display = "block";
        if (testsList) testsList.style.display = "none";
        if (testsView) testsView.style.display = "none";
        if (intro) intro.textContent = "A2 tests will be available here soon.";
      } else {
        if (soon) soon.style.display = "none";
        if (testsList) testsList.style.display = "block";
        if (intro) intro.textContent = "Take a progress test after every 3 units, or the <b>final A1 exam</b> at the end. You can take each test <b>once</b>. Progress test results appear here instantly; your final exam result will be <b>delivered by your teacher</b>.";
        if (typeof window.LV_initTests === "function") window.LV_initTests();
      }
      return;
    }

    // Submit Homework tab — A2 content not provided yet
    if (tabName === "tabSubmit") {
      const hwList = document.getElementById("hwList");
      const hwView = document.getElementById("hwView");
      const soon = document.getElementById("hwComingSoon");
      if (isA2) {
        if (soon) soon.style.display = "block";
        if (hwList) hwList.style.display = "none";
        if (hwView) hwView.style.display = "none";
      } else {
        if (soon) soon.style.display = "none";
        if (hwList) hwList.style.display = "block";
        if (typeof window.LV_initHomework === "function") window.LV_initHomework();
      }
      return;
    }

    // Any other tab re-renders from the currently selected level's data
    if (tabName === "tabSessions") renderSessions();
    else if (tabName === "tabPresentations") renderResource("presentationsList", "presentation", "🖼️ Open presentation", "Slideshow available", "Not ready yet");
    else if (tabName === "tabMiro") renderResource("miroList", "mindmap", "🧩 Open mind map", "Mind map available", "Not ready yet");
    else if (tabName === "tabHomework") renderHomework();
    else if (tabName === "tabRevisions") renderRevisions();
  }

  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => activateTab(btn.dataset.tab, btn));
  });

  /* Level switcher (A1 / A2) — only A2 when granted by the teacher */
  const lvBtns = document.querySelectorAll(".level-btn");
  lvBtns.forEach(b => {
    b.addEventListener("click", () => {
      setLevel(b.dataset.level);
    });
  });

  function setLevel(level) {
    // A2 is only accessible when the teacher has granted it
    if (level === "A2" && !hasLevel("A2")) {
      const lockMsg = document.getElementById("a2LockMsg");
      if (lockMsg) lockMsg.style.display = "block";
      return;
    }
    currentLevel = level;
    lvBtns.forEach(b => b.classList.toggle("active", b.dataset.level === level));
    refreshLevelSwitchState();
    // Re-render the currently active tab for the new level
    const activeTab = document.querySelector(".tab-panel.active");
    if (activeTab) refreshTabContent(activeTab.id);
  }

  /* Show/hide the A2 lock message based on granted access */
  function refreshLevelSwitchState() {
    const lockMsg = document.getElementById("a2LockMsg");
    if (!lockMsg) return;
    lockMsg.style.display = (currentLevel === "A2" && !hasLevel("A2")) ? "block" : "none";
  }

  function hasLevel(level) {
    return accessLevels.indexOf(level) !== -1;
  }

  async function loadPortalConfig() {
    const token = window.LV_Auth && window.LV_Auth.accessToken();
    if (!token) return;
    let forceRefreshed = false;
    try {
      const res = await fetch("/api/portal-config", {
        headers: { "Authorization": "Bearer " + token }
      });
      if (res.ok) {
        var data = await res.json();
        portalSessions = data.sessions || [];
        portalRevisions = data.revisions || [];
        a2Data = data.a2 || null;
        if (Array.isArray(data.access) && data.access.length) accessLevels = data.access;
      } else if (res.status === 401 && !forceRefreshed) {
        // Token was rejected (expired/invalid) — force a refresh and retry once
        forceRefreshed = true;
        await window.LV_Auth.ensureValidSession(true);
        if (window.LV_Auth.currentUser()) return loadPortalConfig();
      } else {
        var errData = await res.json().catch(function() { return {}; });
        console.error("portal-config rejected:", res.status, errData);
      }
    } catch (e) { console.error("portal-config fetch error:", e); }
  }

  async function showPortal() {
    if (loginWrap) loginWrap.style.display = "none";
    if (main) main.style.display = "block";
    if (logoutBtn) logoutBtn.style.display = "inline-flex";
    const nm = sessionStorage.getItem("lv_portal_name");
    const greetEl = document.getElementById("portalGreeting");
    if (greetEl) greetEl.textContent = nm ? `Welcome back, ${nm.split(" ")[0]}! 👋` : "Welcome back! 👋";
    await loadPortalConfig();
    // Show the level switcher once we know access levels
    const switchEl = document.getElementById("levelSwitch");
    if (switchEl) switchEl.style.display = "flex";
    // Default to A1; disable A2 button unless granted
    const grantedA2 = hasLevel("A2");
    lvBtns.forEach(b => {
      b.classList.toggle("active", currentLevel === b.dataset.level);
      if (b.dataset.level === "A2" && !grantedA2) b.classList.add("locked");
    });
    renderSessions();
    renderRevisions();
    renderHomework();
    renderResource("presentationsList", "presentation", "🖼️ Open presentation", "Slideshow available", "Not ready yet");
    renderResource("miroList", "mindmap", "🧩 Open mind map", "Mind map available", "Not ready yet");
  }

  /* Generic renderer for a per-unit link list (presentations, miro, …) */
  function renderResource(containerId, field, btnLabel, readyText, pendingText) {
    const wrap = document.getElementById(containerId);
    if (!wrap) return;
    const data = isA2() ? ((a2Data && a2Data.units) || []) : portalSessions;
    wrap.innerHTML = data.map(s => {
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

  function isA2() { return currentLevel === "A2"; }
  function a2Sessions() { return (a2Data && a2Data.sessions) || []; }

  function renderSessions() {
    const wrap = document.getElementById("sessionsList");
    const data = isA2() ? a2Sessions() : portalSessions;
    wrap.innerHTML = data.map(s => {
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

  function renderRevisions() {
    const wrap = document.getElementById("revisionsList");
    if (!wrap) return;
    const data = isA2() ? ((a2Data && a2Data.revisions) || []) : portalRevisions;
    wrap.innerHTML = data.map(r => {
      const has = r.link && r.link.trim() !== "";
      const action = has
        ? `<a href="${r.link}" target="_blank" rel="noopener" class="btn btn-primary">✈️ Watch on Telegram</a>`
        : `<span class="soon-pill">Coming soon</span>`;
      return `
        <div class="session-row ${has ? "" : "pending"}">
          <div class="session-num">${r.unit}</div>
          <div class="session-info">
            <strong>${r.title}</strong>
            <span>${has ? "Revision session" : "Not ready yet"}</span>
          </div>
          <div class="session-action">${action}</div>
        </div>`;
    }).join("");
  }

  function renderHomework() {
    const wrap = document.getElementById("homeworkList");
    const data = isA2() ? ((a2Data && a2Data.units) || []) : portalSessions;
    wrap.innerHTML = data.map(s => `
      <div class="hw-row">
        <div class="session-num">${s.unit}</div>
        <div class="session-info">
          <strong>${s.title}</strong>
          <span>Homework</span>
        </div>
        <div class="hw-page">📖 Page <b>${s.homeworkPage || "—"}</b></div>
      </div>`).join("");
  }
});
