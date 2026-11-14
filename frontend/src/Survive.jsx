
import "./Survive.css";
import WeatherAlerts from "./WeatherAlerts";
import ResourceCharts from "./ResourceCharts";
import MissionDecisions from "./MissionDecisions";
import { MAXIMUM_VALUES, TOTAL_SOLS, getDailyUsage } from "./missionData";

function Survive({
  onBack,
  missionDay,
  resources,
  history,
  decisions,
  onAdvance,
  onReset,
  onDecide,
}) {
  const getPercentage = (resource) =>
    Math.max(
      0,
      Math.min(100, (resource.amount / MAXIMUM_VALUES[resource.name]) * 100)
    );

  const getStatus = (percentage) => {
    if (percentage <= 20) return "CRITICAL";
    if (percentage <= 50) return "LOW";
    return "STABLE";
  };

  const missionComplete = missionDay >= TOTAL_SOLS;

  return (
    <div className="survive-page">
      {/* Navigation */}
      <nav className="survive-navbar">
        <button className="back-button" onClick={onBack}>
          ← BACK TO HOME
        </button>

        <div className="survive-logo">🚀 RED PLANET RESCUE</div>

        <div className="survive-nav-label">MISSION CONTROL SYSTEM</div>
      </nav>

      {/* Page Heading */}
      <section className="survive-header">
        <div className="survive-header-content">
          <p className="survive-tag">
            MISSION OPERATIONS / RESOURCE MANAGEMENT
          </p>

          <h1>
            SURVIVE ON <span>MARS</span>
          </h1>

          <p className="survive-subtitle">
            Monitor essential supplies, manage crew survival and keep your
            mission operational for 30 Martian days.
          </p>
        </div>

        <div className="mission-status">
          <span className="status-dot"></span>
          MISSION ACTIVE
        </div>
      </section>

      {/* Mission Overview */}
      <section className="survive-overview">
        <div className="overview-card sol-overview-card">
          <span className="overview-icon">📅</span>
          <div className="sol-info">
            <p>CURRENT SOL</p>
            <h2>
              SOL {missionDay}
              <small> / {TOTAL_SOLS}</small>
            </h2>
          </div>
        </div>

        <div className="overview-card">
          <span className="overview-icon">👨‍🚀</span>
          <div>
            <p>CREW MEMBERS</p>
            <h2>06</h2>
          </div>
        </div>

        <div className="overview-card">
          <span className="overview-icon">🌍</span>
          <div>
            <p>LOCATION</p>
            <h2>MARS</h2>
          </div>
        </div>

        <div className="overview-card">
          <span className="overview-icon">🎯</span>
          <div>
            <p>MISSION PROGRESS</p>
            <h2>{Math.round((missionDay / TOTAL_SOLS) * 100)}%</h2>
          </div>
        </div>
      </section>

      {/* Weather and Alerts */}
      <WeatherAlerts missionDay={missionDay} resources={resources} />

      {/* Resource Management */}
      <section className="resource-section">
        <div className="resource-heading">
          <div>
            <p className="survive-tag">LIFE SUPPORT SYSTEM</p>
            <h2>RESOURCE MONITORING</h2>
            <p>
              Track the availability of essential resources required to keep
              your astronauts alive.
            </p>
          </div>

          <div className="resource-live">
            <span className="status-dot"></span>
            LIVE SIMULATION
          </div>
        </div>

        <div className="resource-grid">
          {resources.map((resource) => {
            const percentage = getPercentage(resource);
            const status = getStatus(percentage);

            return (
              <div className="resource-card" key={resource.name}>
                <div className="resource-card-top">
                  <div
                    className="resource-icon"
                    style={{ "--resource-color": resource.color }}
                  >
                    {resource.icon}
                  </div>

                  <span className={`resource-status ${status.toLowerCase()}`}>
                    {status}
                  </span>
                </div>

                <h3>{resource.name}</h3>

                <p className="resource-description">{resource.description}</p>

                <div className="resource-value">
                  {resource.amount.toLocaleString()}
                  <span> {resource.unit}</span>
                </div>

                <div className="resource-progress">
                  <div
                    className="resource-progress-fill"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: resource.color,
                    }}
                  ></div>
                </div>

                <div className="resource-details">
                  <span>{Math.round(percentage)}% AVAILABLE</span>
                  <span>
                    -{getDailyUsage(resource, missionDay, resources)}{" "}
                    {resource.unit}/day
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Resource Charts */}
      <ResourceCharts history={history} />

      {/* Mission Decisions */}
      <MissionDecisions
        missionDay={missionDay}
        decisions={decisions}
        onDecide={onDecide}
        missionComplete={missionComplete}
      />

      {/* Daily Mission Control */}
      <section className="mission-control">
        <div className="control-information">
          <p className="survive-tag">DAILY OPERATIONS</p>
          <h2>MISSION CONTROL</h2>

          <p>
            Advance your mission one Martian day at a time. Resources will
            automatically decrease according to the daily consumption of your
            crew and the weather on Mars.
          </p>

          <div className="day-indicator">
            <span>DAY {missionDay}</span>
            <div className="day-track">
              <div
                className="day-track-fill"
                style={{ width: `${(missionDay / TOTAL_SOLS) * 100}%` }}
              ></div>
            </div>
            <span>DAY {TOTAL_SOLS}</span>
          </div>
        </div>

        <div className="control-actions">
          <button
            className="advance-button"
            onClick={onAdvance}
            disabled={missionComplete}
          >
            {missionComplete ? "MISSION COMPLETED ✓" : "ADVANCE ONE SOL →"}
          </button>

          <button className="reset-button" onClick={onReset}>
            ↻ RESET SIMULATION
          </button>

          <p>One sol represents one Martian day.</p>
        </div>
      </section>

      {/* Mission Warning */}
      {resources.some((resource) => getPercentage(resource) <= 20) && (
        <div className="resource-warning">
          ⚠ WARNING: One or more essential resources are critically low.
          Monitor your supplies carefully.
        </div>
      )}

      {missionComplete && (
        <div className="mission-success">
          <h2>🏆 30-DAY MISSION COMPLETED!</h2>
          <p>Your crew has reached the end of the survival simulation.</p>
        </div>
      )}

      {/* Footer */}
      <footer className="survive-footer">
        <h3>🚀 RED PLANET RESCUE</h3>
        <p>NASA SPACE APPS CHALLENGE | MARS SURVIVAL SIMULATOR</p>
        <span>EXPLORE · SURVIVE · SUCCEED</span>
      </footer>
    </div>
  );
}

export default Survive;
