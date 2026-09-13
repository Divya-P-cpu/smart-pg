from app.db.database import SessionLocal
from app.models import Booking, Pg, Room, Bed, User

db = SessionLocal()
try:
    b = db.query(Booking).filter(Booking.booking_id == 13).first()
    print(f"Booking: id={b.booking_id}, pg_id={b.pg_id}, room_id={b.room_id}, bed_id={b.bed_id}, status={b.status}, user_id={b.user_id}")
    pg = db.query(Pg).filter(Pg.pg_id == b.pg_id).first()
    print(f"PG found: {pg.pg_id if pg else None}")
    if pg:
        print(f"PG prices count: {len(pg.prices)}")
        for p in pg.prices:
            print(f"  price: sharing={p.sharing_type}, rent={p.monthly_rent}, deposit={p.security_deposit}")
        if pg.prices:
            print(f"prices[0].monthly_rent = {pg.prices[0].monthly_rent}")
            print(f"prices[0].security_deposit = {pg.prices[0].security_deposit}")
        else:
            print("NO PRICES - this would cause pg.prices[0] to fail")
    else:
        print("PG NOT FOUND")

    # Test the exact code path from the PATCH handler
    booking = db.query(Booking).filter(Booking.booking_id == 13).first()
    pg = db.query(Pg).filter(Pg.pg_id == booking.pg_id).first()
    room = db.query(Room).filter(Room.room_id == booking.room_id).first() if booking.room_id else None
    bed = db.query(Bed).filter(Bed.bed_id == booking.bed_id).first() if booking.bed_id else None
    user = db.query(User).filter(User.user_id == booking.user_id).first()

    print(f"\nroom: {room.room_id if room else None}")
    print(f"bed: {bed.bed_id if bed else None}")
    print(f"user: {user.user_id if user else None}")
    print(f"pg: {pg.pg_id if pg else None}")
    print(f"pg.prices: {len(pg.prices) if pg and pg.prices else 0}")

    # Now test the status update
    booking.status = "Accepted"
    db.flush()

    if bed:
        bed.current_status = "Occupied"
        print("Bed set to Occupied")
    if room:
        total_beds = len(room.beds)
        occupied = sum(1 for b in room.beds if (b.current_status or "").lower() != "available")
        room.occupied_count = occupied
        room.available_count = max(0, total_beds - occupied)
        print(f"Room updated: occupied={occupied}, total={total_beds}")

    db.commit()
    print("Commit succeeded!")

    rent = pg.prices[0].monthly_rent if pg and pg.prices else 0.0
    deposit = pg.prices[0].security_deposit if pg and pg.prices else 0.0
    print(f"rent={rent}, deposit={deposit}")
    print(f"float(rent)={float(rent)}, float(deposit)={float(deposit)}")

except Exception as e:
    print(f"ERROR: {type(e).__name__}: {e}")
    import traceback
    traceback.print_exc()
    db.rollback()
finally:
    db.close()
