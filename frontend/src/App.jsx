
import { useEffect, useState } from "react";
import "./App.css";

import Explore from "./Explore";
import Survive from "./Survive";
import AdvisorCouncil from "./AdvisorCouncil";
import CrewIntelligence from "./CrewIntelligence";
import SystemIntelligence from "./SystemIntelligence";
import MissionReport from "./MissionReport";

import {
  INITIAL_RESOURCES,
  TOTAL_SOLS,
  getSnapshot,
  getAdvisorState,
  getCrew,
} from "./missionData";

import {
  apiGetMissionStatus,
  apiAdvanceSol,
  apiApplyAction,
} from "./api";

// Supported backend actions and their frontend display details
const BACKEND_ACTIONS = {
  "cut-power": {
    action: "conserve_power",
    title: "CONSERVE POWER",
    icon: "⚡",
  },
  "repair-solar": {
    action: "repair_equipment",
    title: "REPAIR SOLAR PANELS",
    icon: "☀️",
  },
  "ration-water": {
    action: "prioritize_water",
    title: "PRIORITIZE WATER",
    icon: "💧",
  },
};

// Maps backend resource values into the frontend format
function mapBackendResources(mission) {
  return INITIAL_RESOURCES.map((resource) => {
    switch (resource.name) {
      case "Oxygen":
        return { ...resource, amount: mission.resources.oxygen };

      case "Water":
        return { ...resource, amount: mission.resources.water };

      case "Food":
        return { ...resource, amount: mission.resources.food };

      case "Power":
        return {
          ...resource,
          amount: mission.battery_kwh,
          unit: "kWh",
        };

      default:
        return resource;
    }
  });
}

function App() {
  const [currentPage, setCurrentPage] = useState("home");

  // Shared mission state
  const [missionDay, setMissionDay] = useState(1);
  const [resources, setResources] = useState(INITIAL_RESOURCES);
  const [history, setHistory] = useState([
    getSnapshot(1, INITIAL_RESOURCES),
  ]);
  const [decisions, setDecisions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [busy, setBusy] = useState(false);

  // READ-ONLY: Load the existing saved mission from Flask
  useEffect(() => {
    let active = true;

    async function loadSavedMission() {
      try {
        setLoading(true);

        const status = await apiGetMissionStatus();

        if (!active) return;

        const mission = status.mission_data;
        const sol = status.current_sol ?? mission.sol;

        const liveResources = mapBackendResources(mission);

        setMissionDay(sol);
        setResources(liveResources);
        setHistory([getSnapshot(sol, liveResources)]);
        setDecisions([]);
        setApiError("");

        console.log("Backend mission loaded:", status);
      } catch (error) {
        if (active) {
          console.error("Mission loading failed:", error);
          setApiError(error.message);
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadSavedMission();

    return () => {
      active = false;
    };
  }, []);

  // Refresh the mission from the backend
  async function refreshMission() {
    const status = await apiGetMissionStatus();
    const mission = status.mission_data;
    const sol = status.current_sol ?? mission.sol;

    const liveResources = mapBackendResources(mission);

    setMissionDay(sol);
    setResources(liveResources);

    setHistory((previous) => {
      const snapshot = getSnapshot(sol, liveResources);

      const existingIndex = previous.findIndex(
        (entry) => entry.sol === sol
      );

      if (existingIndex >= 0) {
        return previous.map((entry, index) =>
          index === existingIndex ? snapshot : entry
        );
      }

      return [...previous, snapshot].sort(
        (a, b) => a.sol - b.sol
      );
    });

    return status;
  }

  // Advance the mission only after the user clicks Advance Sol
  async function advanceDay() {
    if (missionDay >= TOTAL_SOLS || busy) return;

    try {
      setBusy(true);
      setActionMessage("");
      setApiError("");

      await apiAdvanceSol();
      await refreshMission();

      setActionMessage("Mission advanced successfully.");
    } catch (error) {
      console.error("Advance Sol failed:", error);
      setApiError(error.message);
    } finally {
      setBusy(false);
    }
  }

  // Apply a decision through the Flask backend
  async function makeDecision(decisionId) {
    if (busy || missionDay >= TOTAL_SOLS) return;

    const alreadyDecided = decisions.some(
      (item) => item.sol === missionDay
    );

    if (alreadyDecided) return;

    const decision = BACKEND_ACTIONS[decisionId];

    if (!decision) {
      setActionMessage(
        "This decision is not supported by the backend."
      );
      return;
    }

    try {
      setBusy(true);
      setActionMessage("");
      setApiError("");

      const result = await apiApplyAction(decision.action);

      if (result.error) {
        throw new Error(result.error);
      }

      await refreshMission();

      setDecisions((previous) => [
        ...previous,
        {
          sol: missionDay,
          id: decisionId,
          title: decision.title,
          icon: decision.icon,
        },
      ]);

      setActionMessage(
        result.message || "Mission decision applied successfully."
      );
    } catch (error) {
      console.error("Mission decision failed:", error);
      setApiError(error.message);
    } finally {
      setBusy(false);
    }
  }

  // Safe reload: does NOT reset the backend mission
  async function resetMission() {
    if (busy) return;

    try {
      setBusy(true);
      setActionMessage("");
      setApiError("");

      await refreshMission();
      setDecisions([]);

      setActionMessage(
        "Saved backend mission reloaded. No mission reset performed."
      );
    } catch (error) {
      setApiError(error.message);
    } finally {
      setBusy(false);
    }
  }

  // Scroll to mission section
  const startMission = () => {
    document.getElementById("mission")?.scrollIntoView({
      behavior: "smooth",
    });
  };

  const openPage = (page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  const goHome = () => {
    setCurrentPage("home");
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Makes a card clickable and keyboard friendly
  const linkProps = (page, label) => ({
    onClick: () => openPage(page),
    role: "button",
    tabIndex: 0,
    onKeyDown: (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openPage(page);
      }
    },
    "aria-label": label,
  });

  const crew = getCrew(missionDay, resources, decisions);

  // Loading and connection status
  const connectionStatus = (
    <div style={{ padding: "10px 20px", textAlign: "center" }}>
      {loading && <p>Connecting to mission control...</p>}

      {apiError && (
        <p style={{ color: "#e57373" }}>
          Backend connection error: {apiError}
        </p>
      )}

      {actionMessage && <p>{actionMessage}</p>}
    </div>
  );

  // Open Explore
  if (currentPage === "explore") {
    return <Explore onBack={goHome} />;
  }

  // Open Mission Report
  if (currentPage === "report") {
    return (
      <>
        {connectionStatus}
        <MissionReport
          onBack={goHome}
          missionDay={missionDay}
          resources={resources}
          crew={crew}
          history={history}
          decisions={decisions}
        />
      </>
    );
  }

  // Open System Intelligence
  if (currentPage === "systems") {
    return (
      <>
        {connectionStatus}
        <SystemIntelligence
          onBack={goHome}
          missionDay={missionDay}
          resources={resources}
          crew={crew}
        />
      </>
    );
  }

  // Open Crew Intelligence
  if (currentPage === "crew") {
    return (
      <>
        {connectionStatus}
        <CrewIntelligence
          onBack={goHome}
          missionDay={missionDay}
          crew={crew}
        />
      </>
    );
  }

  // Open Advisor Council
  if (currentPage === "advisors") {
    return (
      <>
        {connectionStatus}
        <AdvisorCouncil
          onBack={goHome}
          missionState={getAdvisorState(missionDay, resources)}
        />
      </>
    );
  }

  // Open Survive dashboard
  if (currentPage === "survive") {
    return (
      <>
        {connectionStatus}
        <Survive
          onBack={goHome}
          missionDay={missionDay}
          resources={resources}
          history={history}
          decisions={decisions}
          onAdvance={advanceDay}
          onReset={resetMission}
          onDecide={makeDecision}
        />
      </>
    );
  }

  return (
    <div className="app">
      {connectionStatus}

      {/* NAVIGATION */}
      <nav className="navbar">
        <div className="logo">
          🚀 RED PLANET RESCUE
        </div>

        <div className="nav-right">
          <span>MISSION CONTROL SYSTEM</span>
        </div>
      </nav>

      {/* OPENING DASHBOARD */}
      <section className="hero">
        <div className="hero-overlay"></div>

        <div className="hero-content">
          <h1>
            SURVIVE THE
            <span> RED PLANET</span>
          </h1>

          <p className="hero-description">
            Six astronauts. Thirty Martian days. One mission to survive.
          </p>

          {/* MISSION STATISTICS */}
          <div className="mission-stats">
            <div className="stat">
              <h2>06</h2>
              <p>ASTRONAUTS</p>
            </div>

            <div className="stat">
              <h2>30</h2>
              <p>MARTIAN DAYS</p>
            </div>

            <div className="stat">
              <h2>01</h2>
              <p>MISSION</p>
            </div>
          </div>

          <button
            className="start-button"
            onClick={startMission}
          >
            START MISSION →
          </button>

          <p className="scroll-text">
            EXPLORE THE MISSION ↓
          </p>
        </div>

        <div className="planet-label">
          <span className="pulse"></span>
          MARS SURFACE · MISSION ACTIVE
        </div>
      </section>

      {/* MISSION INTRODUCTION */}
      <section
        className="mission-section"
        id="mission"
      >
        <div className="section-heading">
          <p className="section-tag">
            YOUR JOURNEY BEGINS HERE
          </p>

          <h2>
            THE MISSION TO SURVIVE MARS
          </h2>

          <p>
            Prepare for an extraordinary journey to the Red Planet.
            Work together, manage essential resources and complete
            the 30 Martian day survival mission.
          </p>
        </div>

        {/* MISSION CARDS */}
        <div className="mission-cards">
          {/* EXPLORE */}
          <div
            className="mission-card survive-home-card"
            {...linkProps("explore", "Open Explore Mars")}
          >
            <div className="card-number">01</div>
            <div className="card-icon">🔭</div>
            <h3>EXPLORE</h3>
            <p>
              Understand the Martian environment and discover
              the challenges of living on Mars.
            </p>
            <span className="card-action">
              OPEN EXPLORE →
            </span>
          </div>

          {/* SURVIVE */}
          <div
            className="mission-card survive-home-card"
            {...linkProps(
              "survive",
              "Open Survive resource management dashboard"
            )}
          >
            <div className="card-number">02</div>
            <div className="card-icon">🛰️</div>
            <h3>SURVIVE</h3>
            <p>
              Manage oxygen, water, food and other essential
              resources throughout the mission.
            </p>
            <span className="card-action">
              OPEN SURVIVAL DASHBOARD →
            </span>
          </div>

          {/* ADVISE */}
          <div
            className="mission-card survive-home-card"
            {...linkProps("advisors", "Open AI Advisor Council")}
          >
            <div className="card-number">03</div>
            <div className="card-icon">🧠</div>
            <h3>ADVISE</h3>
            <p>
              Get recommendations, reasons and risk levels from
              your four AI mission advisors.
            </p>
            <span className="card-action">
              OPEN ADVISOR COUNCIL →
            </span>
          </div>

          {/* CREW */}
          <div
            className="mission-card survive-home-card"
            {...linkProps("crew", "Open Crew Intelligence")}
          >
            <div className="card-number">04</div>
            <div className="card-icon">👩‍🚀</div>
            <h3>CREW</h3>
            <p>
              Monitor the health, fatigue, stress and morale of
              all six astronauts.
            </p>
            <span className="card-action">
              OPEN CREW INTELLIGENCE →
            </span>
          </div>

          {/* SYSTEMS */}
          <div
            className="mission-card survive-home-card"
            {...linkProps("systems", "Open System Intelligence")}
          >
            <div className="card-number">05</div>
            <div className="card-icon">⚙️</div>
            <h3>SYSTEMS</h3>
            <p>
              See how one failure spreads, check equipment status
              and forecast your supplies.
            </p>
            <span className="card-action">
              OPEN SYSTEM INTELLIGENCE →
            </span>
          </div>

          {/* SUCCEED */}
          <div
            className="mission-card survive-home-card"
            {...linkProps("report", "Open Mission Report")}
          >
            <div className="card-number">06</div>
            <div className="card-icon">🏆</div>
            <h3>SUCCEED</h3>
            <p>
              Work as a team, solve mission challenges and
              complete your Martian survival journey.
            </p>
            <span className="card-action">
              OPEN MISSION REPORT →
            </span>
          </div>
        </div>
      </section>

      {/* MARS EXPLORATION SECTION */}
      <section className="exploration-section">
        <div className="exploration-image">
          <img
            src="/mars-explorer.jpg"
            alt="Astronaut exploring the Martian surface"
          />
        </div>

        <div className="exploration-content">
          <p className="section-tag">
            BEYOND EARTH
          </p>

          <h2>
            WELCOME TO
            <span> MARS</span>
          </h2>

          <p>
            You are now part of an extraordinary exploration
            mission on the Red Planet.
          </p>

          <p>
            Every decision matters. Your crew must carefully
            manage resources, overcome environmental challenges
            and work together to survive.
          </p>

          <div className="exploration-highlight">
            <span>30</span>

            <div>
              <strong>MARTIAN DAYS</strong>
              <p>
                Your survival journey starts now.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <h3>
          🚀 RED PLANET RESCUE
        </h3>

        <p>
          NASA SPACE APPS CHALLENGE | MARS SURVIVAL SIMULATOR
        </p>

        <span>
          EXPLORE · SURVIVE · SUCCEED
        </span>
      </footer>
    </div>
  );
}

export default App;
