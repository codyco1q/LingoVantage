/* Cloudflare Pages Function: /api/supabase-storage/*
   Proxies Supabase Storage requests server-side
   so the anon key is never exposed to the browser. */

export async function onRequest(context) {
  const { SUPABASE_URL, SUPABASE_ANON_KEY } = context.env;

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return new Response(JSON.stringify({ error: "Supabase not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  const subpath = Array.isArray(context.params.path) ? context.params.path.join("/") : context.params.path;
  const targetUrl = `${SUPABASE_URL}/storage/v1/object/${subpath}`;

  const headers = {
    "apikey": SUPABASE_ANON_KEY,
    "Authorization": "Bearer " + SUPABASE_ANON_KEY,
    "x-upsert": context.request.headers.get("x-upsert") || "true"
  };

  const ct = context.request.headers.get("Content-Type");
  if (ct) headers["Content-Type"] = ct;

  const init = { method: context.request.method, headers };
  if (context.request.method !== "GET" && context.request.method !== "HEAD") {
    init.body = context.request.body;
  }

  try {
    const res = await fetch(targetUrl, init);
    const body = await res.text();

    if (!res.ok) {
      return new Response(body, {
        status: res.status,
        headers: { "Content-Type": res.headers.get("Content-Type") || "application/json" }
      });
    }

    const firstSlash = subpath.indexOf("/");
    const bucket = firstSlash === -1 ? subpath : subpath.substring(0, firstSlash);
    const filePath = firstSlash === -1 ? "" : subpath.substring(firstSlash + 1);
    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${filePath}`;

    return new Response(JSON.stringify({ publicUrl }), {
      status: res.status,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 502,
      headers: { "Content-Type": "application/json" }
    });
  }
}
