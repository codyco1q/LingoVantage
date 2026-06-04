/* =========================================================
   LingoVantage — Signup form logic
   - Validates fields
   - Prefills package from ?package= query param
   - Saves to Supabase table "students"
   - Sends an automatic Telegram notification to the admin
   - Also offers a WhatsApp message to the admin as backup
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("signupForm");
  if (!form) return;

  const cfg = window.LV_CONFIG || {};

  /* Prefill package from URL (?package=fluency|business) */
  const params = new URLSearchParams(location.search);
  const pkgParam = params.get("package");
  if (pkgParam) {
    const radio = form.querySelector(`input[name="package"][value="${pkgParam}"]`);
    if (radio) radio.checked = true;
  }

  /* Prefill current level from URL (?level=...) e.g. coming from the test */
  const levelParam = params.get("level");
  if (levelParam) {
    const sel = form.querySelector('select[name="current_level"]');
    if (sel) {
      const match = Array.from(sel.options).find(o => o.value === levelParam);
      if (match) sel.value = levelParam;
    }
  }

  const alertBox = document.getElementById("formAlert");
  const submitBtn = document.getElementById("submitBtn");
  const formCard = document.getElementById("formCard");
  const successScreen = document.getElementById("successScreen");

  function showAlert(type, msg) {
    alertBox.className = "alert show " + type;
    alertBox.innerHTML = msg;
  }
  function clearErrors() {
    form.querySelectorAll(".form-row.invalid").forEach(r => r.classList.remove("invalid"));
    alertBox.className = "alert";
  }
  function setError(name) {
    const field = form.querySelector(`[name="${name}"]`);
    if (field) field.closest(".form-row")?.classList.add("invalid");
  }

  function validate(data) {
    let ok = true;
    if (!data.full_name || data.full_name.trim().length < 2) { setError("full_name"); ok = false; }
    if (!data.age || data.age < 5 || data.age > 100) { setError("age"); ok = false; }
    if (!data.whatsapp || !/^[0-9+\s()-]{7,20}$/.test(data.whatsapp)) { setError("whatsapp"); ok = false; }
    if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) { setError("email"); ok = false; }
    if (!data.current_level) { setError("current_level"); ok = false; }
    if (!data.goal || data.goal.trim().length < 3) { setError("goal"); ok = false; }
    if (!data.package) { setError("package"); ok = false; }
    return ok;
  }

  /* Build a WhatsApp message to the admin number (backup button) */
  function buildWhatsAppMessage(d) {
    const pkgName = d.package === "business" ? "Business / باقة العمل" : "Fluency / باقة الطلاقة";
    const lines = [
      "🎓 *New LingoVantage Registration*",
      "",
      `👤 Name: ${d.full_name}`,
      `🎂 Age: ${d.age}`,
      `📱 WhatsApp: ${d.whatsapp}`,
      `📧 Email: ${d.email}`,
      `📊 Current level: ${d.current_level}`,
      `🎯 Goal: ${d.goal}`,
      `📦 Package: ${pkgName}`
    ];
    return encodeURIComponent(lines.join("\n"));
  }

  /* Send an AUTOMATIC notification to the admin via a Telegram bot.
     Fires silently in the background; never blocks the user. */
  async function notifyAdmin(d) {
    const n = cfg.notify || {};
    if (!n.enabled || !n.botToken || !n.chatId ||
        n.botToken === "YOUR_TELEGRAM_BOT_TOKEN" || n.chatId === "YOUR_TELEGRAM_CHAT_ID") return;

    const pkgName = d.package === "business" ? "Business / باقة العمل" : "Fluency / باقة الطلاقة";
    const text =
      `🎓 New LingoVantage Registration\n\n` +
      `👤 ${d.full_name}\n` +
      `🎂 Age: ${d.age}\n` +
      `📱 ${d.whatsapp}\n` +
      `📧 ${d.email}\n` +
      `📊 Level: ${d.current_level}\n` +
      `🎯 Goal: ${d.goal}\n` +
      `📦 ${pkgName}`;

    const url = `https://api.telegram.org/bot${n.botToken}/sendMessage`;
    try {
      await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: n.chatId, text: text, disable_web_page_preview: true })
      });
    } catch (err) {
      console.warn("Admin notification failed (non-blocking):", err);
    }
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearErrors();

    const fd = new FormData(form);
    const data = {
      full_name: (fd.get("full_name") || "").toString().trim(),
      age: parseInt(fd.get("age"), 10) || null,
      whatsapp: (fd.get("whatsapp") || "").toString().trim(),
      email: (fd.get("email") || "").toString().trim(),
      current_level: (fd.get("current_level") || "").toString(),
      goal: (fd.get("goal") || "").toString().trim(),
      package: (fd.get("package") || "").toString()
    };

    if (!validate(data)) {
      showAlert("error", "⚠️ Please fix the highlighted fields and try again.");
      return;
    }

    submitBtn.disabled = true;
    const originalBtn = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span class="spinner"></span> Submitting…';

    let savedToDB = false;

    /* 1) Try to save to Supabase */
    if (window.LV_Supabase && window.LV_Supabase.ready()) {
      try {
        await window.LV_Supabase.insert(cfg.supabase.table || "students", data);
        savedToDB = true;
      } catch (err) {
        console.error(err);
      }
    }

    /* 1.5) Fire an automatic Telegram notification to admin (non-blocking) */
    notifyAdmin(data);

    /* 2) Always prepare a WhatsApp message to admin as backup/confirmation */
    const waMsg = buildWhatsAppMessage(data);
    const waUrl = `https://wa.me/${cfg.whatsappNumber}?text=${waMsg}`;

    /* Show success screen */
    submitBtn.innerHTML = originalBtn;
    submitBtn.disabled = false;

    formCard.style.display = "none";
    successScreen.style.display = "block";

    const dbNote = savedToDB
      ? '<p style="color:var(--success);font-size:.9rem;margin-top:8px;">✓ Your registration was saved successfully.</p>'
      : '<p style="color:var(--warn);font-size:.9rem;margin-top:8px;">Tip: tap the button below to also send your details to us directly on WhatsApp.</p>';

    document.getElementById("successExtra").innerHTML = dbNote;
    document.getElementById("waConfirmBtn").href = waUrl;

    window.scrollTo({ top: 0, behavior: "smooth" });
  });
});