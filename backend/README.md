# Smart PG Backend

This folder contains the Python FastAPI backend for the Smart PG application.

## Overview
1. This is the **Smart PG FastAPI backend**.
2. The frontend is separate and resides in the root directory (under `src/`).
3. The backend connects to the existing MySQL database named `smart_pg`.

---

## Setup Instructions

### 1. Create and Activate a Virtual Environment
Navigate to the `backend` directory in your terminal and run:

**On Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

**On macOS/Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

### 2. Install Requirements
With the virtual environment activated, run:
```bash
pip install -r requirements.txt
```

### 3. Configure Environment Variables
Create a file named `.env` in the `backend` directory (if it doesn't already exist) and populate it with your local MySQL credentials:
```env
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_HOST=localhost
DB_PORT=3306
DB_NAME=smart_pg
```

---

## Running the Backend

Start the FastAPI application with Uvicorn:
```bash
uvicorn app.main:app --reload
```

By default, the server will start at `http://127.0.0.1:8000`.

---

## API & Verification Endpoints

- **Root Endpoint**: [http://127.0.0.1:8000/](http://127.0.0.1:8000/) - Returns a welcome message.
- **Health Check**: [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health) - Verify application status.
- **Database Health Check**: [http://127.0.0.1:8000/health/db](http://127.0.0.1:8000/health/db) - Verify active MySQL connection status.
- **Swagger Documentation**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) - View and test backend API endpoints.
