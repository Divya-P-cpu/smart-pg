# pyrefly: ignore [missing-import]
from urllib.parse import quote_plus

# pyrefly: ignore [missing-import]
from fastapi import APIRouter, Depends, HTTPException
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models import Booking, Pg, User
from app.routers.auth import get_current_user


router = APIRouter(prefix="/api/transport", tags=["Transport"])
CONFIRMED_STATUSES = {"accepted", "completed"}


@router.get("/booking/{booking_id}")
def get_booking_destination(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return a confirmed resident's destination without duplicating PG location data.

    Live public-transit itineraries deliberately stay provider-backed: a future server-side
    Maps/Transit integration can use this trusted destination payload without exposing a key
    to the browser.
    """
    booking = (
        db.query(Booking)
        .filter(Booking.booking_id == booking_id, Booking.user_id == current_user.user_id)
        .first()
    )
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    if str(booking.status).lower() not in CONFIRMED_STATUSES:
        raise HTTPException(status_code=403, detail="Route guidance unlocks once your booking is confirmed")

    pg = db.query(Pg).filter(Pg.pg_id == booking.pg_id).first()
    if not pg or not pg.location:
        raise HTTPException(status_code=422, detail="This PG does not yet have a location available for route guidance")

    location = pg.location
    parts = [location.address, location.area, location.city, location.state, location.pincode]
    destination_label = ", ".join(str(part).strip() for part in parts if part and str(part).strip())
    if not destination_label:
        raise HTTPException(status_code=422, detail="This PG's destination address is incomplete")

    return {
        "booking_id": booking.booking_id,
        "destination": {
            "pg_name": pg.pg_name,
            "address": destination_label,
            "latitude": float(location.latitude) if location.latitude is not None else None,
            "longitude": float(location.longitude) if location.longitude is not None else None,
        },
        "maps_destination_url": f"https://www.google.com/maps/dir/?api=1&destination={quote_plus(destination_label)}&travelmode=transit",
        "provider_status": "not_configured",
        "message": "Live metro and bus recommendations will appear here when a transit provider is configured for this city.",
    }
