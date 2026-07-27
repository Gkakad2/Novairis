import json
from pathlib import Path
from datetime import datetime, UTC

from database.repositories.incident_repository import (
    save_incident,
    get_open_incident,
)

INCIDENT_DIR = Path("incidents")
INCIDENT_DIR.mkdir(exist_ok=True)


def create_incident(rule, hostname, evidence):

    # ---------------------------------
    # Don't create duplicate open alerts
    # ---------------------------------

    existing = get_open_incident(
        hostname,
        rule["id"]
    )

    if existing:
        return None

    incident = {

        "timestamp": datetime.now(UTC).isoformat(),

        "hostname": hostname,

        "rule_id": rule["id"],

        "title": rule["title"],

        "severity": rule["severity"],

        "mitre": rule["mitre"],

        "category": rule["category"],

        "evidence": evidence

    }

    db_id = save_incident(

        hostname,

        rule["id"],

        rule["title"],

        rule["severity"],

        rule["mitre"],

        rule["category"],

        evidence

    )

    filename = INCIDENT_DIR / (
        f"{rule['id']}_{int(datetime.now().timestamp())}.json"
    )

    with open(filename, "w") as f:
        json.dump(incident, f, indent=4)

    print()
    print("=" * 60)
    print(" INCIDENT CREATED")
    print("=" * 60)
    print(f"Database ID : {db_id}")
    print(f"Rule        : {rule['id']}")
    print(f"Hostname    : {hostname}")
    print(f"Evidence    : {evidence}")
    print()

    return incident
