/* Cloudflare Pages Function: POST /api/notify
   Proxies a Telegram bot message so the bot token
   stays server-side. Expects JSON body:
   { full_name, age, whatsapp, email, current_level, goal, package } */

export async function onRequestPost(context) {
  const { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } = context.env;

  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    return new Response(JSON.stringify({ ok: false, error: "Telegram not configured" }), {
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

  const pkgName = data.package === "business" ? "Business / باقة العمل" : "Fluency / باقة الطلاقة";
  const text =
    "🎓 New LingoVantage Registration\n\n" +
    "👤 " + (data.full_name || "") + "\n" +
    "🎂 Age: " + (data.age || "") + "\n" +
    "📱 " + (data.whatsapp || "") + "\n" +
    "📧 " + (data.email || "") + "\n" +
    "📊 Level: " + (data.current_level || "") + "\n" +
    "🎯 Goal: " + (data.goal || "") + "\n" +
    "📦 " + pkgName;

  try {
    const res = await fetch("https://api.telegram.org/bot" + TELEGRAM_BOT_TOKEN + "/sendMessage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: text, disable_web_page_preview: true })
    });

    if (!res.ok) {
      const err = await res.text();
      return new Response(JSON.stringify({ ok: false, error: err }), {
        status: 502,
        headers: { "Content-Type": "application/json" }
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
