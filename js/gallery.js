(function () {
  /* ---------- Timeline ---------- */
  const timelineList = document.getElementById("timelineList");
  if (timelineList) {
    timelineList.innerHTML = CONFIG.timeline
      .map(
        (item) => `
      <article class="timeline-item reveal">
        <span class="timeline-item__dot" aria-hidden="true"></span>
        <span class="timeline-item__chapter">${item.chapter}</span>
        <h3 class="timeline-item__title">${item.title}</h3>
        <span class="timeline-item__date">${item.date}</span>
        <p class="timeline-item__text">${item.text}</p>
        ${item.image
            ? `<img class="timeline-item__img" src="${item.image}" alt="${item.title}" loading="lazy" />`
            : ""
          }
      </article>`
      )
      .join("");
  }

  /* ---------- Family Album ---------- */
  const galleryGrid = document.getElementById("galleryGrid");
  if (galleryGrid) {
    galleryGrid.innerHTML = CONFIG.familyGallery
      .map(
        (g) => `
      <figure class="gallery-item">
        <img src="${g.image}" alt="${g.caption}" loading="lazy" />
        <figcaption class="gallery-item__caption">${g.caption}</figcaption>
      </figure>`
      )
      .join("");
  }

  /* ---------- Reasons: flip cards ---------- */
  const reasonsGrid = document.getElementById("reasonsGrid");
  if (reasonsGrid) {
    reasonsGrid.innerHTML = CONFIG.reasons
      .map(
        (r) => `
      <div class="reason-card reveal" tabindex="0" role="button" aria-label="Flip card">
        <div class="reason-card__inner">
          <div class="reason-card__face reason-card__front">${r.front}</div>
          <div class="reason-card__face reason-card__back">${r.back}</div>
        </div>
      </div>`
      )
      .join("");

    reasonsGrid.querySelectorAll(".reason-card").forEach((card) => {
      const toggle = () => card.classList.toggle("is-flipped");
      card.addEventListener("click", toggle);
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          toggle();
        }
      });
    });
  }


  /* ---------- Wishes: sealed family cards ---------- */

  const promisesGrid = document.getElementById("promisesGrid");

  if (promisesGrid) {
    promisesGrid.innerHTML = CONFIG.wishes
      .map((wish, index) => {
        const from =
          typeof wish === "string"
            ? "Your Family"
            : wish.from || "Your Family";

        const message =
          typeof wish === "string"
            ? wish
            : wish.message || "";

        return `
        <div
          class="promise-card reveal"
          tabindex="0"
          role="button"
          aria-label="Open wish ${index + 1}"
          aria-expanded="false"
          data-wish-index="${index}"
        >
          <span class="promise-card__seal" aria-hidden="true">♥</span>

          <span class="promise-card__hint">
            Tap to open
          </span>

          <span class="promise-card__content">
            <span class="promise-card__from">
              ${escapeHTML(from)}
            </span>

            <span class="promise-card__text">
              ${escapeHTML(message)}
            </span>
          </span>
        </div>
      `;
      })
      .join("");

    promisesGrid.querySelectorAll(".promise-card").forEach((card) => {
      const toggleWish = () => {
        const isOpen = card.classList.toggle("is-open");

        card.setAttribute("aria-expanded", String(isOpen));

        card.setAttribute(
          "aria-label",
          isOpen ? "Close wish" : "Open wish"
        );
      };

      card.addEventListener("click", toggleWish);

      card.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          toggleWish();
        }
      });
    });
  }

  /* ---------- Escape dynamic text safely ---------- */

  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, (character) => {
      const entities = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      };

      return entities[character];
    });
  }


})();