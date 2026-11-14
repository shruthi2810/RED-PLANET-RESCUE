import "./CrewIntelligence.css";
import CrewAvatar from "./CrewAvatar";

// For health and morale, high is good. For fatigue and stress, high is bad.
const getLevel = (value, highIsGood) => {
  const score = highIsGood ? value : 100 - value;
  if (score >= 60) return "good";
  if (score >= 35) return "warn";
  return "bad";
};

function StatBar({ label, value, highIsGood }) {
  return (
    <div className="crew-stat">
      <div className="crew-stat-top">
        <span>{label}</span>
        <strong>{value}%</strong>
      </div>
      <div className="crew-bar">
        <div
          className={`crew-bar-fill ${getLevel(value, highIsGood)}`}
          style={{ width: `${value}%` }}
        ></div>
      </div>
    </div>
  );
}

function CrewIntelligence({ onBack, crew, missionDay }) {
  const available = crew.filter((member) => member.duty === "AVAILABLE").length;
  const averageHealth = Math.round(
    crew.reduce((sum, member) => sum + member.health, 0) / crew.length
  );
  const averageMorale = Math.round(
    crew.reduce((sum, member) => sum + member.morale, 0) / crew.length
  );

  return (
    <div className="crew-page">
      {/* Navigation */}
      <nav className="crew-navbar">
        <button className="crew-back-button" onClick={onBack}>
          ← BACK TO HOME
        </button>
        <div className="crew-logo">🚀 RED PLANET RESCUE</div>
        <div className="crew-nav-label">CREW INTELLIGENCE</div>
      </nav>

      {/* Header */}
      <section className="crew-header">
        <div>
          <p className="crew-tag">MISSION OPERATIONS / CREW MONITORING</p>
          <h1>
            CREW <span>INTELLIGENCE</span>
          </h1>
          <p className="crew-subtitle">
            Track the health, fatigue, stress and morale of all six
            astronauts. Their condition changes as the mission advances and
            supplies run low.
          </p>
        </div>

        <div className="crew-sol">
          <span>MISSION DAY</span>
          <strong>
            {missionDay} <small>/ 30</small>
          </strong>
        </div>
      </section>

      {/* Summary */}
      <section className="crew-summary">
        <div className="crew-summary-card">
          <span className="crew-summary-icon">👨‍🚀</span>
          <div>
            <p>CREW ALIVE</p>
            <h2>{crew.length} / 6</h2>
          </div>
        </div>

        <div className="crew-summary-card">
          <span className="crew-summary-icon">✅</span>
          <div>
            <p>AVAILABLE FOR DUTY</p>
            <h2>
              {available} / {crew.length}
            </h2>
          </div>
        </div>

        <div className="crew-summary-card">
          <span className="crew-summary-icon">❤️</span>
          <div>
            <p>AVERAGE HEALTH</p>
            <h2>{averageHealth}%</h2>
          </div>
        </div>

        <div className="crew-summary-card">
          <span className="crew-summary-icon">😊</span>
          <div>
            <p>AVERAGE MORALE</p>
            <h2>{averageMorale}%</h2>
          </div>
        </div>
      </section>

      {/* Astronaut profiles */}
      <section className="crew-section">
        <div className="crew-grid">
          {crew.map((member) => (
            <div className="crew-card" key={member.id}>
              <div className="crew-card-top">
                <div className="crew-avatar">
                  <CrewAvatar id={member.id} name={member.name} />
                </div>
                <span
                  className={`crew-duty ${member.duty
                    .toLowerCase()
                    .replace(" ", "-")}`}
                >
                  {member.duty}
                </span>
              </div>

              <h3>{member.name}</h3>
              <p className="crew-role">{member.role}</p>

              <div className="crew-stats">
                <StatBar label="Health" value={member.health} highIsGood />
                <StatBar label="Fatigue" value={member.fatigue} />
                <StatBar label="Stress" value={member.stress} />
                <StatBar label="Morale" value={member.morale} highIsGood />
              </div>

              <p className="crew-label">SKILLS</p>
              <div className="crew-skills">
                {member.skills.map((skill) => (
                  <span key={skill}>{skill}</span>
                ))}
              </div>

              <p className="crew-note">{member.note}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="crew-footer">
        <h3>🚀 RED PLANET RESCUE</h3>
        <p>NASA SPACE APPS CHALLENGE | MARS SURVIVAL SIMULATOR</p>
      </footer>
    </div>
  );
}

export default CrewIntelligence;