
# RED PLANET RESCUE
# Resource Prediction System
#
# Educational rule-based estimates.
# Not NASA operational forecasts.

from simulation import (
    calculate_daily_consumption,
    WATER_RECOVERY_RATE,
    BATTERY_CAPACITY
)


def predict_resource_levels(mission):

    resources = mission.get("resources", {})
    crew_count = mission.get("crew_count", 6)

    oxygen = resources.get("oxygen", 0)
    water = resources.get("water", 0)
    food = resources.get("food", 0)
    battery = mission.get("battery_kwh", 0)

    consumption = calculate_daily_consumption(crew_count)

    # Extract numerical consumption values
    oxygen_daily = consumption["oxygen"]["amount"]
    water_daily = consumption["water"]["amount"]
    food_daily = consumption["food"]["amount"]

    # Get current water recovery rate
    equipment = mission.get("equipment", {})
    recycler = equipment.get("water_recycler", {})

    recovery_rate = recycler.get(
        "water_recovery_rate",
        WATER_RECOVERY_RATE
    )

    water_net_loss = water_daily * (1 - recovery_rate)

    def estimate_sols(remaining, daily_loss):

        if daily_loss <= 0:
            return None

        return round(max(0, remaining / daily_loss), 1)

    oxygen_sols = estimate_sols(oxygen, oxygen_daily)
    water_sols = estimate_sols(water, water_net_loss)
    food_sols = estimate_sols(food, food_daily)

    estimates = {
        "oxygen": oxygen_sols,
        "water": water_sols,
        "food": food_sols
    }

    valid_estimates = {
        name: sols
        for name, sols in estimates.items()
        if sols is not None
    }

    if valid_estimates:
        limiting_resource = min(
            valid_estimates,
            key=valid_estimates.get
        )
        limiting_sols = valid_estimates[limiting_resource]
    else:
        limiting_resource = None
        limiting_sols = None

    if limiting_sols is None:
        risk = "Unknown"
    elif limiting_sols <= 3:
        risk = "Critical"
    elif limiting_sols <= 7:
        risk = "Warning"
    else:
        risk = "Normal"

    return {
        "mission": mission.get(
            "mission_name",
            "RED PLANET RESCUE"
        ),
        "sol": mission.get("sol", 1),
        "crew_count": crew_count,

        "resource_predictions": {
            "oxygen": {
                "remaining": oxygen,
                "unit": "kg",
                "daily_consumption": oxygen_daily,
                "estimated_sols_remaining": oxygen_sols
            },
            "water": {
                "remaining": water,
                "unit": "litres",
                "daily_consumption": water_daily,
                "recovery_rate": recovery_rate,
                "estimated_net_daily_loss": round(
                    water_net_loss, 2
                ),
                "estimated_sols_remaining": water_sols
            },
            "food": {
                "remaining": food,
                "unit": "kg",
                "daily_consumption": food_daily,
                "estimated_sols_remaining": food_sols
            }
        },

        "battery": {
            "remaining_kwh": battery,
            "capacity_kwh": BATTERY_CAPACITY,
            "status": (
                "Critical" if battery <= 20
                else "Warning" if battery <= 30
                else "Normal"
            ),
            "future_depletion_prediction": (
                "Not calculated: future weather and power "
                "generation are scenario-dependent."
            )
        },

        "limiting_resource": limiting_resource,
        "estimated_sols_until_limiting_resource": limiting_sols,
        "overall_resource_risk": risk,

        "prediction_type": "Rule-based estimate",
        "prototype_assumptions": True
    }
