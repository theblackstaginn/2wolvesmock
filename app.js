/* app.js — 2WolvesMock
   - Lightbox for .card buttons
   - Sets footer year
*/

(() => {
  "use strict";

  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  const lightbox = document.getElementById("lightbox");
  const titleEl = document.getElementById("lightboxTitle");
  const imgEl = document.getElementById("lightboxImg");

  if (!lightbox || !titleEl || !imgEl) return;

  const open = (title, imgSrc) => {
    titleEl.textContent = title || "Preview";
    imgEl.src = imgSrc || "";
    imgEl.alt = title || "";
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  };

  const close = () => {
    lightbox.setAttribute("aria-hidden", "true");
    imgEl.src = "";
    document.body.style.overflow = "";
  };

  document.addEventListener("click", (e) => {
    const card = e.target.closest?.(".card");
    if (card) {
      const title = card.getAttribute("data-title") || "";
      const img = card.getAttribute("data-img") || "";
      open(title, img);
      return;
    }

    if (e.target.closest?.(".lightbox-close") || e.target.closest?.(".lightbox-backdrop")) {
      close();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && lightbox.getAttribute("aria-hidden") === "false") {
      close();
    }
  });
})();