from sqlalchemy import text
from app.db.database import engine
from app.core.security import get_password_hash

def ensure_demo_users():
    with engine.connect() as conn:
        # Check rahul.sharma@example.com
        u = conn.execute(
            text("SELECT user_id, email FROM users WHERE email = :email"),
            {"email": "rahul.sharma@example.com"}
        ).fetchone()

        if not u:
            hashed = get_password_hash("password")
            conn.execute(
                text("""
                    INSERT INTO users (user_id, full_name, email, phone, gender, password_hash, is_sample_user)
                    VALUES (:uid, :name, :email, :phone, :gender, :hash, 1)
                """),
                {
                    "uid": "USR002",
                    "name": "Rahul Sharma",
                    "email": "rahul.sharma@example.com",
                    "phone": "9876543210",
                    "gender": "Male",
                    "hash": hashed
                }
            )
            conn.commit()
            print("Successfully inserted USR002 rahul.sharma@example.com")
        else:
            print("User rahul.sharma@example.com already exists:", u)

        # Check manager@smartpg.com
        o = conn.execute(
            text("SELECT owner_id, email FROM owners WHERE email = :email"),
            {"email": "manager@smartpg.com"}
        ).fetchone()

        if not o:
            hashed = get_password_hash("password")
            conn.execute(
                text("""
                    INSERT INTO owners (owner_id, owner_name, email, phone, password_hash, verification_status, data_status, notes)
                    VALUES (:oid, :name, :email, :phone, :hash, 'Verified', 'Active', 'Demo Manager')
                """),
                {
                    "oid": "OWN002",
                    "name": "Smart PG Manager",
                    "email": "manager@smartpg.com",
                    "phone": "9876543211",
                    "hash": hashed
                }
            )
            conn.execute(
                text("""
                    INSERT IGNORE INTO owner_pgs (owner_id, pg_id, role)
                    VALUES ('OWN002', 'PG017', 'Primary Owner'), ('OWN002', 'PG018', 'Primary Owner')
                """)
            )
            conn.commit()
            print("Successfully inserted OWN002 manager@smartpg.com")
        else:
            print("Owner manager@smartpg.com already exists:", o)

if __name__ == "__main__":
    ensure_demo_users()
