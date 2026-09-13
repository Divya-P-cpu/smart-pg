# pyrefly: ignore [missing-import]
from fastapi import FastAPI
# pyrefly: ignore [missing-import]
from fastapi.middleware.cors import CORSMiddleware
# pyrefly: ignore [missing-import]
from sqlalchemy import text
from app.db.database import engine
from app.routers import pg, auth, favorites, bookings, reviews, notifications, transport, preferences, db_admin

app = FastAPI(title="Smart PG Backend", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "http://localhost:8080",
        "http://localhost",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(pg.router)
app.include_router(auth.router)
app.include_router(favorites.router)
app.include_router(bookings.router)
app.include_router(preferences.router)
app.include_router(reviews.router)
app.include_router(notifications.router)
app.include_router(transport.router)
app.include_router(db_admin.router)


@app.get("/")
def root():
    return {"message": "Smart PG Backend is running"}

@app.get("/health")
def health():
    return {"status": "healthy"}

@app.get("/health/db")
def db_health():
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        return {"status": "error", "database": "not connected", "detail": str(e)}
