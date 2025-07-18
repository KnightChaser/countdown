// script.js
const odometerContainer = document.getElementById("odometer");
let previousTime = "";

/**
 * Build d/h/m/s reels only
 */
function setupOdometer() {
  const layout = "000d 00h 00m 00s";

  for (const char of layout) {
    if (/\d/.test(char)) {
      // digit reel
      const digitContainer = document.createElement("div");
      digitContainer.className = "digit-container text-8xl md:text-9xl";
      const reel = document.createElement("div");
      reel.className = "digit-reel";
      for (let i = 0; i <= 9; i++) {
        const span = document.createElement("span");
        span.textContent = i;
        reel.appendChild(span);
      }
      digitContainer.appendChild(reel);
      odometerContainer.appendChild(digitContainer);
    } else if (char === " ") {
      // spacer
      const space = document.createElement("div");
      space.className = "unit-container";
      space.innerHTML = "&nbsp;";
      odometerContainer.appendChild(space);
    } else {
      // unit (d, h, m, s)
      const unit = document.createElement("div");
      unit.className = "unit-container text-8xl md:text-9xl";
      unit.textContent = char;
      odometerContainer.appendChild(unit);
    }
  }
}

/**
 * Update only every second, drop ms
 */
function updateOdometer() {
  const urlParams = new URLSearchParams(window.location.search);
  const target = urlParams.get("target"); // e.g. "2025-12-23T24:00:00"
  if (!target) {
    odometerContainer.innerHTML =
      '<span class="text-4xl">Target not provided!</span>';
    return;
  }

  const now = Date.now();
  const diff = Math.max(0, new Date(target).getTime() - now);

  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff % 86_400_000) / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);
  const seconds = Math.floor((diff % 60_000) / 1000);

  const formatted =
    `${String(days).padStart(3, "0")}d ` +
    `${String(hours).padStart(2, "0")}h ` +
    `${String(minutes).padStart(2, "0")}m ` +
    `${String(seconds).padStart(2, "0")}s`;

  if (formatted === previousTime) return;
  previousTime = formatted;

  const reels = document.querySelectorAll(".digit-reel");
  let idx = 0;
  for (const c of formatted) {
    if (/\d/.test(c)) {
      const val = +c;
      reels[idx].style.transform = `translateY(-${val}em)`;
      idx++;
    }
  }

  document.getElementById(
    "currentTime"
  ).textContent = `Current time: ${new Date().toLocaleString()}`;
  document.getElementById("targetTime").textContent = new Date(
    target
  ).toLocaleString();
}

setupOdometer();
setInterval(updateOdometer, 100);
