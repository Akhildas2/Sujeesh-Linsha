(function () {
  const wedding = new Date(CONFIG.couple.weddingDate);
  if (isNaN(wedding.getTime())) {
    console.warn("Invalid wedding date in CONFIG");
    return;
  }

  const $ = (id) => document.getElementById(id);
  const pad = (n) => String(n).padStart(2, "0");

  function breakdown(from, to) {
    let years = to.getFullYear() - from.getFullYear();
    let months = to.getMonth() - from.getMonth();
    let days = to.getDate() - from.getDate();

    if (days < 0) {
      months--;
      const prevMonthDays = new Date(to.getFullYear(), to.getMonth(), 0).getDate();
      days += prevMonthDays;
    }
    if (months < 0) {
      years--;
      months += 12;
    }

    return {
      years,
      months,
      days,
      hours: to.getHours(),
      minutes: to.getMinutes(),
      seconds: to.getSeconds(),
    };
  }

  function update() {
    const now = new Date();
    const b = breakdown(wedding, now);

    const map = {
      "t-years": b.years,
      "t-months": b.months,
      "t-days": b.days,
      "t-hours": b.hours,
      "t-minutes": b.minutes,
      "t-seconds": b.seconds,
    };

    Object.entries(map).forEach(([id, val]) => {
      const el = $(id);
      if (el) el.textContent = pad(val);
    });

    const ms = now - wedding;
    const totalDays = Math.floor(ms / 86400000);
    const weekends = Math.floor(totalDays / 7);
    const totalHours = Math.floor(ms / 3600000);

    if ($("stat-days")) $("stat-days").textContent = totalDays.toLocaleString();
    if ($("stat-weekends")) $("stat-weekends").textContent = weekends.toLocaleString();
    if ($("stat-hours")) $("stat-hours").textContent = totalHours.toLocaleString();
  }

  update();
  setInterval(update, 1000);
})();