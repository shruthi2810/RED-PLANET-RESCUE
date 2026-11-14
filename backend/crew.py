
# RED PLANET RESCUE
# Astronaut Crew Management System

CREW_MEMBERS = [
    {
        "id": 1,
        "name": "Commander",
        "role": "Mission Commander",
        "responsibility": "Leads the mission and makes critical decisions"
    },
    {
        "id": 2,
        "name": "Pilot",
        "role": "Flight Operations",
        "responsibility": "Manages spacecraft and rover operations"
    },
    {
        "id": 3,
        "name": "Medical Officer",
        "role": "Crew Health",
        "responsibility": "Monitors astronaut health and medical needs"
    },
    {
        "id": 4,
        "name": "Engineer",
        "role": "Systems Engineer",
        "responsibility": "Maintains habitat and life-support systems"
    },
    {
        "id": 5,
        "name": "Botanist",
        "role": "Plant Scientist",
        "responsibility": "Manages greenhouse and food production"
    },
    {
        "id": 6,
        "name": "Scientist",
        "role": "Research Scientist",
        "responsibility": "Conducts Mars environmental research"
    }
]


def get_crew():
    """Return all mission crew members."""
    return CREW_MEMBERS


def get_crew_count():
    """Return the number of astronauts."""
    return len(CREW_MEMBERS)
