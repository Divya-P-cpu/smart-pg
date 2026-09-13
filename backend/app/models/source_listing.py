from sqlalchemy import String, Integer, DECIMAL, DateTime, ForeignKey, Text, text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.database import Base

class PgSourceListing(Base):
    __tablename__ = "pg_source_listings"

    listing_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    pg_id: Mapped[str] = mapped_column(ForeignKey("pgs.pg_id"))
    source_name: Mapped[str] = mapped_column(String(100), default="Justdial")
    source_url: Mapped[str | None] = mapped_column(String(500))
    contact_number: Mapped[str | None] = mapped_column(String(30))
    rating: Mapped[float | None] = mapped_column(DECIMAL(2,1))
    rating_raw: Mapped[str | None] = mapped_column(String(150))
    review_count: Mapped[int | None] = mapped_column(Integer)
    review_count_raw: Mapped[str | None] = mapped_column(String(150))
    photo_count: Mapped[int | None] = mapped_column(Integer)
    photo_count_raw: Mapped[str | None] = mapped_column(String(150))
    data_status: Mapped[str] = mapped_column(String(150), nullable=False)
    verification_notes: Mapped[str | None] = mapped_column(Text)
    fetched_at: Mapped[DateTime] = mapped_column(DateTime, server_default=text("CURRENT_TIMESTAMP"))

    pg = relationship("Pg", back_populates="source_listing")