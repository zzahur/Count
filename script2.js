const PRICE_THRESHOLD = 200;
const SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRAXxAZvGoGt-zvP3WUFbgHMEyeFKmgap7OPG5ORuOvpO9yTg9UjONVAxZIpBPwNlKVx4eOvl-Gyrgh/pub?output=csv";

document.addEventListener("DOMContentLoaded", () => {
  const ring = document.getElementById("progress-ring");
  const countdownEl = document.getElementById("countdown");

  const radius = 100;
  const circumference = 2 * Math.PI * radius;
  ring.style.strokeDasharray = `${circumference}`;
  ring.style.strokeDashoffset = 0;

  let targetDate = new Date("2041-06-07T13:00:00");
  const originalTargetDate = new Date(targetDate);

  async function checkSheetValue() {
    try {
      const response = await fetch(SHEET_CSV_URL);
      const text = await response.text();
      const rows = text.split('\n').map(row => row.split(','));
      const value = parseFloat(rows[0][0]); // Cell A1 (row index 0, column index 0)

      if (!isNaN(value)) {
        console.log("Sheet value:", value);
        if (value <= PRICE_THRESHOLD) {
          ring.classList.remove("green-ring");
          ring.classList.add("red-ring");
          targetDate.setFullYear(targetDate.getFullYear() + 1);
        }
      } else {
        console.warn("Value in cell A1 is not a number.");
      }
    } catch (error) {
      console.error("Error fetching sheet data:", error);
    }
  }

  function startCountdown() {
    setInterval(() => {
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const startOfTomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      const distance = targetDate - now;
      const total = targetDate - originalTargetDate;

      if (distance <= 0) {
        countdownEl.innerHTML = `<div class=\"line1\">Time's up!</div><div class=\"line2\"></div>`;
        ring.style.strokeDashoffset = 0;
        return;
      }

      const percent = (startOfTomorrow - now) / (1000 * 60 * 60 * 24);
      const offset = circumference - percent * circumference;
      ring.style.strokeDashoffset = offset;

      const years = Math.floor(distance / (1000 * 60 * 60 * 24 * 365));
      const days = Math.floor((distance % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24));

      countdownEl.innerHTML = `<div class=\"line1\">${years}y ${days}d</div>`;
    }, 60000); // update once per minute
  }

  checkSheetValue().then(startCountdown);
});
