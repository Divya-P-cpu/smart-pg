from datetime import datetime

# pyrefly: ignore [missing-import]
from sqlalchemy import String, Text, DateTime, ForeignKey
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base


class BedAvailabilityHistory(Base):
    __tablename__ = "bed_availability_history"

    history_id: Mapped[str] = mapped_column(
        String(10),
        primary_key=True
    )

    bed_id: Mapped[str] = mapped_column(
        String(10),
        ForeignKey("beds.bed_id"),
        nullable=False
    )

    room_id: Mapped[str] = mapped_column(
        String(10),
        ForeignKey("rooms.room_id"),
        nullable=False
    )

    pg_id: Mapped[str] = mapped_column(
        String(10),
        ForeignKey("pgs.pg_id"),
        nullable=False
    )

    status: Mapped[str] = mapped_column(
        String(30),
        nullable=False
    )

    changed_by_owner_id: Mapped[str | None] = mapped_column(
        String(10),
        ForeignKey("owners.owner_id"),
        nullable=True
    )

    changed_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False
    )

    data_status: Mapped[str] = mapped_column(
        String(50),
        nullable=False
    )

    notes: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    # Relationship to bed
    bed = relationship(
        "Bed",
        back_populates="availability_history"
    )