
import "./MissionDecisions.css";

const BACKEND_DECISIONS = [
  {
    id: "cut-power",
    icon: "⚡",
    title: "CONSERVE POWER",
    gain: "Reduces power consumption from 20 to 15 kWh on the next Sol.",
    cost: "Power conservation may limit energy available for other systems.",
  },
  {
    id: "repair-solar",
    icon: "☀️",
    title: "REPAIR SOLAR PANELS",
    gain: "Schedules a solar panel repair for the next Sol, reducing dust impact.",
    cost: "Consumes 1 spare part.",
  },
  {
    id: "ration-water",
    icon: "💧",
    title: "PRIORITIZE WATER",
    gain: "Prioritizes water recycling on the next Sol.",
    cost: "Consumes 1 spare part. Improved recovery depends on available power.",
  },
];

function MissionDecisions({
  missionDay,
  decisions,
  onDecide,
  missionComplete,
}) {
  const decidedToday = decisions.some(
    (item) => item.sol === missionDay
  );

  const locked = decidedToday || missionComplete;

  let status = "1 ACTION AVAILABLE";

  if (missionComplete) {
    status = "MISSION ENDED";
  } else if (decidedToday) {
    status = "ACTION USED FOR THIS SOL";
  }

  return (
    <section className="md-section">
      <div className="md-card">
        <div className="md-heading">
          <div>
            <p className="md-tag">COMMANDER DECISIONS</p>
            <h2>MISSION DECISIONS</h2>
            <p className="md-intro">
              Choose one supported mission action per Sol.
              Your decision affects future mission operations.
            </p>
          </div>

          <span className={`md-status ${locked ? "used" : ""}`}>
            {status}
          </span>
        </div>

        <div className="md-grid">
          {BACKEND_DECISIONS.map((decision) => (
            <div className="md-option" key={decision.id}>
              <div className="md-option-top">
                <span className="md-icon">{decision.icon}</span>
                <h3>{decision.title}</h3>
              </div>

              <p className="md-gain">
                ✔ {decision.gain}
              </p>

              <p className="md-cost">
                ✖ {decision.cost}
              </p>

              <button
                className="md-button"
                disabled={locked}
                onClick={() => onDecide(decision.id)}
              >
                APPLY DECISION
              </button>
            </div>
          ))}
        </div>

        <p className="md-log-title">DECISION LOG</p>

        {decisions.length === 0 ? (
          <p className="md-empty">
            No decisions made yet.
          </p>
        ) : (
          <div className="md-log">
            {[...decisions].reverse().map((item) => (
              <div
                className="md-log-item"
                key={`${item.sol}-${item.id}`}
              >
                <span>SOL {item.sol}</span>

                <strong>
                  {item.icon} {item.title}
                </strong>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default MissionDecisions;
