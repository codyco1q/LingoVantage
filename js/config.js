/* =========================================================
   LingoVantage — Global Config
   Non-secret settings only. Supabase credentials and student
   portal content are handled server-side via Cloudflare Pages
   Functions (see /api/portal-config, /api/supabase/*).
   ========================================================= */

(function () {

  window.LV_CONFIG = {
    /* ---- Contact / Social links ---- */
    whatsappGroup: "https://chat.whatsapp.com/LmqmGQjqEhmLnWrSYAQe7M",
    whatsappNumber: "201093567856",
    discordInvite: "https://discord.gg/5YaD3sXBNQ",

    /* ---- Admin notifications via Telegram Bot ---- */
    notify: {
      enabled: true
    }
  };

  /* Helper: is Supabase configured? (always true — handled server-side) */
  window.LV_supabaseReady = function () {
    return true;
  };
})();
