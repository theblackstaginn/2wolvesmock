/* app.js — 2WolvesMock (FINAL FIX)
   - Year
   - Lightbox open on .card click
   - Close on backdrop / X / Escape
   - Won’t open without image
   - Prevents “stuck” overlay on mobile
*/

(() => {
  "use strict";

  // ---- Footer year ----
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // ---- Lightbox refs ----
  const lightbox = document.getElementById("lightbox");
  const titleEl = document.getElementById("lightboxTitle");
  const imgEl = document.getElementById("lightboxImg");
  const closeBtn = document.querySelector(".lightbox-close");
  const backdropBtn = document.querySelector(".lightbox-backdrop");

  if (!lightbox || !titleEl || !imgEl) return;

  const isOpen = () => lightbox.getAttribute("aria-hidden") === "false";

  const lockScroll = (locked) => {
    document.documentElement.style.overflow = locked ? "hidden" : "";
    document.body.style.overflow = locked ? "hidden" : "";
  };

  const open = (title, imgSrc) => {
    const src = (imgSrc || "").trim();
    if (!src) return; // don't open empty

    titleEl.textContent = (title || "").trim();
    imgEl.src = src;
    imgEl.alt = titleEl.textContent || "";

    lightbox.setAttribute("aria-hidden", "false");
    lockScroll(true);

    // Focus the close button for accessibility + makes iOS happier
    closeBtn?.focus?.();
  };

  const close = () => {
    lightbox.setAttribute("aria-hidden", "true");
    imgEl.src = "";
    imgEl.alt = "";
    titleEl.textContent = "";
    lockScroll(false);
  };

  // --- Open handler (cards) ---
  document.addEventListener("click", (e) => {
    // If lightbox is open, clicks on backdrop/X should close
    if (isOpen()) {
      if (
        e.target.closest?.(".lightbox-close") ||
        e.target.closest?.(".lightbox-backdrop")
      ) {
        e.preventDefault();
        close();
      }
      return;
    }

    // Only open from .card buttons
    const card = e.target.closest?.(".card");
    if (!card) return;

    e.preventDefault(); // prevents weird button focus states on iOS
    open(card.dataset.title || "", card.dataset.img || "");
  });

  // Extra insurance: direct listeners (sometimes iOS is picky)
  closeBtn?.addEventListener("click", (e) => { e.preventDefault(); close(); });
  backdropBtn?.addEventListener("click", (e) => { e.preventDefault(); close(); });

  // Escape closes on desktop
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isOpen()) close();
  });

  // If something goes wrong, tapping twice on background should still work
  lightbox.addEventListener("click", (e) => {
    if (!isOpen()) return;
    // click outside the panel closes
    if (!e.target.closest?.(".lightbox-panel")) close();
  });
})();