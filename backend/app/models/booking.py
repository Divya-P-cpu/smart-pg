# pyrefly: ignore [missing-import]
from sqlalchemy import String, Integer, Enum, DateTime, Date, Text, ForeignKey, func, text
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.database import Base

class Booking(Base):
    __tablename__ = "bookings"

    booking_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.user_id"))
    pg_id: Mapped[str] = mapped_column(ForeignKey("pgs.pg_id"))
    room_id: Mapped[str | None] = mapped_column(ForeignKey("rooms.room_id"), nullable=True)
    bed_id: Mapped[str | None] = mapped_column(ForeignKey("beds.bed_id"), nullable=True)
    status: Mapped[str] = mapped_column(
        Enum("Pending", "Accepted", "Rejected", "Cancelled", "Completed"),
        default="Pending"
    )
    requested_move_in_date: Mapped[Date | None] = mapped_column(Date, nullable=True)
    message: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[DateTime] = mapped_column(DateTime, server_default=text("CURRENT_TIMESTAMP"))
    updated_at: Mapped[DateTime] = mapped_column(
        DateTime,
        server_default=text("CURRENT_TIMESTAMP"),
        onupdate=func.now()
    )

    # Relationships (optional)
    user = relationship("User", back_populates="bookings")
    pg = relationship("Pg", backref="bookings")
    room = relationship("Room", backref="bookings")
    bed = relationship("Bed", backref="bookings")