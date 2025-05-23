const MUTUAL_FUND_SYMBOL = "FXAIX";
const PRICE_THRESHOLD = 200;
const API_KEY = "BJCGREBCWD2SB76U";

document.addEventListener("DOMContentLoaded", () => {
  const ring = document.getElementById("progress-ring");
  const countdownEl = document.getElementById("countdown");

  const radius = 100;
  const circumference = 2 * Math.PI * radius;
  ring.style.strokeDasharray = `${circumference}`;
  ring.style.strokeDashoffset = 0; // Show full ring immediately

  let targetDate = new Date("2041-06-07T13:00:00");
  const originalTargetDate = new Date(targetDate);

  async function checkMutualFundPrice() {
    try {
      const response = await fetch(`https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${MUTUAL_FUND_SYMBOL}&apikey=${API_KEY}`);
      const data = await response.json();

      if (data["Note"]) {
        console.warn("API limit reached. Defaulting to green.");
        return;
      }

      const timeSeries = data["Time Series (Daily)"];
      if (!timeSeries) {
        console.error("Unexpected response structure:", data);
        return;
      }

      const latestDate = Object.keys(timeSeries)[0];
      const price = parseFloat(timeSeries[latestDate]["4. close"]);

      if (isNaN(price)) {
        console.error("Invalid price data for", latestDate);
        return;
      }

      console.log(`FXAIX price: $${price}`);

      if (price <= PRICE_THRESHOLD) {
        ring.classList.remove("green-ring");
        ring.classList.add("red-ring");
        targetDate.setFullYear(targetDate.getFullYear() + 1);
        console.log("Price below threshold. Countdown extended.");
      }

    } catch (error) {
      console.error("Fetch error:", error);
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
    }, 1000);
  }

  checkMutualFundPrice().then(startCountdown);
});
