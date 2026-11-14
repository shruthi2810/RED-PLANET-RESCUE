
# RED PLANET RESCUE
# Mission Decision System
# Prototype educational actions, not NASA specifications.

def apply_mission_action(mission, action):

    if mission.get("status") != "Active":
        return {"error": "Mission is not active."}

    action = str(action).strip().lower()

    if action == "conserve_power":

        mission["power_conservation_next_sol"] = True

        return {
            "success": True,
            "action": action,
            "message": "Power conservation enabled for the next Sol.",
            "effect": "Power consumption reduced from 20 to 15 kWh."
        }

    elif action == "repair_equipment":

        if mission.get("spare_parts", 0) < 1:
            return {"error": "Not enough spare parts."}

        mission["spare_parts"] -= 1
        mission["solar_panel_repair_next_sol"] = True

        return {
            "success": True,
            "action": action,
            "message": "Solar panel repair scheduled for the next Sol.",
            "spare_parts_remaining": mission["spare_parts"],
            "effect": "Dust impact will be reduced by 0.10 for one Sol."
        }

    elif action == "prioritize_water":

        if mission.get("spare_parts", 0) < 1:
            return {"error": "Not enough spare parts."}

        mission["spare_parts"] -= 1
        mission["water_recovery_priority_next_sol"] = True

        return {
            "success": True,
            "action": action,
            "message": "Water recycling priority enabled for the next Sol.",
            "spare_parts_remaining": mission["spare_parts"],
            "effect": "Water recovery may improve by 10 percentage points when the recycler has sufficient power."
        }

    return {
        "error": "Unknown action.",
        "available_actions": [
            "conserve_power",
            "repair_equipment",
            "prioritize_water"
        ]
    }
