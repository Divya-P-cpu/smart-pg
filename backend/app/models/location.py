# pyrefly: ignore [missing-import]
from sqlalchemy import String, Integer, Text, DECIMAL, ForeignKey, Enum
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.database import Base

class PgLocation(Base):
    __tablename__ = "pg_locations"

    location_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    pg_id: Mapped[str] = mapped_column(ForeignKey("pgs.pg_id"), unique=True)
    address: Mapped[str | None] = mapped_column(Text)
    area: Mapped[str | None] = mapped_column(String(150))
    city: Mapped[str | None] = mapped_column(String(100))
    state: Mapped[str | None] = mapped_column(String(100))
    pincode: Mapped[str | None] = mapped_column(String(10))
    latitude: Mapped[float | None] = mapped_column(DECIMAL(10,7))
    longitude: Mapped[float | None] = mapped_column(DECIMAL(10,7))
    data_status: Mapped[str] = mapped_column(String(150), nullable=False)

    pg = relationship("Pg", back_populates="location")