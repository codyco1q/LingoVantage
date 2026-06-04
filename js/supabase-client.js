/* =========================================================
   LingoVantage — Supabase REST helper
   Uses the Supabase REST API directly (no SDK needed),
   so it works on a static Netlify site with zero build step.
   Configure your URL + anon key in js/config.js
   ========================================================= */

window.LV_Supabase = (function () {
  function cfg() { return (window.LV_CONFIG || {}).supabase || {}; }

  function headers() {
    const c = cfg();
    return {
      "apikey": c.anonKey,
      "Authorization": "Bearer " + c.anonKey,
      "Content-Type": "application/json",
      "Prefer": "return=representation"
    };
  }

  /* Insert a row into a table. Returns the inserted record(s). */
  async function insert(table, row) {
    const c = cfg();
    const res = await fetch(`${c.url}/rest/v1/${table}`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify(row)
    });
    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`Supabase insert failed (${res.status}): ${txt}`);
    }
    return res.json();
  }

  /* Select rows (optionally ordered). Used by the dashboard. */
  async function select(table, { order = "created_at.desc", limit = 500 } = {}) {
    const c = cfg();
    const url = `${c.url}/rest/v1/${table}?select=*&order=${order}&limit=${limit}`;
    const res = await fetch(url, { headers: headers() });
    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`Supabase select failed (${res.status}): ${txt}`);
    }
    return res.json();
  }

  return { insert, select, ready: () => window.LV_supabaseReady() };
})();
