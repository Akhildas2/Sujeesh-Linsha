(function () {
  /* =========================================================
     Opening envelope
     ========================================================= */
  const opening = document.getElementById("opening");
  const openBtn = document.getElementById("openBtn");

  function openGift() {
    if (!opening) return;
    opening.classList.add("is-open");
    setTimeout(() => {
      opening.classList.add("is-hidden");
      opening.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
    }, 1100);
  }

  if (openBtn && opening) {
    document.body.style.overflow = "hidden";
    openBtn.addEventListener("click", openGift);
  }

  /* =========================================================
     Hero background from CONFIG
     ========================================================= */
  const heroBg = document.querySelector(".hero__bg");
  if (heroBg && CONFIG && CONFIG.images && CONFIG.images.hero) {
    heroBg.style.backgroundImage = `url("${CONFIG.images.hero}")`;
  }


  /* =========================================================
     Dynamic Hero — anniversary year calculated automatically
     ========================================================= */

  const heroConfig = CONFIG.hero || {};
  const weddingDate = new Date(CONFIG.couple.weddingDate);

  // Calculate completed wedding anniversaries.
  function getAnniversaryYears(now = new Date()) {
    let years = now.getFullYear() - weddingDate.getFullYear();

    const anniversaryThisYear = new Date(
      now.getFullYear(),
      weddingDate.getMonth(),
      weddingDate.getDate()
    );

    if (now < anniversaryThisYear) {
      years--;
    }

    return Math.max(0, years);
  }

  function updateHero() {
    const eyebrow = document.getElementById("heroEyebrow");
    const quote = document.getElementById("heroQuote");
    const scroll = document.getElementById("heroScroll");

    const years = getAnniversaryYears();

    if (eyebrow) {
      eyebrow.textContent =
        heroConfig.eyebrow || "Happy Anniversary";
    }

    if (quote) {
      const template =
        heroConfig.quote ||
        "{years} years of love, laughter, and a family built on kindness — thank you for showing us what forever looks like.";

      quote.textContent = template.replace(
        /\{years\}/g,
        String(years)
      );
    }

    if (scroll) {
      scroll.textContent =
        heroConfig.scrollText || "Scroll to begin";
    }
  }

  if (!isNaN(weddingDate.getTime())) {
    updateHero();
  }


  /* =========================================================
     FAMILY LETTER — inline, one-by-one reveal
     (no modal; each paragraph fades in sequentially when
      the letter scrolls into view)
     ========================================================= */
  const letterBody = document.getElementById("letterBody");

  if (letterBody && CONFIG && CONFIG.familyLetter) {
    /* Build the paragraph HTML + signature */
    const paragraphsHtml = (CONFIG.familyLetter.paragraphs || [])
      .map((p) => `<p class="letter-body__para">${p}</p>`)
      .join("");

    const signatureHtml = CONFIG.familyLetter.signature
      ? `<span class="signature">${CONFIG.familyLetter.signature}</span>`
      : "";

    letterBody.innerHTML = paragraphsHtml + signatureHtml;

    /* Sequentially reveal each paragraph when the letter scrolls in */
    const items = letterBody.querySelectorAll(
      ".letter-body__para, .signature"
    );

    const STAGGER_MS = 650; // ← change this to speed up / slow down the reveal
    const START_DELAY_MS = 300; // ← small pause before the first line appears

    const letterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          items.forEach((el, i) => {
            const delay = START_DELAY_MS + i * STAGGER_MS;
            setTimeout(() => el.classList.add("is-visible"), delay);
          });

          letterObserver.disconnect(); // one-time only
        });
      },
      { threshold: 0.2 }
    );

    letterObserver.observe(letterBody);
  }

  /* =========================================================
     Then & Now slider
     ========================================================= */
  const compare = document.getElementById("compare");
  const handle = document.getElementById("compareHandle");
  const afterWrap = document.getElementById("compareAfterWrap");

  if (compare && handle && afterWrap) {
    let dragging = false;

    function setPosition(clientX) {
      const rect = compare.getBoundingClientRect();
      let pct = ((clientX - rect.left) / rect.width) * 100;
      pct = Math.max(0, Math.min(100, pct));
      afterWrap.style.width = pct + "%";
      handle.style.left = pct + "%";
      handle.setAttribute("aria-valuenow", String(Math.round(pct)));
    }

    handle.addEventListener("pointerdown", (e) => {
      dragging = true;
      handle.setPointerCapture(e.pointerId);
    });
    handle.addEventListener("pointermove", (e) => {
      if (dragging) setPosition(e.clientX);
    });
    handle.addEventListener("pointerup", () => {
      dragging = false;
    });
    handle.addEventListener("pointercancel", () => {
      dragging = false;
    });

    compare.addEventListener("click", (e) => {
      if (e.target === handle || handle.contains(e.target)) return;
      setPosition(e.clientX);
    });

    handle.addEventListener("keydown", (e) => {
      const current = parseFloat(handle.getAttribute("aria-valuenow")) || 50;
      const rect = compare.getBoundingClientRect();
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        setPosition(rect.left + ((Math.max(0, current - 5)) / 100) * rect.width);
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        setPosition(rect.left + ((Math.min(100, current + 5)) / 100) * rect.width);
      }
    });
  }

  /* =========================================================
     Countdown + anniversary-day celebration
     ========================================================= */
  const wedding = new Date(CONFIG.couple.weddingDate);
  if (!isNaN(wedding.getTime())) {
    const countdownEl = document.getElementById("countdown");
    const countdownSection = document.querySelector(".countdown-section");
    const countdownTitle = document.getElementById("countdownTitle");
    const countdownSubtitle = document.getElementById("countdownSubtitle");

    const isAnniversaryToday = (now) =>
      now.getMonth() === wedding.getMonth() && now.getDate() === wedding.getDate();

    function celebrate() {
      if (countdownTitle) countdownTitle.textContent = "Happy Anniversary!";
      if (countdownSubtitle)
        countdownSubtitle.textContent = "Today is your day — and we're celebrating you.";
      if (countdownEl) {
        countdownEl.innerHTML = `
          <div class="celebration">
            ♥ ♥ ♥
            <small>From all of us, with all our love.</small>
          </div>`;
      }
      countdownSection?.classList.add("is-celebrating");
    }

    function updateCountdown() {
      const now = new Date();

      if (isAnniversaryToday(now)) {
        celebrate();
        return;
      }

      let next = new Date(now.getFullYear(), wedding.getMonth(), wedding.getDate());
      if (next <= now) {
        next = new Date(now.getFullYear() + 1, wedding.getMonth(), wedding.getDate());
      }
      const diff = next - now;
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);

      const set = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.textContent = String(val).padStart(2, "0");
      };
      set("cd-days", d);
      set("cd-hours", h);
      set("cd-minutes", m);
      set("cd-seconds", s);
    }

    updateCountdown();
    setInterval(updateCountdown, 1000);
  }

  /* =========================================================
     Scroll reveals
     ========================================================= */
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );

  document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
})();