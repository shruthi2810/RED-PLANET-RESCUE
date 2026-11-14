
# RED PLANET RESCUE
# Mars Mission Resource Simulation
#
# Prototype assumptions, not verified NASA engineering specifications.

from radiation import update_radiation
from failures import evaluate_equipment_effects

MISSION_DURATION = 30

RESOURCE_RATES = {
    "oxygen": {"rate": 0.84, "unit": "kg"},
    "water": {"rate": 3.5, "unit": "litres"},
    "food": {"rate": 0.62, "unit": "kg"}
}

WATER_RECOVERY_RATE = 0.80

SOLAR_PANEL_CAPACITY = 5
DAILY_POWER_CONSUMPTION = 20
BATTERY_CAPACITY = 100

MARS_WEATHER = [
    {"condition": "Clear", "sunlight_hours": 8, "dust_factor": 0.10},
    {"condition": "Hazy", "sunlight_hours": 6, "dust_factor": 0.35},
    {"condition": "Dust Storm", "sunlight_hours": 2, "dust_factor": 0.80}
]


def calculate_daily_consumption(crew_count):

    consumption = {}

    for resource, details in RESOURCE_RATES.items():

        daily_amount = details["rate"] * crew_count

        consumption[resource] = {
            "amount": round(daily_amount, 2),
            "unit": details["unit"]
        }

    return consumption


def calculate_remaining_resources(available_resources, daily_consumption):

    remaining = {}

    for resource, available in available_resources.items():

        used = daily_consumption[resource]["amount"]

        remaining[resource] = {
            "available": available,
            "consumed": used,
            "remaining": round(max(0, available - used), 2),
            "unit": daily_consumption[resource]["unit"],
            "depleted": available < used
        }

    return remaining


def calculate_water_recycling(
    water_consumed,
    recovery_rate=WATER_RECOVERY_RATE
):

    recovered_water = water_consumed * recovery_rate
    net_water_loss = water_consumed - recovered_water

    return {
        "water_consumed": round(water_consumed, 2),
        "recovery_rate": recovery_rate,
        "recovered_water": round(recovered_water, 2),
        "net_water_loss": round(net_water_loss, 2),
        "unit": "litres"
    }


def calculate_solar_power(sol):

    weather_index = (sol - 1) % len(MARS_WEATHER)
    weather = MARS_WEATHER[weather_index]

    generated_energy = (
        SOLAR_PANEL_CAPACITY
        * weather["sunlight_hours"]
        * (1 - weather["dust_factor"])
    )

    return {
        "weather": weather["condition"],
        "sunlight_hours": weather["sunlight_hours"],
        "dust_factor": weather["dust_factor"],
        "solar_generation": round(generated_energy, 2),
        "unit": "kWh"
    }


def manage_battery(
    mission,
    solar_data,
    power_consumption=DAILY_POWER_CONSUMPTION
):

    previous_battery = mission["battery_kwh"]
    generated = solar_data["solar_generation"]
    consumed = power_consumption

    energy_available = previous_battery + generated

    shortage = max(0, consumed - energy_available)

    battery_remaining = min(
        BATTERY_CAPACITY,
        max(0, energy_available - consumed)
    )

    mission["battery_kwh"] = round(battery_remaining, 2)

    if shortage > 0:
        power_status = "Power Shortage"
    elif battery_remaining <= 20:
        power_status = "Low Battery"
    else:
        power_status = "Normal"

    return {
        "previous_battery": round(previous_battery, 2),
        "solar_generated": generated,
        "power_consumed": consumed,
        "battery_remaining": mission["battery_kwh"],
        "battery_capacity": BATTERY_CAPACITY,
        "energy_shortage": round(shortage, 2),
        "power_status": power_status,
        "unit": "kWh"
    }


def advance_one_sol(mission):

    if mission["status"] != "Active":
        return {
            "error": "Mission is not active",
            "status": mission["status"]
        }

    processed_sol = mission["sol"]

    if processed_sol > MISSION_DURATION:
        return {
            "error": "Mission has already reached its limit",
            "sol": MISSION_DURATION,
            "status": mission["status"]
        }

    # Read and consume the one-Sol decision flags.
    conserve_power = mission.pop(
        "power_conservation_next_sol", False
    )

    repair_panels = mission.pop(
        "solar_panel_repair_next_sol", False
    )

    prioritize_water = mission.pop(
        "water_recovery_priority_next_sol", False
    )

    # 1. Calculate crew consumption.
    consumption = calculate_daily_consumption(
        mission["crew_count"]
    )

    # 2. Calculate solar energy.
    solar_data = calculate_solar_power(processed_sol)

    # 3. Apply solar panel repair effect.
    if repair_panels:

        original_dust_factor = solar_data["dust_factor"]

        solar_data["dust_factor"] = max(
            0,
            original_dust_factor - 0.10
        )

        solar_data["solar_generation"] = round(
            SOLAR_PANEL_CAPACITY
            * solar_data["sunlight_hours"]
            * (1 - solar_data["dust_factor"]),
            2
        )

        solar_data["repair_applied"] = True

    else:
        solar_data["repair_applied"] = False

    # 4. Apply power conservation.
    power_consumption = DAILY_POWER_CONSUMPTION

    if conserve_power:
        power_consumption = max(
            0,
            DAILY_POWER_CONSUMPTION - 5
        )

    power_data = manage_battery(
        mission,
        solar_data,
        power_consumption
    )

    power_data["conservation_applied"] = conserve_power

    # 5. Evaluate equipment and cascade failures.
    equipment_data = evaluate_equipment_effects(
        solar_data["weather"],
        power_data
    )

    recovery_rate = equipment_data["equipment"][
        "water_recycler"
    ]["water_recovery_rate"]

    # 6. Apply water priority only if recycler is operational.
    water_priority_applied = False

    if (
        prioritize_water
        and equipment_data["equipment"]["water_recycler"]["status"]
        == "Operational"
    ):
        recovery_rate = min(0.95, recovery_rate + 0.10)
        water_priority_applied = True

        equipment_data["equipment"]["water_recycler"][
            "water_recovery_rate"
        ] = recovery_rate

        equipment_data["equipment"]["water_recycler"][
            "message"
        ] = "Water recovery priority is active."

    water_recycling = calculate_water_recycling(
        consumption["water"]["amount"],
        recovery_rate
    )

    water_recycling["priority_applied"] = water_priority_applied

    # 7. Update resources.
    for resource, details in consumption.items():

        amount_used = details["amount"]

        if resource == "water":
            amount_used = water_recycling["net_water_loss"]

        mission["resources"][resource] -= amount_used

        mission["resources"][resource] = round(
            max(0, mission["resources"][resource]), 2
        )

    # 8. Save current equipment state for other modules.
    mission["equipment"] = equipment_data["equipment"]

    # 9. Update radiation.
    radiation_data = update_radiation(mission)

    # 10. Detect depleted resources.
    depleted = [
        name
        for name, amount in mission["resources"].items()
        if amount <= 0
    ]

    # 11. Determine mission outcome.
    if (
        depleted
        or power_data["power_status"] == "Power Shortage"
    ):
        mission["status"] = "Critical"
        mission["sol"] = processed_sol

    elif processed_sol == MISSION_DURATION:
        mission["status"] = "Completed"
        mission["sol"] = MISSION_DURATION

    else:
        mission["sol"] = processed_sol + 1

    return {
        "processed_sol": processed_sol,
        "sol": mission["sol"],
        "mission_duration": MISSION_DURATION,
        "remaining_sols": max(
            0,
            MISSION_DURATION - processed_sol
        ),
        "status": mission["status"],
        "resources": mission["resources"],
        "water_recycling": water_recycling,
        "solar_power": solar_data,
        "battery": power_data,
        "equipment": equipment_data["equipment"],
        "cascade_failure": equipment_data["cascade_failure"],
        "radiation": radiation_data,
        "depleted_resources": depleted,
        "decisions_applied": {
            "power_conservation": conserve_power,
            "solar_panel_repair": repair_panels,
            "water_recovery_priority": water_priority_applied
        }
    }
