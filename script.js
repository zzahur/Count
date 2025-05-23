const MUTUAL_FUND_SYMBOL = "FXAIX";
const PRICE_THRESHOLD = 200;
const API_KEY = "BJCGREBCWD2SB76U"; // Replace with your actual Alpha Vantage API key

document.addEventListener("DOMContentLoaded", () => {
  const ring = document.getElementById("progress-ring");
  const ticker = document.getElementById("tick-indicator");
  const countdownEl = document.getElementById("countdown");

  const radius = 100;
  const circumference = 2 * Math.PI * radius;
  ring.style.strokeDasharray = `${circumference}`;
  ring.style.strokeDashoffset = `${circumference}`;

  let targetDate = new Date("2041-06-07T13:00:00");
  const originalTargetDate = new Date(targetDate);
  let tickAngle = 0;

  async function checkMutualFundPrice() {
    try {
      const response = await fetch(`https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${MUTUAL_FUND_SYMBOL}&apikey=${API_KEY}`);
      const data = await response.json();

      if (data["Note"]) {
        console.warn("Alpha Vantage API limit reached:", data["Note"]);
        return;
      }

      if (!data["Time Series (Daily)"]) {
        console.error("Unexpected response structure:", data);
        return;
      }

      const latestDate = Object.keys(data["Time Series (Daily)"])[0];
      const priceStr = data["Time Series (Daily)"][latestDate]["4. close"];

      if (!priceStr) {
        console.error("Price data not found for", latestDate);
        return;
      }

      const price = parseFloat(priceStr);
      console.log(`Current price of ${MUTUAL_FUND_SYMBOL}: $${price}`);

      ring.classList.remove("green-ring", "red-ring");
      if (price > PRICE_THRESHOLD) {
        ring.classList.add("green-ring");
        ring.style.stroke = "#6fdc88";
      } else {
        ring.classList.add("red-ring");
        ring.style.stroke = "#ff8a8a";
        targetDate.setFullYear(targetDate.getFullYear() + 1);
        console.log("Price below threshold. Countdown extended by 1 year.");
      }
    } catch (error) {
      console.error("Failed to fetch mutual fund price:", error);
    }
  }

  function startCountdown() {
    setInterval(() => {
      const now = new Date();
      const distance = targetDate - now;
      const total = targetDate - originalTargetDate;

      if (distance <= 0) {
        countdownEl.innerHTML = `<div class="line1">Time's up!</div><div class="line2"></div>`;
        ring.style.strokeDashoffset = 0;
        return;
      }

      const percent = (distance / total) * 100;
      const offset = circumference - (percent / 100) * circumference;
      ring.style.strokeDashoffset = offset;

      const years = Math.floor(distance / (1000 * 60 * 60 * 24 * 365));
      const days = Math.floor((distance % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      countdownEl.innerHTML = `
        <div class="line1">${years}y ${days}d</div>
        <div class="line2">${hours}h ${minutes}m ${seconds}s</div>`;

      tickAngle = (tickAngle + 6) % 360;
      ticker.setAttribute("transform", `rotate(${tickAngle} 110 110)`);
    }, 1000);
  }

  checkMutualFundPrice().then(startCountdown);
// TEMPORARY TEST — FORCE GREEN RING CLASS TO VERIFY CSS WORKS
setTimeout(() => {
  ring.classList.add("green-ring");
  ring.style.stroke = "#6fdc88";
  console.log("Forced green-ring class to test animation.");
}, 2000);

});
