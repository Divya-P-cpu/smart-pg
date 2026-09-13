from sqlalchemy import Integer, String, DateTime, text
from sqlalchemy.orm import Mapped, mapped_column
from app.db.database import Base


class RoomLayoutImage(Base):
    __tablename__ = "room_layout_images"

    layout_image_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    sharing_capacity: Mapped[int] = mapped_column(Integer, nullable=False, index=True)
    image_url: Mapped[str] = mapped_column(String(700), nullable=False, unique=True)
    label: Mapped[str | None] = mapped_column(String(100))
    data_status: Mapped[str] = mapped_column(String(50), nullable=False, default="OWNER_INPUT")
    created_at: Mapped[DateTime] = mapped_column(DateTime, server_default=text("CURRENT_TIMESTAMP"))
