# pyrefly: ignore [missing-import]
from pydantic import BaseModel, Field
from typing import Optional
from datetime import date

class BookingCreate(BaseModel):
    pg_id: str
    room_id: str | None = None
    bed_id: str | None = None
    requested_move_in_date: Optional[date] = None
    message: str | None = None

class BookingOut(BaseModel):
    booking_id: int
    pg_id: str
    status: str
    requested_move_in_date: Optional[date] = None
    created_at: str
    message: Optional[str] = None
    pgName: Optional[str] = None
    area: Optional[str] = None
    city: Optional[str] = None
    roomName: Optional[str] = None
    bedNumber: Optional[str] = None
    rent: Optional[float] = None
    deposit: Optional[float] = None
    date: Optional[str] = None
    userName: Optional[str] = None
    userEmail: Optional[str] = None
    userPhone: Optional[str] = None