from database.repositories.incident_repository import (
    get_all_open_incidents,
    resolve_incident,
)

from baseline.manager import (
    baseline_exists,
    load_baseline,
    save_baseline,
)

from detector.compare import compare
from detector.drift import detect_drift
from detector.rule_loader import load_rules
from detector.incident import create_incident


def detect(telemetry):

    hostname = telemetry["system"]["hostname"]

    incidents = []

    if not baseline_exists(hostname):

        print(f"[+] Creating baseline for {hostname}")

        save_baseline(hostname, telemetry)

        return []

    baseline = load_baseline(hostname)

    findings = compare(telemetry, baseline)

    incidents.extend(
        detect_drift(hostname, findings)
    )

    rules = load_rules()

    matched = {}

    processes = telemetry.get("processes", [])

    for process in processes:

        command = process.get("command", "")

        name = process.get("name", "")

        for rule in rules:

            field = rule["field"].lower()

            pattern = rule["contains"].lower()

            matched_now = False

            evidence = ""

            if field == "command":

                if pattern in command.lower():

                    matched_now = True
                    evidence = command

            elif field == "name":

                if pattern in name.lower():

                    matched_now = True
                    evidence = name

            if matched_now:

                matched.setdefault(rule["id"], set()).add(evidence)
                print("=" * 60)
                print("Rule:", rule["id"])
                print("Pattern:", pattern)
                print("Command:", command)
                print("Matched:", pattern in command.lower())

                incident = create_incident(
                    rule,
                    hostname,
                    evidence,
                )

                if incident:
                    incidents.append(incident)

    open_incidents = get_all_open_incidents(hostname)

    for incident in open_incidents:

        if incident.rule_id.startswith("DRIFT-"):
            continue

        active = matched.get(incident.rule_id, set())

        if incident.evidence not in active:

            resolve_incident(
                hostname,
                incident.rule_id,
            )

    save_baseline(hostname, telemetry)

    return incidents
