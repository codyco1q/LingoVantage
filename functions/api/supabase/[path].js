/* Cloudflare Pages Function: /api/supabase/*
   Proxies all Supabase PostgREST requests server-side
   so the anon key is never exposed to the browser. */

export async function onRequest(context) {
  const { SUPABASE_URL, SUPABASE_ANON_KEY } = context.env;

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return new Response(JSON.stringify({ error: "Supabase not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  const subpath = context.params.path;
  const reqUrl = new URL(context.request.url);
  const targetUrl = `${SUPABASE_URL}/rest/v1/${subpath}${reqUrl.search}`;

  const headers = {
    "apikey": SUPABASE_ANON_KEY,
    "Authorization": "Bearer " + SUPABASE_ANON_KEY,
    "Prefer": context.request.headers.get("Prefer") || "return=representation"
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
    return new Response(body, {
      status: res.status,
      headers: { "Content-Type": res.headers.get("Content-Type") || "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 502,
      headers: { "Content-Type": "application/json" }
    });
  }
}
