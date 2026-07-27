from datetime import datetime, UTC

from database.db import SessionLocal
from database.models import Telemetry


def save_telemetry(telemetry):

    session = SessionLocal()

    try:

        system = telemetry.get("system", {})
        processes = telemetry.get("processes", [])

        record = Telemetry(

            hostname=system.get("hostname", "unknown"),

            collection_time=datetime.now(UTC),

            cpu_usage=system.get("cpu_usage", 0.0),

            memory_usage=system.get("memory_usage", 0.0),

            process_count=len(processes)

        )

        session.add(record)

        session.commit()

    finally:

        session.close()
