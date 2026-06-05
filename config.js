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
  discordInvite: "#",

  /* ---- Admin notifications via Telegram Bot ----
     Get an instant Telegram message every time a student registers.
     ONE-TIME SETUP (takes ~2 minutes):
       1. In Telegram, search for "@BotFather", press Start.
       2. Send /newbot, give it a name + username. BotFather replies
          with a TOKEN like 123456789:ABCdefGhIJKlmNoPQRstuVWxyz.
          Paste it as botToken below.
       3. Send any message to YOUR new bot (search its username, press Start, say "hi").
       4. Open this URL in a browser (replace <TOKEN>):
            https://api.telegram.org/bot<TOKEN>/getUpdates
          Find  "chat":{"id": 123456789 ...  -> that number is your chatId.
       5. Paste botToken + chatId below and set enabled: true.
     Docs: https://core.telegram.org/bots#how-do-i-create-a-bot */
  notify: {
    enabled: true,
    botToken: "8767687425:AAGpnfAmloO9hgRzdbAk01agWaL9xdXZIMU",
    chatId: "6212386995"  // your numeric chat id (or a group id)
  },

  /* ---- Supabase ----
     Get these from: Supabase Dashboard > Project Settings > API
     anonKey is safe to expose on the frontend (public key). */
  supabase: {
    url: "https://vmfutaaflitvysazbqsl.supabase.co",
    anonKey: "sb_publishable_SCm0cqzWOdi1ez_3fff61w_Z8b7I5E-",
    table: "students"                  // your table name
  },

  /* ---- Simple dashboard password (frontend gate only) ----
     For real security use Supabase Auth + RLS. This is a light gate. */
  dashboardPassword: "lingo2026",

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
