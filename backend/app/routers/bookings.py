from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from datetime import datetime
from app.db.database import get_db
from app.models import Booking, User, Pg, Room, Bed, OwnerPg, BedAvailabilityHistory, Notification
from app.schemas.bookings import BookingCreate, BookingOut
from app.routers.auth import get_current_user, get_current_owner
from pydantic import BaseModel

router = APIRouter(prefix="/api/bookings", tags=["Bookings"])

class BookingStatusUpdate(BaseModel):
    status: str  # Accepted, Rejected, Cancelled

def add_user_notification(db: Session, user_id: str, pg_id: str, title: str, message: str):
    try:
        notif = Notification(
            user_id=user_id,
            pg_id=pg_id,
            title=title,
            message=message,
            is_read=False
        )
        db.add(notif)
    except Exception as e:
        print(f"Warning: Failed to add notification: {e}")

def log_bed_history(db: Session, bed: Bed, room: Room, status: str, owner_id: str = None, notes: str = None):
    try:
        count = db.query(func.count(BedAvailabilityHistory.history_id)).scalar() or 0
        new_hist_id = f"BH{int(count) + 1:03d}"
        while db.query(BedAvailabilityHistory).filter(BedAvailabilityHistory.history_id == new_hist_id).first():
            num = int(new_hist_id.replace("BH", "")) + 1
            new_hist_id = f"BH{num:03d}"

        history = BedAvailabilityHistory(
            history_id=new_hist_id,
            bed_id=bed.bed_id,
            room_id=room.room_id,
            pg_id=room.pg_id,
            status=status,
            changed_by_owner_id=owner_id,
            changed_at=datetime.utcnow(),
            data_status="USER_OR_OWNER_ACTION",
            notes=notes or f"Status changed to {status}"
        )
        db.add(history)
    except Exception as e:
        print(f"Warning: Failed to log bed history: {e}")

@router.get("", response_model=List[BookingOut])
def get_my_bookings(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    bookings = db.query(Booking).filter(Booking.user_id == current_user.user_id).order_by(Booking.booking_id.desc()).all()
    out = []
    for b in bookings:
        pg = db.query(Pg).filter(Pg.pg_id == b.pg_id).first()
        room = db.query(Room).filter(Room.room_id == b.room_id).first() if b.room_id else None
        bed = db.query(Bed).filter(Bed.bed_id == b.bed_id).first() if b.bed_id else None
        
        rent = pg.prices[0].monthly_rent if pg and pg.prices else 0.0
        deposit = pg.prices[0].security_deposit if pg and pg.prices else 0.0

        out.append(BookingOut(
            booking_id=b.booking_id,
            pg_id=b.pg_id,
            status=b.status,
            requested_move_in_date=b.requested_move_in_date,
            created_at=str(b.created_at),
            message=b.message,
            pgName=pg.pg_name if pg else "Unknown PG",
            area=pg.location.area if pg and pg.location else None,
            city=pg.location.city if pg and pg.location else None,
            roomName=room.room_number if room else "Standard Room",
            bedNumber=bed.bed_number if bed else "Bed Allocation",
            rent=float(rent) if rent is not None else None,
            deposit=float(deposit) if deposit is not None else None,
            date=str(b.requested_move_in_date) if b.requested_move_in_date else None,
            userName=current_user.full_name,
            userEmail=current_user.email,
            userPhone=current_user.phone
        ))
    return out

@router.post("", response_model=BookingOut)
def create_booking(booking: BookingCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    pg = db.query(Pg).filter(Pg.pg_id == booking.pg_id).first()
    if not pg:
        raise HTTPException(status_code=404, detail="PG not found")
    
    resolved_room_id = booking.room_id if booking.room_id and not str(booking.room_id).startswith("ROOM_REQ") else None
    resolved_bed_id = booking.bed_id if booking.bed_id and not str(booking.bed_id).startswith("BED_REQ") else None

    if not resolved_room_id and pg.rooms:
        for r in pg.rooms:
            avail_beds = [b for b in r.beds if (b.current_status or "").lower() == "available"]
            if avail_beds:
                resolved_room_id = r.room_id
                if not resolved_bed_id:
                    resolved_bed_id = avail_beds[0].bed_id
                break

    new_booking = Booking(
        user_id=current_user.user_id,
        pg_id=booking.pg_id,
        room_id=resolved_room_id,
        bed_id=resolved_bed_id,
        requested_move_in_date=booking.requested_move_in_date,
        message=booking.message or "I would like to inquire about booking a bed in this PG.",
        status="Pending"
    )
    db.add(new_booking)
    add_user_notification(
        db=db,
        user_id=current_user.user_id,
        pg_id=booking.pg_id,
        title=f"Inquiry Submitted · {pg.pg_name}",
        message=f"Your booking inquiry for {pg.pg_name} has been sent to the property owner for review."
    )
    db.commit()
    db.refresh(new_booking)
    
    room = db.query(Room).filter(Room.room_id == resolved_room_id).first() if resolved_room_id else None
    bed = db.query(Bed).filter(Bed.bed_id == resolved_bed_id).first() if resolved_bed_id else None
    rent = pg.prices[0].monthly_rent if pg.prices else 0.0
    deposit = pg.prices[0].security_deposit if pg.prices else 0.0

    return BookingOut(
        booking_id=new_booking.booking_id,
        pg_id=new_booking.pg_id,
        status=new_booking.status,
        requested_move_in_date=new_booking.requested_move_in_date,
        created_at=str(new_booking.created_at),
        message=new_booking.message,
        pgName=pg.pg_name,
        area=pg.location.area if pg.location else None,
        city=pg.location.city if pg.location else None,
        roomName=room.room_number if room else "Standard Room",
        bedNumber=bed.bed_number if bed else "Bed Allocation",
        rent=float(rent) if rent is not None else None,
        deposit=float(deposit) if deposit is not None else None,
        date=str(new_booking.requested_move_in_date) if new_booking.requested_move_in_date else None,
        userName=current_user.full_name,
        userEmail=current_user.email,
        userPhone=current_user.phone
    )

@router.get("/owner", response_model=List[BookingOut])
def get_owner_bookings(db: Session = Depends(get_db), current_owner = Depends(get_current_owner)):
    owner_pg_rows = db.query(OwnerPg).filter(OwnerPg.owner_id == current_owner.owner_id).all()
    pg_ids = [r.pg_id for r in owner_pg_rows]
    if not pg_ids:
        all_pgs = db.query(Pg.pg_id).all()
        pg_ids = [p[0] for p in all_pgs]
    
    bookings = db.query(Booking).filter(Booking.pg_id.in_(pg_ids)).order_by(Booking.booking_id.desc()).all()
    out = []
    for b in bookings:
        pg = db.query(Pg).filter(Pg.pg_id == b.pg_id).first()
        room = db.query(Room).filter(Room.room_id == b.room_id).first() if b.room_id else None
        bed = db.query(Bed).filter(Bed.bed_id == b.bed_id).first() if b.bed_id else None
        user = db.query(User).filter(User.user_id == b.user_id).first()

        rent = pg.prices[0].monthly_rent if pg and pg.prices else 0.0
        deposit = pg.prices[0].security_deposit if pg and pg.prices else 0.0

        out.append(BookingOut(
            booking_id=b.booking_id,
            pg_id=b.pg_id,
            status=b.status,
            requested_move_in_date=b.requested_move_in_date,
            created_at=str(b.created_at),
            message=b.message,
            pgName=pg.pg_name if pg else "Unknown PG",
            area=pg.location.area if pg and pg.location else None,
            city=pg.location.city if pg and pg.location else None,
            roomName=room.room_number if room else "Standard Room",
            bedNumber=bed.bed_number if bed else "Bed Allocation",
            rent=float(rent) if rent is not None else None,
            deposit=float(deposit) if deposit is not None else None,
            date=str(b.requested_move_in_date) if b.requested_move_in_date else None,
            userName=user.full_name if user else "Guest Resident",
            userEmail=user.email if user else "N/A",
            userPhone=user.phone if user else "N/A"
        ))
    return out

@router.patch("/{booking_id}", response_model=BookingOut)
def update_booking_status(booking_id: int, status_update: BookingStatusUpdate, db: Session = Depends(get_db), current_owner = Depends(get_current_owner)):
    booking = db.query(Booking).filter(Booking.booking_id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking request not found")

    assoc = db.query(OwnerPg).filter(
        OwnerPg.owner_id == current_owner.owner_id,
        OwnerPg.pg_id == booking.pg_id
    ).first()
    if not assoc:
        # Check if owner owns any pgs or is general owner
        new_assoc = OwnerPg(owner_id=current_owner.owner_id, pg_id=booking.pg_id, role="Primary Owner")
        db.add(new_assoc)

    requested_status = str(status_update.status or "").strip().lower()
    if requested_status in ["accepted", "approved", "accept"]:
        next_status = "Accepted"
    elif requested_status in ["rejected", "declined", "reject"]:
        next_status = "Rejected"
    elif requested_status in ["cancelled", "canceled"]:
        next_status = "Cancelled"
    else:
        raise HTTPException(status_code=400, detail="Status must be Accepted, Rejected, or Cancelled")

    booking.status = next_status
    db.flush()

    pg = db.query(Pg).filter(Pg.pg_id == booking.pg_id).first()
    room = db.query(Room).filter(Room.room_id == booking.room_id).first() if booking.room_id else None
    bed = db.query(Bed).filter(Bed.bed_id == booking.bed_id).first() if booking.bed_id else None
    user = db.query(User).filter(User.user_id == booking.user_id).first()

    # If booking is accepted, update bed to Occupied and send notification
    if next_status == "Accepted":
        if bed:
            bed.current_status = "Occupied"
            if room:
                log_bed_history(db, bed, room, "Occupied", current_owner.owner_id, f"Allocated to {user.full_name if user else 'resident'} via booking #{booking_id}")
        if room:
            total_beds = len(room.beds)
            occupied = sum(1 for b in room.beds if (b.current_status or "").lower() != "available")
            room.occupied_count = occupied
            room.available_count = max(0, total_beds - occupied)
            room.room_status = "Available" if room.available_count > 0 else "Occupied"
        
        add_user_notification(
            db=db,
            user_id=booking.user_id,
            pg_id=booking.pg_id,
            title=f"Booking Confirmed · {pg.pg_name if pg else 'PG Property'}",
            message=f"Great news! Your booking request at {pg.pg_name if pg else 'the PG'} has been approved by the owner."
        )
    elif next_status in ["Rejected", "Cancelled"]:
        if bed and (bed.current_status or "").lower() == "occupied":
            bed.current_status = "Available"
            if room:
                log_bed_history(db, bed, room, "Available", current_owner.owner_id, f"Freed up after booking #{booking_id} {next_status}")
        if room:
            total_beds = len(room.beds)
            occupied = sum(1 for b in room.beds if (b.current_status or "").lower() != "available")
            room.occupied_count = occupied
            room.available_count = max(0, total_beds - occupied)
            room.room_status = "Available" if room.available_count > 0 else "Occupied"

        if next_status == "Rejected":
            add_user_notification(
                db=db,
                user_id=booking.user_id,
                pg_id=booking.pg_id,
                title=f"Booking Update · {pg.pg_name if pg else 'PG Property'}",
                message=f"The owner was unable to accommodate your request at {pg.pg_name if pg else 'the PG'}. Feel free to explore other verified stays."
            )

    db.commit()
    db.refresh(booking)

    rent = pg.prices[0].monthly_rent if pg and pg.prices else 0.0
    deposit = pg.prices[0].security_deposit if pg and pg.prices else 0.0

    return BookingOut(
        booking_id=booking.booking_id,
        pg_id=booking.pg_id,
        status=booking.status,
        requested_move_in_date=booking.requested_move_in_date,
        created_at=str(booking.created_at),
        message=booking.message,
        pgName=pg.pg_name if pg else "Unknown PG",
        area=pg.location.area if pg and pg.location else None,
        city=pg.location.city if pg and pg.location else None,
        roomName=room.room_number if room else "Standard Room",
        bedNumber=bed.bed_number if bed else "Bed Allocation",
        rent=float(rent) if rent is not None else None,
        deposit=float(deposit) if deposit is not None else None,
        date=str(booking.requested_move_in_date) if booking.requested_move_in_date else None,
        userName=user.full_name if user else "Unknown User",
        userEmail=user.email if user else "N/A",
        userPhone=user.phone if user else "N/A"
    )

@router.patch("/{booking_id}/cancel", response_model=BookingOut)
def cancel_user_booking(booking_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    booking = db.query(Booking).filter(Booking.booking_id == booking_id, Booking.user_id == current_user.user_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    booking.status = "Cancelled"
    
    room = db.query(Room).filter(Room.room_id == booking.room_id).first() if booking.room_id else None
    bed = db.query(Bed).filter(Bed.bed_id == booking.bed_id).first() if booking.bed_id else None
    if bed and (bed.current_status or "").lower() == "occupied":
        bed.current_status = "Available"
        if room:
            log_bed_history(db, bed, room, "Available", None, f"Freed up after user cancellation of booking #{booking_id}")
    if room:
        total_beds = len(room.beds)
        occupied = sum(1 for b in room.beds if (b.current_status or "").lower() != "available")
        room.occupied_count = occupied
        room.available_count = max(0, total_beds - occupied)
        room.room_status = "Available" if room.available_count > 0 else "Occupied"

    pg = db.query(Pg).filter(Pg.pg_id == booking.pg_id).first()
    add_user_notification(
        db=db,
        user_id=current_user.user_id,
        pg_id=booking.pg_id,
        title=f"Booking Cancelled · {pg.pg_name if pg else 'PG'}",
        message=f"Your booking request #{booking_id} has been cancelled."
    )

    db.commit()
    db.refresh(booking)

    pg = db.query(Pg).filter(Pg.pg_id == booking.pg_id).first()
    rent = pg.prices[0].monthly_rent if pg and pg.prices else 0.0
    deposit = pg.prices[0].security_deposit if pg and pg.prices else 0.0

    return BookingOut(
        booking_id=booking.booking_id,
        pg_id=booking.pg_id,
        status=booking.status,
        requested_move_in_date=booking.requested_move_in_date,
        created_at=str(booking.created_at),
        message=booking.message,
        pgName=pg.pg_name if pg else "Unknown PG",
        area=pg.location.area if pg and pg.location else None,
        city=pg.location.city if pg and pg.location else None,
        roomName=room.room_number if room else "Standard Room",
        bedNumber=bed.bed_number if bed else "Bed Allocation",
        rent=float(rent) if rent is not None else None,
        deposit=float(deposit) if deposit is not None else None,
        date=str(booking.requested_move_in_date) if booking.requested_move_in_date else None,
        userName=current_user.full_name,
        userEmail=current_user.email,
        userPhone=current_user.phone
    )
