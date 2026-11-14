
# RED PLANET RESCUE
# NASA RAD-based Radiation Simulation
#
# Source:
# NASA Curiosity Rover - Radiation Assessment Detector (RAD)
# https://science.nasa.gov/resource/radiation-measurements-on-mars/
#
# NASA reported approximately 210 microgray per day
# during Curiosity's first 10 months on the Martian surface.
#
# This is an educational simulation, not a human safety model.

# NASA reference measurement
NASA_RAD_DAILY_ABSORBED_DOSE_UGY = 210.0

# Additional habitat shielding is not assumed by default.
# Change only when a documented scenario is introduced.
HABITAT_SHIELDING_EFFECTIVENESS = 0.0

NASA_RAD_SOURCE = {
    "instrument": "Radiation Assessment Detector (RAD)",
    "mission": "Mars Science Laboratory - Curiosity",
    "measurement": "Martian surface absorbed dose",
    "reference_rate": 210.0,
    "unit": "microgray/day",
    "source_url": (
        "https://science.nasa.gov/resource/"
        "radiation-measurements-on-mars/"
    ),
    "data_period": "First 10 months of surface observations"
}


def calculate_radiation_exposure():

    baseline = NASA_RAD_DAILY_ABSORBED_DOSE_UGY

    shielding = HABITAT_SHIELDING_EFFECTIVENESS

    absorbed_dose = baseline * (1 - shielding)

    return {
        "nasa_reference_dose": baseline,
        "shielding_effectiveness": shielding,
        "daily_absorbed_dose": round(absorbed_dose, 3),
        "unit": "microgray",
        "source": NASA_RAD_SOURCE
    }


def calculate_radiation_status(total_exposure):

    # Informational tracking only.
    # No human health or safety threshold is inferred.
    return "Monitoring"


def update_radiation(mission):

    radiation_data = calculate_radiation_exposure()

    daily_exposure = radiation_data["daily_absorbed_dose"]

    previous_exposure = mission.get(
        "radiation_absorbed_dose_ugy", 0.0
    )

    total_exposure = previous_exposure + daily_exposure

    mission["radiation_absorbed_dose_ugy"] = round(
        total_exposure, 3
    )

    return {
        "daily_absorbed_dose": daily_exposure,
        "previous_absorbed_dose": previous_exposure,
        "total_absorbed_dose": mission[
            "radiation_absorbed_dose_ugy"
        ],
        "radiation_status": calculate_radiation_status(
            total_exposure
        ),
        "unit": "microgray",
        "source": radiation_data["source"]
    }
