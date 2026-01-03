/* app.js — 2WolvesMock (FIXED)
   - Sets footer year
   - Lightbox opens ONLY from explicit triggers
   - No "Preview" default title
   - Won’t open if image src missing
*/

(() => {
  "use strict";

  // ---- Footer year ----
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // ---- Lightbox wiring ----
  const lightbox = document.getElementById("lightbox");
  const titleEl = document.getElementById("lightboxTitle");
  const imgEl = document.getElementById("lightboxImg");

  if (!lightbox || !titleEl || !imgEl) return;

  const isOpen = () => lightbox.getAttribute("aria-hidden") === "false";

  const open = (title, imgSrc) => {
    const src = (imgSrc || "").trim();
    if (!src) return; // ✅ don't open empty lightbox

    titleEl.textContent = (title || "").trim(); // ✅ no default "Preview"
    imgEl.src = src;
    imgEl.alt = titleEl.textContent || "";

    lightbox.setAttribute("aria-hidden", "false");
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
  };

  const close = () => {
    lightbox.setAttribute("aria-hidden", "true");
    imgEl.src = "";
    imgEl.alt = "";
    titleEl.textContent = "";

    document.documentElement.style.overflow = "";
    document.body.style.overflow = "";
  };

  // Open only from explicit triggers:
  // 1) Any element with [data-lightbox] attribute
  //    expects data-title + data-img on itself OR nearest .card
  // 2) Optional class ".card__btn" (if you already use that)
  document.addEventListener("click", (e) => {
    // Close handlers
    if (e.target.closest?.(".lightbox-close") || e.target.closest?.(".lightbox-backdrop")) {
      close();
      return;
    }

    // Don't hijack normal interactions
    if (e.target.closest?.("a, button, input, textarea, select, label")) {
      // Unless it's an explicit lightbox trigger
      if (!e.target.closest?.("[data-lightbox], .card__btn")) return;
    }

    const trigger = e.target.closest?.("[data-lightbox], .card__btn");
    if (!trigger) return;

    const card = trigger.closest?.(".card");
    const title =
      trigger.getAttribute?.("data-title") ||
      card?.dataset?.title ||
      "";
    const imgSrc =
      trigger.getAttribute?.("data-img") ||
      card?.dataset?.img ||
      "";

    open(title, imgSrc);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isOpen()) close();
  });
})();