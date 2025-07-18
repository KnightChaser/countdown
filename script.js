function updateCountdown() {
  // Get the target time from the URL
  const urlParams = new URLSearchParams(window.location.search);
  const target = urlParams.get("target");

  // If no target is provided, display an error
  if (!target) {
    document.getElementById("countdown").innerHTML =
      "Target time not provided!";
    return;
  }

  const targetTime = new Date(target).getTime();
  const currentTime = new Date().getTime();
  const remainingTime = targetTime - currentTime;
  const mainEl = document.getElementById("countdown-main");
  const msEl = document.getElementById("countdown-ms");

  // If the countdown is finished, display a message
  if (remainingTime <= 0) {
    mainEl.innerHTML = "Countdown Finished!";
    msEl.innerHTML = ""; // Clear the milliseconds
    document.getElementById(
      "currentTime"
    ).innerHTML = `Current time: ${new Date().toLocaleString()}`;
    document.getElementById("targetTime").innerHTML = new Date(
      target
    ).toLocaleString();
    return;
  }

  // Calculate each unit of time
  const days = Math.floor(remainingTime / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (remainingTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  const minutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((remainingTime % (1000 * 60)) / 1000);
  const milliseconds = remainingTime % 1000;

  // Update the main part of the countdown
  mainEl.innerHTML = `${days}d ${hours}h ${minutes}m ${seconds}`;

  // Update the milliseconds part, padding with leading zeros to keep it 3 digits long
  msEl.innerHTML = `.${String(milliseconds).padStart(3, "0")}s`;

  // Display current and target times
  document.getElementById(
    "currentTime"
  ).innerHTML = `Current time: ${new Date().toLocaleString()}`;
  document.getElementById("targetTime").innerHTML = new Date(
    target
  ).toLocaleString();
}

// Update the countdown every 10 milliseconds for a smoother animation
setInterval(updateCountdown, 2);
