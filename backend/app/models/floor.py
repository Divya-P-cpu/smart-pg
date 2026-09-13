# pyrefly: ignore [missing-import]
from sqlalchemy import String, Integer, ForeignKey, Enum
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.database import Base

class Floor(Base):
    __tablename__ = "floors"

    floor_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    pg_id: Mapped[str] = mapped_column(ForeignKey("pgs.pg_id"))
    floor_label: Mapped[str] = mapped_column(String(50), nullable=False)
    data_status: Mapped[str] = mapped_column(String(50), default="SAMPLE")

    pg = relationship("Pg", back_populates="floors")
    rooms = relationship("Room", back_populates="floor")