/* =========================================================
   LingoVantage — Supabase Auth helper (email + password)
   Uses the Supabase Auth REST endpoints directly (no SDK),
   so it works on a static Netlify site with zero build step.

   Stores the session in localStorage so students stay logged
   in across page navigations.

   Approval flow:
   - On signup we ALSO create a row in "student_profiles"
     (approved = false). A student can authenticate but the
     portal only unlocks when approved = true (you flip it in
     the dashboard).
   ========================================================= */

window.LV_Auth = (function () {
  const SKEY = "lv_auth_session";
  function cfg() { return (window.LV_CONFIG || {}).supabase || {}; }
  function base() { return cfg().url + "/auth/v1"; }
  function rest() { return cfg().url + "/rest/v1"; }
  function apikey() { return cfg().anonKey; }

  function saveSession(s) { try { localStorage.setItem(SKEY, JSON.stringify(s)); } catch (e) {} }
  function getSession() { try { return JSON.parse(localStorage.getItem(SKEY) || "null"); } catch (e) { return null; } }
  function clearSession() { try { localStorage.removeItem(SKEY); } catch (e) {} }

  /* ---- Sign up (email + password) + create profile row ---- */
  async function signUp(email, password, fullName) {
    const res = await fetch(`${base()}/signup`, {
      method: "POST",
      headers: { "apikey": apikey(), "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, data: { full_name: fullName } })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.msg || data.error_description || data.error || "Sign up failed");

    // Create a profile row (approved = false). Uses the user id if returned.
    const uid = (data.user && data.user.id) || (data.id) || null;
    try {
      await fetch(`${rest()}/student_profiles`, {
        method: "POST",
        headers: {
          "apikey": apikey(), "Authorization": "Bearer " + apikey(),
          "Content-Type": "application/json", "Prefer": "return=minimal"
        },
        body: JSON.stringify({ id: uid, email: email, full_name: fullName, approved: false })
      });
    } catch (e) { console.warn("profile create skipped:", e); }

    return data;
  }

  /* ---- Log in ---- */
  async function signIn(email, password) {
    const res = await fetch(`${base()}/token?grant_type=password`, {
      method: "POST",
      headers: { "apikey": apikey(), "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.msg || data.error_description || data.error || "Login failed");
    saveSession(data);
    return data;
  }

  function signOut() { clearSession(); }

  /* ---- Current user (from stored session) ---- */
  function currentUser() {
    const s = getSession();
    return s && s.user ? s.user : null;
  }
  function accessToken() {
    const s = getSession();
    return s ? s.access_token : null;
  }

  /* ---- Look up this user's profile (approved flag, name) ---- */
  async function getProfile() {
    const u = currentUser();
    if (!u) return null;
    const res = await fetch(`${rest()}/student_profiles?id=eq.${u.id}&select=*`, {
      headers: { "apikey": apikey(), "Authorization": "Bearer " + (accessToken() || apikey()) }
    });
    if (!res.ok) return null;
    const rows = await res.json();
    return rows && rows.length ? rows[0] : null;
  }

  /* ---- Password reset email ---- */
  async function resetPassword(email) {
    const res = await fetch(`${base()}/recover`, {
      method: "POST",
      headers: { "apikey": apikey(), "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });
    if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.msg || "Could not send reset email"); }
    return true;
  }

  return { signUp, signIn, signOut, currentUser, accessToken, getProfile, resetPassword, getSession };
})();
