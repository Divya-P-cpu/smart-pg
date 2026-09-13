# pyrefly: ignore [missing-import]
from sqlalchemy import String, Enum, ForeignKey, Text, DateTime, func, text
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.database import Base

class Bed(Base):
    __tablename__ = "beds"

    bed_id: Mapped[str] = mapped_column(String(10), primary_key=True)
    room_id: Mapped[str] = mapped_column(ForeignKey("rooms.room_id"))
    bed_number: Mapped[str | None] = mapped_column(String(20))
    bed_position: Mapped[str | None] = mapped_column(String(50))
    near_wall: Mapped[str] = mapped_column(Enum("Yes", "No"), default="No")
    near_window: Mapped[str] = mapped_column(Enum("Yes", "No"), default="No")
    near_door: Mapped[str] = mapped_column(Enum("Yes", "No"), default="No")
    current_status: Mapped[str] = mapped_column(String(30), default="Available")
    data_status: Mapped[str] = mapped_column(String(50), nullable=False)
    notes: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[DateTime] = mapped_column(DateTime, server_default=text("CURRENT_TIMESTAMP"))
    updated_at: Mapped[DateTime] = mapped_column(DateTime, server_default=text("CURRENT_TIMESTAMP"), onupdate=func.now())

    # Relationships
    room = relationship("Room", back_populates="beds")
    availability_history = relationship("BedAvailabilityHistory", back_populates="bed")

class BedAvailabilityHistory(Base):
    __tablename__ = "bed_availability_history"

    history_id: Mapped[str] = mapped_column(String(10), primary_key=True)
    bed_id: Mapped[str] = mapped_column(ForeignKey("beds.bed_id"))
    room_id: Mapped[str] = mapped_column(ForeignKey("rooms.room_id"))
    pg_id: Mapped[str] = mapped_column(ForeignKey("pgs.pg_id"))
    status: Mapped[str] = mapped_column(String(30), nullable=False)
    changed_by_owner_id: Mapped[str | None] = mapped_column(ForeignKey("owners.owner_id"))
    changed_at: Mapped[DateTime] = mapped_column(DateTime, server_default=text("CURRENT_TIMESTAMP"))
    data_status: Mapped[str] = mapped_column(String(50), nullable=False)
    notes: Mapped[str | None] = mapped_column(Text)

    # Only one relationship (to Bed) – avoids mapper conflicts with Room/Pg
    bed = relationship("Bed", back_populates="availability_history")
