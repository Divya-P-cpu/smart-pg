from sqlalchemy import String, DateTime, ForeignKey, text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.database import Base

class OwnerPg(Base):
    __tablename__ = "owner_pgs"

    owner_id: Mapped[str] = mapped_column(ForeignKey("owners.owner_id"), primary_key=True)
    pg_id: Mapped[str] = mapped_column(ForeignKey("pgs.pg_id"), primary_key=True)
    role: Mapped[str | None] = mapped_column(String(50), default="Primary Owner")
    assigned_at: Mapped[DateTime] = mapped_column(DateTime, server_default=text("CURRENT_TIMESTAMP"))

    owner = relationship("Owner", backref="owner_pg_assocs")
    pg = relationship("Pg", backref="owner_pg_assocs")
