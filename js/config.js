/* =========================================================
   LingoVantage — Global Config
   Edit the values here to change links / Supabase keys
   in ONE place. Loaded on every page before other scripts.
   ========================================================= */

window.LV_CONFIG = {
  brand: "LingoVantage",

  /* ---- Contact / Social links ---- */
  whatsappGroup: "https://chat.whatsapp.com/LmqmGQjqEhmLnWrSYAQe7M",
  // Your personal WhatsApp number (international format, no + or spaces) used for direct messages
  whatsappNumber: "201093567856",
  // TODO: paste your Discord invite link here when ready
  discordInvite: "https://discord.gg/5YaD3sXBNQ",

  /* ---- Admin notifications via Telegram Bot ---- */
  notify: {
    enabled: true,
    botToken: "8767687425:AAGpnfAmloO9hgRzdbAk01agWaL9xdXZIMU",
    chatId: "6212386995"  // your numeric chat id (or a group id)
  },

  /* ---- Supabase ---- */
  supabase: {
    url: "https://vmfutaaflitvysazbqsl.supabase.co",
    anonKey: "sb_publishable_SCm0cqzWOdi1ez_3fff61w_Z8b7I5E-",
    table: "students"                  // your table name
  },

  /* ---- Simple dashboard password (frontend gate only) ---- */
  dashboardPassword: "lingo2026",

  /* ---- Assessment test access (username + password gate) ---- */
  assessmentAuth: {
    username: "test_user",
    password: "testme123%"
  },

  /* ---- Packages shown on signup + pricing ---- */
  packages: [
    { id: "fluency", name: "Fluency / باقة الطلاقة", desc: "Everyday speaking confidence" },
    { id: "business", name: "Business / باقة العمل", desc: "Professional & workplace English" }
  ]
};

/* Helper: is Supabase configured? */
window.LV_supabaseReady = function () {
  const s = window.LV_CONFIG.supabase;
  return s.url && s.url !== "YOUR_SUPABASE_URL" && s.anonKey && s.anonKey !== "YOUR_SUPABASE_ANON_KEY";
};