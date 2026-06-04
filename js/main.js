/* =========================================================
   LingoVantage — Shared UI logic
   - Navbar (sticky, mobile toggle, active link)
   - FAQ accordion
   - Pricing billing toggle
   - Scroll reveal animations
   - Footer link injection (WhatsApp / Discord)
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  initNavbar();
  initFAQ();
  initPricingToggle();
  initReveal();
  injectSocialLinks();
  setActiveNav();
});

/* ---------- Navbar ---------- */
function initNavbar() {
  const nav = document.querySelector(".nav");
  const toggle = document.querySelector(".nav-toggle");
  const links = document.querySelector(".nav-links");

  if (nav) {
    const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  if (toggle && links) {
    toggle.addEventListener("click", () => links.classList.toggle("open"));
    links.querySelectorAll("a").forEach(a =>
      a.addEventListener("click", () => links.classList.remove("open"))
    );
  }
}

/* Highlight current page in nav */
function setActiveNav() {
  const page = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  document.querySelectorAll(".nav-links a").forEach(a => {
    const href = (a.getAttribute("href") || "").toLowerCase();
    if (href === page || (page === "" && href === "index.html")) a.classList.add("active");
  });
}

/* ---------- FAQ accordion ---------- */
function initFAQ() {
  document.querySelectorAll(".faq-item").forEach(item => {
    const q = item.querySelector(".faq-q");
    const a = item.querySelector(".faq-a");
    if (!q || !a) return;
    q.addEventListener("click", () => {
      const open = item.classList.contains("open");
      // close others
      document.querySelectorAll(".faq-item.open").forEach(o => {
        o.classList.remove("open");
        o.querySelector(".faq-a").style.maxHeight = null;
      });
      if (!open) {
        item.classList.add("open");
        a.style.maxHeight = a.scrollHeight + "px";
      }
    });
  });
}

/* ---------- Pricing billing toggle ---------- */
function initPricingToggle() {
  const sw = document.querySelector(".switch");
  if (!sw) return;
  sw.addEventListener("click", () => {
    sw.classList.toggle("on");
    const yearly = sw.classList.contains("on");
    document.querySelectorAll("[data-monthly]").forEach(el => {
      el.textContent = yearly ? el.dataset.yearly : el.dataset.monthly;
    });
    document.querySelectorAll("[data-old-monthly]").forEach(el => {
      el.textContent = yearly ? el.dataset.oldYearly : el.dataset.oldMonthly;
    });
    document.querySelectorAll(".bill-cycle").forEach(el => {
      el.textContent = yearly ? "/year" : "/month";
    });
  });
}

/* ---------- Scroll reveal ---------- */
function initReveal() {
  const els = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window) || !els.length) {
    els.forEach(e => e.classList.add("in"));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
    });
  }, { threshold: 0.12 });
  els.forEach(e => io.observe(e));
}

/* ---------- Inject social links from config ---------- */
function injectSocialLinks() {
  const cfg = window.LV_CONFIG || {};
  document.querySelectorAll("[data-link='whatsapp']").forEach(a => {
    if (cfg.whatsappGroup) a.href = cfg.whatsappGroup;
    a.target = "_blank"; a.rel = "noopener";
  });
  document.querySelectorAll("[data-link='discord']").forEach(a => {
    a.href = cfg.discordInvite || "#";
    if (cfg.discordInvite && cfg.discordInvite !== "#") { a.target = "_blank"; a.rel = "noopener"; }
    else a.addEventListener("click", e => { e.preventDefault(); alert("رابط سيرفر الديسكورد هيتضاف قريباً 🚀\nDiscord link coming soon!"); });
  });
}

/* Set current year in footer */
document.addEventListener("DOMContentLoaded", () => {
  const y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();
});
