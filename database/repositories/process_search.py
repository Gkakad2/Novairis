from database.db import SessionLocal
from database.models import Process


def get_all_processes(limit=100):

    session = SessionLocal()

    try:

        return (
            session.query(Process)
            .order_by(Process.collection_time.desc())
            .limit(limit)
            .all()
        )

    finally:
        session.close()


def search_process(name):

    session = SessionLocal()

    try:

        return (
            session.query(Process)
            .filter(Process.name.ilike(f"%{name}%"))
            .order_by(Process.collection_time.desc())
            .all()
        )

    finally:
        session.close()


def search_command(keyword):

    session = SessionLocal()

    try:

        return (
            session.query(Process)
            .filter(Process.command.ilike(f"%{keyword}%"))
            .order_by(Process.collection_time.desc())
            .all()
        )

    finally:
        session.close()
