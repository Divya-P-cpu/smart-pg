"""
Smart PG Cloud Database Read-Only Verification Script
-----------------------------------------------------
Purpose:
  Safely verifies connectivity, table counts, and master/sample data row
  counts in the target MySQL-compatible database without modifying, deleting,
  or exposing sensitive credentials.

Usage:
  Run from the backend directory:
    cd backend
    python verify_cloud_db.py
"""

import sys
from sqlalchemy import text
from app.db.database import engine

def main():
    print("=" * 60)
    print("  Smart PG - Cloud Database Read-Only Verification")
    print("=" * 60)

    try:
        with engine.connect() as conn:
            print("\n[1] Testing database connection...")
            conn.execute(text("SELECT 1;"))
            print("  --> Connection successful.")

            print("\n[2] Checking database tables...")
            tables_res = conn.execute(text("SHOW TABLES;")).fetchall()
            table_names = [r[0] for r in tables_res]
            print(f"  --> Total tables found: {len(table_names)} (expected 22)")

            key_tables = [
                "amenities",
                "pgs",
                "pg_locations",
                "pg_prices",
                "pg_amenities",
                "floors",
                "rooms",
                "beds",
                "pg_images",
                "users",
                "owners",
                "bookings",
            ]

            print("\n[3] Table row counts (Read-Only):")
            print(f"  {'Table Name':<28} {'Row Count':<10}")
            print("  " + "-" * 40)

            for table in key_tables:
                if table in table_names:
                    count = conn.execute(text(f"SELECT COUNT(*) FROM `{table}`;")).scalar()
                    print(f"  {table:<28} {count:<10}")
                else:
                    print(f"  {table:<28} [MISSING]")

            print("\n" + "=" * 60)
            print("  Database verification completed cleanly!")
            print("=" * 60)

    except Exception as exc:
        print(f"\n[ERROR] Verification failed: {exc}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
