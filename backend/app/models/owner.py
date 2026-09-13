# pyrefly: ignore [missing-import]
from sqlalchemy import String, DateTime, Text, func, text
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.database import Base

class Owner(Base):
    __tablename__ = "owners"

    owner_id: Mapped[str] = mapped_column(String(10), primary_key=True)
    owner_name: Mapped[str | None] = mapped_column(String(150))
    phone: Mapped[str | None] = mapped_column(String(30))
    email: Mapped[str | None] = mapped_column(String(150))
    password_hash: Mapped[str | None] = mapped_column(String(255))
    verification_status: Mapped[str] = mapped_column(String(50), default="Not Verified")
    data_status: Mapped[str] = mapped_column(String(50), nullable=False)
    notes: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[DateTime] = mapped_column(DateTime, server_default=text("CURRENT_TIMESTAMP"))
    updated_at: Mapped[DateTime] = mapped_column(DateTime, server_default=text("CURRENT_TIMESTAMP"), onupdate=func.now())

    # (Optional) relationship to OwnerPg if needed later
    # pgs = relationship("OwnerPg", back_populates="owner")