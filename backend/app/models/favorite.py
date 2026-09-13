from sqlalchemy import String, Integer, DateTime, ForeignKey, text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.database import Base

class Favorite(Base):
    __tablename__ = "favorites"

    favorite_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.user_id"))
    pg_id: Mapped[str] = mapped_column(ForeignKey("pgs.pg_id"))
    created_at: Mapped[DateTime] = mapped_column(DateTime, server_default=text("CURRENT_TIMESTAMP"))

    # Relationships (optional, but helpful for queries)
    user = relationship("User", back_populates="favorites")
    pg = relationship("Pg", backref="favorited_by")