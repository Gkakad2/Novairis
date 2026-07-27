from fastapi import APIRouter
from sqlalchemy import func

from database.repositories.dashboard_repository import get_dashboard_summary
from database.db import SessionLocal
from database.models import Incident

router = APIRouter(
    prefix="/api/dashboard",
    tags=["Dashboard"],
)


@router.get("/summary")
def dashboard_summary():
    return get_dashboard_summary()


@router.get("/threat-intelligence")
def threat_intelligence():

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

    mitre = session.query(
        func.count(func.distinct(Incident.mitre))
    ).filter(
        Incident.status == "Open",
        Incident.mitre != "Behavioral"
    ).scalar()

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

    return {
        "critical": critical,
        "high": high,
        "medium": medium,
        "low": low,
        "hosts": hosts,
        "mitre": mitre,
        "score": level
    }


@router.get("/top-mitre")
def top_mitre():

    session = SessionLocal()

    rows = (
        session.query(
            Incident.mitre,
            func.count(Incident.id).label("count")
        )
        .filter(
            Incident.status == "Open",
            Incident.mitre != "Behavioral"
        )
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
