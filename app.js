/* app.js — 2WolvesMock (REWRITE)
   - Sets footer year
   - Lightbox for .card buttons
*/

(() => {
  "use strict";

  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  const lightbox = document.getElementById("lightbox");
  const titleEl = document.getElementById("lightboxTitle");
  const imgEl = document.getElementById("lightboxImg");

  if (!lightbox || !titleEl || !imgEl) return;

  const isOpen = () => lightbox.getAttribute("aria-hidden") === "false";

  const open = (title, imgSrc) => {
    titleEl.textContent = title || "Preview";
    imgEl.src = imgSrc || "";
    imgEl.alt = title || "";
    lightbox.setAttribute("aria-hidden", "false");
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
  };

  const close = () => {
    lightbox.setAttribute("aria-hidden", "true");
    imgEl.src = "";
    document.documentElement.style.overflow = "";
    document.body.style.overflow = "";
  };

  document.addEventListener("click", (e) => {
    const card = e.target.closest?.(".card");
    if (card) {
      open(card.dataset.title || "", card.dataset.img || "");
      return;
    }

    if (e.target.closest?.(".lightbox-close") || e.target.closest?.(".lightbox-backdrop")) {
      close();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isOpen()) close();
  });
})();