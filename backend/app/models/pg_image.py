from sqlalchemy import String, Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.database import Base

class PgImage(Base):
    __tablename__ = "pg_images"

    image_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    pg_id: Mapped[str] = mapped_column(ForeignKey("pgs.pg_id"))
    image_url: Mapped[str] = mapped_column(String(500), nullable=False)
    caption: Mapped[str | None] = mapped_column(String(255))
    uploaded_by_owner_id: Mapped[str | None] = mapped_column(ForeignKey("owners.owner_id"))
    data_status: Mapped[str] = mapped_column(String(50), default="Owner Input Required")

    pg = relationship("Pg", back_populates="images")
