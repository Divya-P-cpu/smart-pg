import os
from sqlalchemy import text
from app.db.database import engine

def export_database():
    output_path = os.path.join(os.path.dirname(__file__), "smart_pg_full_dump.sql")
    with engine.connect() as conn, open(output_path, "w", encoding="utf-8") as f:
        f.write("-- ========================================================\n")
        f.write("-- SMART PG Database Full Dump\n")
        f.write("-- Database: smart_pg\n")
        f.write("-- ========================================================\n\n")
        f.write("SET FOREIGN_KEY_CHECKS = 0;\n\n")

        tables = [r[0] for r in conn.execute(text("SHOW TABLES")).fetchall()]
        print(f"Exporting {len(tables)} tables...")

        for table in tables:
            create_stmt = conn.execute(text(f"SHOW CREATE TABLE `{table}`")).fetchone()[1]
            f.write(f"-- --------------------------------------------------------\n")
            f.write(f"-- Table structure for `{table}`\n")
            f.write(f"-- --------------------------------------------------------\n")
            f.write(f"DROP TABLE IF EXISTS `{table}`;\n")
            f.write(f"{create_stmt};\n\n")

            rows = conn.execute(text(f"SELECT * FROM `{table}`")).mappings().all()
            if rows:
                cols = [f"`{k}`" for k in rows[0].keys()]
                cols_str = ", ".join(cols)
                f.write(f"-- Data for table `{table}` ({len(rows)} rows)\n")
                f.write(f"INSERT INTO `{table}` ({cols_str}) VALUES\n")
                
                records = []
                for row in rows:
                    val_strs = []
                    for val in row.values():
                        if val is None:
                            val_strs.append("NULL")
                        elif isinstance(val, (int, float)):
                            val_strs.append(str(val))
                        elif isinstance(val, bool):
                            val_strs.append("1" if val else "0")
                        else:
                            s = str(val).replace("\\", "\\\\").replace("'", "''")
                            val_strs.append(f"'{s}'")
                    records.append(f"  ({', '.join(val_strs)})")
                
                f.write(",\n".join(records))
                f.write(";\n\n")

        f.write("SET FOREIGN_KEY_CHECKS = 1;\n")
    print(f"Export complete: {output_path}")

if __name__ == "__main__":
    export_database()
