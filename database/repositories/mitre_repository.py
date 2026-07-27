from sqlalchemy import func

from database.db import SessionLocal
from database.models import Incident


DRIFT_MITRE_MAP = {
    "processes": ("T1057", "Process Discovery"),
    "ports": ("T1571", "Non-Standard Port"),
    "services": ("T1543", "Create or Modify System Process"),
    "users": ("T1136", "Create Account"),
}


def get_top_mitre_techniques(limit=5):
    """Return top MITRE techniques for dashboard widgets.

    Drift incidents store mitre='Behavioral', so when no mapped MITRE
    techniques exist we derive technique labels from incident categories.
    """

    session = SessionLocal()

    try:
        rows = (
            session.query(
                Incident.mitre,
                func.count(Incident.id).label("count"),
            )
            .filter(
                Incident.status == "Open",
                Incident.mitre != "Behavioral",
                Incident.mitre != "",
            )
            .group_by(Incident.mitre)
            .order_by(func.count(Incident.id).desc())
            .limit(limit)
            .all()
        )

        if rows:
            return [
                {
                    "mitre": mitre,
                    "count": count,
                    "label": mitre,
                }
                for mitre, count in rows
            ]

        category_rows = (
            session.query(
                Incident.category,
                func.count(Incident.id).label("count"),
            )
            .filter(Incident.status == "Open")
            .group_by(Incident.category)
            .order_by(func.count(Incident.id).desc())
            .limit(limit)
            .all()
        )

        result = []
        for category, count in category_rows:
            code, label = DRIFT_MITRE_MAP.get(
                category,
                ("T1485", category.replace("_", " ").title()),
            )
            result.append({
                "mitre": code,
                "count": count,
                "label": label,
            })

        if result:
            return result

        # Last resort: group open incidents by rule id
        rule_rows = (
            session.query(
                Incident.rule_id,
                func.count(Incident.id).label("count"),
            )
            .filter(Incident.status == "Open")
            .group_by(Incident.rule_id)
            .order_by(func.count(Incident.id).desc())
            .limit(limit)
            .all()
        )

        return [
            {
                "mitre": rule_id,
                "count": count,
                "label": rule_id.replace("DRIFT-", "").replace("_", " ").title(),
            }
            for rule_id, count in rule_rows
        ]

    finally:
        session.close()


def count_open_techniques():
    session = SessionLocal()

    try:
        mapped = (
            session.query(func.count(func.distinct(Incident.mitre)))
            .filter(
                Incident.status == "Open",
                Incident.mitre != "Behavioral",
                Incident.mitre != "",
            )
            .scalar()
        ) or 0

        if mapped:
            return mapped

        return (
            session.query(func.count(func.distinct(Incident.category)))
            .filter(Incident.status == "Open")
            .scalar()
        ) or 0

    finally:
        session.close()
