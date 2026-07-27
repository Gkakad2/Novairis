from flask import Flask, request, jsonify
from flask_cors import CORS
from pathlib import Path
from datetime import datetime, UTC
import json

from detector.engine import detect

from database.repositories.host_repository import (
    update_host,
    create_demo_host,
    delete_demo_host,
)
from database.repositories.telemetry_repository import save_telemetry
from database.repositories.process_repository import save_processes
from database.repositories.process_search import (
    get_all_processes,
    search_process,
    search_command
)

from database.repositories.timeline_repository import get_host_timeline
from database.repositories.dashboard_repository import (
    get_dashboard_summary,
    get_host_resource_inventory,
    get_live_threat_feed,
)

from database.repositories.analytics_repository import get_analytics

from database.repositories.mitre_repository import (
    count_open_techniques,
    get_top_mitre_techniques,
)

from database.repositories.incident_repository import (
    get_recent_incidents,
    get_incident_by_id,
)

from sqlalchemy import func, desc
from database.db import SessionLocal
from database.models import Host, Incident

from database.repositories.assets_repository import (
    get_asset_summary,
    get_all_assets,
)

app = Flask(__name__)

CORS(app)

LOG_DIR = Path("logs/telemetry")
LOG_DIR.mkdir(parents=True, exist_ok=True)


@app.route("/")
def home():

    return {
        "application": "OSVF",
        "status": "Running",
        "version": "1.0",
        "endpoints": [
            "/heartbeat",
            "/processes",
            "/hunt/process/<name>",
            "/hunt/command/<keyword>",
            "/dashboard/summary",
            "/dashboard/incidents",
            "/dashboard/resources",
            "/analytics",
            "/hosts",
            "/hosts/demo",
            "/timeline/<hostname>"
        ]
    }


@app.route("/heartbeat", methods=["POST"])
def heartbeat():

    telemetry = request.get_json()

    update_host(telemetry["system"])

    save_telemetry(telemetry)

    save_processes(telemetry)

    hostname = telemetry["system"]["hostname"]

    timestamp = datetime.now(UTC).strftime("%Y%m%d_%H%M%S")

    file = LOG_DIR / f"{hostname}_{timestamp}.json"

    with open(file, "w") as f:
        json.dump(telemetry, f, indent=4)

    incidents = detect(telemetry)

    return jsonify({
        "status": "received",
        "incidents": len(incidents)
    })


@app.route("/processes", methods=["GET"])
def processes():

    rows = get_all_processes()

    result = []

    for p in rows:

        result.append({

            "hostname": p.hostname,
            "time": str(p.collection_time),
            "pid": p.pid,
            "name": p.name,
            "user": p.user,
            "cpu": p.cpu_percent,
            "memory": p.memory_percent,
            "command": p.command

        })

    return jsonify(result)


@app.route("/hunt/process/<name>", methods=["GET"])
def hunt_process(name):

    rows = search_process(name)

    result = []

    for p in rows:

        result.append({

            "hostname": p.hostname,
            "time": str(p.collection_time),
            "pid": p.pid,
            "name": p.name,
            "user": p.user,
            "command": p.command

        })

    return jsonify(result)


@app.route("/hunt/command/<keyword>", methods=["GET"])
def hunt_command(keyword):

    rows = search_command(keyword)

    result = []

    for p in rows:

        result.append({

            "hostname": p.hostname,
            "time": str(p.collection_time),
            "pid": p.pid,
            "name": p.name,
            "user": p.user,
            "command": p.command

        })

    return jsonify(result)


@app.route("/timeline/<hostname>", methods=["GET"])
def timeline(hostname):

    telemetry, incidents = get_host_timeline(hostname)

    result = {

        "hostname": hostname,
        "telemetry": [],
        "incidents": []

    }

    for t in telemetry:

        result["telemetry"].append({

            "time": str(t.collection_time),
            "cpu": t.cpu_usage,
            "memory": t.memory_usage,
            "processes": t.process_count

        })

    for i in incidents:

        result["incidents"].append({

            "time": str(i.timestamp),
            "rule": i.rule_id,
            "title": i.title,
            "severity": i.severity,
            "evidence": i.evidence

        })

    return jsonify(result)

@app.route("/dashboard/summary", methods=["GET"])
def dashboard_summary():

    return jsonify(get_dashboard_summary())


@app.route("/dashboard/incidents", methods=["GET"])
def dashboard_incidents():

    return jsonify(get_recent_incidents(limit=10))


@app.route("/incidents", methods=["GET"])
def incidents_list():

    status = request.args.get("status")
    hostname = request.args.get("hostname")

    return jsonify(
        get_recent_incidents(
            limit=200,
            status=status,
            hostname=hostname,
        )
    )


@app.route("/analytics", methods=["GET"])
def analytics():

    hostname = request.args.get("hostname") or None
    hours = request.args.get("hours", 72, type=int)

    return jsonify(get_analytics(hostname=hostname, hours=hours))


@app.route("/hosts", methods=["GET"])
def hosts_list():

    session = SessionLocal()

    try:
        rows = session.query(Host).order_by(Host.hostname).all()
        return jsonify([
            {
                "hostname": h.hostname,
                "ip": h.ip,
                "os": h.os,
                "kernel": h.kernel,
                "first_seen": h.first_seen.isoformat() if h.first_seen else None,
                "last_seen": h.last_seen.isoformat() if h.last_seen else None,
                "is_demo": bool(h.is_demo),
            }
            for h in rows
        ])
    finally:
        session.close()


@app.route("/hosts/demo", methods=["POST"])
def hosts_create_demo():

    payload = request.get_json(silent=True) or {}

    hostname = (payload.get("hostname") or "").strip()

    if not hostname:
        return jsonify({"error": "hostname is required"}), 400

    try:
        host = create_demo_host(
            hostname=hostname,
            ip=(payload.get("ip") or "").strip() or None,
            os_name=(payload.get("os") or "").strip() or None,
            kernel=(payload.get("kernel") or "").strip() or None,
        )
    except ValueError as err:
        return jsonify({"error": str(err)}), 409

    return jsonify(host), 201


@app.route("/hosts/<hostname>", methods=["DELETE"])
def hosts_delete_demo(hostname):

    try:
        delete_demo_host(hostname)
    except ValueError as err:
        return jsonify({"error": str(err)}), 404
    except PermissionError as err:
        return jsonify({"error": str(err)}), 403

    return jsonify({"status": "deleted", "hostname": hostname})


@app.route("/incidents/<int:incident_id>", methods=["GET"])
def incidents_detail(incident_id):

    incident = get_incident_by_id(incident_id)

    if not incident:
        return jsonify({"error": "Incident not found"}), 404

    return jsonify(incident)


@app.route("/dashboard/resources", methods=["GET"])
def dashboard_resources():

    return jsonify(
        get_host_resource_inventory()
    )


@app.route("/dashboard/threat-feed", methods=["GET"])
def dashboard_threat_feed():

    return jsonify(
        get_live_threat_feed()
    )

@app.route("/dashboard/threat-intelligence", methods=["GET"])
def dashboard_threat_intelligence():

    session = SessionLocal()

    critical = session.query(Incident).filter(
        Incident.status == "Open",
        Incident.severity == "Critical"
    ).count()

    high = session.query(Incident).filter(
        Incident.status == "Open",
        Incident.severity == "High"
    ).count()

    medium = session.query(Incident).filter(
        Incident.status == "Open",
        Incident.severity == "Medium"
    ).count()

    low = session.query(Incident).filter(
        Incident.status == "Open",
        Incident.severity == "Low"
    ).count()

    hosts = session.query(
        func.count(func.distinct(Incident.hostname))
    ).filter(
        Incident.status == "Open"
    ).scalar()

    mitre = count_open_techniques()

    score = critical * 10 + high * 5 + medium * 2 + low

    if score > 50:
        level = "CRITICAL"
    elif score > 25:
        level = "HIGH"
    elif score > 10:
        level = "MEDIUM"
    else:
        level = "LOW"

    session.close()

    return jsonify({
        "critical": critical,
        "high": high,
        "medium": medium,
        "low": low,
        "hosts": hosts,
        "mitre": mitre,
        "score": level
    })

@app.route("/dashboard/top-mitre", methods=["GET"])
def dashboard_top_mitre():

    return jsonify(get_top_mitre_techniques(limit=5))

@app.route("/assets/summary", methods=["GET"])
def assets_summary():

    return jsonify(
        get_asset_summary()
    )


@app.route("/assets/hosts", methods=["GET"])
def assets_hosts():

    return jsonify(
        get_assets()
    )

@app.get("/assets")
def assets():

    return jsonify(
        get_all_assets()
    )

if __name__ == "__main__":

    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True
    )
