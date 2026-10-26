import os

# pyrefly: ignore [missing-import]
from fastapi import FastAPI
# pyrefly: ignore [missing-import]
from fastapi.middleware.cors import CORSMiddleware
# pyrefly: ignore [missing-import]
from sqlalchemy import text
from app.db.database import engine
from app.routers import pg, auth, favorites, bookings, reviews, notifications, transport, preferences, db_admin

app = FastAPI(title="Smart PG Backend", version="1.0.0")

# CORS Configuration
default_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "http://localhost:8080",
    "http://localhost",
    "https://smart-pg-frontend.onrender.com",
    "https://smart-pg-frontend-svw3.onrender.com",
    "https://smart-pg.onrender.com",
    "https://smart-pg-app.onrender.com",
]
custom_origins = [o.strip().rstrip("/") for o in os.getenv("ALLOWED_ORIGINS", "").split(",") if o.strip()]
frontend_url = os.getenv("FRONTEND_URL", "").strip().rstrip("/")
if frontend_url:
    custom_origins.append(frontend_url)

allowed_origins = list(set(default_origins + custom_origins))

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r"https://.*\.onrender\.com|https://.*\.vercel\.app|https://.*\.pages\.dev|https://.*\.netlify\.app",
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
