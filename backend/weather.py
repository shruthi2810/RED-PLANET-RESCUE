
"""
RED PLANET RESCUE
NASA Curiosity REMS MODRDR weather-data reader.

Reads historical Sol 1 observations from the NASA PDS MODRDR product.

Confidence screening follows the field definitions in MODRDR6.FMT.
Raw numeric summaries are retained separately from screened summaries.
"""

import csv
import json
import statistics
from pathlib import Path
from typing import Optional


BASE_DIR = Path(__file__).resolve().parent

DATA_FILE = (
    BASE_DIR
    / "data"
    / "RME_397535244RMD00010000000_______PA.TAB"
)

MISSING_VALUE = -999.0

# Zero-based column positions from NASA MODRDR6.FMT
COL_HORIZONTAL_WIND_SPEED = 3
COL_WIND_DIRECTION = 5
COL_WIND_CONFIDENCE = 6

COL_AMBIENT_TEMP_K = 15
COL_AMBIENT_TEMP_CONFIDENCE = 16

COL_UV_ABC = 20
COL_UV_CONFIDENCE = 29

COL_RELATIVE_HUMIDITY = 30
COL_HUMIDITY_CONFIDENCE = 35

COL_PRESSURE_PA = 37
COL_PRESSURE_CONFIDENCE = 39


NASA_SOURCE = {
    "agency": "NASA Planetary Data System",
    "mission": "Mars Science Laboratory - Curiosity",
    "instrument": "Rover Environmental Monitoring Station (REMS)",
    "dataset_id": "MSL-M-REMS-5-MODRDR-V1.0",
    "product_id": "RME_397535244RMD00010000000_______PA",
    "sol": 1,
    "observation_start_utc": "2012-08-07T04:04:38.536",
    "observation_stop_utc": "2012-08-07T04:24:19.547",
    "source_description": (
        "NASA PDS MODRDR environmental measurements; "
        "historical observations from Curiosity at Gale Crater."
    )
}


def _to_float(value: str) -> Optional[float]:
    """Convert a table value to float; ignore missing or invalid values."""

    try:
        number = float(value.strip())
    except (TypeError, ValueError):
        return None

    if number == MISSING_VALUE:
        return None

    return number


def _confidence_counts(rows, column_index):
    """Count confidence strings without combining their individual meanings."""

    counts = {}

    for row in rows:
        if len(row) <= column_index:
            continue

        value = row[column_index].strip().replace('"', "")

        if value:
            counts[value] = counts.get(value, 0) + 1

    return counts


def _numeric_values(rows, column_index, confidence_column=None,
                    confidence_check=None):
    """Collect numeric values, optionally applying a confidence check."""

    values = []

    for row in rows:

        if len(row) <= column_index:
            continue

        number = _to_float(row[column_index])

        if number is None:
            continue

        if confidence_check is not None:

            if confidence_column is None:
                continue

            if len(row) <= confidence_column:
                continue

            confidence = (
                row[confidence_column].strip().replace('"', "")
            )

            if not confidence_check(confidence):
                continue

        values.append(number)

    return values


def _median(values):
    if not values:
        return None

    return round(statistics.median(values), 3)


def _field_summary(rows, value_column, confidence_column=None,
                   confidence_check=None):
    """Return raw and confidence-screened statistics separately."""

    raw_values = _numeric_values(
        rows,
        value_column
    )

    screened_values = _numeric_values(
        rows,
        value_column,
        confidence_column,
        confidence_check
    )

    return {
        "value": _median(screened_values),
        "raw_numeric_median": _median(raw_values),
        "raw_valid_records": len(raw_values),
        "confidence_screened_records": len(screened_values)
    }


def load_rems_weather(file_path=DATA_FILE):
    """
    Read the NASA REMS MODRDR table and produce a weather summary.

    Confidence screening:
    - Wind: final confidence character must be 1 (reliable).
    - Temperature: operational-range and observation-reliability
      characters must both be 1.
    - Humidity: all three documented confidence characters must be 1.
    - Pressure: second character must be 1 (no shadow effect).

    These are field-specific checks, not a universal quality score.
    """

    path = Path(file_path)

    if not path.exists():
        raise FileNotFoundError(
            f"NASA REMS data file not found: {path}. "
            "Place the .TAB file in the backend/data folder."
        )

    rows = []

    with path.open(
        "r",
        encoding="utf-8-sig",
        newline=""
    ) as table_file:

        for line in table_file:

            cleaned = line.strip()

            if not cleaned or cleaned.startswith("```"):
                continue

            parsed = next(
                csv.reader(
                    [cleaned],
                    skipinitialspace=True
                )
            )

            if len(parsed) == 40:
                rows.append([
                    item.strip() for item in parsed
                ])

    if not rows:
        raise ValueError(
            "No valid 40-column REMS records were found."
        )

    # WIND
    wind_speed = _field_summary(
        rows,
        COL_HORIZONTAL_WIND_SPEED,
        COL_WIND_CONFIDENCE,
        lambda flag: len(flag) >= 6 and flag[5] == "1"
    )

    wind_direction = _field_summary(
        rows,
        COL_WIND_DIRECTION,
        COL_WIND_CONFIDENCE,
        lambda flag: len(flag) >= 6 and flag[5] == "1"
    )

    # AMBIENT TEMPERATURE
    # Character 7: operational range.
    # Character 8: observation reliability.
    temperature = _field_summary(
        rows,
        COL_AMBIENT_TEMP_K,
        COL_AMBIENT_TEMP_CONFIDENCE,
        lambda flag: (
            len(flag) >= 9
            and flag[7] == "1"
            and flag[8] == "1"
        )
    )

    raw_temperature_kelvin = temperature["raw_numeric_median"]
    screened_temperature_kelvin = temperature["value"]

    raw_temperature_celsius = (
        round(raw_temperature_kelvin - 273.15, 2)
        if raw_temperature_kelvin is not None
        else None
    )

    screened_temperature_celsius = (
        round(screened_temperature_kelvin - 273.15, 2)
        if screened_temperature_kelvin is not None
        else None
    )

    # HUMIDITY
    # Character 0: observation reliability.
    # Character 1: relative humidity quality.
    # Character 2: water-vapour mixing ratio in range.
    humidity = _field_summary(
        rows,
        COL_RELATIVE_HUMIDITY,
        COL_HUMIDITY_CONFIDENCE,
        lambda flag: (
            len(flag) >= 3
            and flag[0] == "1"
            and flag[1] == "1"
            and flag[2] == "1"
        )
    )

    # PRESSURE
    # Character 0: oscillator selection.
    # Character 1: shadow effect (1 means no shadow effect).
    pressure = _field_summary(
        rows,
        COL_PRESSURE_PA,
        COL_PRESSURE_CONFIDENCE,
        lambda flag: (
            len(flag) >= 2
            and flag[1] == "1"
        )
    )

    # UV
    uv = _field_summary(
        rows,
        COL_UV_ABC
    )

    return {

        "source": NASA_SOURCE,

        "data_quality": {
            "records_read": len(rows),

            "missing_value_code": MISSING_VALUE,

            "aggregation": "Median",

            "confidence_screening": {
                "wind": (
                    "Final confidence character must be 1 "
                    "(observation reliable)."
                ),
                "temperature": (
                    "Operational-range and observation-reliability "
                    "characters must both be 1."
                ),
                "humidity": (
                    "All three documented humidity confidence "
                    "characters must be 1."
                ),
                "pressure": (
                    "No-shadow-effect character must be 1. "
                    "This is not a general quality score."
                )
            },

            "important_note": (
                "Raw numeric summaries and confidence-screened "
                "summaries are reported separately."
            )
        },

        "weather": {

            "horizontal_wind_speed": {
                **wind_speed,
                "unit": "m/s",
                "confidence_flags": _confidence_counts(
                    rows,
                    COL_WIND_CONFIDENCE
                )
            },

            "wind_direction": {
                **wind_direction,
                "unit": "degrees clockwise from North",
                "confidence_flags": _confidence_counts(
                    rows,
                    COL_WIND_CONFIDENCE
                )
            },

            "ambient_air_temperature": {
                "value_celsius": screened_temperature_celsius,
                "value_kelvin": screened_temperature_kelvin,

                "raw_median_celsius": raw_temperature_celsius,
                "raw_median_kelvin": raw_temperature_kelvin,

                "raw_valid_records": (
                    temperature["raw_valid_records"]
                ),

                "confidence_screened_records": (
                    temperature["confidence_screened_records"]
                ),

                "unit": "°C and K",

                "confidence_flags": _confidence_counts(
                    rows,
                    COL_AMBIENT_TEMP_CONFIDENCE
                )
            },

            "ultraviolet_abc": {
                **uv,
                "unit": "W/m^2",
                "confidence_flags": _confidence_counts(
                    rows,
                    COL_UV_CONFIDENCE
                )
            },

            "relative_humidity": {
                **humidity,
                "unit": "%",
                "confidence_flags": _confidence_counts(
                    rows,
                    COL_HUMIDITY_CONFIDENCE
                )
            },

            "atmospheric_pressure": {
                **pressure,
                "unit": "Pa",
                "confidence_flags": _confidence_counts(
                    rows,
                    COL_PRESSURE_CONFIDENCE
                )
            }
        },

        "limitations": [
            "These are historical Sol 1 observations, not live Mars weather.",

            "The observations cover one approximately 20-minute window, "
            "not the entire Sol.",

            "A field without confidence-screened numeric records "
            "is returned as null.",

            "Raw numeric summaries are retained for transparency.",

            "Pressure flags describe sensor configuration and shadow, "
            "not a general quality score.",

            "These readings are not a human habitat safety forecast."
        ]
    }


if __name__ == "__main__":

    try:
        print(
            json.dumps(
                load_rems_weather(),
                indent=4
            )
        )

    except Exception as error:
        print(f"REMS weather reader error: {error}")
