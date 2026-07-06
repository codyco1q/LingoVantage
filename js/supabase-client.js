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

  /* Select rows matching a raw PostgREST filter string,
     e.g. selectWhere("test_results", "ip=eq.1.2.3.4&test_id=eq.units-1-3") */
  async function selectWhere(table, filter, { order = "created_at.desc", limit = 100 } = {}) {
    const c = cfg();
    const url = `${c.url}/rest/v1/${table}?select=*&${filter}&order=${order}&limit=${limit}`;
    const res = await fetch(url, { headers: headers() });
    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`Supabase selectWhere failed (${res.status}): ${txt}`);
    }
    return res.json();
  }

  /* Upload a file (Blob) to a Storage bucket. Returns the public URL.
     Requires the bucket to be PUBLIC (see README). */
  async function uploadFile(bucket, path, blob, contentType) {
    const c = cfg();
    const res = await fetch(`${c.url}/storage/v1/object/${bucket}/${encodeURIComponent(path)}`, {
      method: "POST",
      headers: {
        "apikey": c.anonKey,
        "Authorization": "Bearer " + c.anonKey,
        "Content-Type": contentType || "application/octet-stream",
        "x-upsert": "true"
      },
      body: blob
    });
    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`Supabase upload failed (${res.status}): ${txt}`);
    }
    return `${c.url}/storage/v1/object/public/${bucket}/${encodeURIComponent(path)}`;
  }

  /* Update rows matching a PostgREST filter. Returns updated record(s).
     e.g. update("student_profiles", "id=eq.<uuid>", { approved: true }) */
  async function update(table, filter, patch) {
    const c = cfg();
    const res = await fetch(`${c.url}/rest/v1/${table}?${filter}`, {
      method: "PATCH",
      headers: headers(),
      body: JSON.stringify(patch)
    });
    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`Supabase update failed (${res.status}): ${txt}`);
    }
    return res.json();
  }

  return { insert, select, selectWhere, uploadFile, update, ready: () => window.LV_supabaseReady() };
})();
