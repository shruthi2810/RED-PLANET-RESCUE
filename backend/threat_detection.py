# RED PLANET RESCUE
# Hidden Threat Detection System
#
# Prototype warning thresholds.
# These are educational simulation assumptions,
# NOT NASA astronaut safety limits.

BATTERY_WARNING = 30
OXYGEN_WARNING = 30
WATER_WARNING = 150
FOOD_WARNING = 30


def detect_threats(mission):
    resources = mission.get("resources", {})

    battery = mission.get("battery_kwh", 0)
    oxygen = resources.get("oxygen", 0)
    water = resources.get("water", 0)
    food = resources.get("food", 0)

    threats = []

    # Battery monitoring
    if battery <= 20:
        threats.append({
            "name": "Critical Battery Level",
            "severity": "Critical",
            "message": "Battery reserve is critically low."
        })
    elif battery <= BATTERY_WARNING:
        threats.append({
            "name": "Declining Battery",
            "severity": "Warning",
            "message": "Battery reserve is decreasing. Monitor power usage."
        })

    # Oxygen monitoring
    if oxygen <= 10:
        threats.append({
            "name": "Critical Oxygen Supply",
            "severity": "Critical",
            "message": "Oxygen supply is critically low."
        })
    elif oxygen <= OXYGEN_WARNING:
        threats.append({
            "name": "Low Oxygen Reserve",
            "severity": "Warning",
            "message": "Oxygen reserves are becoming limited."
        })

    # Water monitoring
    if water <= 50:
        threats.append({
            "name": "Critical Water Supply",
            "severity": "Critical",
            "message": "Water supply is critically low."
        })
    elif water <= WATER_WARNING:
        threats.append({
            "name": "Declining Water Reserve",
            "severity": "Warning",
            "message": "Water reserves are decreasing."
        })

    # Food monitoring
    if food <= 10:
        threats.append({
            "name": "Critical Food Supply",
            "severity": "Critical",
            "message": "Food supply is critically low."
        })
    elif food <= FOOD_WARNING:
        threats.append({
            "name": "Low Food Reserve",
            "severity": "Warning",
            "message": "Food reserves are becoming limited."
        })

    if any(t["severity"] == "Critical" for t in threats):
        overall_risk = "Critical"
    elif threats:
        overall_risk = "Warning"
    else:
        overall_risk = "Normal"

    return {
        "overall_risk": overall_risk,
        "threat_count": len(threats),
        "threats": threats,
        "thresholds_are_prototype_assumptions": True
    }