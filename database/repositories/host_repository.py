import random
from datetime import datetime, timedelta, UTC

from database.db import SessionLocal
from database.models import Host, Telemetry, Incident, Process


def update_host(system):

    session = SessionLocal()

    hostname = system["hostname"]

    host = (
        session.query(Host)
        .filter(Host.hostname == hostname)
        .first()
    )

    if host is None:

        host = Host(

            hostname=hostname,

            ip=system["ip_address"],

            os=system["os"],

            kernel=system["kernel"],

            first_seen=datetime.now(UTC),

            last_seen=datetime.now(UTC),

            is_demo=False,
        )

        session.add(host)

        print(f"[+] New host registered: {hostname}")

    else:

        host.ip = system["ip_address"]

        host.os = system["os"]

        host.kernel = system["kernel"]

        host.last_seen = datetime.now(UTC)

        print(f"[+] Host updated: {hostname}")

    session.commit()

    session.close()


DEMO_PROCESS_NAMES = [
    ("systemd", "root"),
    ("sshd", "root"),
    ("nginx", "www-data"),
    ("python3", "appuser"),
    ("cron", "root"),
    ("bash", "appuser"),
    ("node", "appuser"),
    ("postgres", "postgres"),
]

DEMO_INCIDENT_TEMPLATES = [
    {
        "rule_id": "DRIFT-PROCESSES",
        "title": "New Process Detected",
        "severity": "Medium",
        "mitre": "Behavioral",
        "category": "processes",
    },
    {
        "rule_id": "DRIFT-SERVICES",
        "title": "New Service",
        "severity": "High",
        "mitre": "Behavioral",
        "category": "services",
    },
]


def create_demo_host(hostname, ip=None, os_name=None, kernel=None):
    """Create a host that isn't backed by a real agent, and seed it with
    a small amount of realistic telemetry/process/incident history so it
    shows up meaningfully across every panel immediately. Only hosts
    created this way (is_demo=True) can later be removed via the API.
    """

    session = SessionLocal()

    try:
        existing = (
            session.query(Host)
            .filter(Host.hostname == hostname)
            .first()
        )

        if existing:
            raise ValueError(f"Host '{hostname}' already exists")

        now = datetime.now(UTC)

        host = Host(
            hostname=hostname,
            ip=ip or f"10.50.0.{random.randint(2, 250)}",
            os=os_name or random.choice(
                ["Ubuntu 22.04 LTS", "Debian 12", "Windows Server 2022"]
            ),
            kernel=kernel or "6.8.0-demo-generic",
            first_seen=now,
            last_seen=now,
            is_demo=True,
        )
        session.add(host)

        # Telemetry: last hour, one sample every 5 minutes
        for i in range(12):
            sample_time = now - timedelta(minutes=5 * (11 - i))
            session.add(Telemetry(
                hostname=hostname,
                collection_time=sample_time,
                cpu_usage=round(random.uniform(8, 65), 1),
                memory_usage=round(random.uniform(20, 75), 1),
                process_count=random.randint(90, 210),
            ))

        # A handful of processes so /processes and /hunt/* have
        # something real to find for this host too
        for pid, (name, user) in enumerate(DEMO_PROCESS_NAMES, start=1000):
            session.add(Process(
                hostname=hostname,
                collection_time=now,
                pid=pid,
                name=name,
                user=user,
                cpu_percent=round(random.uniform(0, 12), 1),
                memory_percent=round(random.uniform(0, 8), 1),
                command=f"/usr/bin/{name}",
            ))

        # A couple of sample incidents, mixed severity/status, spread
        # over the last few hours
        for i, template in enumerate(DEMO_INCIDENT_TEMPLATES):
            session.add(Incident(
                hostname=hostname,
                timestamp=now - timedelta(hours=i + 1),
                rule_id=template["rule_id"],
                title=template["title"],
                severity=template["severity"],
                mitre=template["mitre"],
                category=template["category"],
                evidence=f"demo-seeded evidence for {hostname}",
                status="Resolved" if i % 2 else "Open",
            ))

        session.commit()

        return {
            "hostname": host.hostname,
            "ip": host.ip,
            "os": host.os,
            "kernel": host.kernel,
            "is_demo": True,
        }

    finally:
        session.close()


def delete_demo_host(hostname):
    """Remove a demo host and its seeded data. Refuses to delete a host
    that isn't marked is_demo — real enrolled hosts can only be removed
    directly against the database, never through the API."""

    session = SessionLocal()

    try:
        host = (
            session.query(Host)
            .filter(Host.hostname == hostname)
            .first()
        )

        if not host:
            raise ValueError(f"Host '{hostname}' not found")

        if not host.is_demo:
            raise PermissionError(
                f"'{hostname}' is a live enrolled host — refusing to delete"
            )

        session.query(Telemetry).filter(Telemetry.hostname == hostname).delete()
        session.query(Process).filter(Process.hostname == hostname).delete()
        session.query(Incident).filter(Incident.hostname == hostname).delete()
        session.delete(host)

        session.commit()

    finally:
        session.close()
