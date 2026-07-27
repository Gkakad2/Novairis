from detector.incident import create_incident
from database.repositories.incident_repository import (
    get_open_drift_incidents,
    resolve_drift_incident,
)

# Common Linux services that legitimately start/stop/update on their own
# and aren't meaningful signals of compromise on their own. New services
# outside this list still get flagged normally.
BENIGN_SERVICES = {
    "fwupd.service",
    "fwupd-refresh.service",
    "packagekit.service",
    "man-db.service",
    "apt-daily.service",
    "apt-daily-upgrade.service",
    "snapd.service",
    "systemd-tmpfiles-clean.service",
    "logrotate.service",
    "motd-news.service",
}


def detect_drift(hostname, findings):

    incidents = []

    mapping = {
        "processes": ("New Process Detected", "Medium"),
        "ports": ("New Listening Port", "High"),
        "services": ("New Service", "High"),
        "users": ("New User Account", "High"),
    }

    for category, values in findings.items():

        title, severity = mapping[category]

        # ----------------------------
        # Create incidents
        # ----------------------------

        for item in values.get("added", []):

            if category == "services" and str(item) in BENIGN_SERVICES:
                continue

            rule = {
                "id": f"DRIFT-{category.upper()}",
                "title": title,
                "severity": severity,
                "mitre": "Behavioral",
                "category": category,
            }

            incident = create_incident(
                rule,
                hostname,
                str(item),
            )

            if incident:
                incidents.append(incident)

        # ----------------------------
        # Resolve incidents
        # ----------------------------

        for item in values.get("removed", []):

            resolve_drift_incident(
                hostname,
                f"DRIFT-{category.upper()}",
                str(item),
            )

    return incidents
