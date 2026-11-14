import { useState } from "react";
import "./Explore.css";

const TOPICS = [
  {
    id: "atmosphere",
    icon: "🌫️",
    title: "Thin Atmosphere",
    value: "95% CO₂",
    fact: "Mars's atmosphere is about 95% carbon dioxide, at less than 1% of Earth's surface pressure. Humans cannot breathe it.",
    impact: "Oxygen must be produced and recycled inside the habitat, which is why oxygen is your first survival resource.",
  },
  {
    id: "temperature",
    icon: "🥶",
    title: "Extreme Cold",
    value: "−60°C",
    fact: "The average temperature is around −60°C, and nights can be much colder.",
    impact: "Heating the habitat uses battery power, so cold nights drain your energy reserves faster.",
  },
  {
    id: "gravity",
    icon: "🪐",
    title: "Low Gravity",
    value: "38%",
    fact: "Gravity on Mars is about 38% of Earth's. Long stays weaken muscles and bones.",
    impact: "Crew health and fatigue worsen over time, so the crew needs rest and medical care.",
  },
  {
    id: "dust",
    icon: "🌪️",
    title: "Dust Storms",
    value: "Weeks",
    fact: "Dust storms can last for weeks, and some cover the entire planet.",
    impact: "Solar power drops, the battery falls, water recycling slows and the failure spreads to other systems.",
  },
  {
    id: "radiation",
    icon: "☢️",
    title: "Radiation",
    value: "No shield",
    fact: "Mars has no global magnetic field and only a thin atmosphere, so radiation reaches the surface.",
    impact: "Radiation adds to crew stress and medical risk during the mission.",
  },
  {
    id: "communication",
    icon: "📡",
    title: "Communication Delay",
    value: "3–22 min",
    fact: "A radio signal takes roughly 3 to 22 minutes one way between Mars and Earth, depending on their positions.",
    impact: "As Commander you must decide quickly, because Earth cannot answer in real time.",
  },
  {
    id: "sol",
    icon: "🌅",
    title: "A Martian Day (Sol)",
    value: "24h 39m",
    fact: "A sol, one Martian day, lasts about 24 hours and 39 minutes.",
    impact: "Your mission runs for 30 sols, and each click of Next Sol moves the mission forward by one day.",
  },
];

export default function Explore({ onBack }) {
  const [active, setActive] = useState(TOPICS[0]);

  return (
    <div className="ex-page">
      {/* NAVIGATION */}
      <nav className="ex-navbar">
        <button className="ex-back-button" onClick={onBack}>
          ← BACK
        </button>
        <div className="ex-logo">🚀 RED PLANET RESCUE</div>
        <span className="ex-nav-label">MARS EXPLORATION</span>
      </nav>

      {/* HEADER */}
      <header className="ex-header">
        <div>
          <p className="ex-tag">KNOW YOUR ENEMY</p>
          <h1>
            EXPLORE <span>MARS</span>
          </h1>
          <p className="ex-subtitle">
            Understand the Martian environment and discover the challenges
            your crew will face during the 30 sol survival mission.
          </p>
        </div>
        <div className="ex-status">
          <span className="ex-status-dot"></span>
          {TOPICS.length} CHALLENGES
        </div>
      </header>

      {/* TOPIC CARDS */}
      <section className="ex-section">
        <h2>MARTIAN CHALLENGES</h2>
        <p className="ex-hint">Select a card to read more.</p>

        <div className="ex-grid">
          {TOPICS.map((topic) => (
            <button
              key={topic.id}
              className={`ex-card ${active.id === topic.id ? "active" : ""}`}
              onClick={() => setActive(topic)}
            >
              <span className="ex-card-icon">{topic.icon}</span>
              <span className="ex-card-title">{topic.title}</span>
              <span className="ex-card-value">{topic.value}</span>
            </button>
          ))}
        </div>

        {/* DETAIL PANEL */}
        <div className="ex-detail">
          <div className="ex-detail-icon">{active.icon}</div>
          <div>
            <p className="ex-tag">{active.value}</p>
            <h3>{active.title}</h3>
            <p className="ex-fact">{active.fact}</p>
            <p className="ex-impact">
              <strong>IN THE SIMULATION:</strong> {active.impact}
            </p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="ex-footer">
        <h3>🚀 RED PLANET RESCUE</h3>
        <p>NASA SPACE APPS CHALLENGE | MARS SURVIVAL SIMULATOR</p>
        <span>EXPLORE · SURVIVE · SUCCEED</span>
      </footer>
    </div>
  );
}