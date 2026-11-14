import React from "react";
import "./SystemIntelligence.css";
import {
  TOTAL_SOLS,
  getAlerts,
  getCascade,
  getEquipment,
  predictResources,
} from "./missionData";

const LEVEL_LABEL = { ok: "NORMAL", warn: "WARNING", critical: "CRITICAL" };
const ALERT_ICON = { critical: "🚨", warning: "⚠️", info: "ℹ️", ok: "✅" };

function SystemIntelligence({ onBack, missionDay, resources, crew }) {
  const chains = getCascade(missionDay, resources, crew);
  const equipment = getEquipment(missionDay, resources);
  const alerts = getAlerts(missionDay, resources);
  const predictions = predictResources(missionDay, resources);
  const activeAlerts = alerts.filter((alert) => alert.level !== "ok").length;

  return (
    <div className="si-page">
      {/* Navigation */}
      <nav className="si-navbar">
        <button className="si-back-button" onClick={onBack}>
          ← BACK TO HOME
        </button>
        <div className="si-logo">🚀 RED PLANET RESCUE</div>
        <div className="si-nav-label">SYSTEM INTELLIGENCE</div>
      </nav>

      {/* Header */}
      <section className="si-header">
        <div>
          <p className="si-tag">MISSION OPERATIONS / SYSTEM ANALYSIS</p>
          <h1>
            SYSTEM <span>INTELLIGENCE</span>
          </h1>
          <p className="si-subtitle">
            See how one failure spreads to other systems. Every step in the
            map shows its current state and the reason behind it.
          </p>
        </div>

        <div className="si-sol">
          <span>MISSION DAY</span>
          <strong>
            {missionDay} <small>/ {TOTAL_SOLS}</small>
          </strong>
        </div>
      </section>

      {/* Cascade failure map */}
      <section className="si-section">
        <div className="si-card">
          <p className="si-card-tag">CASCADE FAILURE MAP</p>

          {chains.map((chain) => (
            <div className="si-chain-block" key={chain.id}>
              <p className="si-chain-title">{chain.title}</p>

              <div className="si-chain">
                {chain.nodes.map((node, index) => (
                  <React.Fragment key={node.id}>
                    <div className={`si-node ${node.level}`}>
                      <span className="si-node-title">{node.title}</span>
                      <strong>{node.value}</strong>
                      <span className={`si-node-level ${node.level}`}>
                        {LEVEL_LABEL[node.level]}
                      </span>
                      <p>{node.reason}</p>
                    </div>

                    {index < chain.nodes.length - 1 && (
                      <div className="si-arrow">→</div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Equipment status */}
      <section className="si-section">
        <div className="si-card">
          <p className="si-card-tag">EQUIPMENT STATUS</p>

          <div className="si-equip-grid">
            {equipment.map((item) => (
              <div className="si-equip" key={item.id}>
                <div className="si-equip-top">
                  <span className="si-equip-icon">{item.icon}</span>
                  <span className={`si-status ${item.status.toLowerCase()}`}>
                    {item.status}
                  </span>
                </div>

                <h3>{item.name}</h3>

                <div className="si-bar">
                  <div
                    className={`si-bar-fill ${item.status.toLowerCase()}`}
                    style={{ width: `${item.efficiency}%` }}
                  ></div>
                </div>

                <p>{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Threat warnings and predictions */}
      <section className="si-section si-two">
        <div className="si-card">
          <div className="si-card-head">
            <p className="si-card-tag">THREAT WARNINGS</p>
            <span className={`si-count ${activeAlerts > 0 ? "active" : ""}`}>
              {activeAlerts} ACTIVE
            </span>
          </div>

          <div className="si-alerts">
            {alerts.map((alert, index) => (
              <div className={`si-alert ${alert.level}`} key={index}>
                <span className="si-alert-icon">{ALERT_ICON[alert.level]}</span>
                <div>
                  <strong>{alert.title}</strong>
                  <p>{alert.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="si-card">
          <p className="si-card-tag">RESOURCE PREDICTIONS</p>
          <p className="si-note">
            A forecast to Sol {TOTAL_SOLS} using the weather schedule, with no
            new decisions.
          </p>

          <div className="si-predictions">
            {predictions.map((item) => {
              let text = `${item.finalPercent}% left at Sol ${TOTAL_SOLS}`;
              if (item.runsOutOn) {
                text =
                  item.runsOutOn <= missionDay
                    ? "Already depleted"
                    : `Runs out by Sol ${item.runsOutOn}`;
              }

              return (
                <div className="si-predict" key={item.name}>
                  <span className="si-predict-icon">{item.icon}</span>
                  <div>
                    <strong>{item.name}</strong>
                    <p>{text}</p>
                  </div>
                  <span className={`si-risk ${item.risk.toLowerCase()}`}>
                    {item.risk} RISK
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <footer className="si-footer">
        <h3>🚀 RED PLANET RESCUE</h3>
        <p>NASA SPACE APPS CHALLENGE | MARS SURVIVAL SIMULATOR</p>
      </footer>
    </div>
  );
}

export default SystemIntelligence;