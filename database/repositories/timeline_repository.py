from database.db import SessionLocal
from database.models import Telemetry, Incident


def get_host_timeline(hostname):

    session = SessionLocal()

    try:

        telemetry = (
            session.query(Telemetry)
            .filter(Telemetry.hostname == hostname)
            .order_by(Telemetry.collection_time.desc())
            .all()
        )

        incidents = (
            session.query(Incident)
            .filter(Incident.hostname == hostname)
            .order_by(Incident.timestamp.desc())
            .all()
        )

        return telemetry, incidents

    finally:

        session.close()
