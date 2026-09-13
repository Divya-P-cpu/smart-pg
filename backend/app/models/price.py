from sqlalchemy import String, Integer, DECIMAL, ForeignKey, DateTime, text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.database import Base

class PgPrice(Base):
    __tablename__ = "pg_prices"

    price_id: Mapped[str] = mapped_column(String(10), primary_key=True)
    pg_id: Mapped[str] = mapped_column(ForeignKey("pgs.pg_id"))
    room_type: Mapped[str | None] = mapped_column(String(100))
    sharing_type: Mapped[str | None] = mapped_column(String(100))
    monthly_rent: Mapped[float | None] = mapped_column(DECIMAL(10,2))
    monthly_rent_raw: Mapped[str | None] = mapped_column(String(150))
    security_deposit: Mapped[float | None] = mapped_column(DECIMAL(10,2))
    security_deposit_raw: Mapped[str | None] = mapped_column(String(150))
    data_status: Mapped[str] = mapped_column(String(50), nullable=False)
    price_source: Mapped[str | None] = mapped_column(String(255))
    effective_from: Mapped[DateTime] = mapped_column(DateTime, server_default=text("CURRENT_TIMESTAMP"))

    pg = relationship("Pg", back_populates="prices")