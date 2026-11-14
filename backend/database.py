
# RED PLANET RESCUE
# SQLite Database Management

import sqlite3
import json
import os

DATABASE_PATH = os.path.join(
    os.path.dirname(__file__),
    "red_planet_rescue.db"
)


def get_connection():
    connection = sqlite3.connect(DATABASE_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def create_database():

    connection = get_connection()

    connection.execute("""
        CREATE TABLE IF NOT EXISTS missions (
            id INTEGER PRIMARY KEY,
            mission_data TEXT NOT NULL,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    connection.execute("""
        CREATE TABLE IF NOT EXISTS mission_events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sol INTEGER NOT NULL,
            event_type TEXT NOT NULL,
            description TEXT NOT NULL,
            event_data TEXT
        )
    """)

    connection.commit()
    connection.close()


def save_mission(mission):

    connection = get_connection()

    connection.execute("""
        INSERT OR REPLACE INTO missions
        (id, mission_data, updated_at)
        VALUES (1, ?, CURRENT_TIMESTAMP)
    """, (json.dumps(mission),))

    connection.commit()
    connection.close()


def load_mission():

    connection = get_connection()

    result = connection.execute("""
        SELECT mission_data
        FROM missions
        WHERE id = 1
    """).fetchone()

    connection.close()

    if result is None:
        return None

    return json.loads(result["mission_data"])


def save_event(sol, event_type, description, event_data=None):

    connection = get_connection()

    connection.execute("""
        INSERT INTO mission_events
        (sol, event_type, description, event_data)
        VALUES (?, ?, ?, ?)
    """, (
        sol,
        event_type,
        description,
        json.dumps(event_data) if event_data is not None else None
    ))

    connection.commit()
    connection.close()


def get_mission_events():

    connection = get_connection()

    results = connection.execute("""
        SELECT * FROM mission_events
        ORDER BY id
    """).fetchall()

    connection.close()

    return [
        {
            "id": row["id"],
            "sol": row["sol"],
            "event_type": row["event_type"],
            "description": row["description"],
            "event_data": (
                json.loads(row["event_data"])
                if row["event_data"] else None
            )
        }
        for row in results
    ]
