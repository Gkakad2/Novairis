from datetime import datetime, UTC

from database.db import SessionLocal
from database.models import Process


def save_processes(telemetry):

    session = SessionLocal()

    try:

        hostname = telemetry["system"]["hostname"]

        collected = datetime.now(UTC)

        for proc in telemetry.get("processes", []):

            process = Process(

                hostname=hostname,

                collection_time=collected,

                pid=proc.get("pid", 0),

                name=proc.get("name", ""),

                user=proc.get("user", ""),

                cpu_percent=proc.get("cpu_percent", 0),

                memory_percent=proc.get("memory_percent", 0),

                command=proc.get("command", "")

            )

            session.add(process)

        session.commit()

    finally:

        session.close()
