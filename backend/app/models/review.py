from sqlalchemy import String, Integer, Text, DateTime, ForeignKey, text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.database import Base

class Review(Base):
    __tablename__ = "reviews"

    review_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    pg_id: Mapped[str] = mapped_column(ForeignKey("pgs.pg_id"))
    user_id: Mapped[str] = mapped_column(ForeignKey("users.user_id"))
    rating: Mapped[int] = mapped_column(Integer)          # 1-5
    comment: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[DateTime] = mapped_column(DateTime, server_default=text("CURRENT_TIMESTAMP"))

    pg = relationship("Pg", backref="reviews")
    user = relationship("User", backref="reviews")