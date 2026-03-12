const presetConfigs = {
  sportka: {
    name: "Sportka style (6/49)",
    mainPicks: 6,
    mainTotal: 49,
    bonusPicks: 0,
    bonusTotal: 0,
    drawsPerWeek: 2,
    ticketPrice: 30,
    currency: "CZK"
  },
  power: {
    name: "Power style (5/69 + 1/26)",
    mainPicks: 5,
    mainTotal: 69,
    bonusPicks: 1,
    bonusTotal: 26,
    drawsPerWeek: 3,
    ticketPrice: 2,
    currency: "USD"
  },
  euro: {
    name: "Euro style (5/50 + 2/12)",
    mainPicks: 5,
    mainTotal: 50,
    bonusPicks: 2,
    bonusTotal: 12,
    drawsPerWeek: 2,
    ticketPrice: 2.5,
    currency: "EUR"
  },
  custom: {
    name: "Custom format",
    mainPicks: 6,
    mainTotal: 49,
    bonusPicks: 0,
    bonusTotal: 0,
    drawsPerWeek: 2,
    ticketPrice: 30,
    currency: "CZK"
  }
};

function combinations(n, k) {
  if (k < 0 || n < 0 || k > n) return 0;
  if (k === 0 || k === n) return 1;
  k = Math.min(k, n - k);
  let result = 1;
  for (let i = 1; i <= k; i++) {
    result = result * (n - k + i) / i;
  }
  return result;
}

function formatNumber(num, maximumFractionDigits = 0) {
  return num.toLocaleString("en-US", { maximumFractionDigits });
}

function formatPercent(num) {
  if (num < 0.0001) return num.toFixed(6) + "%";
  if (num < 0.01) return num.toFixed(4) + "%";
  if (num < 1) return num.toFixed(3) + "%";
  return num.toFixed(2) + "%";
}

function setError(message) {
  document.getElementById("error").textContent = message;
}

function clearError() {
  setError("");
}

function getSelectedPreset() {
  const el = document.getElementById("lotteryPreset");
  return el ? el.value : "sportka";
}

function applyPreset() {
  const preset = getSelectedPreset();
  const config = presetConfigs[preset];

  document.getElementById("mainPicks").value = config.mainPicks;
  document.getElementById("mainTotal").value = config.mainTotal;
  document.getElementById("bonusPicks").value = config.bonusPicks;
  document.getElementById("bonusTotal").value = config.bonusTotal;

  document.getElementById("drawsPerWeek").value = config.drawsPerWeek;
  document.getElementById("ticketPrice").value = config.ticketPrice;
  document.getElementById("currency").value = config.currency;

  document.getElementById("customSettings").classList.toggle("hidden", preset !== "custom");

  rebuildNumberInputs();
  updateStaticStats();
  resetDynamicBoxes();
}

function getConfig() {
  return {
    mainPicks: Number(document.getElementById("mainPicks").value),
    mainTotal: Number(document.getElementById("mainTotal").value),
    bonusPicks: Number(document.getElementById("bonusPicks").value),
    bonusTotal: Number(document.getElementById("bonusTotal").value)
  };
}

function validateConfig(config) {
  if (!Number.isInteger(config.mainPicks) || !Number.isInteger(config.mainTotal) ||
      !Number.isInteger(config.bonusPicks) || !Number.isInteger(config.bonusTotal)) {
    return "Lottery setup must contain whole numbers.";
  }

  if (config.mainPicks < 1 || config.mainTotal < 2 || config.mainPicks > config.mainTotal) {
    return "Main lottery format is invalid.";
  }

  if (config.bonusPicks < 0 || config.bonusTotal < 0) {
    return "Bonus lottery format is invalid.";
  }

  if (config.bonusPicks > 0 && config.bonusTotal < 1) {
    return "Bonus pool must be greater than 0 when bonus picks are used.";
  }

  if (config.bonusPicks > config.bonusTotal) {
    return "Bonus picks cannot be greater than bonus pool.";
  }

  return "";
}

function rebuildNumberInputs() {
  const config = getConfig();
  const mainInputs = document.getElementById("mainInputs");
  const bonusInputs = document.getElementById("bonusInputs");
  const bonusSection = document.getElementById("bonusSection");

  mainInputs.innerHTML = "";
  bonusInputs.innerHTML = "";

  for (let i = 1; i <= config.mainPicks; i++) {
    const input = document.createElement("input");
    input.type = "number";
    input.min = "1";
    input.max = String(config.mainTotal);
    input.placeholder = String(i);
    input.className = "number-input";
    input.id = "main_" + i;
    mainInputs.appendChild(input);
  }

  if (config.bonusPicks > 0) {
    bonusSection.classList.remove("hidden");

    for (let i = 1; i <= config.bonusPicks; i++) {
      const input = document.createElement("input");
      input.type = "number";
      input.min = "1";
      input.max = String(config.bonusTotal);
      input.placeholder = String(i);
      input.className = "number-input";
      input.id = "bonus_" + i;
      bonusInputs.appendChild(input);
    }
  } else {
    bonusSection.classList.add("hidden");
  }
}

function getMainNumbers() {
  const config = getConfig();
  const values = [];
  for (let i = 1; i <= config.mainPicks; i++) {
    values.push(Number(document.getElementById("main_" + i).value));
  }
  return values;
}

function getBonusNumbers() {
  const config = getConfig();
  const values = [];
  for (let i = 1; i <= config.bonusPicks; i++) {
    values.push(Number(document.getElementById("bonus_" + i).value));
  }
  return values;
}

function validateNumberSet(numbers, min, max, label) {
  if (numbers.some(n => !Number.isInteger(n) || n < min || n > max)) {
    return `Please enter valid ${label} numbers between ${min} and ${max}.`;
  }

  const unique = new Set(numbers);
  if (unique.size !== numbers.length) {
    return `Please enter different ${label} numbers.`;
  }

  return "";
}

function validateAllInputs() {
  const config = getConfig();
  const configError = validateConfig(config);
  if (configError) return configError;

  const mainNumbers = getMainNumbers();
  const mainError = validateNumberSet(mainNumbers, 1, config.mainTotal, "main");
  if (mainError) return mainError;

  if (config.bonusPicks > 0) {
    const bonusNumbers = getBonusNumbers();
    const bonusError = validateNumberSet(bonusNumbers, 1, config.bonusTotal, "bonus");
    if (bonusError) return bonusError;
  }

  return "";
}

function getDrawsPerWeek() {
  const value = Number(document.getElementById("drawsPerWeek").value);
  return value > 0 ? value : 2;
}

function getTicketPrice() {
  const value = Number(document.getElementById("ticketPrice").value);
  return value > 0 ? value : 30;
}

function getCurrency() {
  return document.getElementById("currency").value;
}

function getJackpotCombinations(config) {
  const mainComb = combinations(config.mainTotal, config.mainPicks);
  const bonusComb = config.bonusPicks > 0 ? combinations(config.bonusTotal, config.bonusPicks) : 1;
  return mainComb * bonusComb;
}

function getJackpotProbability(config) {
  return 1 / getJackpotCombinations(config);
}

function probabilityAtLeastOneWin(years, drawsPerWeek, p) {
  const draws = years * 52 * drawsPerWeek;
  return 1 - Math.pow(1 - p, draws);
}

function geometricSimulation(p) {
  const u = Math.random();
  return Math.ceil(Math.log(1 - u) / Math.log(1 - p));
}

function setHeroResult(value, description) {
  document.getElementById("heroResult").textContent = value;
  document.getElementById("heroDescription").textContent = description;
}

function updateStaticStats() {
  clearError();

  const config = getConfig();
  const configError = validateConfig(config);
  if (configError) {
    setError(configError);
    return;
  }

  const drawsPerWeek = getDrawsPerWeek();
  const combinationsCount = getJackpotCombinations(config);
  const p = 1 / combinationsCount;
  const averageDraws = 1 / p;
  const averageYears = averageDraws / (drawsPerWeek * 52);

  const p10 = probabilityAtLeastOneWin(10, drawsPerWeek, p) * 100;
  const p20 = probabilityAtLeastOneWin(20, drawsPerWeek, p) * 100;
  const p50 = probabilityAtLeastOneWin(50, drawsPerWeek, p) * 100;
  const p80 = probabilityAtLeastOneWin(80, drawsPerWeek, p) * 100;

  document.getElementById("oddsPerDraw").textContent = "1 in " + formatNumber(combinationsCount);
  document.getElementById("averageYears").textContent = formatNumber(averageYears) + " years";
  document.getElementById("chance10").textContent = formatPercent(p10);
  document.getElementById("chance50").textContent = formatPercent(p50);

  let desc = `${config.mainPicks}/${config.mainTotal}`;
  if (config.bonusPicks > 0) {
    desc += ` + ${config.bonusPicks}/${config.bonusTotal}`;
  }
  document.getElementById("oddsDescription").textContent = `Jackpot format: ${desc}`;

  document.getElementById("chance10b").textContent = formatPercent(p10);
  document.getElementById("chance20b").textContent = formatPercent(p20);
  document.getElementById("chance50b").textContent = formatPercent(p50);
  document.getElementById("chance80b").textContent = formatPercent(p80);

  setHeroResult(
    formatNumber(averageYears) + " years",
    "At your current draw frequency, this lottery is practically unwinnable in a normal human lifetime."
  );
}

function renderHistogram(results, drawsPerWeek) {
  const years = results.map(r => r / (drawsPerWeek * 52));

  const buckets = [
    { label: "< 10k years", count: 0 },
    { label: "10k–50k", count: 0 },
    { label: "50k–100k", count: 0 },
    { label: "100k–500k", count: 0 },
    { label: "500k+", count: 0 }
  ];

  years.forEach(y => {
    if (y < 10000) buckets[0].count++;
    else if (y < 50000) buckets[1].count++;
    else if (y < 100000) buckets[2].count++;
    else if (y < 500000) buckets[3].count++;
    else buckets[4].count++;
  });

  const maxCount = Math.max(...buckets.map(b => b.count), 1);
  const chartGrid = document.getElementById("chartGrid");
  chartGrid.innerHTML = "";

  buckets.forEach(bucket => {
    const col = document.createElement("div");
    col.className = "bar-col";

    const value = document.createElement("div");
    value.className = "bar-value";
    value.textContent = bucket.count;

    const bar = document.createElement("div");
    bar.className = "bar";
    bar.style.height = `${Math.max((bucket.count / maxCount) * 180, 8)}px`;

    const label = document.createElement("div");
    label.className = "bar-label";
    label.textContent = bucket.label;

    col.appendChild(value);
    col.appendChild(bar);
    col.appendChild(label);

    chartGrid.appendChild(col);
  });

  document.getElementById("chartWrap").classList.remove("hidden");
}

function runOneSimulation() {
  clearError();

  const validationError = validateAllInputs();
  if (validationError) {
    setError(validationError);
    return;
  }

  const config = getConfig();
  const p = getJackpotProbability(config);
  const drawsPerWeek = getDrawsPerWeek();
  const ticketPrice = getTicketPrice();
  const currency = getCurrency();

  const drawsNeeded = geometricSimulation(p);
  const yearsNeeded = drawsNeeded / (drawsPerWeek * 52);
  const moneySpent = drawsNeeded * ticketPrice;

  setHeroResult(
    formatNumber(yearsNeeded, 1) + " years",
    "In this single random simulation, your numbers matched the jackpot after this approximate time."
  );

  document.getElementById("resultBox").innerHTML = `
    <strong>In this simulation, your numbers matched the jackpot after:</strong><br>
    ${formatNumber(drawsNeeded)} draws<br><br>

    <strong>Approximate time:</strong><br>
    ${formatNumber(yearsNeeded, 1)} years<br><br>

    <strong>Money spent at ${formatNumber(ticketPrice, 2)} ${currency} per ticket:</strong><br>
    ${formatNumber(moneySpent, 2)} ${currency}<br><br>

    <span class="muted">This is one random simulation, not a prediction.</span>
  `;

  document.getElementById("shareText").value =
    `My lottery numbers matched the jackpot after about ${formatNumber(yearsNeeded, 1)} years in one simulation.`;

  document.getElementById("chartWrap").classList.add("hidden");
}

function runHundredSimulations() {
  clearError();

  const validationError = validateAllInputs();
  if (validationError) {
    setError(validationError);
    return;
  }

  const config = getConfig();
  const p = getJackpotProbability(config);
  const drawsPerWeek = getDrawsPerWeek();
  const ticketPrice = getTicketPrice();
  const currency = getCurrency();

  const results = [];
  for (let i = 0; i < 100; i++) {
    results.push(geometricSimulation(p));
  }

  const sorted = [...results].sort((a, b) => a - b);
  const averageDraws = results.reduce((sum, val) => sum + val, 0) / results.length;
  const medianDraws = sorted[Math.floor(sorted.length / 2)];
  const bestDraws = sorted[0];
  const worstDraws = sorted[sorted.length - 1];

  const averageYears = averageDraws / (drawsPerWeek * 52);
  const medianYears = medianDraws / (drawsPerWeek * 52);
  const bestYears = bestDraws / (drawsPerWeek * 52);
  const worstYears = worstDraws / (drawsPerWeek * 52);
  const averageSpent = averageDraws * ticketPrice;

  setHeroResult(
    formatNumber(averageYears, 1) + " years",
    "At your current draw frequency, this lottery is practically unwinnable in a human lifetime."
  );

  document.getElementById("resultBox").innerHTML = `
    <strong>100-Simulation Reality Check:</strong><br><br>

    <strong>Average result:</strong> ${formatNumber(averageYears, 1)} years<br>
    <strong>Median result:</strong> ${formatNumber(medianYears, 1)} years<br>
    <strong>Best result:</strong> ${formatNumber(bestYears, 1)} years<br>
    <strong>Worst result:</strong> ${formatNumber(worstYears, 1)} years<br><br>

    <strong>Average draws:</strong> ${formatNumber(averageDraws)}<br>
    <strong>Average money spent:</strong> ${formatNumber(averageSpent, 2)} ${currency}<br><br>

    <span class="muted">These 100 simulations show how wildly lottery outcomes can vary.</span>
  `;

  document.getElementById("shareText").value =
    `I ran 100 lottery simulations. Average jackpot wait: ${formatNumber(averageYears, 1)} years.`;

  renderHistogram(results, drawsPerWeek);
}

function generateUniqueNumbers(count, max) {
  const numbers = [];
  while (numbers.length < count) {
    const randomNumber = Math.floor(Math.random() * max) + 1;
    if (!numbers.includes(randomNumber)) {
      numbers.push(randomNumber);
    }
  }
  numbers.sort((a, b) => a - b);
  return numbers;
}

function generateRandomNumbers() {
  clearError();

  const config = getConfig();
  const configError = validateConfig(config);
  if (configError) {
    setError(configError);
    return;
  }

  const mainNumbers = generateUniqueNumbers(config.mainPicks, config.mainTotal);
  for (let i = 0; i < config.mainPicks; i++) {
    document.getElementById("main_" + (i + 1)).value = mainNumbers[i];
  }

  if (config.bonusPicks > 0) {
    const bonusNumbers = generateUniqueNumbers(config.bonusPicks, config.bonusTotal);
    for (let i = 0; i < config.bonusPicks; i++) {
      document.getElementById("bonus_" + (i + 1)).value = bonusNumbers[i];
    }
  }

  document.getElementById("shareText").value = "Random numbers generated. Run a simulation to create a shareable result.";
  setHeroResult("Ready", "Random numbers were generated. Run a simulation to see the outcome.");
  document.getElementById("chartWrap").classList.add("hidden");
}

function compareWithRandom() {
  clearError();

  const validationError = validateAllInputs();
  if (validationError) {
    setError(validationError);
    return;
  }

  const config = getConfig();
  const p = getJackpotProbability(config);
  const drawsPerWeek = getDrawsPerWeek();

  const userResults = [];
  const randomResults = [];

  for (let i = 0; i < 100; i++) {
    userResults.push(geometricSimulation(p));
    randomResults.push(geometricSimulation(p));
  }

  const avgUser = userResults.reduce((a, b) => a + b, 0) / userResults.length;
  const avgRandom = randomResults.reduce((a, b) => a + b, 0) / randomResults.length;

  const avgUserYears = avgUser / (drawsPerWeek * 52);
  const avgRandomYears = avgRandom / (drawsPerWeek * 52);
  const difference = Math.abs(avgUserYears - avgRandomYears);

  setHeroResult(
    "No real edge",
    "Your chosen numbers are not smarter than random numbers. Any difference you see here is just noise from the simulation."
  );

  document.getElementById("resultBox").innerHTML = `
    <strong>Your numbers vs random numbers (100 simulations each):</strong><br><br>

    <strong>Your numbers average:</strong> ${formatNumber(avgUserYears, 1)} years<br>
    <strong>Random numbers average:</strong> ${formatNumber(avgRandomYears, 1)} years<br>
    <strong>Simulated difference:</strong> ${formatNumber(difference, 1)} years<br><br>

    <span class="muted">Both number sets have exactly the same real jackpot odds. This difference is only random variation from the simulation.</span>
  `;

  document.getElementById("shareText").value =
    `I compared my lottery numbers with random numbers. Result: both have the same real odds.`;

  document.getElementById("chartWrap").classList.add("hidden");
}

function runLifetimeCalculator() {
  clearError();

  const configError = validateConfig(getConfig());
  if (configError) {
    setError(configError);
    return;
  }

  const currentAge = Number(document.getElementById("currentAge").value);
  const playUntilAge = Number(document.getElementById("playUntilAge").value);
  const drawsPerWeek = getDrawsPerWeek();
  const ticketPrice = getTicketPrice();
  const currency = getCurrency();
  const p = getJackpotProbability(getConfig());

  if (!Number.isInteger(currentAge) || !Number.isInteger(playUntilAge) || currentAge < 1 || playUntilAge > 120 || playUntilAge <= currentAge) {
    setError("Please enter a valid age range.");
    return;
  }

  const yearsPlaying = playUntilAge - currentAge;
  const totalDraws = yearsPlaying * 52 * drawsPerWeek;
  const totalSpent = totalDraws * ticketPrice;
  const chanceToWin = (1 - Math.pow(1 - p, totalDraws)) * 100;
  const chanceToNeverWin = 100 - chanceToWin;

  setHeroResult(
    formatPercent(chanceToWin),
    `Even if you play for ${yearsPlaying} years, your jackpot chance is still usually tiny.`
  );

  document.getElementById("lifetimeBox").innerHTML = `
    <strong>If you play from age ${currentAge} to ${playUntilAge}:</strong><br><br>

    <strong>Total years playing:</strong> ${yearsPlaying}<br>
    <strong>Total draws:</strong> ${formatNumber(totalDraws)}<br>
    <strong>Total money spent:</strong> ${formatNumber(totalSpent, 2)} ${currency}<br><br>

    <strong>Chance to hit jackpot at least once:</strong> ${formatPercent(chanceToWin)}<br>
    <strong>Chance to never hit jackpot:</strong> ${formatPercent(chanceToNeverWin)}<br><br>

    <strong>Reality check:</strong><br>
    Even after playing for ${yearsPlaying} years, the jackpot chance is still usually very low.
  `;

  document.getElementById("shareText").value =
    `Even if I played this lottery for ${yearsPlaying} years, my jackpot chance would still be only ${formatPercent(chanceToWin)}.`;

  document.getElementById("chartWrap").classList.add("hidden");
}

function copyShareText() {
  const text = document.getElementById("shareText").value;
  navigator.clipboard.writeText(text)
    .then(() => {
      alert("Share text copied.");
    })
    .catch(() => {
      alert("Copy failed. Please copy the text manually.");
    });
}

function resetDynamicBoxes() {
  document.getElementById("resultBox").innerHTML = "Your results will appear here.";
  document.getElementById("lifetimeBox").innerHTML = "Lifetime results will appear here.";
  document.getElementById("shareText").value = "Run a simulation to generate a shareable result.";
  setHeroResult("—", "Run a simulation to see your main result here.");
  document.getElementById("chartWrap").classList.add("hidden");
}

function resetAll() {
  applyPreset();

  const config = getConfig();

  for (let i = 1; i <= config.mainPicks; i++) {
    document.getElementById("main_" + i).value = "";
  }

  for (let i = 1; i <= config.bonusPicks; i++) {
    document.getElementById("bonus_" + i).value = "";
  }

  document.getElementById("currentAge").value = 25;
  document.getElementById("playUntilAge").value = 80;

  clearError();
  resetDynamicBoxes();
  updateStaticStats();
}

function initLotteryPage(defaultPreset = "sportka") {
  const presetSelect = document.getElementById("lotteryPreset");
  if (presetSelect) {
    presetSelect.value = defaultPreset;
  }

  document.getElementById("lotteryPreset").addEventListener("change", applyPreset);
  document.getElementById("drawsPerWeek").addEventListener("input", updateStaticStats);
  document.getElementById("mainPicks").addEventListener("input", () => {
    rebuildNumberInputs();
    updateStaticStats();
    resetDynamicBoxes();
  });
  document.getElementById("mainTotal").addEventListener("input", () => {
    rebuildNumberInputs();
    updateStaticStats();
    resetDynamicBoxes();
  });
  document.getElementById("bonusPicks").addEventListener("input", () => {
    rebuildNumberInputs();
    updateStaticStats();
    resetDynamicBoxes();
  });
  document.getElementById("bonusTotal").addEventListener("input", () => {
    rebuildNumberInputs();
    updateStaticStats();
    resetDynamicBoxes();
  });

  applyPreset();
}
