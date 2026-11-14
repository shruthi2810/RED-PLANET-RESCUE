import { useState } from "react";
import "./AdvisorCouncil.css";

const WEATHER = ["Normal", "Dusty", "Dust Storm", "Severe Dust Storm"];

// Approximate % of full supply used per sol (from the Survive page)
const DAILY_DROP = { oxygen: 2.8, water: 3.3, food: 3.3, power: 2 };

const RISK_ORDER = { LOW: 0, MEDIUM: 1, HIGH: 2 };

const DEFAULT_STATE = {
  sol: 8,
  oxygen: 78,
  water: 52,
  food: 68,
  power: 35,
  weather: "Dust Storm",
};

function getAdvice(s) {
  const storm = WEATHER.indexOf(s.weather);

  /* Chief Engineer: power and equipment */
  let engineer;
  if (s.power <= 20 || storm === 3) {
    engineer = {
      risk: "HIGH",
      recommendation:
        "Switch to emergency power mode and shut down all non-essential systems.",
      reason:
        s.power <= 20
          ? `Battery is at ${s.power}%, close to a full shutdown.`
          : "A severe dust storm is blocking most solar generation.",
    };
  } else if (s.power <= 50 || storm === 2) {
    engineer = {
      risk: "MEDIUM",
      recommendation:
        "Reduce non-essential electricity usage and inspect the solar panels.",
      reason:
        s.power <= 50
          ? `Battery is at ${s.power}% and still dropping each sol.`
          : "The dust storm is reducing solar energy generation.",
    };
  } else {
    engineer = {
      risk: "LOW",
      recommendation:
        "Maintain normal power usage and schedule routine equipment checks.",
      reason: `Battery is healthy at ${s.power}% and the weather is ${s.weather.toLowerCase()}.`,
    };
  }

  /* Medical Officer: crew health and life support */
  const lifeSupport = [
    ["Oxygen", s.oxygen],
    ["Water", s.water],
    ["Food", s.food],
  ].sort((a, b) => a[1] - b[1])[0];

  let medical;
  if (lifeSupport[1] <= 20) {
    medical = {
      risk: "HIGH",
      recommendation: `Protect life-support power and ration ${lifeSupport[0].toLowerCase()} immediately.`,
      reason: `${lifeSupport[0]} is critically low at ${lifeSupport[1]}%, which directly threatens crew health.`,
    };
  } else if (s.power <= 20) {
    medical = {
      risk: "HIGH",
      recommendation: "Protect life-support power above all other systems.",
      reason:
        "Low battery could cut power to oxygen and water recycling.",
    };
  } else if (lifeSupport[1] <= 50 || s.power <= 50) {
    medical = {
      risk: "MEDIUM",
      recommendation: `Monitor crew fatigue and begin light ${lifeSupport[0].toLowerCase()} conservation.`,
      reason: `${lifeSupport[0]} is the lowest life-support supply at ${lifeSupport[1]}%.`,
    };
  } else {
    medical = {
      risk: "LOW",
      recommendation: "Continue normal duties with routine health checks.",
      reason: "Oxygen, water and food are all at safe levels.",
    };
  }

  /* Mission Commander: mission priorities */
  const levels = [s.oxygen, s.water, s.food, s.power];
  const critical = levels.filter((v) => v <= 20).length;
  const low = levels.filter((v) => v <= 50).length;

  let commander;
  if (critical > 0) {
    commander = {
      risk: "HIGH",
      recommendation:
        "Prioritize survival over optional research and cancel all outdoor activity.",
      reason: `${critical} essential resource${critical > 1 ? "s are" : " is"} critically low.`,
    };
  } else if (low > 0 || storm >= 2) {
    commander = {
      risk: "MEDIUM",
      recommendation:
        "Delay non-essential research and focus the crew on maintenance.",
      reason:
        low > 0
          ? `${low} resource${low > 1 ? "s are" : " is"} at or below 50%.`
          : "Storm conditions may limit safe outdoor work.",
    };
  } else {
    commander = {
      risk: "LOW",
      recommendation:
        "Continue the planned mission schedule, including research tasks.",
      reason: "All resources are stable and conditions are safe.",
    };
  }

  /* Risk Analyst: future risks and worst-case scenarios */
  const stormPenalty = storm >= 2 ? 1.5 : 1;
  const forecast = [
    ["Oxygen", s.oxygen / DAILY_DROP.oxygen],
    ["Water", s.water / DAILY_DROP.water],
    ["Food", s.food / DAILY_DROP.food],
    ["Power", s.power / (DAILY_DROP.power * stormPenalty)],
  ].sort((a, b) => a[1] - b[1])[0];
  const daysLeft = Math.floor(forecast[1]);

  let analyst;
  if (daysLeft <= 5) {
    analyst = {
      risk: "HIGH",
      recommendation:
        "Prepare for a longer storm and cut consumption now to extend supplies.",
      reason: `${forecast[0]} could run out in about ${daysLeft} sol${daysLeft === 1 ? "" : "s"} at the current rate.`,
    };
  } else if (daysLeft <= 10) {
    analyst = {
      risk: "MEDIUM",
      recommendation:
        "Plan resource rationing and keep a reserve for emergencies.",
      reason: `${forecast[0]} could run out in about ${daysLeft} sols.`,
    };
  } else {
    analyst = {
      risk: "LOW",
      recommendation: "No immediate threats. Keep monitoring weather forecasts.",
      reason: `The lowest supply (${forecast[0]}) should last about ${daysLeft} more sols.`,
    };
  }

  return [
    { id: "engineer", title: "Chief Engineer", icon: "🛠️", focus: "Power and equipment", ...engineer },
    { id: "medical", title: "Medical Officer", icon: "🩺", focus: "Crew health and life support", ...medical },
    { id: "commander", title: "Mission Commander", icon: "🎖️", focus: "Mission priorities", ...commander },
    { id: "analyst", title: "Risk Analyst", icon: "📊", focus: "Future risks and worst-case scenarios", ...analyst },
  ];
}

function AdvisorCouncil({ onBack, missionState }) {
  const [state, setState] = useState(missionState || DEFAULT_STATE);

  const advisors = getAdvice(state);
  const overallRisk = advisors.reduce(
    (worst, a) => (RISK_ORDER[a.risk] > RISK_ORDER[worst] ? a.risk : worst),
    "LOW"
  );

  const updateValue = (key, value) =>
    setState((prev) => ({ ...prev, [key]: Number(value) }));

  const sliders = [
    { key: "oxygen", label: "Oxygen", icon: "🫧" },
    { key: "water", label: "Water", icon: "💧" },
    { key: "food", label: "Food", icon: "🥫" },
    { key: "power", label: "Power", icon: "⚡" },
  ];

  return (
    <div className="advisor-page">
      {/* Navigation */}
      <nav className="advisor-navbar">
        <button className="advisor-back-button" onClick={onBack}>
          ← BACK
        </button>
        <div className="advisor-logo">🚀 RED PLANET RESCUE</div>
        <div className="advisor-nav-label">AI ADVISOR COUNCIL</div>
      </nav>

      {/* Header */}
      <section className="advisor-header">
        <div>
          <p className="advisor-tag">MISSION OPERATIONS / DECISION SUPPORT</p>
          <h1>
            AI ADVISOR <span>COUNCIL</span>
          </h1>
          <p className="advisor-subtitle">
            Four advisors review the current mission state and recommend what
            to do next. Each recommendation shows its reason and risk level.
          </p>
        </div>

        <div className={`advisor-overall ${overallRisk.toLowerCase()}`}>
          <span>OVERALL RISK</span>
          <strong>{overallRisk}</strong>
        </div>
      </section>

      {/* Mission state controls */}
      <section className="advisor-state">
        <div className="advisor-state-heading">
          <h2>CURRENT MISSION STATE · SOL {state.sol}</h2>
          <p>Adjust the values to see how the advisors react.</p>
        </div>

        <div className="advisor-sliders">
          {sliders.map((item) => (
            <label className="advisor-slider" key={item.key}>
              <div className="advisor-slider-top">
                <span>
                  {item.icon} {item.label}
                </span>
                <strong>{state[item.key]}%</strong>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={state[item.key]}
                onChange={(e) => updateValue(item.key, e.target.value)}
              />
            </label>
          ))}

          <label className="advisor-slider">
            <div className="advisor-slider-top">
              <span>🌪️ Weather</span>
            </div>
            <select
              value={state.weather}
              onChange={(e) =>
                setState((prev) => ({ ...prev, weather: e.target.value }))
              }
            >
              {WEATHER.map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      {/* Advisor recommendations */}
      <section className="advisor-section">
        <div className="advisor-grid">
          {advisors.map((advisor) => (
            <div className="advisor-card" key={advisor.id}>
              <div className="advisor-card-top">
                <div className="advisor-icon">{advisor.icon}</div>
                <span className={`advisor-risk ${advisor.risk.toLowerCase()}`}>
                  {advisor.risk} RISK
                </span>
              </div>

              <h3>{advisor.title}</h3>
              <p className="advisor-focus">{advisor.focus}</p>

              <p className="advisor-label">RECOMMENDATION</p>
              <p className="advisor-recommendation">
                {advisor.recommendation}
              </p>

              <p className="advisor-label">REASON</p>
              <p className="advisor-reason">{advisor.reason}</p>

              <div className="advisor-meter">
                <div
                  className={`advisor-meter-fill ${advisor.risk.toLowerCase()}`}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer className="advisor-footer">
        <h3>🚀 RED PLANET RESCUE</h3>
        <p>NASA SPACE APPS CHALLENGE | MARS SURVIVAL SIMULATOR</p>
      </footer>
    </div>
  );
}

export default AdvisorCouncil;