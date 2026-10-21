"use strict";
const siteMusic = document.querySelector(".site-music");
if (siteMusic) {
  const player = siteMusic.querySelector("audio");
  const toggle = siteMusic.querySelector(".music-toggle");
  let hasPlayed = false;
  player.volume = 0.35;

  async function requestPlayback() {
    if (hasPlayed) return;
    try {
      await player.play();
    } catch (error) {
      // A blocked autoplay attempt leaves the native play button available.
      siteMusic.classList.remove("is-playing");
    }
  }

  player.addEventListener("playing", () => {
    hasPlayed = true;
    siteMusic.classList.add("is-playing");
  });
  for (const event of ["pause", "waiting", "ended", "error"]) {
    player.addEventListener(event, () => siteMusic.classList.remove("is-playing"));
  }

  toggle.addEventListener("click", () => {
    const open = siteMusic.toggleAttribute("open");
    toggle.setAttribute("aria-expanded", String(open));
    if (open) requestPlayback();
  });
  siteMusic.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    siteMusic.removeAttribute("open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.focus();
  });
  requestPlayback();
}
