/* Cloudflare Pages Function: GET /api/portal-config
   Returns student portal session data (recordings, presentations, mindmaps)
   only after verifying the user's Supabase auth token and approved status. */

export async function onRequestGet(context) {
  const { SUPABASE_URL, SUPABASE_ANON_KEY, DASHBOARD_PASSWORD } = context.env;

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return new Response(JSON.stringify({ error: "Supabase not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  const authHeader = context.request.headers.get("Authorization") || "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  if (!token) {
    return new Response(JSON.stringify({ error: "No auth token" }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const userRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: { "Authorization": `Bearer ${token}`, "apikey": SUPABASE_ANON_KEY }
    });
    if (!userRes.ok) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    const user = await userRes.json();

    let profiles = [];
    let selectFields = "approved,access_levels,full_name";
    let profileRes = await fetch(
      `${SUPABASE_URL}/rest/v1/student_profiles?id=eq.${user.id}&select=${selectFields}&limit=1`,
      { headers: { "apikey": SUPABASE_ANON_KEY, "Authorization": `Bearer ${SUPABASE_ANON_KEY}`, "Prefer": "return=representation" } }
    );

    // If the access_levels column hasn't been added to the DB yet (older schema),
    // retry without it so the portal keeps working (A1 stays available).
    if (profileRes.status === 400 || profileRes.status === 422) {
      selectFields = "approved,full_name";
      profileRes = await fetch(
        `${SUPABASE_URL}/rest/v1/student_profiles?id=eq.${user.id}&select=${selectFields}&limit=1`,
        { headers: { "apikey": SUPABASE_ANON_KEY, "Authorization": `Bearer ${SUPABASE_ANON_KEY}`, "Prefer": "return=representation" } }
      );
    }
    if (!profileRes.ok) {
      return new Response(JSON.stringify({ error: "Could not load profile" }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
    profiles = await profileRes.json();
    if (!profiles.length || profiles[0].approved !== true) {
      return new Response(JSON.stringify({ error: "Not approved" }), {
        status: 403,
        headers: { "Content-Type": "application/json" }
      });
    }
    const profile = profiles[0];
    const accessLevels = Array.isArray(profile.access_levels) && profile.access_levels.length
      ? profile.access_levels
      : ["A1"];

    const sessions = [
      { unit: 1,  title: "Unit 1",  homeworkPage: 14,  recording: "https://t.me/c/4428371838/4", presentation: "https://canva.link/aoazz9v0qv200o6", mindmap: "https://notebooklm.google.com/notebook/86ef7e63-0606-44ac-b4a6-635b7e7def32/artifact/58d8eef5-57f5-4a3a-86e2-50d815a9058f?utm_source=nlm_web_share&utm_medium=google_oo&utm_campaign=art_share_1&utm_content=&utm_smc=nlm_web_share_google_oo_art_share_1_" },
      { unit: 2,  title: "Unit 2",  homeworkPage: 22,  recording: "https://t.me/c/4428371838/6", presentation: "https://canva.link/30qh10jgrca64d5", mindmap: "https://notebooklm.google.com/notebook/86ef7e63-0606-44ac-b4a6-635b7e7def32/artifact/17268c82-010b-4c7a-a52b-64cf77c30fa9?utm_source=nlm_web_share&utm_medium=google_oo&utm_campaign=art_share_1&utm_content=&utm_smc=nlm_web_share_google_oo_art_share_1_" },
      { unit: 3,  title: "Unit 3",  homeworkPage: 30,  recording: "https://t.me/c/4428371838/8", presentation: "https://canva.link/kx582x524amccoz", mindmap: "https://notebooklm.google.com/notebook/86ef7e63-0606-44ac-b4a6-635b7e7def32/artifact/871477c9-a045-4735-ba69-9f7407c943cb?utm_source=nlm_web_share&utm_medium=google_oo&utm_campaign=art_share_1&utm_content=&utm_smc=nlm_web_share_google_oo_art_share_1_" },
      { unit: 4,  title: "Unit 4",  homeworkPage: 38,  recording: "https://t.me/c/4428371838/9", presentation: "https://canva.link/rwsl8v49xsz9vha", mindmap: "https://notebooklm.google.com/notebook/86ef7e63-0606-44ac-b4a6-635b7e7def32/artifact/1d947df0-778d-43dc-a5bd-156699ff8954?utm_source=nlm_web_share&utm_medium=google_oo&utm_campaign=art_share_1&utm_content=&utm_smc=nlm_web_share_google_oo_art_share_1_" },
      { unit: 5,  title: "Unit 5",  homeworkPage: 46,  recording: "https://t.me/c/4428371838/10", presentation: "https://canva.link/n5wpabu5p9g4mqp", mindmap: "https://notebooklm.google.com/notebook/86ef7e63-0606-44ac-b4a6-635b7e7def32/artifact/bfaef4be-4017-4413-9b22-2e7354708b20?utm_source=nlm_web_share&utm_medium=google_oo&utm_campaign=art_share_1&utm_content=&utm_smc=nlm_web_share_google_oo_art_share_1_" },
      { unit: 6,  title: "Unit 6",  homeworkPage: 54,  recording: "https://t.me/c/4428371838/11", presentation: "https://canva.link/lxy7cxayec8ggv7", mindmap: "https://notebooklm.google.com/notebook/86ef7e63-0606-44ac-b4a6-635b7e7def32/artifact/dbe51f40-c2b0-4b98-a48d-7409745809f2?utm_source=nlm_web_share&utm_medium=google_oo&utm_campaign=art_share_1&utm_content=&utm_smc=nlm_web_share_google_oo_art_share_1_" },
      { unit: 7,  title: "Unit 7",  homeworkPage: 62,  recording: "https://t.me/c/4428371838/13", presentation: "https://canva.link/6dvi5mlm01cqa0c", mindmap: "https://notebooklm.google.com/notebook/86ef7e63-0606-44ac-b4a6-635b7e7def32/artifact/052c7e63-889a-4e4d-9e21-805eac70de16?utm_source=nlm_web_share&utm_medium=google_oo&utm_campaign=art_share_1&utm_content=&utm_smc=nlm_web_share_google_oo_art_share_1_" },
      { unit: 8,  title: "Unit 8",  homeworkPage: 70,  recording: "https://t.me/c/4428371838/14", presentation: "https://canva.link/rr1amv20zpz3zs5", mindmap: "https://notebooklm.google.com/notebook/86ef7e63-0606-44ac-b4a6-635b7e7def32/artifact/ba904976-00c3-4a2a-b3fa-6b4daf0d14f4?utm_source=nlm_web_share&utm_medium=google_oo&utm_campaign=art_share_1&utm_content=&utm_smc=nlm_web_share_google_oo_art_share_1_" },
      { unit: 9,  title: "Unit 9",  homeworkPage: 78,  recording: "https://t.me/c/4428371838/15", presentation: "https://canva.link/c7m2f33w5ir1s8u", mindmap: "https://notebooklm.google.com/notebook/86ef7e63-0606-44ac-b4a6-635b7e7def32/artifact/0a30dc6d-2962-4a8e-a3b2-cbc109229da1?utm_source=nlm_web_share&utm_medium=google_oo&utm_campaign=art_share_1&utm_content=&utm_smc=nlm_web_share_google_oo_art_share_1_" },
      { unit: 10, title: "Unit 10", homeworkPage: 86,  recording: "https://t.me/c/4428371838/16", presentation: "https://canva.link/22f988kxxb6pqhv", mindmap: "https://notebooklm.google.com/notebook/86ef7e63-0606-44ac-b4a6-635b7e7def32/artifact/2b1c106a-8359-42a7-ba9b-e82745c7ff15?utm_source=nlm_web_share&utm_medium=google_oo&utm_campaign=art_share_1&utm_content=&utm_smc=nlm_web_share_google_oo_art_share_1_" },
      { unit: 11, title: "Unit 11", homeworkPage: 94,  recording: "https://t.me/c/4428371838/17", presentation: "https://canva.link/kxtkqlr4qbcgy6l", mindmap: "https://notebooklm.google.com/notebook/86ef7e63-0606-44ac-b4a6-635b7e7def32/artifact/4b8c18b9-1e67-4f91-9d24-7d941b8090ad?utm_source=nlm_web_share&utm_medium=google_oo&utm_campaign=art_share_1&utm_content=&utm_smc=nlm_web_share_google_oo_art_share_1_" },
      { unit: 12, title: "Unit 12", homeworkPage: 102, recording: "https://t.me/c/4428371838/18", presentation: "https://canva.link/ht1sqdafrtoy3fm", mindmap: "https://notebooklm.google.com/notebook/86ef7e63-0606-44ac-b4a6-635b7e7def32/artifact/5de465b0-57be-4895-ad39-84a668636d4d?utm_source=nlm_web_share&utm_medium=google_oo&utm_campaign=art_share_1&utm_content=&utm_smc=nlm_web_share_google_oo_art_share_1_" }
    ];

    const revisions = [
      { unit: 1, title: "Revision Session 1", link: "https://t.me/c/4428371838/19" },
      { unit: 2, title: "Revision Session 2", link: "https://t.me/c/4428371838/20" },
      { unit: 3, title: "Revision Session 3", link: "https://t.me/c/4428371838/21" }
    ];

    /* ============================================================
       NEXT LEVEL — A2
       - 24 session recordings (Sessions tab)
      - 24 session resources (Presentations · Mind Maps tabs)
      - 12 units/levels (Homework tab)
      Sessions 1–6 are available; the remaining sessions are placeholders.
       ============================================================ */
    const a2Sessions = Array.from({ length: 24 }, (_, i) => {
      const n = i + 1;
      return { unit: n, title: "Session " + n, homeworkPage: 0, recording: "", presentation: "", mindmap: "" };
    });

    a2Sessions[0].recording = "https://t.me/c/4299575479/3";
    a2Sessions[1].recording = "https://t.me/c/4299575479/4";
    a2Sessions[2].recording = "https://t.me/c/4299575479/5";
    a2Sessions[3].recording = "https://t.me/c/4299575479/6";
    a2Sessions[4].recording = "https://t.me/c/4299575479/7";
    a2Sessions[5].recording = "https://t.me/c/4299575479/8";

    a2Sessions[0].presentation = "https://notebook.google.com/notebook/86ef7e63-0606-44ac-b4a6-635b7e7def32/artifact/9288bb99-578c-4720-a710-8354cfd99ea6?utm_source=nlm_web_share&utm_medium=google_oo&utm_campaign=art_share_1&utm_content=&utm_smc=nlm_web_share_google_oo_art_share_1_";
    a2Sessions[0].mindmap = "https://notebook.google.com/notebook/86ef7e63-0606-44ac-b4a6-635b7e7def32/artifact/c19da8ee-9c3c-48a4-8930-a62e7806dbfc?utm_source=nlm_web_share&utm_medium=google_oo&utm_campaign=art_share_1&utm_content=&utm_smc=nlm_web_share_google_oo_art_share_1_";
    a2Sessions[1].presentation = "https://notebook.google.com/notebook/86ef7e63-0606-44ac-b4a6-635b7e7def32/artifact/e3c78c95-7e27-4542-9b2e-6337ffbbb56a?utm_source=nlm_web_share&utm_medium=google_oo&utm_campaign=art_share_1&utm_content=&utm_smc=nlm_web_share_google_oo_art_share_1_";
    a2Sessions[1].mindmap = "https://notebook.google.com/notebook/86ef7e63-0606-44ac-b4a6-635b7e7def32/artifact/efe978af-c28d-48da-9792-287fb65cd5d2?utm_source=nlm_web_share&utm_medium=google_oo&utm_campaign=art_share_1&utm_content=&utm_smc=nlm_web_share_google_oo_art_share_1_";
    a2Sessions[2].presentation = "https://notebook.google.com/notebook/86ef7e63-0606-44ac-b4a6-635b7e7def32/artifact/95a94dbe-8fb0-4439-a105-632cfc85ad35?utm_source=nlm_web_share&utm_medium=google_oo&utm_campaign=art_share_1&utm_content=&utm_smc=nlm_web_share_google_oo_art_share_1_";
    a2Sessions[2].mindmap = "https://notebook.google.com/notebook/86ef7e63-0606-44ac-b4a6-635b7e7def32/artifact/24cd89c4-3e8c-43e5-87cc-ce3b4ee80473?utm_source=nlm_web_share&utm_medium=google_oo&utm_campaign=art_share_1&utm_content=&utm_smc=nlm_web_share_google_oo_art_share_1_";
    a2Sessions[3].presentation = "https://notebook.google.com/notebook/86ef7e63-0606-44ac-b4a6-635b7e7def32/artifact/8bdb06f0-bb6d-4f7a-9cec-884a1c10d3fb?utm_source=nlm_web_share&utm_medium=google_oo&utm_campaign=art_share_1&utm_content=&utm_smc=nlm_web_share_google_oo_art_share_1_";
    a2Sessions[3].mindmap = "https://notebook.google.com/notebook/86ef7e63-0606-44ac-b4a6-635b7e7def32/artifact/031d8679-018c-438e-b38b-94c1dde77dcd?utm_source=nlm_web_share&utm_medium=google_oo&utm_campaign=art_share_1&utm_content=&utm_smc=nlm_web_share_google_oo_art_share_1_";
    a2Sessions[4].presentation = "https://notebook.google.com/notebook/86ef7e63-0606-44ac-b4a6-635b7e7def32/artifact/6848d3d0-f63c-4a0c-86d0-7fd3d5ff50af?utm_source=nlm_web_share&utm_medium=google_oo&utm_campaign=art_share_1&utm_content=&utm_smc=nlm_web_share_google_oo_art_share_1_";
    a2Sessions[4].mindmap = "https://notebook.google.com/notebook/86ef7e63-0606-44ac-b4a6-635b7e7def32/artifact/12b1cbbf-2d19-4c4c-ba2a-6f91fa68262b?utm_source=nlm_web_share&utm_medium=google_oo&utm_campaign=art_share_1&utm_content=&utm_smc=nlm_web_share_google_oo_art_share_1_";
    a2Sessions[5].presentation = "https://notebook.google.com/notebook/86ef7e63-0606-44ac-b4a6-635b7e7def32/artifact/75bfcde6-fc6d-4cfa-8746-2a171d40dedf?utm_source=nlm_web_share&utm_medium=google_oo&utm_campaign=art_share_1&utm_content=&utm_smc=nlm_web_share_google_oo_art_share_1_";
    a2Sessions[5].mindmap = "https://notebook.google.com/notebook/86ef7e63-0606-44ac-b4a6-635b7e7def32/artifact/0427f739-92c2-4cdd-8431-fdb71770e884?utm_source=nlm_web_share&utm_medium=google_oo&utm_campaign=art_share_1&utm_content=&utm_smc=nlm_web_share_google_oo_art_share_1_";

    const homeworkPages = [18, 28, 38, 48, 58, 68, 78, 88, 98, 108, 118, 128];
    const a2Units = Array.from({ length: 12 }, (_, i) => {
      const n = i + 1;
      return { unit: n, title: "Unit " + n, homeworkPage: homeworkPages[i], presentation: "", mindmap: "" };
    });

    const a2Revisions = Array.from({ length: 3 }, (_, i) => {
      return { unit: i + 1, title: "A2 Revision Session " + (i + 1), link: "" };
    });

    const a2 = {
      sessions: a2Sessions,   // 24 sessions
      units: a2Units,         // 12 levels
      revisions: a2Revisions,
      telegramChannel: "https://t.me/+pXja5Af9U5gzYWQ0",
      // A2 Tests are not provided yet; Sessions 1–6 homework are available.
      hasTests: false,
      hasHomework: true
    };

    return new Response(JSON.stringify({ sessions, revisions, access: accessLevels, a2 }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
