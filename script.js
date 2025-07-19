// script.js
const odometerContainer = document.getElementById("odometer");
let previousTime = "";

/**
 * Set up the event listener for the "Set Target Time" button
 * This will prompt the user to enter a target date/time in ISO 8601 format.
 * If valid, it updates the URL with the new target and reloads the page.
 * If invalid, it shows an error message.
 */
document.getElementById("setDateBtn").addEventListener("click", () => {
  Swal.fire({
    title: "Set Target Time",
    input: "text",
    inputLabel: "Enter date/time (ISO 8601)",
    inputPlaceholder: "e.g. 2025-12-23T24:00:00",
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
  }).then((result) => {
    if (result.isConfirmed && result.value) {
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.set("target", result.value);
      window.location.href = newUrl.toString(); // Reload with updated target
    }
  });
});

/**
 * Get the countdown layout based on the time difference.
 * This function determines how many years and days to show based on the difference.
 * It returns a string that defines the layout for the odometer.
 */
function getCountdownLayout(diff) {
  const ONE_DAY = 86_400_000;
  const ONE_YEAR = 365 * ONE_DAY;

  const years = Math.floor(diff / ONE_YEAR);
  const days = Math.floor((diff % ONE_YEAR) / ONE_DAY);

  let layout = "";

  if (years > 0) {
    layout += "000y "; // Always fixed 3 digits for year (We don't support >=1000 years, that's so far in the future!)
    layout += "000d "; // Days always shown if year is shown
  } else {
    if (days >= 100) layout += "000d ";
    else if (days >= 10) layout += "00d ";
    else if (days >= 1) layout += "0d ";
    // else skip day unit
  }

  layout += "00h 00m 00s";
  return layout.trim();
}

/**
 * Update the odometer display based on the current time difference.
 * This function calculates the time difference from the target date/time,
 * updates the odometer layout, and checks if the target time has been reached.
 * It also handles the case where the target time is in the past.
 */
function setupOdometer(diff) {
  const layout = getCountdownLayout(diff);
  odometerContainer.innerHTML = ""; // Clear previous layout

  for (const char of layout) {
    if (/\d/.test(char)) {
      // digit (0-9)
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
      space.innerHTML = "&nbsp;&nbsp;&nbsp;&nbsp;"; // Non-breaking space
      odometerContainer.appendChild(space);
    } else {
      // unit (e.g., y, d, h, m, s)
      const unit = document.createElement("div");
      unit.className = "unit-container text-2xl md:text-3xl ml-2";
      unit.innerHTML = `<small>${char}</small>`;
      odometerContainer.appendChild(unit);
    }
  }
}

/**
 * Update the odometer display every 100ms.
 * This function calculates the time difference from the target date/time,
 * formats it, and updates the odometer reels accordingly.
 * It also updates the current time and target time display.
 * If the target time is in the past, it shows a message.
 */
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

  // Build display string
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
  if (formatted === previousTime) return;
  previousTime = formatted;

  // Rebuild odometer layout if changed
  const currentDigits = document.querySelectorAll(".digit-reel").length;
  const expectedDigits = (formatted.match(/\d/g) || []).length;
  if (currentDigits !== expectedDigits) {
    setupOdometer(diff); // layout might have changed
  }

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

setInterval(updateOdometer, 100);
updateOdometer();
