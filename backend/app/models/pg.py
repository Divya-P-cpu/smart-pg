# pyrefly: ignore [missing-import]
from sqlalchemy import String, Boolean, DateTime, ForeignKey, func, text
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.database import Base

class Pg(Base):
    __tablename__ = "pgs"

    pg_id: Mapped[str] = mapped_column(String(10), primary_key=True)
    pg_name: Mapped[str] = mapped_column(String(255), nullable=False)
    property_type: Mapped[str | None] = mapped_column(String(100))
    gender_policy: Mapped[str | None] = mapped_column(String(100))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    data_status: Mapped[str] = mapped_column(String(150), nullable=False)
    created_at: Mapped[DateTime] = mapped_column(DateTime, server_default=text("CURRENT_TIMESTAMP"))
    updated_at: Mapped[DateTime] = mapped_column(DateTime, server_default=text("CURRENT_TIMESTAMP"), onupdate=func.now())

    # Relationships
    location = relationship("PgLocation", back_populates="pg", uselist=False)
    prices = relationship("PgPrice", back_populates="pg")
    amenities = relationship("PgAmenity", back_populates="pg")
    floors = relationship("Floor", back_populates="pg")
    rooms = relationship("Room", back_populates="pg")  # direct to rooms for convenience
    source_listing = relationship("PgSourceListing", back_populates="pg", uselist=False)
    images = relationship("PgImage", back_populates="pg", order_by="PgImage.image_id")
