
# RED PLANET RESCUE
# AI Advisor Council
#
# Rule-based educational recommendations.
# These are prototype rules, not real NASA operational advice.

from threat_detection import detect_threats


def get_chief_engineer_advice(mission):

    battery = mission.get("battery_kwh", 0)

    if battery <= 20:
        risk = "Critical"
        recommendation = "Activate emergency power conservation."
        reason = "Battery reserve is critically low."

    elif battery <= 30:
        risk = "Warning"
        recommendation = "Reduce non-essential power consumption."
        reason = "Battery reserve is decreasing."

    else:
        risk = "Normal"
        recommendation = "Continue monitoring power and solar generation."
        reason = "Battery reserve is currently above the warning threshold."

    return {
        "advisor": "Chief Engineer",
        "specialization": "Power and Equipment",
        "risk_level": risk,
        "recommendation": recommendation,
        "reason": reason
    }


def get_medical_officer_advice(mission):

    resources = mission.get("resources", {})

    oxygen = resources.get("oxygen", 0)
    water = resources.get("water", 0)
    food = resources.get("food", 0)
    medical_kits = mission.get("medical_kits", 0)

    if oxygen <= 10 or water <= 50 or food <= 10:
        risk = "Critical"
        recommendation = "Prioritize essential life-support resources."
        reason = "One or more essential crew resources are critically low."

    elif oxygen <= 30 or water <= 150 or food <= 30:
        risk = "Warning"
        recommendation = "Review crew resource allocation and conservation."
        reason = "One or more essential resources are approaching low levels."

    else:
        risk = "Normal"
        recommendation = "Continue monitoring crew life-support supplies."
        reason = "Current oxygen, water and food reserves are above warning thresholds."

    return {
        "advisor": "Medical Officer",
        "specialization": "Crew Health and Life Support",
        "risk_level": risk,
        "recommendation": recommendation,
        "reason": reason,
        "medical_kits_available": medical_kits
    }


def get_mission_commander_advice(mission):

    status = mission.get("status", "Unknown")
    sol = mission.get("sol", 1)
    duration = mission.get("mission_duration", 30)

    remaining_sols = max(0, duration - sol + 1)

    if status == "Critical":
        risk = "Critical"
        recommendation = "Prioritize mission survival and resolve critical failures."
        reason = "The mission has entered a critical state."

    elif status == "Completed":
        risk = "Normal"
        recommendation = "Review the final mission report."
        reason = "The mission has been completed."

    elif status != "Active":
        risk = "Warning"
        recommendation = "Review the mission status before taking further action."
        reason = "The mission is not currently active."

    else:
        risk = "Normal"
        recommendation = "Continue mission operations and review advisor reports."
        reason = (
            f"Mission is on Sol {sol} with "
            f"{remaining_sols} Sols remaining."
        )

    return {
        "advisor": "Mission Commander",
        "specialization": "Mission Strategy",
        "risk_level": risk,
        "recommendation": recommendation,
        "reason": reason,
        "remaining_sols": remaining_sols
    }


def get_risk_analyst_advice(mission):

    threat_data = detect_threats(mission)

    overall_risk = threat_data["overall_risk"]
    threat_count = threat_data["threat_count"]

    if overall_risk == "Critical":
        risk = "Critical"
        recommendation = "Address critical threats immediately."
        reason = "The threat detection system has identified critical resource risks."

    elif overall_risk == "Warning":
        risk = "Warning"
        recommendation = "Monitor warning-level threats and take preventive action."
        reason = "The threat detection system has identified developing risks."

    else:
        risk = "Normal"
        recommendation = "Continue monitoring resources for emerging threats."
        reason = "No resource threats are currently detected."

    return {
        "advisor": "Risk Analyst",
        "specialization": "Threat Detection and Risk Assessment",
        "risk_level": risk,
        "recommendation": recommendation,
        "reason": reason,
        "detected_threats": threat_count
    }


def get_all_advisor_recommendations(mission):

    return {
        "mission": mission.get("mission_name", "RED PLANET RESCUE"),
        "sol": mission.get("sol", 1),
        "advisor_count": 4,
        "advisors": [
            get_chief_engineer_advice(mission),
            get_medical_officer_advice(mission),
            get_mission_commander_advice(mission),
            get_risk_analyst_advice(mission)
        ],
        "system_type": "Rule-based prototype",
        "not_nasa_operational_advice": True
    }
