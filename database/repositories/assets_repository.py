from datetime import datetime, UTC

from database.db import SessionLocal
from database.models import Host, Telemetry


ONLINE_THRESHOLD_SECONDS = 120


def is_online(last_seen, is_demo=False):
    # Demo hosts aren't backed by a real agent, so nothing ever refreshes
    # their last_seen after creation — a pure time-since-last-seen check
    # would flip them to "Offline" within minutes even though they're
    # meant to represent an active fleet member. Treat them as always on.
    if is_demo:
        return True

    if not last_seen:
        return False

    if last_seen.tzinfo:
        last_seen = last_seen.replace(tzinfo=None)

    return (datetime.utcnow() - last_seen).total_seconds() <= ONLINE_THRESHOLD_SECONDS

def get_asset_summary():

    session = SessionLocal()

    try:

        hosts = session.query(Host).all()

        total_hosts = len(hosts)

        linux = 0
        windows = 0
        online = 0

        for host in hosts:

            if "linux" in host.os.lower() or "ubuntu" in host.os.lower():
                linux += 1

            if "windows" in host.os.lower():
                windows += 1

            if is_online(host.last_seen, host.is_demo):
                online += 1

        return {

            "total_hosts": total_hosts,

            "online": online,

            "offline": total_hosts - online,

            "linux": linux,

            "windows": windows,

        }

    finally:

        session.close()


def get_assets():

    session = SessionLocal()

    try:

        inventory = []

        hosts = session.query(Host).all()

        for host in hosts:

            latest = (
                session.query(Telemetry)
                .filter(
                    Telemetry.hostname == host.hostname
                )
                .order_by(
                    Telemetry.collection_time.desc()
                )
                .first()
            )

            inventory.append({

                "hostname": host.hostname,

                "ip": host.ip,

                "os": host.os,

                "kernel": host.kernel,

                "last_seen": (
                    host.last_seen.isoformat()
                    if host.last_seen
                    else None
                ),

                "status": (
                    "Online"
                    if is_online(host.last_seen, host.is_demo)
                    else "Offline"
                ),

                "cpu": (
                    latest.cpu_usage
                    if latest
                    else 0
                ),

                "memory": (
                    latest.memory_usage
                    if latest
                    else 0
                ),

            })

        return inventory

    finally:

        session.close()

def get_all_assets():

    session = SessionLocal()

    try:

        hosts = session.query(Host).order_by(Host.hostname).all()

        assets = []

        for host in hosts:

            latest = (
                session.query(Telemetry)
                .filter(Telemetry.hostname == host.hostname)
                .order_by(Telemetry.collection_time.desc())
                .first()
            )

            assets.append({

                "hostname": host.hostname,

                "ip": host.ip,

                "os": host.os,

                "kernel": host.kernel,

                "status": "Online" if is_online(host.last_seen, host.is_demo) else "Offline",

                "first_seen": host.first_seen.isoformat(),

                "last_seen": host.last_seen.isoformat(),

                "cpu": latest.cpu_usage if latest else 0,

                "memory": latest.memory_usage if latest else 0,

                "processes": latest.process_count if latest else 0,

                "is_demo": bool(host.is_demo),

            })

        return assets

    finally:

        session.close()
