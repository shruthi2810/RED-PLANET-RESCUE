
# RED PLANET RESCUE
# Equipment Status and Cascade Failure Logic
#
# Prototype assumptions, not verified NASA engineering specifications.

NORMAL_WATER_RECOVERY_RATE = 0.80
REDUCED_WATER_RECOVERY_RATE = 0.40


def evaluate_equipment_effects(weather_condition, battery):
    """
    Evaluate equipment status after the daily power calculation.

    A dust storm marks solar panels as dust-affected.
    Low battery or power shortage limits water-recycler operation.
    """

    power_status = battery.get("power_status", "Normal")
    battery_remaining = battery.get("battery_remaining", 0)

    if weather_condition == "Dust Storm":
        solar_panel_status = "Dust-affected"
        solar_panel_message = (
            "Dust storm conditions are reducing solar energy generation."
        )
    else:
        solar_panel_status = "Operational"
        solar_panel_message = "Solar panels are operating normally."

    if power_status == "Power Shortage":
        water_recycler_status = "Power shortage"
        recovery_rate = REDUCED_WATER_RECOVERY_RATE
        recycler_message = (
            "Power shortage is limiting water-recycler operation."
        )

    elif power_status == "Low Battery" or battery_remaining <= 20:
        water_recycler_status = "Power limited"
        recovery_rate = REDUCED_WATER_RECOVERY_RATE
        recycler_message = (
            "Low battery is reducing water-recycler efficiency."
        )

    else:
        water_recycler_status = "Operational"
        recovery_rate = NORMAL_WATER_RECOVERY_RATE
        recycler_message = "Water recycler is operating normally."

    cascade_active = (
        solar_panel_status == "Dust-affected"
        and water_recycler_status != "Operational"
    )

    return {
        "equipment": {
            "solar_panels": {
                "status": solar_panel_status,
                "message": solar_panel_message
            },
            "water_recycler": {
                "status": water_recycler_status,
                "message": recycler_message,
                "water_recovery_rate": recovery_rate
            }
        },
        "cascade_failure": {
            "active": cascade_active,
            "chain": (
                [
                    "Dust storm",
                    "Reduced solar generation",
                    "Low battery or power shortage",
                    "Reduced water recycling",
                    "Increased net water loss"
                ]
                if cascade_active else []
            )
        },
        "prototype_assumptions": {
            "normal_water_recovery_rate": NORMAL_WATER_RECOVERY_RATE,
            "reduced_water_recovery_rate": REDUCED_WATER_RECOVERY_RATE
        }
    }
