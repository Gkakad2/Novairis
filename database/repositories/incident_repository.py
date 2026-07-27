from sqlalchemy import func

from database.db import SessionLocal
from database.models import Incident


def save_incident(
    hostname,
    rule_id,
    title,
    severity,
    mitre,
    category,
    evidence,
):

    session = SessionLocal()

    incident = Incident(
        hostname=hostname,
        rule_id=rule_id,
        title=title,
        severity=severity,
        mitre=mitre,
        category=category,
        evidence=evidence,
        status="Open",
    )

    session.add(incident)
    session.commit()
    session.refresh(incident)

    incident_id = incident.id

    session.close()

    return incident_id


def get_open_incident(hostname, rule_id):

    session = SessionLocal()

    incident = (
        session.query(Incident)
        .filter(
            Incident.hostname == hostname,
            Incident.rule_id == rule_id,
            Incident.status == "Open",
        )
        .first()
    )

    session.close()

    return incident


def resolve_incident(hostname, rule_id):

    session = SessionLocal()

    incident = (
        session.query(Incident)
        .filter(
            Incident.hostname == hostname,
            Incident.rule_id == rule_id,
            Incident.status == "Open",
        )
        .first()
    )

    if incident:
        incident.status = "Resolved"
        session.commit()

    session.close()


def get_all_open_incidents(hostname):

    session = SessionLocal()

    incidents = (
        session.query(Incident)
        .filter(
            Incident.hostname == hostname,
            Incident.status == "Open",
        )
        .all()
    )

    session.close()

    return incidents


def get_open_drift_incidents(hostname):

    session = SessionLocal()

    incidents = (
        session.query(Incident)
        .filter(
            Incident.hostname == hostname,
            Incident.status == "Open",
            Incident.rule_id.like("DRIFT-%")
        )
        .all()
    )

    session.close()

    return incidents


def resolve_drift_incident(hostname, rule_id, evidence):

    session = SessionLocal()

    incident = (
        session.query(Incident)
        .filter(
            Incident.hostname == hostname,
            Incident.rule_id == rule_id,
            Incident.status == "Open",
            Incident.evidence == evidence
        )
        .first()
    )

    if incident:
        incident.status = "Resolved"
        session.commit()

    session.close()


def get_top_mitre():

    session = SessionLocal()

    rows = (
        session.query(
            Incident.mitre,
            func.count(Incident.id).label("count")
        )
        .filter(Incident.status == "Open")
        .group_by(Incident.mitre)
        .order_by(func.count(Incident.id).desc())
        .limit(5)
        .all()
    )

    session.close()

    return [
        {
            "mitre": row.mitre,
            "count": row.count
        }
        for row in rows
    ]


def get_recent_incidents(limit=200, status=None, hostname=None):
    """Return recent incidents across the fleet (or one host), most recent first.

    Used by the /incidents and /dashboard/incidents API routes.
    """

    session = SessionLocal()

    query = session.query(Incident)

    if status:
        query = query.filter(Incident.status == status)

    if hostname:
        query = query.filter(Incident.hostname == hostname)

    rows = (
        query
        .order_by(Incident.timestamp.desc())
        .limit(limit)
        .all()
    )

    result = [
        {
            "id": row.id,
            "timestamp": row.timestamp.isoformat() if row.timestamp else None,
            "hostname": row.hostname,
            "rule_id": row.rule_id,
            "title": row.title,
            "severity": row.severity,
            "mitre": row.mitre,
            "category": row.category,
            "evidence": row.evidence,
            "status": row.status,
        }
        for row in rows
    ]

    session.close()

    return result


def get_incident_by_id(incident_id):

    session = SessionLocal()

    row = session.query(Incident).filter(Incident.id == incident_id).first()

    session.close()

    if not row:
        return None

    return {
        "id": row.id,
        "timestamp": row.timestamp.isoformat() if row.timestamp else None,
        "hostname": row.hostname,
        "rule_id": row.rule_id,
        "title": row.title,
        "severity": row.severity,
        "mitre": row.mitre,
        "category": row.category,
        "evidence": row.evidence,
        "status": row.status,
    }
