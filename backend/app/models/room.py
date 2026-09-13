# pyrefly: ignore [missing-import]
from sqlalchemy import String, Integer, ForeignKey, Text, DateTime, func, text
# pyrefly: ignore [missing-import]
from sqlalchemy.dialects.mysql import TINYINT
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.database import Base

class Room(Base):
    __tablename__ = "rooms"

    room_id: Mapped[str] = mapped_column(String(10), primary_key=True)
    pg_id: Mapped[str] = mapped_column(ForeignKey("pgs.pg_id"))
    floor_id: Mapped[int] = mapped_column(ForeignKey("floors.floor_id"))
    room_number: Mapped[str | None] = mapped_column(String(50))
    room_type: Mapped[str | None] = mapped_column(String(50))
    capacity: Mapped[int | None] = mapped_column(TINYINT)
    occupied_count: Mapped[int | None] = mapped_column(TINYINT)
    available_count: Mapped[int | None] = mapped_column(TINYINT)
    room_status: Mapped[str | None] = mapped_column(String(50))
    ac_type: Mapped[str | None] = mapped_column(String(20), default="Not Available")
    bathroom_type: Mapped[str | None] = mapped_column(String(20), default="Not Available")
    data_status: Mapped[str] = mapped_column(String(50), nullable=False)
    notes: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[DateTime] = mapped_column(DateTime, server_default=text("CURRENT_TIMESTAMP"))
    updated_at: Mapped[DateTime] = mapped_column(DateTime, server_default=text("CURRENT_TIMESTAMP"), onupdate=func.now())

    pg = relationship("Pg", back_populates="rooms")
    floor = relationship("Floor", back_populates="rooms")
    beds = relationship("Bed", back_populates="room")
