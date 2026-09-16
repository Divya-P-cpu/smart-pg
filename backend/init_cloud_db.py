"""
Smart PG Cloud Database Initialization Script
--------------------------------------------
Purpose:
  Safely initializes an empty or existing MySQL-compatible database for the
  Smart PG application without migrating, copying, or embedding sensitive
  local developer/user data.

What this script does:
  1. Validates the internal canonical master amenities list for duplicate IDs or names.
  2. Tests connectivity to the configured database.
  3. Creates all 22 registered tables if they are missing (using SQLAlchemy
     Base.metadata.create_all). Note: create_all() creates missing tables only;
     it does not perform schema migrations or modify existing table structures.
  4. Validates and inserts the canonical 19 master amenities if missing.
     Detects and reports any ID or name collisions instead of silently ignoring them.
     Uses explicit flushing to guarantee that pending inserts cannot cause
     inconsistent duplicate checks.
  5. Commits changes and cleanly closes database sessions.

Database Compatibility:
  - Designed for MySQL-compatible databases.
  - PyMySQL handles the MySQL wire and authentication protocol.
  - Cloud provider-specific SSL/TLS parameters, certificates, or networking
    requirements must be tested and verified separately with the selected provider.

Safety Guarantees:
  - Strictly additive: NO DROP, NO TRUNCATE, NO DELETE statements.
  - Never creates or copies local users, owners, or password hashes.
  - Never creates or copies local bookings, favorites, reviews, notifications,
    preferences, or test history.
  - Safe to execute repeatedly on compatible databases without duplicating records.
  - Never exposes passwords or sensitive connection details in stdout/logs.

Usage:
  This script must be executed manually from the `backend` directory:
    cd backend
    python init_cloud_db.py
"""

import sys
from sqlalchemy import text
from sqlalchemy.orm import Session

# 1. Import database configuration and all models before table creation
from app.db.database import Base, engine, SessionLocal
import app.models  # Ensures all 22 models are registered on Base.metadata
from app.models.amenity import Amenity


# 2. Canonical master amenities catalog
# Preserves the exact 19 records from the Smart PG database dump.
# Verified against app.services.pg_service.AMENITY_ALIASES:
#   - Both 'Wi-Fi' and 'Wi-Fi / Internet' are preserved because AMENITY_ALIASES["wifi"]
#     maps both variants: ["Wi-Fi", "Internet", "Internet/Wi-Fi", "Wi-Fi / Internet"].
#   - Both 'Food' and 'Food (Homely Food, Daily Chapathi)' are preserved because
#     AMENITY_ALIASES["food"] maps ["Food", "Food (Homely Food, Daily Chapathi)", "Mess", "Meals"],
#     and SQL seed scripts specifically look up 'Food' by name.
#   - 'Geyser' and 'Hot Water' are preserved as distinct canonical amenities because
#     AMENITY_ALIASES maps between both ("geyser": ["Geyser", "Hot Water"]).
CANONICAL_AMENITIES = [
    (1, "Wi-Fi"),
    (2, "Food (Homely Food, Daily Chapathi)"),
    (3, "Hot Water"),
    (4, "CCTV"),
    (5, "AC"),
    (6, "Attached Bathroom"),
    (7, "Washing Machine"),
    (8, "Geyser"),
    (9, "Housekeeping"),
    (10, "Kitchen"),
    (11, "TV"),
    (12, "Security"),
    (13, "Personal Locker"),
    (14, "Parking"),
    (15, "Laundry"),
    (16, "Lift"),
    (17, "Power Backup"),
    (18, "Wi-Fi / Internet"),
    (19, "Food"),
]


def validate_canonical_amenities():
    """Verify CANONICAL_AMENITIES list for internal duplicates before database operations."""
    seen_ids = set()
    seen_names = set()
    id_dups = []
    name_dups = []

    for amenity_id, amenity_name in CANONICAL_AMENITIES:
        if amenity_id in seen_ids:
            id_dups.append(amenity_id)
        seen_ids.add(amenity_id)

        if amenity_name in seen_names:
            name_dups.append(amenity_name)
        seen_names.add(amenity_name)

    if id_dups or name_dups:
        errors = []
        if id_dups:
            errors.append(f"Duplicate IDs found in CANONICAL_AMENITIES: {id_dups}")
        if name_dups:
            errors.append(f"Duplicate names found in CANONICAL_AMENITIES: {name_dups}")
        raise ValueError("; ".join(errors))


def test_connection():
    """Verify connectivity to the configured database without printing secrets."""
    print("[1/3] Testing database connection...")
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1;"))
        print("  --> Connection successful.")
    except Exception as exc:
        print(f"  [ERROR] Database connection failed: {exc}", file=sys.stderr)
        raise


def create_schema():
    """Create missing registered tables.
    
    Note: Base.metadata.create_all() creates missing tables only.
    It does not perform schema migrations or modify existing table structures.
    """
    print("[2/3] Checking and creating missing database tables...")
    try:
        Base.metadata.create_all(bind=engine)
        print(f"  --> Verified/created {len(Base.metadata.tables)} registered tables successfully.")
    except Exception as exc:
        print(f"  [ERROR] Table creation failed: {exc}", file=sys.stderr)
        raise


def seed_master_amenities():
    """Validate and insert missing canonical amenities.

    Conflict Detection:
      - Same ID and same Name: Skipped safely (already seeded).
      - Same ID with different Name: Reported as a conflict, aborts.
      - Same Name with different ID: Reported as a conflict, aborts.
      - Neither exists: Inserted cleanly and flushed to prevent pending discrepancy.
    """
    print("[3/3] Checking master amenities catalog...")
    session: Session = SessionLocal()
    inserted_count = 0
    skipped_count = 0
    conflicts = []

    try:
        # Pre-load existing amenities to build lookup maps
        existing_amenities = session.query(Amenity).all()
        id_to_name = {a.amenity_id: a.amenity_name for a in existing_amenities}
        name_to_id = {a.amenity_name: a.amenity_id for a in existing_amenities}

        for amenity_id, amenity_name in CANONICAL_AMENITIES:
            has_id = amenity_id in id_to_name
            has_name = amenity_name in name_to_id

            if has_id and has_name:
                existing_name = id_to_name[amenity_id]
                existing_id = name_to_id[amenity_name]
                if existing_name == amenity_name and existing_id == amenity_id:
                    # Same ID and same name exists -> already seeded
                    skipped_count += 1
                else:
                    conflicts.append(
                        f"Cross-collision: ID {amenity_id} belongs to '{existing_name}', "
                        f"while name '{amenity_name}' belongs to ID {existing_id}."
                    )
            elif has_id and not has_name:
                conflicts.append(
                    f"ID collision: ID {amenity_id} already exists with name '{id_to_name[amenity_id]}' "
                    f"(expected '{amenity_name}')."
                )
            elif has_name and not has_id:
                conflicts.append(
                    f"Name collision: Name '{amenity_name}' already exists with ID {name_to_id[amenity_name]} "
                    f"(expected ID {amenity_id})."
                )
            else:
                # Neither exists -> insert and flush to maintain consistent transaction state
                new_amenity = Amenity(amenity_id=amenity_id, amenity_name=amenity_name)
                session.add(new_amenity)
                session.flush()
                id_to_name[amenity_id] = amenity_name
                name_to_id[amenity_name] = amenity_id
                inserted_count += 1

        if conflicts:
            session.rollback()
            print("  [ERROR] Amenity catalog conflicts detected:", file=sys.stderr)
            for c in conflicts:
                print(f"    - {c}", file=sys.stderr)
            raise ValueError(f"Aborted due to {len(conflicts)} amenity catalog conflict(s).")

        session.commit()
        print(f"  --> Master amenities check complete: {inserted_count} inserted, {skipped_count} already existed.")
    except Exception as exc:
        session.rollback()
        print(f"  [ERROR] Seeding master amenities failed: {exc}", file=sys.stderr)
        raise
    finally:
        session.close()


def main():
    print("=" * 60)
    print("  Smart PG - Cloud Database Initialization")
    print("=" * 60)
    try:
        # Pre-flight in-memory validation
        validate_canonical_amenities()

        # Database operations
        test_connection()
        create_schema()
        seed_master_amenities()
        print("=" * 60)
        print("  Initialization completed successfully!")
        print("=" * 60)
    except Exception:
        print("=" * 60, file=sys.stderr)
        print("  Initialization ABORTED due to an error.", file=sys.stderr)
        print("=" * 60, file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
