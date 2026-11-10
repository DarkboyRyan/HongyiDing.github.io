"use strict";
const figureDialog = document.querySelector(".figure-dialog");
const expandedFigure = document.getElementById("figure-expanded");
const expandedCaption = document.getElementById("figure-caption");
let figureOpener = null;
if (figureDialog && typeof figureDialog.showModal === "function") {
  document.querySelectorAll(".figure-zoom").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      figureOpener = link;
      expandedFigure.src = link.href;
      expandedFigure.alt = link.querySelector("img").alt;
      expandedCaption.textContent = link.closest("figure").querySelector("figcaption").textContent;
      figureDialog.showModal();
    });
  });
  document.getElementById("close-figure").addEventListener("click", () => figureDialog.close());
  figureDialog.addEventListener("click", (event) => {
    if (event.target !== figureDialog) return;
    const bounds = figureDialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) figureDialog.close();
  });
  figureDialog.addEventListener("close", () => figureOpener?.focus());
}
