from datetime import datetime

from sqlalchemy import func, and_

from database.models import Host
from database.models import Incident
from database.models import Telemetry
from database.db import SessionLocal


def get_host_resource_inventory():

    session = SessionLocal()

    try:

        latest = (

            session.query(

                Telemetry.hostname,

                func.max(
                    Telemetry.collection_time
                ).label("latest_time")

            )

            .group_by(Telemetry.hostname)

            .subquery()

        )

        rows = (

            session.query(

                Host.hostname,

                Host.ip,

                Host.os,

                Host.last_seen,

                Host.is_demo,

                Telemetry.cpu_usage,

                Telemetry.memory_usage

            )

            .join(

                latest,

                Host.hostname == latest.c.hostname

            )

            .join(

                Telemetry,

                and_(

                    Telemetry.hostname == latest.c.hostname,

                    Telemetry.collection_time == latest.c.latest_time

                )

            )

            .order_by(Host.hostname)

            .all()

        )

        inventory = []

        for row in rows:

            last_seen = row.last_seen
            online = bool(row.is_demo)
            if not online and last_seen is not None:
                seen = last_seen.replace(tzinfo=None) if last_seen.tzinfo else last_seen
                online = (datetime.utcnow() - seen).total_seconds() <= 120

            inventory.append({
                "hostname": row.hostname,
                "ip": row.ip,
                "os": row.os,
                "cpu": round(row.cpu_usage or 0, 1),
                "memory": round(row.memory_usage or 0, 1),
                "last_seen": last_seen.isoformat() if last_seen else None,
                "status": "Online" if online else "Offline",
            })

        return inventory

    finally:

        session.close()


def get_cpu_memory_history(limit=50):

    session = SessionLocal()

    try:

        rows = (
            session.query(Telemetry)
            .order_by(Telemetry.collection_time.desc())
            .limit(limit)
            .all()
        )

        rows.reverse()

        return rows

    finally:

        session.close()


def get_dashboard_summary():
    """Fleet KPIs using the latest telemetry sample per host.

    Averaging the entire telemetry history mixes old samples and breaks
    when more than one host is reporting — always reduce to latest/host.
    """

    session = SessionLocal()

    try:

        total_hosts = session.query(Host).count()

        latest_per_host = (
            session.query(
                Telemetry.hostname,
                func.max(Telemetry.collection_time).label("latest_time"),
            )
            .group_by(Telemetry.hostname)
            .subquery()
        )

        latest_rows = (
            session.query(Telemetry)
            .join(
                latest_per_host,
                and_(
                    Telemetry.hostname == latest_per_host.c.hostname,
                    Telemetry.collection_time == latest_per_host.c.latest_time,
                ),
            )
            .all()
        )

        if latest_rows:
            avg_cpu = sum(r.cpu_usage or 0 for r in latest_rows) / len(latest_rows)
            avg_memory = sum(r.memory_usage or 0 for r in latest_rows) / len(latest_rows)
            last_sync = max(r.collection_time for r in latest_rows)
        else:
            avg_cpu = 0
            avg_memory = 0
            last_sync = None

        critical_alerts = (
            session.query(Incident)
            .filter(
                Incident.severity == "Critical",
                Incident.status == "Open",
            )
            .count()
        )

        open_incidents = (
            session.query(Incident)
            .filter(Incident.status == "Open")
            .count()
        )

        high_open = (
            session.query(Incident)
            .filter(
                Incident.severity == "High",
                Incident.status == "Open",
            )
            .count()
        )

        medium_open = (
            session.query(Incident)
            .filter(
                Incident.severity == "Medium",
                Incident.status == "Open",
            )
            .count()
        )

        low_open = (
            session.query(Incident)
            .filter(
                Incident.severity == "Low",
                Incident.status == "Open",
            )
            .count()
        )

        online_hosts = 0
        now = datetime.utcnow()
        for host in session.query(Host).all():
            if host.is_demo:
                online_hosts += 1
                continue
            if host.last_seen is None:
                continue
            seen = host.last_seen
            if seen.tzinfo:
                seen = seen.replace(tzinfo=None)
            if (now - seen).total_seconds() <= 120:
                online_hosts += 1

        # Security health is incident-driven, not resource-driven
        health = 100.0
        health -= critical_alerts * 18
        health -= high_open * 10
        health -= medium_open * 4
        health -= low_open * 1
        # Mild resource pressure only when hosts are saturated
        pressure = max(0.0, ((avg_cpu + avg_memory) / 2) - 70)
        health -= pressure * 0.4

        return {
            "total_hosts": total_hosts,
            "online_hosts": online_hosts,
            "offline_hosts": max(total_hosts - online_hosts, 0),
            "critical_alerts": critical_alerts,
            "open_incidents": open_incidents,
            "average_cpu": round(avg_cpu, 2),
            "average_memory": round(avg_memory, 2),
            "security_health": round(max(0.0, min(100.0, health)), 1),
            "last_sync": last_sync.isoformat() if last_sync else None,
        }

    finally:

        session.close()


def get_live_threat_feed(limit=10):

    session = SessionLocal()

    try:
        # Prefer open threats; fall back to newest overall if none open
        rows = (
            session.query(Incident)
            .filter(Incident.status == "Open")
            .order_by(Incident.timestamp.desc())
            .limit(limit)
            .all()
        )

        if not rows:
            rows = (
                session.query(Incident)
                .order_by(Incident.timestamp.desc())
                .limit(limit)
                .all()
            )

        result = []

        for row in rows:
            result.append({
                "id": row.id,
                "hostname": row.hostname,
                "rule_id": row.rule_id,
                "title": row.title,
                "severity": row.severity,
                "status": row.status,
                "time": row.timestamp.isoformat() if row.timestamp else None,
            })

        return result

    finally:
        session.close()
