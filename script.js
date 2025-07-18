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

  // If the countdown is finished, display a message
  if (remainingTime <= 0) {
    document.getElementById("countdown").innerHTML = "Countdown finished!";
    document.getElementById(
      "currentTime"
    ).innerHTML = `Current time: ${new Date().toLocaleString()}`;
    document.getElementById("targetTime").innerHTML = new Date(
      target
    ).toLocaleString();
    return;
  }

  // Calculate days, hours, minutes, and seconds
  const days = Math.floor(remainingTime / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (remainingTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  const minutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));
  // Calculate seconds as a floating-point number
  const seconds = (remainingTime % (1000 * 60)) / 1000;

  // Display the countdown with seconds formatted to 3 decimal places
  document.getElementById(
    "countdown"
  ).innerHTML = `${days}d ${hours}h ${minutes}m ${seconds.toFixed(3)}s`;

  // Display current and target times
  document.getElementById(
    "currentTime"
  ).innerHTML = `Current time: ${new Date().toLocaleString()}`;
  document.getElementById("targetTime").innerHTML = new Date(
    target
  ).toLocaleString();
}

// Update the countdown every 10 milliseconds for a smoother animation
setInterval(updateCountdown, 10);
