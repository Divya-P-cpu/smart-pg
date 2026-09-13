# pyrefly: ignore [missing-import]
from sqlalchemy import String, Integer, ForeignKey
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.database import Base

class Amenity(Base):
    __tablename__ = "amenities"

    amenity_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    amenity_name: Mapped[str] = mapped_column(String(150), nullable=False, unique=True)

    pg_amenities = relationship("PgAmenity", back_populates="amenity")

class PgAmenity(Base):
    __tablename__ = "pg_amenities"

    pg_amenity_id: Mapped[str] = mapped_column(String(10), primary_key=True)
    pg_id: Mapped[str] = mapped_column(ForeignKey("pgs.pg_id"))
    amenity_id: Mapped[int] = mapped_column(ForeignKey("amenities.amenity_id"))
    data_status: Mapped[str] = mapped_column(String(50), nullable=False)
    amenity_source: Mapped[str | None] = mapped_column(String(255))

    pg = relationship("Pg", back_populates="amenities")
    amenity = relationship("Amenity", back_populates="pg_amenities")