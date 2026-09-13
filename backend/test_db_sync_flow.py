import sys
import os
from sqlalchemy import text
from app.db.database import engine, SessionLocal
from app.models import (
    User, Owner, Pg, Room, Bed, Booking, Favorite, 
    UserPreference, UserPreferredArea, UserRequiredAmenity,
    BedAvailabilityHistory, PgLocation, PgPrice, PgAmenity
)

def run_tests():
    db = SessionLocal()
    print("==================================================")
    print("STARTING END-TO-END DATABASE SYNCHRONIZATION TESTS")
    print("==================================================")

    try:
        # Test 1: Verify MySQL connection
        with engine.connect() as conn:
            tables = [r[0] for r in conn.execute(text("SHOW TABLES;")).fetchall()]
            print(f"[PASS] Connected to MySQL database 'smart_pg'. Tables count: {len(tables)}")
            assert "pgs" in tables, "Table 'pgs' missing"
            assert "beds" in tables, "Table 'beds' missing"
            assert "bookings" in tables, "Table 'bookings' missing"
            assert "favorites" in tables, "Table 'favorites' missing"
            assert "user_preferences" in tables, "Table 'user_preferences' missing"

        # Test 2: Verify Existing User and Owner retrieval
        user = db.query(User).first()
        owner = db.query(Owner).first()
        print(f"[PASS] Retrieved active User: {user.full_name} ({user.user_id})")
        print(f"[PASS] Retrieved active Owner: {owner.owner_name} ({owner.owner_id})")

        # Test 3: Verify User Preferences Persistence
        print("\n--- Testing User Preferences DB Flow ---")
        test_city = "Hyderabad"
        test_area = "Madhapur, HITEC City"
        pref = db.query(UserPreference).filter(UserPreference.user_id == user.user_id).first()
        if not pref:
            pref = UserPreference(
                preference_id="UP_TEST",
                user_id=user.user_id,
                preferred_city=test_city,
                preferred_areas_raw=test_area,
                min_budget=6000,
                max_budget=12000,
                preferred_sharing="2 Sharing",
                preferred_gender="Male",
                data_status="TEST"
            )
            db.add(pref)
        else:
            pref.preferred_city = test_city
            pref.preferred_areas_raw = test_area
            pref.min_budget = 6000
            pref.max_budget = 12000
        
        db.commit()
        db.refresh(pref)
        
        # Verify from MySQL
        with engine.connect() as conn:
            saved_pref = conn.execute(
                text("SELECT preferred_city, min_budget, max_budget FROM user_preferences WHERE user_id=:u"),
                {"u": user.user_id}
            ).mappings().first()
            assert saved_pref is not None, "User preference record not found in MySQL"
            assert saved_pref["preferred_city"] == test_city, "City mismatch in MySQL"
            print(f"[PASS] User preferences verified in MySQL table 'user_preferences': {saved_pref}")

        # Test 4: Verify Favorite Add and Remove Flow
        print("\n--- Testing Favorites DB Flow ---")
        sample_pg = db.query(Pg).filter(Pg.is_active == True).first()
        assert sample_pg is not None, "No active PG found in database"
        
        # Clean any previous test favorite
        db.query(Favorite).filter(Favorite.user_id == user.user_id, Favorite.pg_id == sample_pg.pg_id).delete()
        db.commit()

        # Add Favorite
        new_fav = Favorite(user_id=user.user_id, pg_id=sample_pg.pg_id)
        db.add(new_fav)
        db.commit()

        with engine.connect() as conn:
            fav_record = conn.execute(
                text("SELECT * FROM favorites WHERE user_id=:u AND pg_id=:p"),
                {"u": user.user_id, "p": sample_pg.pg_id}
            ).mappings().first()
            assert fav_record is not None, "Favorite not inserted into MySQL"
            print(f"[PASS] Favorite inserted into MySQL table 'favorites': user_id={fav_record['user_id']}, pg_id={fav_record['pg_id']}")

        # Remove Favorite
        db.delete(new_fav)
        db.commit()
        with engine.connect() as conn:
            fav_after = conn.execute(
                text("SELECT * FROM favorites WHERE user_id=:u AND pg_id=:p"),
                {"u": user.user_id, "p": sample_pg.pg_id}
            ).mappings().first()
            assert fav_after is None, "Favorite not deleted from MySQL"
            print("[PASS] Favorite removal verified in MySQL table 'favorites'.")

        # Test 5: Verify Bed Availability & History DB Flow
        print("\n--- Testing Bed Status & Availability History DB Flow ---")
        sample_bed = db.query(Bed).first()
        assert sample_bed is not None, "No bed found in database"
        orig_status = sample_bed.current_status

        # Update bed status to Reserved
        sample_bed.current_status = "Reserved"
        hist_count = db.query(BedAvailabilityHistory).count()
        new_hist = BedAvailabilityHistory(
            history_id=f"BH_T{hist_count + 1}",
            bed_id=sample_bed.bed_id,
            room_id=sample_bed.room_id,
            pg_id=sample_bed.room.pg_id if sample_bed.room else sample_pg.pg_id,
            status="Reserved",
            changed_by_owner_id=owner.owner_id,
            changed_at=sample_bed.created_at,
            data_status="TEST",
            notes=f"Test change from {orig_status} to Reserved"
        )
        db.add(new_hist)
        db.commit()

        with engine.connect() as conn:
            bed_record = conn.execute(
                text("SELECT bed_id, current_status FROM beds WHERE bed_id=:b"),
                {"b": sample_bed.bed_id}
            ).mappings().first()
            assert bed_record["current_status"] == "Reserved", "Bed status did not update in MySQL"
            print(f"[PASS] Bed status change verified in MySQL table 'beds': {bed_record}")

            hist_record = conn.execute(
                text("SELECT * FROM bed_availability_history WHERE bed_id=:b ORDER BY history_id DESC LIMIT 1"),
                {"b": sample_bed.bed_id}
            ).mappings().first()
            assert hist_record is not None, "Bed availability history log missing in MySQL"
            print(f"[PASS] Bed availability history log verified in MySQL: {hist_record['history_id']} -> {hist_record['status']}")

        # Revert bed status
        sample_bed.current_status = orig_status
        db.commit()

        # Test 6: Verify Booking Request and Approval Flow
        print("\n--- Testing Booking Request & Approval DB Flow ---")
        new_booking = Booking(
            user_id=user.user_id,
            pg_id=sample_pg.pg_id,
            room_id=sample_bed.room_id,
            bed_id=sample_bed.bed_id,
            status="Pending",
            message="Test booking inquiry for client demo."
        )
        db.add(new_booking)
        db.commit()
        db.refresh(new_booking)

        with engine.connect() as conn:
            b_row = conn.execute(
                text("SELECT booking_id, status, user_id, pg_id FROM bookings WHERE booking_id=:bid"),
                {"bid": new_booking.booking_id}
            ).mappings().first()
            assert b_row is not None and b_row["status"] == "Pending", "Booking creation failed in MySQL"
            print(f"[PASS] Booking request created in MySQL table 'bookings': id={b_row['booking_id']}, status={b_row['status']}")

        # Owner Approves Booking
        new_booking.status = "Accepted"
        sample_bed.current_status = "Occupied"
        db.commit()

        with engine.connect() as conn:
            b_updated = conn.execute(
                text("SELECT booking_id, status FROM bookings WHERE booking_id=:bid"),
                {"bid": new_booking.booking_id}
            ).mappings().first()
            assert b_updated["status"] == "Accepted", "Booking status did not update to Accepted in MySQL"
            print(f"[PASS] Owner booking approval updated in MySQL table 'bookings': status={b_updated['status']}")

        print("\n==================================================")
        print("ALL REAL-TIME MYSQL DATABASE SYNC TESTS PASSED!")
        print("==================================================")

    except Exception as e:
        print(f"\n[FAIL] Test encountered error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
    finally:
        db.close()

if __name__ == "__main__":
    run_tests()
