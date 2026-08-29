/* =========================================================
   LingoVantage — Supabase Auth helper (email + password)
   All Supabase Auth calls go through server-side Cloudflare
   Pages Functions so the API key is never exposed.

   Stores the session in localStorage so students stay logged
   in across page navigations.

   Approval flow:
   - On signup we ALSO create a row in "student_profiles"
     (approved = false). A student can authenticate but the
     portal only unlocks when approved = true (you flip it in
     the dashboard).
   ========================================================= */

window.LV_Auth = (function () {
  var SKEY = "lv_auth_session";

  function saveSession(s) { try { localStorage.setItem(SKEY, JSON.stringify(s)); } catch (e) {} }
  function getSession() { try { return JSON.parse(localStorage.getItem(SKEY) || "null"); } catch (e) { return null; } }
  function clearSession() { try { localStorage.removeItem(SKEY); } catch (e) {} }

  /* ---- Sign up (email + password) + create profile row ---- */
  async function signUp(email, password, fullName) {
    var res = await fetch("/api/supabase-auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email, password: password, data: { full_name: fullName } })
    });
    var data = await res.json();
    if (!res.ok) throw new Error(data.msg || data.error_description || data.error || "Sign up failed");

    var uid = (data.user && data.user.id) || data.id || null;
    try {
      await fetch("/api/supabase/student_profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Prefer": "return=minimal" },
        body: JSON.stringify({ id: uid, email: email, full_name: fullName, approved: false, access_levels: ["A1"] })
      });
    } catch (e) { console.warn("profile create skipped:", e); }

    return data;
  }

  /* ---- Log in ---- */
  async function signIn(email, password) {
    var res = await fetch("/api/supabase-auth/token?grant_type=password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email, password: password })
    });
    var data = await res.json();
    if (!res.ok) throw new Error(data.msg || data.error_description || data.error || "Login failed");
    saveSession(data);
    return data;
  }

  function signOut() { clearSession(); }

  /* ---- Current user (from stored session) ---- */
  function currentUser() {
    var s = getSession();
    return s && s.user ? s.user : null;
  }
  function accessToken() {
    var s = getSession();
    return s ? s.access_token : null;
  }

  /* ---- Look up this user's profile (approved flag, name) ---- */
  async function getProfile() {
    var u = currentUser();
    if (!u) return null;
    var res = await fetch("/api/supabase/student_profiles?id=eq." + u.id + "&select=*", {
      headers: { "Prefer": "return=representation" }
    });
    if (!res.ok) return null;
    var rows = await res.json();
    return rows && rows.length ? rows[0] : null;
  }

  /* ---- Password reset email ---- */
  async function resetPassword(email) {
    var res = await fetch("/api/supabase-auth/recover", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email })
    });
    if (!res.ok) { var d = await res.json().catch(function () { return {}; }); throw new Error(d.msg || "Could not send reset email"); }
    return true;
  }

  return { signUp: signUp, signIn: signIn, signOut: signOut, currentUser: currentUser, accessToken: accessToken, getProfile: getProfile, resetPassword: resetPassword, getSession: getSession };
})();
