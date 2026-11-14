export const TOTAL_SOLS = 30;

export const INITIAL_RESOURCES = [
  {
    name: "Oxygen",
    amount: 180,
    unit: "kg",
    dailyUsage: 5,
    icon: "🫧",
    color: "#56c5ed",
    description: "Breathable oxygen supply",
  },
  {
    name: "Water",
    amount: 540,
    unit: "L",
    dailyUsage: 18,
    icon: "💧",
    color: "#399cf5",
    description: "Drinking and daily water supply",
  },
  {
    name: "Food",
    amount: 270,
    unit: "kg",
    dailyUsage: 9,
    icon: "🥫",
    color: "#e9a34c",
    description: "Stored food for the crew",
  },
  {
    name: "Power",
    amount: 100,
    unit: "%",
    dailyUsage: 2,
    icon: "⚡",
    color: "#e8d15d",
    description: "Habitat energy reserves",
  },
];

export const MAXIMUM_VALUES = {
  Oxygen: 180,
  Water: 540,
  Food: 270,
  Power: 100,
};

const percentOf = (resources, name) => {
  const resource = resources.find((item) => item.name === name);
  return (resource.amount / MAXIMUM_VALUES[name]) * 100;
};

/* ---------------- HISTORY (for charts) ---------------- */

// One chart point: every resource as a % of its starting amount
export function getSnapshot(sol, resources) {
  return {
    sol,
    oxygen: Math.round(percentOf(resources, "Oxygen")),
    water: Math.round(percentOf(resources, "Water")),
    food: Math.round(percentOf(resources, "Food")),
    power: Math.round(percentOf(resources, "Power")),
  };
}

/* ---------------- DECISIONS ---------------- */

export const DECISIONS = [
  {
    id: "ration-water",
    icon: "🚰",
    title: "Ration water",
    gain: "+40 L water",
    cost: "Stress +3, morale -3",
    resources: { Water: 40 },
    crew: { stress: 3, morale: -3 },
  },
  {
    id: "cut-power",
    icon: "🔌",
    title: "Cut non-essential power",
    gain: "+8% power",
    cost: "Morale -3",
    resources: { Power: 8 },
    crew: { morale: -3 },
  },
  {
    id: "repair-solar",
    icon: "🛠️",
    title: "Repair solar panels",
    gain: "+10% power",
    cost: "Fatigue +6",
    resources: { Power: 10 },
    crew: { fatigue: 6 },
  },
  {
    id: "make-oxygen",
    icon: "🫧",
    title: "Run emergency oxygen generator",
    gain: "+15 kg oxygen",
    cost: "-6% power",
    resources: { Oxygen: 15, Power: -6 },
    crew: {},
  },
  {
    id: "reduce-rations",
    icon: "🥫",
    title: "Reduce food rations",
    gain: "+20 kg food",
    cost: "Health -2, morale -4",
    resources: { Food: 20 },
    crew: { health: -2, morale: -4 },
  },
  {
    id: "rest-day",
    icon: "😴",
    title: "Give the crew a rest day",
    gain: "Fatigue -12, stress -8, morale +4",
    cost: "-6 kg food",
    resources: { Food: -6 },
    crew: { fatigue: -12, stress: -8, morale: 4 },
  },
];

// Returns the resources after a decision is applied
export function applyDecision(resources, decision) {
  return resources.map((resource) => {
    const change = decision.resources[resource.name] || 0;
    return {
      ...resource,
      amount: Math.max(
        0,
        Math.min(MAXIMUM_VALUES[resource.name], resource.amount + change)
      ),
    };
  });
}

/* ---------------- WEATHER ---------------- */

export const WEATHER_TYPES = [
  "Normal",
  "Dusty",
  "Dust Storm",
  "Severe Dust Storm",
];

export const WEATHER_INFO = {
  Normal: {
    icon: "☀️",
    solar: 100,
    powerMultiplier: 1,
    stress: 0,
    note: "Clear skies. Solar panels are working at full output.",
  },
  Dusty: {
    icon: "🌫️",
    solar: 70,
    powerMultiplier: 1.5,
    stress: 3,
    note: "Dust in the air is reducing solar panel output.",
  },
  "Dust Storm": {
    icon: "🌪️",
    solar: 40,
    powerMultiplier: 2.5,
    stress: 8,
    note: "A dust storm is blocking most sunlight. Power is draining fast.",
  },
  "Severe Dust Storm": {
    icon: "🌀",
    solar: 15,
    powerMultiplier: 4,
    stress: 14,
    note: "Severe storm. Solar generation is almost zero.",
  },
};

// Weather is fixed for each sol so every run of the mission is the same
const WEATHER_SCHEDULE = {
  6: "Dusty",
  7: "Dusty",
  8: "Dust Storm",
  9: "Dust Storm",
  10: "Severe Dust Storm",
  11: "Severe Dust Storm",
  12: "Dusty",
  20: "Dusty",
  21: "Dusty",
  22: "Dust Storm",
  23: "Dust Storm",
  24: "Dusty",
};

export const getWeather = (sol) => WEATHER_SCHEDULE[sol] || "Normal";

export const getForecast = (sol, days = 3) =>
  Array.from({ length: days }, (_, index) => {
    const nextSol = sol + index + 1;
    return nextSol <= TOTAL_SOLS
      ? { sol: nextSol, weather: getWeather(nextSol) }
      : null;
  }).filter(Boolean);

/* ---------------- DAILY USAGE ---------------- */

// Storms drain power faster, and low power slows water recycling
export function getDailyUsage(resource, missionDay, resources) {
  let usage = resource.dailyUsage;

  if (resource.name === "Power") {
    usage *= WEATHER_INFO[getWeather(missionDay)].powerMultiplier;
  }

  if (resource.name === "Water" && percentOf(resources, "Power") <= 30) {
    usage *= 1.25;
  }

  return Math.round(usage);
}

/* ---------------- ALERTS ---------------- */

const LEVEL_ORDER = { critical: 0, warning: 1, info: 2, ok: 3 };

export function getAlerts(missionDay, resources) {
  const alerts = [];
  const weather = getWeather(missionDay);
  const weatherIndex = WEATHER_TYPES.indexOf(weather);

  if (weatherIndex === 3) {
    alerts.push({
      level: "critical",
      title: "Severe dust storm",
      message:
        "Solar generation has fallen to 15%. Cut non-essential power use now.",
    });
  } else if (weatherIndex === 2) {
    alerts.push({
      level: "warning",
      title: "Dust storm in progress",
      message: "Solar generation is down to 40%. The battery is draining faster.",
    });
  } else if (weatherIndex === 1) {
    alerts.push({
      level: "info",
      title: "Dusty conditions",
      message: "Solar output is reduced to 70%.",
    });
  }

  const upcoming = getForecast(missionDay, 2).find((item) => {
    const index = WEATHER_TYPES.indexOf(item.weather);
    return index >= 2 && index > weatherIndex;
  });

  if (upcoming) {
    alerts.push({
      level: "warning",
      title: "Storm incoming",
      message: `${upcoming.weather} expected on Sol ${upcoming.sol}. Prepare to ration power.`,
    });
  }

  const power = Math.round(percentOf(resources, "Power"));

  if (power <= 20) {
    alerts.push({
      level: "critical",
      title: "Low battery",
      message: `Battery is at ${power}%. Life support may fail soon.`,
    });
  } else if (power <= 50) {
    alerts.push({
      level: "warning",
      title: "Low battery",
      message: `Battery is at ${power}% and still dropping.`,
    });
  }

  if (power <= 30) {
    alerts.push({
      level: "warning",
      title: "Water recycling slowed",
      message:
        "Low power is reducing recycling efficiency, so water use is up 25%.",
    });
  }

  ["Oxygen", "Water", "Food"].forEach((name) => {
    const value = Math.round(percentOf(resources, name));

    if (value <= 20) {
      alerts.push({
        level: "critical",
        title: `${name} critically low`,
        message: `${name} is at ${value}%. Start rationing immediately.`,
      });
    } else if (value <= 50) {
      alerts.push({
        level: "warning",
        title: `${name} running low`,
        message: `${name} is at ${value}% of the original supply.`,
      });
    }
  });

  if (alerts.length === 0) {
    alerts.push({
      level: "ok",
      title: "All systems nominal",
      message: "No active alerts. Supplies and weather are stable.",
    });
  }

  return alerts.sort((a, b) => LEVEL_ORDER[a.level] - LEVEL_ORDER[b.level]);
}

/* ---------------- ADVISOR STATE ---------------- */

// Converts the live mission data into the format the Advisor Council uses
export function getAdvisorState(missionDay, resources) {
  const percent = (name) => Math.round(percentOf(resources, name));

  return {
    sol: missionDay,
    oxygen: percent("Oxygen"),
    water: percent("Water"),
    food: percent("Food"),
    power: percent("Power"),
    weather: getWeather(missionDay),
  };
}

/* ---------------- CREW ---------------- */

// base = starting condition, rate = change per sol
export const CREW = [
  {
    id: "commander",
    name: "Aanya Rao",
    role: "Mission Commander",
    icon: "🎖️",
    skills: ["Leadership", "Navigation", "Crisis Control"],
    base: { health: 98, fatigue: 8, stress: 10, morale: 92 },
    rate: { health: 0.3, fatigue: 1.5, stress: 1.3, morale: 0.8 },
  },
  {
    id: "engineer",
    name: "Marcus Hale",
    role: "Chief Engineer",
    icon: "🛠️",
    skills: ["Power Systems", "Repairs", "Robotics"],
    base: { health: 96, fatigue: 12, stress: 14, morale: 88 },
    rate: { health: 0.35, fatigue: 1.8, stress: 1.2, morale: 0.9 },
  },
  {
    id: "medical",
    name: "Dr. Lena Okafor",
    role: "Medical Officer",
    icon: "🩺",
    skills: ["Emergency Care", "Nutrition", "Psychology"],
    base: { health: 99, fatigue: 10, stress: 12, morale: 90 },
    rate: { health: 0.25, fatigue: 1.6, stress: 1.1, morale: 0.7 },
  },
  {
    id: "geologist",
    name: "Kenji Tanaka",
    role: "Geologist",
    icon: "⛏️",
    skills: ["Soil Analysis", "Ice Mining", "Sampling"],
    base: { health: 95, fatigue: 14, stress: 9, morale: 94 },
    rate: { health: 0.4, fatigue: 1.9, stress: 1.0, morale: 0.8 },
  },
  {
    id: "lifesupport",
    name: "Sofia Marin",
    role: "Life Support Specialist",
    icon: "🌱",
    skills: ["Water Recycling", "Hydroponics", "Air Quality"],
    base: { health: 97, fatigue: 9, stress: 11, morale: 91 },
    rate: { health: 0.3, fatigue: 1.5, stress: 1.2, morale: 0.7 },
  },
  {
    id: "pilot",
    name: "Omar Haddad",
    role: "Pilot",
    icon: "🚀",
    skills: ["Rover Driving", "Flight Systems", "Navigation"],
    base: { health: 97, fatigue: 11, stress: 15, morale: 86 },
    rate: { health: 0.35, fatigue: 1.7, stress: 1.4, morale: 1.0 },
  },
];

const clamp = (value) => Math.max(0, Math.min(100, Math.round(value)));

// Calculates each astronaut's current condition from the live mission state
export function getCrew(missionDay, resources, decisions = []) {
  const sol = missionDay - 1;

  const lifeSupportMin = Math.min(
    percentOf(resources, "Oxygen"),
    percentOf(resources, "Water"),
    percentOf(resources, "Food")
  );

  // Penalties grow as supplies run low
  const lifePenalty = Math.max(0, 50 - lifeSupportMin) * 0.6;
  const powerPenalty = Math.max(0, 40 - percentOf(resources, "Power")) * 0.4;
  const weatherStress = WEATHER_INFO[getWeather(missionDay)].stress;

  // Total effect of every decision made so far
  const adjust = { health: 0, fatigue: 0, stress: 0, morale: 0 };
  decisions.forEach((item) => {
    const decision = DECISIONS.find((entry) => entry.id === item.id);
    if (!decision) return;
    Object.keys(decision.crew).forEach((key) => {
      adjust[key] += decision.crew[key];
    });
  });

  return CREW.map((member) => {
    const health = clamp(
      member.base.health -
        sol * member.rate.health -
        lifePenalty +
        adjust.health
    );
    const fatigue = clamp(
      member.base.fatigue +
        sol * member.rate.fatigue +
        powerPenalty * 0.5 +
        lifePenalty * 0.3 +
        adjust.fatigue
    );
    const stress = clamp(
      member.base.stress +
        sol * member.rate.stress +
        lifePenalty * 0.8 +
        powerPenalty * 0.6 +
        weatherStress +
        adjust.stress
    );
    const morale = clamp(
      member.base.morale -
        sol * member.rate.morale -
        lifePenalty * 0.6 -
        powerPenalty * 0.5 +
        adjust.morale
    );

    let duty = "AVAILABLE";
    if (health <= 35 || fatigue >= 90) {
      duty = "REST REQUIRED";
    } else if (health < 60 || fatigue > 70 || stress > 75) {
      duty = "LIMITED DUTY";
    }

    let note = "Performing well. Ready for all assigned duties.";
    if (health < 60) note = "Health is dropping. A medical check is advised.";
    else if (stress > 75) note = "High stress. Schedule recovery time.";
    else if (fatigue > 70) note = "Fatigued. Reduce workload and allow rest.";
    else if (morale < 40) note = "Low morale. A group activity is advised.";

    return { ...member, health, fatigue, stress, morale, duty, note };
  });
}
/* =====================================================
   MISSION REPORT AND SYSTEM INTELLIGENCE
   ===================================================== */

const average = (items, key) =>
  items.reduce((sum, item) => sum + item[key], 0) / items.length;

const levelByPercent = (value) =>
  value <= 20 ? "critical" : value <= 50 ? "warn" : "ok";

/* ---------------- SIMULATION (used by Regret Replay) ---------------- */

// decisionMap looks like { 5: "ration-water", 9: "repair-solar" }
export function runSimulation(decisionMap, untilSol) {
  let current = INITIAL_RESOURCES;
  const history = [];
  const applied = [];

  for (let sol = 1; sol <= untilSol; sol++) {
    const decision = DECISIONS.find((item) => item.id === decisionMap[sol]);

    if (decision && sol < TOTAL_SOLS) {
      current = applyDecision(current, decision);
      applied.push({ sol, id: decision.id });
    }

    history.push(getSnapshot(sol, current));

    if (sol < untilSol) {
      const before = current;
      current = before.map((resource) => ({
        ...resource,
        amount: Math.max(
          0,
          resource.amount - getDailyUsage(resource, sol, before)
        ),
      }));
    }
  }

  return {
    resources: current,
    history,
    crew: getCrew(untilSol, current, applied),
  };
}

/* ---------------- SCORE AND OUTCOME ---------------- */

// Survival rate needed at Sol 30 for a full success (change to tune the game)
const SUCCESS_SURVIVAL = 75;

export function getMissionSummary(sol, resources, crew) {
  const supplies = Math.round(
    resources.reduce(
      (sum, resource) => sum + percentOf(resources, resource.name),
      0
    ) / resources.length
  );

  const depleted = ["Oxygen", "Water", "Food"].filter(
    (name) => resources.find((item) => item.name === name).amount <= 0
  );

  const lifeSupportMin = Math.min(
    percentOf(resources, "Oxygen"),
    percentOf(resources, "Water"),
    percentOf(resources, "Food")
  );

  const avgHealth = average(crew, "health");
  const crewScore = Math.round(
    (avgHealth +
      average(crew, "morale") +
      (100 - average(crew, "stress")) +
      (100 - average(crew, "fatigue"))) /
      4
  );

  const failed = depleted.length > 0;

  let survival = Math.round(
    0.7 * avgHealth + 0.3 * Math.min(100, lifeSupportMin * 2)
  );
  if (failed) survival = Math.min(survival, 30);

  let score = Math.round(0.4 * supplies + 0.4 * crewScore + 0.2 * survival);
  if (failed) score = Math.min(score, 40);

  let grade = "F";
  if (score >= 85) grade = "A";
  else if (score >= 70) grade = "B";
  else if (score >= 55) grade = "C";
  else if (score >= 40) grade = "D";

  let outcome = "IN PROGRESS";
  if (failed) outcome = "MISSION FAILED";
  else if (sol >= TOTAL_SOLS) {
    outcome = survival >= SUCCESS_SURVIVAL ? "MISSION SUCCESS" : "NARROW SURVIVAL";
  }

  return { supplies, crewScore, survival, score, grade, outcome, depleted };
}

/* ---------------- KEY EVENTS (for the report timeline) ---------------- */

const RESOURCE_KEYS = [
  ["oxygen", "Oxygen"],
  ["water", "Water"],
  ["food", "Food"],
  ["power", "Power"],
];

const THRESHOLDS = [
  [0, "critical", (name) => `${name} ran out`],
  [20, "critical", (name) => `${name} critically low`],
  [50, "warning", (name) => `${name} dropped below 50%`],
];

export function getKeyEvents(history) {
  const events = [];
  const seen = {};

  history.forEach((entry, index) => {
    const weatherIndex = WEATHER_TYPES.indexOf(getWeather(entry.sol));
    const previousIndex =
      index > 0
        ? WEATHER_TYPES.indexOf(getWeather(history[index - 1].sol))
        : 0;

    if (weatherIndex >= 2 && previousIndex < 2) {
      events.push({
        sol: entry.sol,
        level: "critical",
        text: `${getWeather(entry.sol)} hit the habitat`,
      });
    }

    RESOURCE_KEYS.forEach(([key, name]) => {
      for (const [limit, level, text] of THRESHOLDS) {
        if (entry[key] <= limit) {
          if (!seen[`${key}-${limit}`]) {
            THRESHOLDS.forEach(([other]) => {
              if (other >= limit) seen[`${key}-${other}`] = true;
            });
            events.push({ sol: entry.sol, level, text: text(name) });
          }
          break;
        }
      }
    });
  });

  return events.sort((a, b) => a.sol - b.sol);
}

/* ---------------- PREDICTIONS ---------------- */

// Looks ahead to Sol 30 using today's weather schedule and no new decisions
export function predictResources(missionDay, resources) {
  let current = resources;
  const runsOutOn = {};

  resources.forEach((resource) => {
    if (resource.amount <= 0) runsOutOn[resource.name] = missionDay;
  });

  for (let sol = missionDay; sol < TOTAL_SOLS; sol++) {
    const before = current;
    current = before.map((resource) => ({
      ...resource,
      amount: Math.max(
        0,
        resource.amount - getDailyUsage(resource, sol, before)
      ),
    }));

    current.forEach((resource) => {
      if (resource.amount <= 0 && !runsOutOn[resource.name]) {
        runsOutOn[resource.name] = sol + 1;
      }
    });
  }

  return resources.map((resource) => {
    const final = current.find((item) => item.name === resource.name);
    const finalPercent = Math.round(
      (final.amount / MAXIMUM_VALUES[resource.name]) * 100
    );
    const outSol = runsOutOn[resource.name] || null;

    let risk = "LOW";
    if (outSol) risk = "HIGH";
    else if (finalPercent <= 20) risk = "MEDIUM";

    return {
      name: resource.name,
      icon: resource.icon,
      unit: resource.unit,
      finalAmount: final.amount,
      finalPercent,
      runsOutOn: outSol,
      risk,
    };
  });
}

/* ---------------- CASCADE FAILURE MAP ---------------- */

export function getCascade(missionDay, resources, crew) {
  const weather = getWeather(missionDay);
  const weatherInfo = WEATHER_INFO[weather];
  const weatherIndex = WEATHER_TYPES.indexOf(weather);
  const power = Math.round(percentOf(resources, "Power"));
  const recycling = power <= 30 ? 75 : 100;
  const waterForecast = predictResources(missionDay, resources).find(
    (item) => item.name === "Water"
  );

  let shortageReason = "Water should last until the end of the mission.";
  if (waterForecast.runsOutOn) {
    shortageReason =
      waterForecast.runsOutOn <= missionDay
        ? "Water has run out."
        : `At the current rate, water runs out by Sol ${waterForecast.runsOutOn}.`;
  } else if (waterForecast.risk === "MEDIUM") {
    shortageReason = `Only ${waterForecast.finalPercent}% of the water remains at Sol ${TOTAL_SOLS}.`;
  }

  const stormChain = {
    id: "storm",
    title: "STORM TO WATER SHORTAGE",
    nodes: [
      {
        id: "weather",
        title: "Weather",
        value: weather,
        level: weatherIndex >= 2 ? "critical" : weatherIndex === 1 ? "warn" : "ok",
        reason: weatherInfo.note,
      },
      {
        id: "solar",
        title: "Solar generation",
        value: `${weatherInfo.solar}%`,
        level:
          weatherInfo.solar >= 70
            ? "ok"
            : weatherInfo.solar >= 40
            ? "warn"
            : "critical",
        reason:
          weatherInfo.solar === 100
            ? "Panels receive full sunlight."
            : `Dust blocks sunlight, so panels give ${weatherInfo.solar}% of normal output.`,
      },
      {
        id: "battery",
        title: "Battery level",
        value: `${power}%`,
        level: levelByPercent(power),
        reason:
          weatherInfo.powerMultiplier === 1
            ? "Power use is normal today."
            : `Weather raises power use by x${weatherInfo.powerMultiplier} today.`,
      },
      {
        id: "recycling",
        title: "Water recycling",
        value: `${recycling}%`,
        level: recycling < 100 ? "warn" : "ok",
        reason:
          recycling < 100
            ? "Battery is at 30% or lower, so recycling slows and water use rises 25%."
            : "There is enough power to recycle water at full efficiency.",
      },
      {
        id: "shortage",
        title: "Water shortage risk",
        value: waterForecast.risk,
        level:
          waterForecast.risk === "HIGH"
            ? "critical"
            : waterForecast.risk === "MEDIUM"
            ? "warn"
            : "ok",
        reason: shortageReason,
      },
    ],
  };

  const lowest = ["Oxygen", "Water", "Food"]
    .map((name) => ({ name, value: Math.round(percentOf(resources, name)) }))
    .sort((a, b) => a.value - b.value)[0];
  const avgStress = Math.round(average(crew, "stress"));
  const avgFatigue = Math.round(average(crew, "fatigue"));
  const available = crew.filter((member) => member.duty === "AVAILABLE").length;

  const crewChain = {
    id: "crew",
    title: "LOW SUPPLIES TO CREW DUTY",
    nodes: [
      {
        id: "supplies",
        title: "Lowest life-support supply",
        value: `${lowest.name} ${lowest.value}%`,
        level: levelByPercent(lowest.value),
        reason:
          lowest.value > 50
            ? "All life-support supplies are at safe levels."
            : `${lowest.name} is running low and is adding pressure on the crew.`,
      },
      {
        id: "stress",
        title: "Crew stress",
        value: `${avgStress}%`,
        level: avgStress >= 70 ? "critical" : avgStress >= 45 ? "warn" : "ok",
        reason: "Storms, low power and low supplies all raise stress.",
      },
      {
        id: "fatigue",
        title: "Crew fatigue",
        value: `${avgFatigue}%`,
        level: avgFatigue >= 70 ? "critical" : avgFatigue >= 45 ? "warn" : "ok",
        reason: "Fatigue builds every sol and grows faster when power is low.",
      },
      {
        id: "duty",
        title: "Duty availability",
        value: `${available} / ${crew.length}`,
        level:
          available === crew.length
            ? "ok"
            : available > crew.length / 2
            ? "warn"
            : "critical",
        reason:
          available === crew.length
            ? "Every astronaut is fit for duty."
            : "Tired or stressed astronauts are on limited duty or resting.",
      },
    ],
  };

  return [stormChain, crewChain];
}

/* ---------------- EQUIPMENT STATUS ---------------- */

export function getEquipment(missionDay, resources) {
  const solar = WEATHER_INFO[getWeather(missionDay)].solar;
  const power = Math.round(percentOf(resources, "Power"));
  const oxygen = Math.round(percentOf(resources, "Oxygen"));
  const food = Math.round(percentOf(resources, "Food"));

  const status = (value, onlineAt, degradedAt) =>
    value >= onlineAt ? "ONLINE" : value >= degradedAt ? "DEGRADED" : "FAILING";

  return [
    {
      id: "solar",
      name: "Solar array",
      icon: "☀️",
      efficiency: solar,
      status: status(solar, 70, 25),
      detail: `Producing ${solar}% of normal output.`,
    },
    {
      id: "battery",
      name: "Battery bank",
      icon: "🔋",
      efficiency: power,
      status: status(power, 51, 21),
      detail: `${power}% charge remaining.`,
    },
    {
      id: "recycler",
      name: "Water recycler",
      icon: "♻️",
      efficiency: power <= 30 ? 75 : 100,
      status: power <= 30 ? "DEGRADED" : "ONLINE",
      detail:
        power <= 30
          ? "Low power cuts recycling to 75%."
          : "Recycling at full efficiency.",
    },
    {
      id: "oxygen",
      name: "Oxygen reserve",
      icon: "🫧",
      efficiency: oxygen,
      status: status(oxygen, 51, 21),
      detail: `${oxygen}% of the oxygen supply remains.`,
    },
    {
      id: "food",
      name: "Food stores",
      icon: "🥫",
      efficiency: food,
      status: status(food, 51, 21),
      detail: `${food}% of the food supply remains.`,
    },
  ];
}