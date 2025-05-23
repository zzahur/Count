const MUTUAL_FUND_SYMBOL = "FXAIX";
const PRICE_THRESHOLD = 200;
const API_KEY = "BJCGREBCWD2SB76U"; // Replace with your actual Alpha Vantage API key

document.addEventListener("DOMContentLoaded", () => {
  const ring = document.getElementById("progress-ring");
  const countdownEl = document.getElementById("countdown");

  const radius = 100;
  const circumference = 2 * Math.PI * radius;
  ring.style.strokeDasharray = `${circumference}`;
  ring.style.strokeDashoffset = `${circumference}`;

  let targetDate = new Date("2041-06-07T13:00:00");
  const originalTargetDate = new Date(targetDate);

  async function checkMutualFundPrice() {
    try {
      const response = await fetch(`https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${MUTUAL_FUND_SYMBOL}&apikey=${API_KEY}`);
      const data = await response.json();

      ring.classList.remove("green-ring", "red-ring");

      if (data["Note"]) {
        console.warn("Alpha Vantage API limit reached:", data["Note"]);
        ring.classList.add("green-ring");
        return;
      }

      if (!data["Time Series (Daily)"]) {
        console.error("Unexpected response structure:", data);
        ring.classList.add("green-ring");
        return;
      }

      const latestDate = Object.keys(data["Time Series (Daily)"])[0];
      const priceStr = data["Time Series (Daily)"][latestDate]["4. close"];

      if (!priceStr) {
        console.error("Price data not found for", latestDate);
        ring.classList.add("green-ring");
        return;
      }

      const price = parseFloat(priceStr);
      console.log(`Current price of ${MUTUAL_FUND_SYMBOL}: $${price}`);

      if (price > PRICE_THRESHOLD) {
        ring.classList.add("green-ring");
      } else {
        ring.classList.add("red-ring");
        targetDate.setFullYear(targetDate.getFullYear() + 1);
        console.log("Price below threshold. Countdown extended by 1 year.");
      }
    } catch (error) {
      console.error("Failed to fetch mutual fund price:", error);
      ring.classList.add("green-ring");
    }
  }

  function startCountdown() {
    setInterval(() => {
      const now = new Date();
      const distance = targetDate - now;
      const total = targetDate - originalTargetDate;

      if (distance <= 0) {
        countdownEl.innerHTML = `<div class=\"line1\">Time's up!</div><div class=\"line2\"></div>`;
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
        <div class=\"line1\">${years}y ${days}d</div>
        <div class=\"line2\">${hours}h ${minutes}m ${seconds}s</div>`;
    }, 1000);
  }

  checkMutualFundPrice().then(startCountdown);
});
