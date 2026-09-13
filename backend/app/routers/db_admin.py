from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import HTMLResponse
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import Optional, List, Any, Dict
from pydantic import BaseModel
from app.db.database import get_db, engine

router = APIRouter(tags=["Browser Database Management"])

class QueryRequest(BaseModel):
    query: str

@router.get("/api/db-admin/tables")
def get_db_tables(db: Session = Depends(get_db)):
    try:
        tables_res = db.execute(text("SHOW TABLES;")).fetchall()
        table_names = [r[0] for r in tables_res]
        
        tables_info = []
        for name in table_names:
            count_res = db.execute(text(f"SELECT COUNT(*) FROM `{name}`")).scalar()
            tables_info.append({
                "name": name,
                "row_count": count_res
            })
        return {"tables": tables_info, "database": "smart_pg"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/api/db-admin/table/{table_name}")
def get_table_data(
    table_name: str,
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
    search: Optional[str] = None,
    order_by: Optional[str] = None,
    order_dir: Optional[str] = "DESC",
    db: Session = Depends(get_db)
):
    # Validate table name against real tables to prevent SQL injection
    tables_res = db.execute(text("SHOW TABLES;")).fetchall()
    valid_tables = [r[0] for r in tables_res]
    if table_name not in valid_tables:
        raise HTTPException(status_code=404, detail=f"Table '{table_name}' does not exist.")

    # Get column metadata
    columns_desc = db.execute(text(f"DESCRIBE `{table_name}`")).mappings().all()
    columns = [c["Field"] for c in columns_desc]

    # Total count
    total_count = db.execute(text(f"SELECT COUNT(*) FROM `{table_name}`")).scalar()

    # Build order clause
    order_clause = ""
    if order_by and order_by in columns:
        direction = "ASC" if str(order_dir).upper() == "ASC" else "DESC"
        order_clause = f"ORDER BY `{order_by}` {direction}"
    elif columns:
        # Default order by first column desc
        order_clause = f"ORDER BY `{columns[0]}` DESC"

    offset = (page - 1) * page_size
    query_str = f"SELECT * FROM `{table_name}` {order_clause} LIMIT :limit OFFSET :offset"
    rows_res = db.execute(text(query_str), {"limit": page_size, "offset": offset}).mappings().all()

    # Format values for JSON serialization
    serialized_rows = []
    for r in rows_res:
        row_dict = {}
        for k, v in r.items():
            if v is None:
                row_dict[k] = None
            elif hasattr(v, "isoformat"):
                row_dict[k] = v.isoformat()
            elif isinstance(v, (int, float, bool, str)):
                row_dict[k] = v
            else:
                row_dict[k] = str(v)
        serialized_rows.append(row_dict)

    return {
        "table": table_name,
        "columns": [dict(c) for c in columns_desc],
        "total_rows": total_count,
        "page": page,
        "page_size": page_size,
        "rows": serialized_rows
    }

@router.post("/api/db-admin/query")
def execute_custom_query(req: QueryRequest, db: Session = Depends(get_db)):
    raw_query = req.query.strip()
    if not raw_query:
        raise HTTPException(status_code=400, detail="Query cannot be empty.")
    
    # Allow SELECT, DESCRIBE, SHOW, EXPLAIN for client demonstrations
    first_word = raw_query.split()[0].upper()
    try:
        if first_word in ["SELECT", "SHOW", "DESCRIBE", "DESC", "EXPLAIN"]:
            res = db.execute(text(raw_query)).mappings().all()
            if not res:
                return {"columns": [], "rows": [], "row_count": 0, "status": "No rows returned"}
            cols = list(res[0].keys())
            rows_data = []
            for row in res:
                r_dict = {}
                for k, v in row.items():
                    if v is None:
                        r_dict[k] = None
                    elif hasattr(v, "isoformat"):
                        r_dict[k] = v.isoformat()
                    elif isinstance(v, (int, float, bool, str)):
                        r_dict[k] = v
                    else:
                        r_dict[k] = str(v)
                rows_data.append(r_dict)
            return {"columns": cols, "rows": rows_data, "row_count": len(rows_data), "status": "Success"}
        else:
            # Execute modification query and commit
            result = db.execute(text(raw_query))
            db.commit()
            return {"affected_rows": result.rowcount, "status": "Query executed successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/db-admin", response_class=HTMLResponse)
def get_db_admin_ui():
    html_content = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>SMART PG — Live MySQL Database Manager</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
  <style>
    :root {
      --bg-primary: #0b0f19;
      --bg-secondary: #111827;
      --bg-tertiary: #1f2937;
      --bg-card: rgba(17, 24, 39, 0.85);
      --border-color: rgba(255, 255, 255, 0.1);
      --border-hover: rgba(99, 102, 241, 0.4);
      --accent: #6366f1;
      --accent-glow: rgba(99, 102, 241, 0.25);
      --accent-cyan: #06b6d4;
      --accent-green: #10b981;
      --accent-amber: #f59e0b;
      --accent-red: #ef4444;
      --text-main: #f8fafc;
      --text-muted: #94a3b8;
      --text-dim: #64748b;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Plus Jakarta Sans', sans-serif;
      background-color: var(--bg-primary);
      color: var(--text-main);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      overflow-x: hidden;
    }
    .header {
      background: var(--bg-secondary);
      border-bottom: 1px solid var(--border-color);
      padding: 0.85rem 1.75rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: sticky;
      top: 0;
      z-index: 100;
      backdrop-filter: blur(12px);
    }
    .header-left {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .db-badge {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: rgba(99, 102, 241, 0.15);
      border: 1px solid rgba(99, 102, 241, 0.35);
      padding: 0.35rem 0.85rem;
      border-radius: 999px;
      font-size: 0.85rem;
      font-weight: 700;
      color: #818cf8;
    }
    .db-badge .pulse-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--accent-green);
      box-shadow: 0 0 10px var(--accent-green);
      animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.4; transform: scale(0.8); }
    }
    .logo-text {
      font-size: 1.15rem;
      font-weight: 800;
      letter-spacing: -0.3px;
      background: linear-gradient(135deg, #fff 30%, #a5b4fc 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .header-actions {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      padding: 0.5rem 1rem;
      border-radius: 8px;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      border: 1px solid var(--border-color);
      background: var(--bg-tertiary);
      color: var(--text-main);
      transition: all 0.2s ease;
      text-decoration: none;
    }
    .btn:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: rgba(255, 255, 255, 0.2);
    }
    .btn-primary {
      background: linear-gradient(135deg, #6366f1, #4f46e5);
      border-color: #6366f1;
      color: white;
      box-shadow: 0 4px 14px var(--accent-glow);
    }
    .btn-primary:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 20px var(--accent-glow);
    }
    .btn-success {
      background: #059669;
      border-color: #10b981;
      color: white;
    }
    .btn-sm {
      padding: 0.35rem 0.65rem;
      font-size: 0.78rem;
    }
    .main-layout {
      display: flex;
      flex: 1;
      height: calc(100vh - 65px);
      overflow: hidden;
    }
    /* Sidebar */
    .sidebar {
      width: 280px;
      background: var(--bg-secondary);
      border-right: 1px solid var(--border-color);
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .sidebar-header {
      padding: 1rem;
      border-bottom: 1px solid var(--border-color);
    }
    .sidebar-search {
      width: 100%;
      background: var(--bg-primary);
      border: 1px solid var(--border-color);
      border-radius: 6px;
      padding: 0.45rem 0.75rem;
      color: var(--text-main);
      font-size: 0.82rem;
      outline: none;
    }
    .sidebar-search:focus {
      border-color: var(--accent);
    }
    .table-list {
      flex: 1;
      overflow-y: auto;
      padding: 0.5rem;
    }
    .table-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.55rem 0.85rem;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.85rem;
      font-weight: 500;
      color: var(--text-muted);
      transition: all 0.15s ease;
      margin-bottom: 2px;
    }
    .table-item:hover {
      background: var(--bg-tertiary);
      color: var(--text-main);
    }
    .table-item.active {
      background: rgba(99, 102, 241, 0.2);
      color: #c7d2fe;
      font-weight: 700;
      border-left: 3px solid var(--accent);
    }
    .table-badge {
      background: var(--bg-primary);
      border: 1px solid var(--border-color);
      padding: 0.15rem 0.45rem;
      border-radius: 999px;
      font-size: 0.72rem;
      font-family: 'JetBrains Mono', monospace;
      color: var(--text-dim);
    }
    .table-item.active .table-badge {
      background: var(--accent);
      color: white;
      border-color: transparent;
    }
    /* Content Area */
    .content-area {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      background: var(--bg-primary);
    }
    .toolbar {
      background: var(--bg-secondary);
      border-bottom: 1px solid var(--border-color);
      padding: 0.75rem 1.5rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
    }
    .toolbar-title {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .toolbar-title h2 {
      font-size: 1.15rem;
      font-weight: 700;
      font-family: 'JetBrains Mono', monospace;
      color: #38bdf8;
    }
    .toolbar-actions {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    /* SQL Console Box */
    .sql-box {
      background: var(--bg-secondary);
      border-bottom: 1px solid var(--border-color);
      padding: 0.85rem 1.5rem;
      display: none;
    }
    .sql-box.open {
      display: block;
    }
    .sql-input {
      width: 100%;
      height: 70px;
      background: var(--bg-primary);
      border: 1px solid var(--border-color);
      border-radius: 6px;
      padding: 0.65rem;
      color: #a5f3fc;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.85rem;
      resize: vertical;
      outline: none;
    }
    .sql-input:focus {
      border-color: var(--accent-cyan);
    }
    .sql-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
      margin-top: 0.5rem;
    }
    /* Table View Container */
    .data-container {
      flex: 1;
      overflow: auto;
      padding: 1.25rem 1.5rem;
    }
    .data-table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
      font-size: 0.82rem;
      font-family: 'JetBrains Mono', monospace;
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      overflow: hidden;
    }
    .data-table th {
      background: #1e293b;
      color: #e2e8f0;
      font-weight: 600;
      text-align: left;
      padding: 0.65rem 0.85rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.15);
      white-space: nowrap;
      position: sticky;
      top: 0;
      z-index: 10;
    }
    .data-table td {
      padding: 0.6rem 0.85rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      color: #cbd5e1;
      max-width: 260px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .data-table tr:last-child td {
      border-bottom: none;
    }
    .data-table tr:hover td {
      background: rgba(99, 102, 241, 0.08);
      color: #fff;
    }
    .null-val {
      color: var(--text-dim);
      font-style: italic;
    }
    .status-pill {
      display: inline-block;
      padding: 0.15rem 0.5rem;
      border-radius: 999px;
      font-size: 0.72rem;
      font-weight: 700;
      text-transform: uppercase;
    }
    .status-available { background: rgba(16, 185, 129, 0.2); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.4); }
    .status-occupied { background: rgba(239, 68, 68, 0.2); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.4); }
    .status-reserved { background: rgba(245, 158, 11, 0.2); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.4); }
    .status-pending { background: rgba(245, 158, 11, 0.2); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.4); }
    .status-accepted { background: rgba(16, 185, 129, 0.2); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.4); }
    .status-rejected { background: rgba(239, 68, 68, 0.2); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.4); }
    /* Key quick action cards */
    .quick-table-strip {
      display: flex;
      gap: 0.5rem;
      padding: 0.65rem 1.5rem;
      background: var(--bg-primary);
      border-bottom: 1px solid var(--border-color);
      overflow-x: auto;
    }
    .quick-chip {
      padding: 0.35rem 0.75rem;
      border-radius: 999px;
      font-size: 0.78rem;
      font-weight: 600;
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      color: var(--text-muted);
      cursor: pointer;
      white-space: nowrap;
      transition: all 0.15s ease;
    }
    .quick-chip:hover {
      border-color: var(--accent);
      color: var(--text-main);
    }
    .quick-chip.active {
      background: var(--accent);
      color: white;
      border-color: transparent;
    }
    .loading-state, .empty-state {
      padding: 4rem;
      text-align: center;
      color: var(--text-dim);
    }
    .loading-spinner {
      display: inline-block;
      width: 28px;
      height: 28px;
      border: 3px solid rgba(255,255,255,0.1);
      border-top-color: var(--accent);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin-bottom: 1rem;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  </style>
</head>
<body>
  <header class="header">
    <div class="header-left">
      <div class="db-badge">
        <span class="pulse-dot"></span>
        <span>MySQL 8.0 · smart_pg</span>
      </div>
      <span class="logo-text">SMART PG Browser Database Explorer</span>
    </div>
    <div class="header-actions">
      <button class="btn btn-sm" id="btnToggleSql" onclick="toggleSqlBox()">
        <i class="fas fa-terminal"></i> SQL Query Console
      </button>
      <button class="btn btn-sm btn-primary" onclick="refreshCurrentTable()">
        <i class="fas fa-rotate"></i> Refresh Table
      </button>
      <a href="http://localhost:5173" target="_blank" class="btn btn-sm">
        <i class="fas fa-arrow-up-right-from-square"></i> Open SMART PG App
      </a>
    </div>
  </header>

  <!-- Quick shortcut strip to critical demonstration tables -->
  <div class="quick-table-strip">
    <span style="font-size: 0.75rem; color: var(--text-dim); align-self: center; font-weight: 700; margin-right: 4px;">KEY TABLES:</span>
    <span class="quick-chip" onclick="selectTable('pgs')"><i class="fas fa-building"></i> pgs</span>
    <span class="quick-chip" onclick="selectTable('beds')"><i class="fas fa-bed"></i> beds</span>
    <span class="quick-chip" onclick="selectTable('rooms')"><i class="fas fa-door-open"></i> rooms</span>
    <span class="quick-chip" onclick="selectTable('bookings')"><i class="fas fa-calendar-check"></i> bookings</span>
    <span class="quick-chip" onclick="selectTable('favorites')"><i class="fas fa-heart"></i> favorites</span>
    <span class="quick-chip" onclick="selectTable('user_preferences')"><i class="fas fa-sliders"></i> user_preferences</span>
    <span class="quick-chip" onclick="selectTable('bed_availability_history')"><i class="fas fa-clock-rotate-left"></i> bed_availability_history</span>
    <span class="quick-chip" onclick="selectTable('pg_prices')"><i class="fas fa-indian-rupee-sign"></i> pg_prices</span>
    <span class="quick-chip" onclick="selectTable('pg_locations')"><i class="fas fa-location-dot"></i> pg_locations</span>
  </div>

  <div class="main-layout">
    <!-- Left Sidebar: Tables List -->
    <aside class="sidebar">
      <div class="sidebar-header">
        <input type="text" id="tableFilter" class="sidebar-search" placeholder="Filter tables..." oninput="filterTables()" />
      </div>
      <div class="table-list" id="tableList">
        <div class="loading-state" style="padding: 1.5rem;"><div class="loading-spinner"></div><p>Loading schema...</p></div>
      </div>
    </aside>

    <!-- Right: Content Table Viewer -->
    <main class="content-area">
      <!-- SQL Console Box -->
      <div class="sql-box" id="sqlBox">
        <textarea id="sqlQueryInput" class="sql-input" placeholder="SELECT * FROM bookings ORDER BY booking_id DESC;"></textarea>
        <div class="sql-actions">
          <button class="btn btn-sm" onclick="setSampleSql('SELECT * FROM bookings ORDER BY booking_id DESC LIMIT 10;')">Recent Bookings</button>
          <button class="btn btn-sm" onclick="setSampleSql('SELECT b.bed_id, b.room_id, b.bed_number, b.current_status, r.pg_id FROM beds b JOIN rooms r ON b.room_id = r.room_id WHERE b.current_status != \\'Available\\';')">Occupied Beds</button>
          <button class="btn btn-sm" onclick="setSampleSql('SELECT * FROM bed_availability_history ORDER BY history_id DESC LIMIT 10;')">Availability Logs</button>
          <button class="btn btn-sm btn-success" onclick="runCustomSql()">
            <i class="fas fa-play"></i> Execute Query
          </button>
        </div>
      </div>

      <!-- Toolbar -->
      <div class="toolbar">
        <div class="toolbar-title">
          <i class="fas fa-table" style="color: var(--accent);"></i>
          <h2 id="currentTableTitle">Loading...</h2>
          <span class="table-badge" id="totalRowsBadge">0 rows</span>
        </div>
        <div class="toolbar-actions">
          <input type="text" id="rowSearchInput" class="sidebar-search" style="width: 220px;" placeholder="Search in table..." oninput="filterRowsLocally()" />
          <button class="btn btn-sm" onclick="refreshCurrentTable()"><i class="fas fa-arrows-rotate"></i> Sync Live State</button>
        </div>
      </div>

      <!-- Data Table View -->
      <div class="data-container" id="dataContainer">
        <div class="loading-state">
          <div class="loading-spinner"></div>
          <p>Fetching real MySQL records...</p>
        </div>
      </div>
    </main>
  </div>

  <script>
    let currentTable = 'pgs';
    let allTables = [];
    let currentTableData = null;

    async function loadTables() {
      try {
        const res = await fetch('/api/db-admin/tables');
        const data = await res.json();
        allTables = data.tables || [];
        renderTableList();
        if (allTables.length > 0) {
          selectTable(currentTable || allTables[0].name);
        }
      } catch (err) {
        console.error("Failed to load tables:", err);
      }
    }

    function renderTableList() {
      const filter = (document.getElementById('tableFilter').value || '').toLowerCase();
      const listEl = document.getElementById('tableList');
      const filtered = allTables.filter(t => t.name.toLowerCase().includes(filter));
      
      listEl.innerHTML = filtered.map(t => `
        <div class="table-item ${t.name === currentTable ? 'active' : ''}" onclick="selectTable('${t.name}')">
          <span><i class="fas fa-table-cells"></i> ${t.name}</span>
          <span class="table-badge">${t.row_count}</span>
        </div>
      `).join('');
    }

    function filterTables() {
      renderTableList();
    }

    async function selectTable(tableName) {
      currentTable = tableName;
      renderTableList();
      
      // Update quick chips
      document.querySelectorAll('.quick-chip').forEach(el => {
        el.classList.toggle('active', el.textContent.trim().includes(tableName));
      });

      document.getElementById('currentTableTitle').textContent = `smart_pg.${tableName}`;
      document.getElementById('totalRowsBadge').textContent = 'Loading...';
      const container = document.getElementById('dataContainer');
      container.innerHTML = `<div class="loading-state"><div class="loading-spinner"></div><p>Querying table '${tableName}' from MySQL...</p></div>`;

      try {
        const res = await fetch(`/api/db-admin/table/${tableName}?page_size=100`);
        const data = await res.json();
        currentTableData = data;
        document.getElementById('totalRowsBadge').textContent = `${data.total_rows} total rows`;
        renderTableData(data.columns, data.rows);
      } catch (err) {
        container.innerHTML = `<div class="empty-state"><p style="color: var(--accent-red);">Error loading table: ${err.message}</p></div>`;
      }
    }

    function formatCell(columnName, val) {
      if (val === null || val === undefined) return '<span class="null-val">NULL</span>';
      const str = String(val);
      const colLower = columnName.toLowerCase();
      
      if (colLower.includes('status')) {
        const statusClass = `status-${str.toLowerCase()}`;
        return `<span class="status-pill ${statusClass}">${str}</span>`;
      }
      return str;
    }

    function renderTableData(columns, rows) {
      const container = document.getElementById('dataContainer');
      if (!rows || rows.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-inbox" style="font-size: 2rem; margin-bottom: 0.5rem;"></i><p>Table is currently empty.</p></div>';
        return;
      }

      const colNames = columns.map(c => typeof c === 'string' ? c : c.Field);

      let html = '<table class="data-table"><thead><tr>';
      colNames.forEach(col => {
        html += `<th>${col}</th>`;
      });
      html += '</tr></thead><tbody>';

      rows.forEach(r => {
        html += '<tr>';
        colNames.forEach(col => {
          html += `<td title="${r[col] !== null && r[col] !== undefined ? String(r[col]).replace(/"/g, '&quot;') : 'NULL'}">${formatCell(col, r[col])}</td>`;
        });
        html += '</tr>';
      });

      html += '</tbody></table>';
      container.innerHTML = html;
    }

    function refreshCurrentTable() {
      loadTables();
      selectTable(currentTable);
    }

    function toggleSqlBox() {
      const box = document.getElementById('sqlBox');
      box.classList.toggle('open');
    }

    function setSampleSql(query) {
      document.getElementById('sqlQueryInput').value = query;
    }

    async function runCustomSql() {
      const query = document.getElementById('sqlQueryInput').value.trim();
      if (!query) return;
      
      const container = document.getElementById('dataContainer');
      container.innerHTML = '<div class="loading-state"><div class="loading-spinner"></div><p>Executing SQL query on MySQL...</p></div>';

      try {
        const res = await fetch('/api/db-admin/query', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || 'Query failed');

        if (data.rows) {
          document.getElementById('currentTableTitle').textContent = `Query Results (${data.row_count} rows)`;
          document.getElementById('totalRowsBadge').textContent = `${data.row_count} rows`;
          renderTableData(data.columns.map(c => ({ Field: c })), data.rows);
        } else {
          document.getElementById('currentTableTitle').textContent = 'Execution Succeeded';
          document.getElementById('totalRowsBadge').textContent = `${data.affected_rows || 0} affected`;
          container.innerHTML = `<div class="empty-state"><i class="fas fa-circle-check" style="font-size: 2rem; color: var(--accent-green); margin-bottom: 0.5rem;"></i><p>Query executed successfully! (${data.affected_rows || 0} rows affected)</p></div>`;
          loadTables();
        }
      } catch (err) {
        container.innerHTML = `<div class="empty-state"><i class="fas fa-triangle-exclamation" style="font-size: 2rem; color: var(--accent-red); margin-bottom: 0.5rem;"></i><p style="color: var(--accent-red); font-weight: 700;">Query Error: ${err.message}</p></div>`;
      }
    }

    function filterRowsLocally() {
      if (!currentTableData || !currentTableData.rows) return;
      const term = (document.getElementById('rowSearchInput').value || '').toLowerCase();
      const filtered = currentTableData.rows.filter(r => {
        return Object.values(r).some(v => v !== null && String(v).toLowerCase().includes(term));
      });
      renderTableData(currentTableData.columns, filtered);
    }

    // Initialize on load
    loadTables();
  </script>
</body>
</html>
"""
    return HTMLResponse(content=html_content)
