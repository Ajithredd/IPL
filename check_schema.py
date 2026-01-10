import sqlite3
import os

db_path = 'instance/auction.db'
if not os.path.exists(db_path):
    db_path = 'auction.db'

print(f"Checking DB at: {db_path}")

if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("PRAGMA table_info(room)")
    columns = [info[1] for info in cursor.fetchall()]
    print("Columns in Room table:", columns)
    conn.close()
else:
    print("DB file not found")
