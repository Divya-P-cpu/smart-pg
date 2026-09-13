from sqlalchemy import String, Integer, Boolean, DateTime, Text, ForeignKey, text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.database import Base

class Notification(Base):
    __tablename__ = "notifications"

    notification_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.user_id"))
    pg_id: Mapped[str | None] = mapped_column(ForeignKey("pgs.pg_id"))
    title: Mapped[str] = mapped_column(String(255))
    message: Mapped[str | None] = mapped_column(Text)
    is_read: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[DateTime] = mapped_column(DateTime, server_default=text("CURRENT_TIMESTAMP"))

    user = relationship("User", backref="notifications")
    pg = relationship("Pg")