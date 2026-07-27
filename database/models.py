from datetime import datetime, UTC

from sqlalchemy import String
from sqlalchemy import Text
from sqlalchemy import DateTime
from sqlalchemy import Integer
from sqlalchemy import Boolean

from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column


class Base(DeclarativeBase):
    pass


class Host(Base):

    __tablename__ = "hosts"

    id: Mapped[int] = mapped_column(primary_key=True)

    hostname: Mapped[str] = mapped_column(String(100), unique=True)

    ip: Mapped[str] = mapped_column(String(50))

    os: Mapped[str] = mapped_column(String(100))

    kernel: Mapped[str] = mapped_column(String(100))

    first_seen: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC)
    )

    last_seen: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC)
    )

    # True for hosts created via the "Add Host" demo flow (no real agent
    # reporting) rather than a live collector enrollment. Lets the UI
    # badge them and allows safe deletion — real enrolled hosts can't
    # be deleted through the API.
    is_demo: Mapped[bool] = mapped_column(Boolean, default=False)


class Incident(Base):

    __tablename__ = "incidents"

    id: Mapped[int] = mapped_column(primary_key=True)

    timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC)
    )

    hostname: Mapped[str] = mapped_column(String(100))

    rule_id: Mapped[str] = mapped_column(String(50))

    title: Mapped[str] = mapped_column(String(200))

    severity: Mapped[str] = mapped_column(String(30))

    mitre: Mapped[str] = mapped_column(String(50))

    category: Mapped[str] = mapped_column(String(100))

    evidence: Mapped[str] = mapped_column(Text)

    status: Mapped[str] = mapped_column(String(20), default="Open")

class Telemetry(Base):

    __tablename__ = "telemetry"

    id: Mapped[int] = mapped_column(primary_key=True)

    hostname: Mapped[str] = mapped_column(String(100))

    collection_time: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC)
    )

    cpu_usage: Mapped[float] = mapped_column(default=0.0)

    memory_usage: Mapped[float] = mapped_column(default=0.0)

    process_count: Mapped[int] = mapped_column(default=0)

class Process(Base):

    __tablename__ = "processes"

    id: Mapped[int] = mapped_column(primary_key=True)

    hostname: Mapped[str] = mapped_column(String(100))

    collection_time: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC)
    )

    pid: Mapped[int] = mapped_column(Integer)

    name: Mapped[str] = mapped_column(String(200))

    user: Mapped[str] = mapped_column(String(100))

    cpu_percent: Mapped[float] = mapped_column(default=0.0)

    memory_percent: Mapped[float] = mapped_column(default=0.0)

    command: Mapped[str] = mapped_column(Text)
