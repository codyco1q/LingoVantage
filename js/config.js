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
  // Discord server invite link
  discordInvite: "https://discord.gg/5YaD3sXBNQ",

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

  /* ---- Student Portal (current students area) ----
     Shared fixed credentials for all current students.
     Change these and re-share with your students any time. */
  studentPortal: {
    username: "student",
    password: "lingo2026",

    /* 12 units. For each unit add the link as it's ready.
       Leave a link as "" to show "Coming soon".
         recording    = session recording (Google Drive, etc.)
         presentation = Canva slideshow link
         miro         = Miro board link */
    sessions: [
      { unit: 1,  title: "Unit 1",  homeworkPage: 14,  recording: "https://drive.google.com/file/d/1d3T4hoiNN8Kv9K9elz-t2d8Hyx693cTR/view?usp=sharing", presentation: "https://canva.link/aoazz9v0qv200o6", miro: "https://miro.com/app/board/uXjVHIQXrMg=/?share_link_id=357044481221" },
      { unit: 2,  title: "Unit 2",  homeworkPage: 22,  recording: "https://drive.google.com/file/d/1FZe7eUOZlpdG6LgOU__-JW9SkLe8bjbC/view?usp=sharing", presentation: "https://canva.link/30qh10jgrca64d5", miro: "https://miro.com/app/board/uXjVHG7LkHM=/?share_link_id=142149045315" },
      { unit: 3,  title: "Unit 3",  homeworkPage: 30,  recording: "https://drive.google.com/file/d/1Qh1pH219cDVtddkTV-ot7Q0EkP9sIbm4/view?usp=sharing", presentation: "https://canva.link/kx582x524amccoz", miro: "https://miro.com/app/board/uXjVHE6SYc0=/?share_link_id=366901220545" },
      { unit: 4,  title: "Unit 4",  homeworkPage: 38,  recording: "https://drive.google.com/file/d/1mKtcWLVQkbCWjy10DxW83ikFBdolyzX5/view?usp=sharing", presentation: "https://canva.link/rwsl8v49xsz9vha", miro: "https://miro.com/app/board/uXjVHBzXdc8=/?share_link_id=557110337314" },
      { unit: 5,  title: "Unit 5",  homeworkPage: 46,  recording: "", presentation: "", miro: "" },
      { unit: 6,  title: "Unit 6",  homeworkPage: 54,  recording: "", presentation: "", miro: "" },
      { unit: 7,  title: "Unit 7",  homeworkPage: 62,  recording: "", presentation: "", miro: "" },
      { unit: 8,  title: "Unit 8",  homeworkPage: 70,  recording: "", presentation: "", miro: "" },
      { unit: 9,  title: "Unit 9",  homeworkPage: 78,  recording: "", presentation: "", miro: "" },
      { unit: 10, title: "Unit 10", homeworkPage: 86,  recording: "", presentation: "", miro: "" },
      { unit: 11, title: "Unit 11", homeworkPage: 94,  recording: "", presentation: "", miro: "" },
      { unit: 12, title: "Unit 12", homeworkPage: 102, recording: "", presentation: "", miro: "" }
    ]
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
