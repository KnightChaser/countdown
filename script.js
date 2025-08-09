// script.js
const odometerContainer = document.getElementById("odometer");
let previousTime = "";

/* Neon blue → neon green */
const GRADIENT_START = { r: 0, g: 229, b: 255 }; // #00E5FF
const GRADIENT_END = { r: 55, g: 255, b: 127 }; // #37FF7F

function interpolateColor(color1, color2, factor) {
  const result = { ...color1 };
  for (const k in result)
    result[k] = Math.round(color1[k] + factor * (color2[k] - color1[k]));
  return `rgb(${result.r}, ${result.g}, ${result.b})`;
}

function applyGlobalGradient() {
  const chars = odometerContainer.querySelectorAll(
    ".digit-reel > span, .unit-container small"
  );
  if (!chars.length) return;

  const first = chars[0];
  const last = chars[chars.length - 1];
  const startX = first.getBoundingClientRect().left;
  const endX = last.getBoundingClientRect().right;
  const totalW = Math.max(1, endX - startX);

  odometerContainer.querySelectorAll(".digit-container").forEach((dc) => {
    const reel = dc.querySelector(".digit-reel");
    const pos = dc.getBoundingClientRect().left + dc.offsetWidth / 2;
    const f = Math.min(1, Math.max(0, (pos - startX) / totalW));
    const col = interpolateColor(GRADIENT_START, GRADIENT_END, f);
    reel.querySelectorAll("span").forEach((s) => (s.style.color = col));
  });

  odometerContainer.querySelectorAll(".unit-container small").forEach((u) => {
    if (!u.textContent.trim()) return;
    const pos = u.getBoundingClientRect().left + u.offsetWidth / 2;
    const f = Math.min(1, Math.max(0, (pos - startX) / totalW));
    u.style.color = interpolateColor(GRADIENT_START, GRADIENT_END, f);
  });
}

/* Set target via SweetAlert — unchanged logic except placeholder fix */
document.getElementById("setDateBtn").addEventListener("click", () => {
  Swal.fire({
    title: "Set Target Time",
    input: "text",
    inputLabel: "Enter date/time (ISO 8601)",
    inputPlaceholder: "e.g. 2025-12-23T00:00:00",
    inputValue: new URLSearchParams(window.location.search).get("target") || "",
    showCancelButton: true,
    confirmButtonText: "Set",
    preConfirm: (value) => {
      if (!value || isNaN(Date.parse(value))) {
        Swal.showValidationMessage("Invalid ISO 8601 format.");
        return false;
      }
      return value;
    },
  }).then((res) => {
    if (res.isConfirmed && res.value) {
      const u = new URL(window.location.href);
      u.searchParams.set("target", res.value);
      window.location.href = u.toString();
    }
  });
});

function getCountdownLayout(diff) {
  const ONE_DAY = 86_400_000;
  const ONE_YEAR = 365 * ONE_DAY;

  const years = Math.floor(diff / ONE_YEAR);
  const days = Math.floor((diff % ONE_YEAR) / ONE_DAY);

  let layout = "";
  if (years > 0) {
    layout += "000y ";
    layout += "000d ";
  } else {
    if (days >= 100) layout += "000d ";
    else if (days >= 10) layout += "00d ";
    else if (days >= 1) layout += "0d ";
  }
  layout += "00h 00m 00s";
  return layout.trim();
}

function fitOdometer() {
  const wrap = document.querySelector(".od-wrap");
  const el = document.getElementById("odometer");
  if (!wrap || !el) return;

  el.style.transform = "scale(1)"; // reset
  const pad = 12;
  const need = el.scrollWidth;
  const have = wrap.clientWidth - pad;
  const s = Math.min(1, have / Math.max(1, need)); // 0..1
  el.style.transform = `scale(${s})`;
}

function setupOdometer(diff) {
  const layout = getCountdownLayout(diff);
  odometerContainer.innerHTML = "";

  for (const ch of layout) {
    if (/\d/.test(ch)) {
      const digitContainer = document.createElement("div");
      digitContainer.className = "digit-container";
      const reel = document.createElement("div");
      reel.className = "digit-reel";
      for (let i = 0; i <= 9; i++) {
        const span = document.createElement("span");
        span.textContent = i;
        reel.appendChild(span);
      }
      digitContainer.appendChild(reel);
      odometerContainer.appendChild(digitContainer);
    } else if (ch === " ") {
      const gap = document.createElement("div");
      gap.className = "gap-spacer";
      odometerContainer.appendChild(gap);
    } else {
      const unit = document.createElement("div");
      unit.className = "unit-container";
      unit.innerHTML = `<small>${ch}</small>`;
      odometerContainer.appendChild(unit);
    }
  }

  // After DOM is in, measure once next frame for correct centering + gradient
  requestAnimationFrame(() => {
    fitOdometer();
    applyGlobalGradient();
  });
}

function updateOdometer() {
  const urlParams = new URLSearchParams(window.location.search);
  const target = urlParams.get("target");
  if (!target) {
    odometerContainer.innerHTML =
      '<span class="text-4xl">Target not provided!</span>';
    return;
  }

  const now = Date.now();
  const diff = Math.max(0, new Date(target).getTime() - now);

  const ONE_DAY = 86_400_000;
  const ONE_YEAR = 365 * ONE_DAY;

  const years = Math.floor(diff / ONE_YEAR);
  const days = Math.floor((diff % ONE_YEAR) / ONE_DAY);
  const hours = Math.floor((diff % ONE_DAY) / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);
  const seconds = Math.floor((diff % 60_000) / 1000);

  let formatted = "";
  if (years > 0) formatted += String(years).padStart(3, "0") + "y ";
  if (years > 0 || days >= 100)
    formatted += String(days).padStart(3, "0") + "d ";
  else if (days >= 10) formatted += String(days).padStart(2, "0") + "d ";
  else if (days >= 1) formatted += String(days).padStart(1, "0") + "d ";
  formatted += String(hours).padStart(2, "0") + "h ";
  formatted += String(minutes).padStart(2, "0") + "m ";
  formatted += String(seconds).padStart(2, "0") + "s";
  formatted = formatted.trim();

  if (formatted !== previousTime) {
    previousTime = formatted;

    // Rebuild if digit count changed (layout change)
    const currentDigits =
      odometerContainer.querySelectorAll(".digit-reel").length;
    const expectedDigits = (formatted.match(/\d/g) || []).length;
    if (currentDigits !== expectedDigits) {
      setupOdometer(diff);
      fitOdometer();
      applyGlobalGradient();
    }

    const reels = odometerContainer.querySelectorAll(".digit-reel");
    let idx = 0;
    for (const c of formatted) {
      if (/\d/.test(c)) {
        const val = +c;
        reels[idx].style.transform = `translateY(-${val}em)`;
        idx++;
      }
    }
  }

  // Timestamps
  document.getElementById(
    "currentTime"
  ).textContent = `Current time: ${new Date().toLocaleString()}`;
  document.getElementById("targetTime").textContent = new Date(
    target
  ).toLocaleString();

  // Subtle global pulse synced to seconds (for aura/shine)
  const t = (now / 1000) % 1; // 0..1
  document.documentElement.style.setProperty(
    "--glow-amt",
    0.55 + 0.15 * Math.sin(t * Math.PI * 2)
  );
}

setInterval(updateOdometer, 100);
updateOdometer();

window.addEventListener("resize", () => {
  fitOdometer();
  applyGlobalGradient();
});
