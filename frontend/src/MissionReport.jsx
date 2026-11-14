import { useState } from "react";
import "./MissionReport.css";
import ResourceCharts from "./ResourceCharts";
import {
  TOTAL_SOLS,
  DECISIONS,
  MAXIMUM_VALUES,
  runSimulation,
  getMissionSummary,
  getKeyEvents,
} from "./missionData";

const OUTCOME_CLASS = {
  "MISSION SUCCESS": "success",
  "NARROW SURVIVAL": "narrow",
  "MISSION FAILED": "failed",
  "IN PROGRESS": "progress",
};

const percentOfStart = (resources, name) =>
  Math.round(
    (resources.find((item) => item.name === name).amount /
      MAXIMUM_VALUES[name]) *
      100
  );

function MissionReport({
  onBack,
  missionDay,
  resources,
  crew,
  history,
  decisions,
}) {
  const summary = getMissionSummary(missionDay, resources, crew);
  const events = getKeyEvents(history);
  const maxReplaySol = Math.min(missionDay, TOTAL_SOLS - 1);

  const [replaySol, setReplaySol] = useState(
    decisions.length > 0 ? decisions[0].sol : 1
  );
  const [replayChoice, setReplayChoice] = useState("none");
  const [result, setResult] = useState(null);

  // Timeline: events first, then decisions made on the same sol
  const timeline = [
    ...events.map((item) => ({ ...item, kind: "event" })),
    ...decisions.map((item) => ({
      sol: item.sol,
      level: "decision",
      text: `${item.icon} ${item.title}`,
      kind: "decision",
    })),
  ].sort((a, b) => a.sol - b.sol);

  const runReplay = () => {
    const original = {};
    decisions.forEach((item) => {
      original[item.sol] = item.id;
    });

    const alternative = { ...original };
    if (replayChoice === "none") delete alternative[replaySol];
    else alternative[replaySol] = replayChoice;

    const before = runSimulation(original, missionDay);
    const after = runSimulation(alternative, missionDay);

    setResult({
      sol: replaySol,
      choice: replayChoice,
      before: {
        resources: before.resources,
        summary: getMissionSummary(missionDay, before.resources, before.crew),
      },
      after: {
        resources: after.resources,
        summary: getMissionSummary(missionDay, after.resources, after.crew),
      },
    });
  };

  const originalAtSol = decisions.find((item) => item.sol === replaySol);

  const solOptions = Array.from({ length: maxReplaySol }, (_, index) => {
    const sol = index + 1;
    const made = decisions.find((item) => item.sol === sol);
    return {
      sol,
      label: `Sol ${sol} · ${made ? made.title : "no decision"}`,
    };
  });

  let rows = [];
  let verdict = "";

  if (result) {
    rows = [
      ...["Oxygen", "Water", "Food", "Power"].map((name) => ({
        label: name,
        before: percentOfStart(result.before.resources, name),
        after: percentOfStart(result.after.resources, name),
        unit: "%",
      })),
      {
        label: "Survival rate",
        before: result.before.summary.survival,
        after: result.after.summary.survival,
        unit: "%",
      },
      {
        label: "Mission score",
        before: result.before.summary.score,
        after: result.after.summary.score,
        unit: "",
      },
    ];

    const difference = result.after.summary.score - result.before.summary.score;

    if (difference > 0) {
      verdict = `Better choice found. This change would have raised your score by ${difference} points.`;
    } else if (difference < 0) {
      verdict = `Your original choice was better. This change would have lowered your score by ${Math.abs(difference)} points.`;
    } else {
      verdict = "No difference. This change would not have changed your score.";
    }

    if (result.before.summary.outcome !== result.after.summary.outcome) {
      verdict += ` The outcome would have changed from ${result.before.summary.outcome} to ${result.after.summary.outcome}.`;
    }
  }

  const alternativeTitle =
    result && result.choice !== "none"
      ? DECISIONS.find((item) => item.id === result.choice).title
      : "No decision";

  return (
    <div className="mr-page">
      {/* Navigation */}
      <nav className="mr-navbar">
        <button className="mr-back-button" onClick={onBack}>
          ← BACK TO HOME
        </button>
        <div className="mr-logo">🚀 RED PLANET RESCUE</div>
        <div className="mr-nav-label">MISSION REPORT</div>
      </nav>

      {/* Header */}
      <section className="mr-header">
        <div>
          <p className="mr-tag">MISSION OPERATIONS / FINAL REPORT</p>
          <h1>
            MISSION <span>REPORT</span>
          </h1>
          <p className="mr-subtitle">
            {missionDay >= TOTAL_SOLS
              ? "The 30 sol mission is complete. Here is how your crew did."
              : "The mission is still in progress. This report shows the result so far."}
          </p>
          {summary.depleted.length > 0 && (
            <p className="mr-failure">
              Life support failed: {summary.depleted.join(", ")} ran out.
            </p>
          )}
        </div>

        <div className={`mr-outcome ${OUTCOME_CLASS[summary.outcome]}`}>
          <span>OUTCOME</span>
          <strong>{summary.outcome}</strong>
        </div>
      </section>

      {/* Summary */}
      <section className="mr-summary">
        <div className="mr-summary-card">
          <span className="mr-summary-icon">❤️</span>
          <div>
            <p>SURVIVAL RATE</p>
            <h2>{summary.survival}%</h2>
          </div>
        </div>

        <div className="mr-summary-card">
          <span className="mr-summary-icon">🏆</span>
          <div>
            <p>MISSION SCORE</p>
            <h2>
              {summary.score}
              <small>/100</small>
              <span className="mr-grade">GRADE {summary.grade}</span>
            </h2>
          </div>
        </div>

        <div className="mr-summary-card">
          <span className="mr-summary-icon">📅</span>
          <div>
            <p>SOLS COMPLETED</p>
            <h2>
              {missionDay}
              <small>/{TOTAL_SOLS}</small>
            </h2>
          </div>
        </div>

        <div className="mr-summary-card">
          <span className="mr-summary-icon">🧭</span>
          <div>
            <p>DECISIONS MADE</p>
            <h2>{decisions.length}</h2>
          </div>
        </div>
      </section>

      {/* Resource usage chart */}
      <ResourceCharts history={history} />

      {/* Timeline */}
      <section className="mr-section">
        <div className="mr-card">
          <p className="mr-card-tag">IMPORTANT DECISIONS AND EVENTS</p>

          {timeline.length === 0 ? (
            <p className="mr-empty">
              Nothing to report yet. Advance a few sols on the Survive page.
            </p>
          ) : (
            <div className="mr-timeline">
              {timeline.map((item, index) => (
                <div className={`mr-event ${item.level}`} key={index}>
                  <span>SOL {item.sol}</span>
                  <strong>{item.text}</strong>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Regret Replay */}
      <section className="mr-section mr-last">
        <div className="mr-card">
          <p className="mr-card-tag">REGRET REPLAY / WHAT-IF</p>
          <p className="mr-intro">
            Pick a sol and a different decision. The simulator replays your
            mission with that one change and compares the two results at Sol{" "}
            {missionDay}.
          </p>

          <div className="mr-controls">
            <label>
              <span>SOL TO CHANGE</span>
              <select
                value={replaySol}
                onChange={(event) => setReplaySol(Number(event.target.value))}
              >
                {solOptions.map((option) => (
                  <option key={option.sol} value={option.sol}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span>WHAT IF YOU HAD CHOSEN</span>
              <select
                value={replayChoice}
                onChange={(event) => setReplayChoice(event.target.value)}
              >
                <option value="none">No decision</option>
                {DECISIONS.map((decision) => (
                  <option key={decision.id} value={decision.id}>
                    {decision.title}
                  </option>
                ))}
              </select>
            </label>

            <button className="mr-run" onClick={runReplay}>
              RUN WHAT-IF
            </button>
          </div>

          {result && (
            <div className="mr-result">
              <p className="mr-compare-title">
                SOL {result.sol}:{" "}
                <strong>{originalAtSol ? originalAtSol.title : "No decision"}</strong>{" "}
                vs <strong>{alternativeTitle}</strong>
              </p>

              <div className="mr-table">
                <div className="mr-row mr-row-head">
                  <span>MEASURE</span>
                  <span>YOUR MISSION</span>
                  <span>WHAT-IF</span>
                  <span>CHANGE</span>
                </div>

                {rows.map((row) => {
                  const change = row.after - row.before;
                  const direction =
                    change > 0 ? "up" : change < 0 ? "down" : "same";

                  return (
                    <div className="mr-row" key={row.label}>
                      <span>{row.label}</span>
                      <span>
                        {row.before}
                        {row.unit}
                      </span>
                      <span>
                        {row.after}
                        {row.unit}
                      </span>
                      <span className={`mr-change ${direction}`}>
                        {change > 0 ? "+" : ""}
                        {change}
                        {row.unit}
                      </span>
                    </div>
                  );
                })}

                <div className="mr-row">
                  <span>Outcome</span>
                  <span>{result.before.summary.outcome}</span>
                  <span>{result.after.summary.outcome}</span>
                  <span></span>
                </div>
              </div>

              <p className="mr-verdict">{verdict}</p>
            </div>
          )}
        </div>
      </section>

      <footer className="mr-footer">
        <h3>🚀 RED PLANET RESCUE</h3>
        <p>NASA SPACE APPS CHALLENGE | MARS SURVIVAL SIMULATOR</p>
      </footer>
    </div>
  );
}

export default MissionReport;