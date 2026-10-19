/**
 * Voice note player (son's voice note and any future entries)
 * - Renders each entry from CONFIG.voiceNotes
 * - Only one voice note plays at a time
 * - Gracefully handles missing files, autoplay blocks, and errors
 * - Accessible: buttons, progressbar, keyboard seek
 */
(function () {
  const list = document.getElementById("voiceNotesList");
  if (!list) return;

  const notes = Array.isArray(CONFIG.voiceNotes) ? CONFIG.voiceNotes : [];

  if (notes.length === 0) {
    list.innerHTML = `<p class="voice-notes__empty">No voice notes added yet.</p>`;
    return;
  }

  /* ---------- Render cards ---------- */
  list.innerHTML = notes
    .map(
      (vn, i) => `
    <div class="voice-card reveal" data-audio-card data-index="${i}">
      <div class="voice-card__mic" aria-hidden="true">
        <div class="voice-card__wave">
          <span></span><span></span><span></span><span></span><span></span>
        </div>
        🎙️
      </div>
      <div class="voice-card__body">
        <p class="voice-card__speaker">${escapeHtml(vn.speaker || "")}</p>
        <p class="voice-card__title">${escapeHtml(vn.title || "Voice note")}</p>
        ${vn.subtitle ? `<p class="voice-card__sub">${escapeHtml(vn.subtitle)}</p>` : ""}
        <div class="voice-card__controls">
          <button class="voice-card__btn" type="button" data-play aria-label="Play voice note">▶</button>
          <div class="voice-card__progress"
               data-progress
               role="progressbar"
               aria-label="Voice note progress"
               aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"
               tabindex="0">
            <div class="voice-card__fill" data-progress-fill></div>
          </div>
          <span class="voice-card__time" data-time>0:00</span>
        </div>
        <audio preload="metadata" src="${vn.src}" data-audio-el></audio>
      </div>
    </div>`
    )
    .join("");

  /* ---------- Wire up behaviour ---------- */
  const cards = Array.from(list.querySelectorAll("[data-audio-card]"));
  const allEls = cards.map((c) => c.querySelector("[data-audio-el]"));

  const formatTime = (t) => {
    if (!isFinite(t) || t < 0) return "0:00";
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m}:${String(s).padStart(2, "0")}`;
  };

  const pauseOthers = (currentAudio) => {
    allEls.forEach((a) => {
      if (a && a !== currentAudio && !a.paused) a.pause();
    });
  };

  cards.forEach((card) => {
    const audio = card.querySelector("[data-audio-el]");
    const btn = card.querySelector("[data-play]");
    const progress = card.querySelector("[data-progress]");
    const fill = card.querySelector("[data-progress-fill]");
    const time = card.querySelector("[data-time]");
    if (!audio || !btn) return;

    btn.addEventListener("click", () => {
      if (audio.paused) {
        pauseOthers(audio);
        const p = audio.play();
        if (p && typeof p.catch === "function") {
          p.catch((err) => {
            console.warn("Voice note could not play:", audio.src, err);
            time.textContent = "Unavailable";
            card.classList.add("has-error");
          });
        }
      } else {
        audio.pause();
      }
    });

    audio.addEventListener("play", () => {
      btn.textContent = "❚❚";
      btn.setAttribute("aria-label", "Pause voice note");
      card.classList.add("is-playing");
    });

    audio.addEventListener("pause", () => {
      btn.textContent = "▶";
      btn.setAttribute("aria-label", "Play voice note");
      card.classList.remove("is-playing");
    });

    audio.addEventListener("loadedmetadata", () => {
      time.textContent = `0:00 / ${formatTime(audio.duration)}`;
    });

    audio.addEventListener("timeupdate", () => {
      if (!audio.duration) return;
      const pct = (audio.currentTime / audio.duration) * 100;
      fill.style.width = pct + "%";
      progress.setAttribute("aria-valuenow", String(Math.round(pct)));
      time.textContent = `${formatTime(audio.currentTime)} / ${formatTime(audio.duration)}`;
    });

    audio.addEventListener("ended", () => {
      audio.currentTime = 0;
      fill.style.width = "0%";
      progress.setAttribute("aria-valuenow", "0");
      time.textContent = `0:00 / ${formatTime(audio.duration)}`;
      btn.textContent = "▶";
      btn.setAttribute("aria-label", "Play voice note");
      card.classList.remove("is-playing");
    });

    audio.addEventListener("error", () => {
      time.textContent = "Audio unavailable";
      btn.disabled = true;
      card.classList.add("has-error");
      console.warn("Missing or invalid audio asset:", audio.src);
    });

    progress.addEventListener("click", (e) => {
      if (!audio.duration) return;
      const rect = progress.getBoundingClientRect();
      const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      audio.currentTime = pct * audio.duration;
    });

    progress.addEventListener("keydown", (e) => {
      if (!audio.duration) return;
      if (e.key === "ArrowRight") {
        e.preventDefault();
        audio.currentTime = Math.min(audio.duration, audio.currentTime + 5);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        audio.currentTime = Math.max(0, audio.currentTime - 5);
      } else if (e.key === "Home") {
        e.preventDefault();
        audio.currentTime = 0;
      } else if (e.key === "End") {
        e.preventDefault();
        audio.currentTime = audio.duration;
      }
    });
  });

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }
})();