import uvicorn
from fastapi import FastAPI
from fastapi.responses import RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from app.routers import db_admin

admin_app = FastAPI(title="Smart PG Database Admin Console")

admin_app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

admin_app.include_router(db_admin.router)

@admin_app.get("/")
def root():
    return RedirectResponse(url="/db-admin")

@admin_app.get("/phpmyadmin")
def phpmyadmin_redirect():
    return RedirectResponse(url="/db-admin")

@admin_app.get("/sql")
def sql_redirect():
    return RedirectResponse(url="/db-admin")

@admin_app.get("/mysql")
def mysql_redirect():
    return RedirectResponse(url="/db-admin")

if __name__ == "__main__":
    try:
        # Listen on port 80 so typing 'localhost' in browser directly opens DB admin!
        uvicorn.run(admin_app, host="0.0.0.0", port=80)
    except Exception as e:
        print(f"Port 80 failed ({e}), falling back to port 8080...")
        uvicorn.run(admin_app, host="0.0.0.0", port=8080)
