/* Cloudflare Pages Function: POST /api/auth
   Validates the admin dashboard password server-side.
   Expects JSON body: { password }
   Returns { ok: true } or { ok: false }. */

export async function onRequestPost(context) {
  const { DASHBOARD_PASSWORD } = context.env;

  if (!DASHBOARD_PASSWORD) {
    return new Response(JSON.stringify({ ok: false, error: "Password not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  let data;
  try {
    data = await context.request.json();
  } catch {
    return new Response(JSON.stringify({ ok: false, error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }

  if (data.password === DASHBOARD_PASSWORD) {
    return new Response(JSON.stringify({ ok: true }), {
      headers: { "Content-Type": "application/json" }
    });
  }

  return new Response(JSON.stringify({ ok: false }), {
    status: 401,
    headers: { "Content-Type": "application/json" }
  });
}
