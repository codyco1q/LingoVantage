/* =========================================================
   LingoVantage — Supabase REST helper
   All Supabase calls go through server-side Cloudflare
   Pages Functions so the API key is never exposed.
   ========================================================= */

window.LV_Supabase = (function () {

  function headers(contentType) {
    return {
      "Content-Type": contentType || "application/json",
      "Prefer": "return=representation"
    };
  }

  /* Insert a row into a table. Returns the inserted record(s). */
  async function insert(table, row) {
    const res = await fetch("/api/supabase/" + table, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify(row)
    });
    if (!res.ok) {
      const txt = await res.text();
      throw new Error("Insert failed (" + res.status + "): " + txt);
    }
    return res.json();
  }

  /* Select rows (optionally ordered). Used by the dashboard. */
  async function select(table, opts) {
    opts = opts || {};
    var order = opts.order || "created_at.desc";
    var limit = opts.limit || 500;
    var url = "/api/supabase/" + table + "?select=*&order=" + order + "&limit=" + limit;
    var res = await fetch(url, { headers: headers() });
    if (!res.ok) {
      var txt = await res.text();
      throw new Error("Select failed (" + res.status + "): " + txt);
    }
    return res.json();
  }

  /* Select rows matching a raw PostgREST filter string,
     e.g. selectWhere("test_results", "ip=eq.1.2.3.4&test_id=eq.units-1-3") */
  async function selectWhere(table, filter, opts) {
    opts = opts || {};
    var order = opts.order || "created_at.desc";
    var limit = opts.limit || 100;
    var url = "/api/supabase/" + table + "?select=*&" + filter + "&order=" + order + "&limit=" + limit;
    var res = await fetch(url, { headers: headers() });
    if (!res.ok) {
      var txt = await res.text();
      throw new Error("SelectWhere failed (" + res.status + "): " + txt);
    }
    return res.json();
  }

  /* Upload a file (Blob) to a Storage bucket. Returns the public URL.
     Requires the bucket to be PUBLIC (see README). */
  async function uploadFile(bucket, path, blob, contentType) {
    var res = await fetch("/api/supabase-storage/" + bucket + "/" + encodeURIComponent(path), {
      method: "POST",
      headers: {
        "Content-Type": contentType || "application/octet-stream",
        "x-upsert": "true"
      },
      body: blob
    });
    if (!res.ok) {
      var txt = await res.text();
      throw new Error("Upload failed (" + res.status + "): " + txt);
    }
    var data = await res.json();
    return data.publicUrl;
  }

  /* Update rows matching a PostgREST filter. Returns updated record(s).
     e.g. update("student_profiles", "id=eq.<uuid>", { approved: true }) */
  async function update(table, filter, patch) {
    var res = await fetch("/api/supabase/" + table + "?" + filter, {
      method: "PATCH",
      headers: headers(),
      body: JSON.stringify(patch)
    });
    if (!res.ok) {
      var txt = await res.text();
      throw new Error("Update failed (" + res.status + "): " + txt);
    }
    return res.json();
  }

  /* Delete rows matching a PostgREST filter.
     e.g. remove("test_results", "id=eq.<uuid>") */
  async function remove(table, filter) {
    var res = await fetch("/api/supabase/" + table + "?" + filter, {
      method: "DELETE",
      headers: { "Prefer": "return=minimal" }
    });
    if (!res.ok && res.status !== 204 && res.status !== 404) {
      var txt = await res.text();
      throw new Error("Delete failed (" + res.status + "): " + txt);
    }
    return true;
  }

  return { insert: insert, select: select, selectWhere: selectWhere, uploadFile: uploadFile, update: update, remove: remove, ready: function () { return true; } };
})();
