
# RED PLANET RESCUE
# Main Flask Backend
# NASA RAD + NASA REMS + Threat Detection + AI Advisor Council
# Complete Backend API

from flask import Flask, jsonify, request
from copy import deepcopy
from prediction import predict_resource_levels
from threat_detection import detect_threats
from ai_advisors import get_all_advisor_recommendations
from mission_actions import apply_mission_action
from crew import get_crew, get_crew_count

from simulation import (
    advance_one_sol,
    calculate_daily_consumption,
    calculate_remaining_resources,
    calculate_water_recycling,
    calculate_solar_power,
    BATTERY_CAPACITY,
    MISSION_DURATION
)

from radiation import (
    calculate_radiation_exposure,
    calculate_radiation_status
)

from weather import load_rems_weather

from database import (
    create_database,
    save_mission,
    load_mission,
    save_event,
    get_mission_events
)


app = Flask(__name__)


# --------------------------------------------------
# DATABASE INITIALIZATION
# --------------------------------------------------

create_database()
mission = load_mission()


# --------------------------------------------------
# HOME
# --------------------------------------------------

@app.route("/", methods=["GET"])
def home():

    return jsonify({
        "project": "RED PLANET RESCUE",
        "planet": "Mars",
        "status": "Backend running successfully!",
        "database": "Connected",
        "radiation_model": "NASA RAD reference-based",
        "weather_data": "NASA REMS historical observations",
        "threat_detection": "Available",
        "ai_advisor_council": "Available",
        "mission_report": "Available"
    })


# --------------------------------------------------
# MISSION INFORMATION
# --------------------------------------------------

@app.route("/api/mission/info", methods=["GET"])
def mission_info():

    return jsonify({
        "mission": "Mars Exploration",
        "mission_status": "Ready",
        "mission_duration": MISSION_DURATION,
        "resources": [
            "Oxygen",
            "Water",
            "Food",
            "Power",
            "Radiation Protection"
        ]
    })


# --------------------------------------------------
# RESOURCE SIMULATION
# --------------------------------------------------

@app.route("/api/mission/simulate", methods=["GET"])
def simulate_mission():

    crew_count = get_crew_count()

    available_resources = {
        "oxygen": 100,
        "water": 500,
        "food": 100
    }

    daily_consumption = calculate_daily_consumption(
        crew_count
    )

    remaining_resources = calculate_remaining_resources(
        available_resources,
        daily_consumption
    )

    return jsonify({
        "mission": "RED PLANET RESCUE",
        "crew_count": crew_count,
        "daily_consumption": daily_consumption,
        "remaining_resources": remaining_resources
    })


# --------------------------------------------------
# CREW INFORMATION
# --------------------------------------------------

@app.route("/api/mission/crew", methods=["GET"])
def mission_crew():

    return jsonify({
        "mission": "RED PLANET RESCUE",
        "total_astronauts": get_crew_count(),
        "crew": get_crew()
    })


@app.route("/api/crew", methods=["GET"])
def get_mission_crew():

    return jsonify({
        "mission": "RED PLANET RESCUE",
        "total_astronauts": get_crew_count(),
        "crew": get_crew()
    })


# --------------------------------------------------
# START MISSION
# --------------------------------------------------

@app.route("/api/mission/start", methods=["POST"])
def start_mission():

    global mission

    mission = {
        "mission_name": "RED PLANET RESCUE",
        "crew_count": get_crew_count(),
        "sol": 1,
        "mission_duration": MISSION_DURATION,
        "status": "Active",

        "resources": {
            "oxygen": 100,
            "water": 500,
            "food": 100
        },

        "battery_kwh": 50,
        "medical_kits": 6,
        "spare_parts": 10,

        "radiation_exposure": 0.0,
        "radiation_absorbed_dose_ugy": 0.0
    }

    save_mission(mission)

    save_event(
        1,
        "Mission Started",
        "Mars outpost mission initialized at Sol 1.",
        mission
    )

    return jsonify({
        "message": "Mars mission started successfully!",
        "mission": mission
    })


# --------------------------------------------------
# MISSION STATUS
# --------------------------------------------------

@app.route("/api/mission/status", methods=["GET"])
def mission_status():

    if mission is None:

        return jsonify({
            "mission_status": "Not Started",
            "message": "Start a mission first."
        }), 400

    return jsonify({
        "mission": "RED PLANET RESCUE",
        "mission_status": mission["status"],
        "current_sol": mission["sol"],
        "mission_duration": mission.get(
            "mission_duration",
            MISSION_DURATION
        ),
        "mission_data": mission
    })


# --------------------------------------------------
# ADVANCE MISSION BY ONE SOL
# --------------------------------------------------

@app.route("/api/mission/advance", methods=["POST"])
def advance_mission():

    global mission

    if mission is None:

        return jsonify({
            "error": "Start a mission first"
        }), 400

    if mission.get("status") != "Active":

        return jsonify({
            "error": "Mission cannot advance",
            "mission_status": mission.get("status")
        }), 400

    result = advance_one_sol(mission)

    if "error" in result:

        return jsonify(result), 400

    save_mission(mission)

    save_event(
        result["processed_sol"],
        "Sol Advanced",
        "Mission processed Sol " + str(
            result["processed_sol"]
        ),
        result
    )

    return jsonify(result)


# --------------------------------------------------
# WATER RECYCLING
# --------------------------------------------------

@app.route("/api/mission/recycle-water", methods=["POST"])
def recycle_water():

    if mission is None:

        return jsonify({
            "error": "Start a mission first"
        }), 400

    consumption = calculate_daily_consumption(
        mission["crew_count"]
    )

    result = calculate_water_recycling(
        consumption["water"]["amount"]
    )

    return jsonify({
        "mission": "RED PLANET RESCUE",
        "sol": mission["sol"],
        "water_recycling": result,
        "current_water": mission["resources"]["water"]
    })


# --------------------------------------------------
# POWER STATUS
# --------------------------------------------------

@app.route("/api/mission/power", methods=["GET"])
def mission_power():

    if mission is None:

        return jsonify({
            "error": "Start a mission first"
        }), 400

    return jsonify({
        "mission": "RED PLANET RESCUE",
        "sol": mission["sol"],

        "battery": {
            "remaining": mission["battery_kwh"],
            "capacity": BATTERY_CAPACITY,
            "unit": "kWh"
        },

        "next_sol_solar_forecast": calculate_solar_power(
            mission["sol"] + 1
        )
    })


# --------------------------------------------------
# NASA RAD RADIATION INFORMATION
# --------------------------------------------------

@app.route("/api/mission/radiation", methods=["GET"])
def mission_radiation():

    if mission is None:

        return jsonify({
            "error": "Start a mission first"
        }), 400

    radiation_data = calculate_radiation_exposure()

    total_exposure = mission.get(
        "radiation_absorbed_dose_ugy",
        0.0
    )

    return jsonify({
        "mission": "RED PLANET RESCUE",
        "sol": mission["sol"],

        "radiation": {
            "daily_absorbed_dose": (
                radiation_data["daily_absorbed_dose"]
            ),

            "total_absorbed_dose": total_exposure,

            "radiation_status": calculate_radiation_status(
                total_exposure
            ),

            "unit": "microgray",

            "source": radiation_data["source"]
        }
    })


# --------------------------------------------------
# NASA REMS HISTORICAL WEATHER DATA
# --------------------------------------------------

@app.route("/api/mission/weather", methods=["GET"])
def mission_weather():

    try:

        weather_data = load_rems_weather()

        return jsonify({
            "mission": "RED PLANET RESCUE",
            "weather_data": weather_data
        })

    except FileNotFoundError as error:

        return jsonify({
            "error": "NASA REMS data file not found",
            "details": str(error)
        }), 404

    except Exception as error:

        return jsonify({
            "error": "Unable to read NASA REMS weather data",
            "details": str(error)
        }), 500


# --------------------------------------------------
# HIDDEN THREAT DETECTION
# --------------------------------------------------

@app.route("/api/threats", methods=["GET"])
def get_threats():

    if mission is None:

        return jsonify({
            "error": "Start a mission first"
        }), 400

    result = detect_threats(mission)

    return jsonify({
        "mission": "RED PLANET RESCUE",
        "sol": mission["sol"],
        **result
    }), 200


# --------------------------------------------------
# AI ADVISOR COUNCIL
# --------------------------------------------------

@app.route("/api/advisors", methods=["GET"])
def mission_advisors():

    if mission is None:

        return jsonify({
            "error": "Start a mission first"
        }), 400

    result = get_all_advisor_recommendations(mission)

    return jsonify(result), 200


# --------------------------------------------------
# MISSION EVENT HISTORY
# --------------------------------------------------

@app.route("/api/mission/events", methods=["GET"])
def mission_events():

    return jsonify({
        "mission": "RED PLANET RESCUE",
        "events": get_mission_events()
    })


# --------------------------------------------------
# RESOURCE PREDICTIONS
# --------------------------------------------------

@app.route("/api/predictions", methods=["GET"])
def get_resource_predictions():

    current_mission = load_mission()

    if current_mission is None:

        return jsonify({
            "error": "No active mission found."
        }), 400

    predictions = predict_resource_levels(current_mission)

    return jsonify(predictions), 200


# --------------------------------------------------
# PLAYER MISSION DECISIONS
# --------------------------------------------------

@app.route("/api/mission/action", methods=["POST"])
def mission_action():

    global mission

    if mission is None:

        return jsonify({
            "error": "Start a mission first."
        }), 400

    data = request.get_json(silent=True) or {}

    action = data.get("action")

    if not action:

        return jsonify({
            "error": "Please provide an action.",
            "available_actions": [
                "conserve_power",
                "repair_equipment",
                "prioritize_water"
            ]
        }), 400

    result = apply_mission_action(mission, action)

    if "error" in result:

        return jsonify(result), 400

    save_mission(mission)

    save_event(
        mission["sol"],
        "Mission Decision",
        result["message"],
        result
    )

    return jsonify({
        "mission": mission.get("mission_name"),
        "sol": mission["sol"],
        "decision": result
    }), 200


# --------------------------------------------------
# REGRET REPLAY - WHAT-IF DECISION COMPARISON
# --------------------------------------------------

@app.route("/api/replay", methods=["POST"])
def regret_replay():

    if mission is None:
        return jsonify({
            "error": "Start a mission first."
        }), 400

    if mission.get("status") != "Active":
        return jsonify({
            "error": "Replay is available only for an active mission."
        }), 400

    data = request.get_json(silent=True) or {}

    alternative_action = data.get(
        "alternative_action",
        data.get("action")
    )

    if not alternative_action:
        return jsonify({
            "error": "Please provide an alternative_action.",
            "available_actions": [
                "conserve_power",
                "repair_equipment",
                "prioritize_water"
            ]
        }), 400

    # Create two independent temporary mission copies.
    baseline_mission = deepcopy(mission)
    alternative_mission = deepcopy(mission)

    # Simulate the next Sol without an additional decision.
    baseline_result = advance_one_sol(baseline_mission)

    if "error" in baseline_result:
        return jsonify(baseline_result), 400

    # Apply the alternative decision to the second copy.
    decision_result = apply_mission_action(
        alternative_mission,
        alternative_action
    )

    if "error" in decision_result:
        return jsonify(decision_result), 400

    # Simulate the same next Sol with the alternative decision.
    alternative_result = advance_one_sol(alternative_mission)

    if "error" in alternative_result:
        return jsonify(alternative_result), 400

    baseline_resources = baseline_result.get("resources", {})
    alternative_resources = alternative_result.get("resources", {})

    resource_difference = {}

    for resource in ["oxygen", "water", "food"]:
        baseline_value = float(
            baseline_resources.get(resource, 0)
        )
        alternative_value = float(
            alternative_resources.get(resource, 0)
        )

        resource_difference[resource] = round(
            alternative_value - baseline_value, 2
        )

    baseline_battery = baseline_result.get(
        "battery", {}
    ).get("battery_remaining", 0)

    alternative_battery = alternative_result.get(
        "battery", {}
    ).get("battery_remaining", 0)

    return jsonify({

        "mission": mission.get("mission_name"),

        "replay_type": "One-Sol What-If Comparison",

        "saved_mission_changed": False,

        "starting_sol": mission.get("sol"),

        "simulated_sol": baseline_result.get("processed_sol"),

        "alternative_decision": decision_result,

        "baseline": {
            "description": "Next Sol without the new alternative decision.",
            "status": baseline_result.get("status"),
            "resources": baseline_resources,
            "battery": baseline_result.get("battery"),
            "water_recycling": baseline_result.get("water_recycling"),
            "solar_power": baseline_result.get("solar_power"),
            "equipment": baseline_result.get("equipment"),
            "cascade_failure": baseline_result.get("cascade_failure")
        },

        "alternative": {
            "description": "Next Sol after applying the alternative decision.",
            "status": alternative_result.get("status"),
            "resources": alternative_resources,
            "battery": alternative_result.get("battery"),
            "water_recycling": alternative_result.get("water_recycling"),
            "solar_power": alternative_result.get("solar_power"),
            "equipment": alternative_result.get("equipment"),
            "cascade_failure": alternative_result.get("cascade_failure")
        },

        "difference": {
            "battery_kwh": round(
                alternative_battery - baseline_battery, 2
            ),
            "resources": resource_difference
        },

        "replay_note": (
            "This is a one-Sol educational what-if simulation "
            "using temporary copies of the current mission. "
            "It does not restore historical states or modify "
            "the saved mission."
        )

    }), 200

# --------------------------------------------------
# FINAL MISSION REPORT
# --------------------------------------------------

@app.route("/api/report", methods=["GET"])
def final_mission_report():

    if mission is None:

        return jsonify({
            "error": "No mission found. Start a mission first."
        }), 400

    duration = mission.get(
        "mission_duration",
        MISSION_DURATION
    )

    current_sol = mission.get("sol", 1)

    status = mission.get("status", "Unknown")

    # Calculate completed Sols
    if status == "Active":

        sols_completed = max(0, current_sol - 1)

    else:

        sols_completed = min(current_sol, duration)

    progress_percentage = round(
        (sols_completed / duration) * 100, 2
    ) if duration else 0

    # Current resources
    resources = mission.get("resources", {})

    oxygen = float(resources.get("oxygen", 0))
    water = float(resources.get("water", 0))
    food = float(resources.get("food", 0))
    battery = float(mission.get("battery_kwh", 0))

    # Prototype resource scoring assumptions
    # Initial resources:
    # Oxygen = 100 kg
    # Water = 500 litres
    # Food = 100 kg
    # Battery = 50 kWh

    resource_percentages = {
        "oxygen": min(100, max(0, oxygen)),
        "water": min(100, max(0, water / 500 * 100)),
        "food": min(100, max(0, food)),
        "battery": min(100, max(0, battery / 50 * 100))
    }

    resource_score = sum(
        resource_percentages.values()
    ) / len(resource_percentages)

    # Crew retention
    initial_crew = get_crew_count()

    current_crew = mission.get(
        "crew_count",
        initial_crew
    )

    crew_retention = (
        min(100, max(0, current_crew / initial_crew * 100))
        if initial_crew else 0
    )

    # Educational prototype score:
    # Mission progress = 40 points
    # Resource management = 40 points
    # Crew retention = 20 points

    mission_score = round(
        (progress_percentage * 0.40)
        + (resource_score * 0.40)
        + (crew_retention * 0.20),
        2
    )

    events = get_mission_events()

    return jsonify({

        "mission": mission.get(
            "mission_name",
            "RED PLANET RESCUE"
        ),

        "mission_outcome": status,

        "current_sol": current_sol,

        "sols_completed": sols_completed,

        "mission_duration": duration,

        "remaining_sols": max(
            0,
            duration - sols_completed
        ),

        "progress_percentage": progress_percentage,

        "mission_score": mission_score,

        "score_type": "Educational prototype score",

        "score_breakdown": {
            "mission_progress": round(
                progress_percentage * 0.40, 2
            ),
            "resource_management": round(
                resource_score * 0.40, 2
            ),
            "crew_retention": round(
                crew_retention * 0.20, 2
            )
        },

        "crew": {
            "initial_crew": initial_crew,
            "current_crew": current_crew,
            "crew_retention_percentage": round(
                crew_retention, 2
            ),
            "profiles": get_crew()
        },

        "resources": {
            "oxygen_kg": oxygen,
            "water_litres": water,
            "food_kg": food,
            "battery_kwh": battery,
            "resource_percentages": resource_percentages
        },

        "radiation": {
            "total_absorbed_dose_ugy": mission.get(
                "radiation_absorbed_dose_ugy",
                0
            ),
            "unit": "microgray"
        },

        "spare_parts_remaining": mission.get(
            "spare_parts",
            0
        ),

        "medical_kits_remaining": mission.get(
            "medical_kits",
            0
        ),

        "event_count": len(events),

        "mission_events": events,

        "scoring_note": (
            "Prototype scoring model based on mission progress, "
            "remaining resources, and crew count. It is not a "
            "NASA-approved scoring or astronaut survival model."
        )

    }), 200


# --------------------------------------------------
# RUN FLASK SERVER
# --------------------------------------------------

if __name__ == "__main__":

    app.run(debug=True)
