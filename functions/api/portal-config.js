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

    const profileRes = await fetch(
      `${SUPABASE_URL}/rest/v1/student_profiles?id=eq.${user.id}&select=approved&limit=1`,
      { headers: { "apikey": SUPABASE_ANON_KEY, "Authorization": `Bearer ${SUPABASE_ANON_KEY}`, "Prefer": "return=representation" } }
    );
    if (!profileRes.ok) {
      return new Response(JSON.stringify({ error: "Could not load profile" }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
    const profiles = await profileRes.json();
    if (!profiles.length || profiles[0].approved !== true) {
      return new Response(JSON.stringify({ error: "Not approved" }), {
        status: 403,
        headers: { "Content-Type": "application/json" }
      });
    }

    const sessions = [
      { unit: 1,  title: "Unit 1",  homeworkPage: 14,  recording: "https://drive.google.com/file/d/1d3T4hoiNN8Kv9K9elz-t2d8Hyx693cTR/view?usp=sharing", presentation: "https://canva.link/aoazz9v0qv200o6", mindmap: "https://miro.com/app/board/uXjVHIQXrMg=/?share_link_id=357044481221" },
      { unit: 2,  title: "Unit 2",  homeworkPage: 22,  recording: "https://drive.google.com/file/d/1FZe7eUOZlpdG6LgOU__-JW9SkLe8bjbC/view?usp=sharing", presentation: "https://canva.link/30qh10jgrca64d5", mindmap: "https://miro.com/app/board/uXjVHG7LkHM=/?share_link_id=142149045315" },
      { unit: 3,  title: "Unit 3",  homeworkPage: 30,  recording: "https://drive.google.com/file/d/1Qh1pH219cDVtddkTV-ot7Q0EkP9sIbm4/view?usp=sharing", presentation: "https://canva.link/kx582x524amccoz", mindmap: "https://miro.com/app/board/uXjVHE6SYc0=/?share_link_id=366901220545" },
      { unit: 4,  title: "Unit 4",  homeworkPage: 38,  recording: "https://drive.google.com/file/d/1mKtcWLVQkbCWjy10DxW83ikFBdolyzX5/view?usp=sharing", presentation: "https://canva.link/rwsl8v49xsz9vha", mindmap: "https://miro.com/app/board/uXjVHBzXdc8=/?share_link_id=557110337314" },
      { unit: 5,  title: "Unit 5",  homeworkPage: 46,  recording: "https://drive.google.com/file/d/1eJCl-4fGqqk5tyIAhz9tpFbxreiXNr3V/view?usp=sharing", presentation: "https://canva.link/n5wpabu5p9g4mqp", mindmap: "https://miro.com/app/board/uXjVHAi0gZc=/?share_link_id=841858833574" },
      { unit: 6,  title: "Unit 6",  homeworkPage: 54,  recording: "https://drive.google.com/file/d/1ErJybEzg7GyYXBDbs5Un6dpV1eWIGtz7/view?usp=sharing", presentation: "https://canva.link/lxy7cxayec8ggv7", mindmap: "https://miro.com/app/board/uXjVH_HCllM=/?share_link_id=49946922519" },
      { unit: 7,  title: "Unit 7",  homeworkPage: 62,  recording: "https://drive.google.com/file/d/1uKUz-welyj_jEvLQtr3ALQUSC9t7sW72/view?usp=sharing", presentation: "https://canva.link/6dvi5mlm01cqa0c", mindmap: "https://notebooklm.google.com/notebook/86ef7e63-0606-44ac-b4a6-635b7e7def32/artifact/052c7e63-889a-4e4d-9e21-805eac70de16?utm_source=nlm_web_share&utm_medium=google_oo&utm_campaign=art_share_1&utm_content=&utm_smc=nlm_web_share_google_oo_art_share_1_" },
      { unit: 8,  title: "Unit 8",  homeworkPage: 70,  recording: "https://drive.google.com/file/d/13pHy9aRzzosvkLShAZGQvINo4WyBW8J7/view?usp=sharing", presentation: "https://canva.link/rr1amv20zpz3zs5", mindmap: "https://notebooklm.google.com/notebook/86ef7e63-0606-44ac-b4a6-635b7e7def32/artifact/ba904976-00c3-4a2a-b3fa-6b4daf0d14f4?utm_source=nlm_web_share&utm_medium=google_oo&utm_campaign=art_share_1&utm_content=&utm_smc=nlm_web_share_google_oo_art_share_1_" },
      { unit: 9,  title: "Unit 9",  homeworkPage: 78,  recording: "https://drive.google.com/file/d/1JTNHwwgPHPlCbTvyb8Qnm5sXIi5iyIu-/view?usp=sharing", presentation: "https://canva.link/c7m2f33w5ir1s8u", mindmap: "https://notebooklm.google.com/notebook/86ef7e63-0606-44ac-b4a6-635b7e7def32/artifact/0a30dc6d-2962-4a8e-a3b2-cbc109229da1?utm_source=nlm_web_share&utm_medium=google_oo&utm_campaign=art_share_1&utm_content=&utm_smc=nlm_web_share_google_oo_art_share_1_" },
      { unit: 10, title: "Unit 10", homeworkPage: 86,  recording: "https://drive.google.com/file/d/11B6o8hasRBx4G5Vv1tkaZAw1HSV0h7Qj/view?usp=sharing", presentation: "https://canva.link/22f988kxxb6pqhv", mindmap: "https://notebooklm.google.com/notebook/86ef7e63-0606-44ac-b4a6-635b7e7def32/artifact/2b1c106a-8359-42a7-ba9b-e82745c7ff15?utm_source=nlm_web_share&utm_medium=google_oo&utm_campaign=art_share_1&utm_content=&utm_smc=nlm_web_share_google_oo_art_share_1_" },
      { unit: 11, title: "Unit 11", homeworkPage: 94,  recording: "https://drive.google.com/file/d/1q7zjui-8UTqXNNruhJvlVUOJwAQc4O3S/view?usp=sharing", presentation: "https://canva.link/kxtkqlr4qbcgy6l", mindmap: "https://notebooklm.google.com/notebook/86ef7e63-0606-44ac-b4a6-635b7e7def32/artifact/4b8c18b9-1e67-4f91-9d24-7d941b8090ad?utm_source=nlm_web_share&utm_medium=google_oo&utm_campaign=art_share_1&utm_content=&utm_smc=nlm_web_share_google_oo_art_share_1_" },
      { unit: 12, title: "Unit 12", homeworkPage: 102, recording: "", presentation: "", mindmap: "" }
    ];

    return new Response(JSON.stringify({ sessions }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
