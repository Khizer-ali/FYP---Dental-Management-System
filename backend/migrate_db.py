<<<<<<< HEAD
import sqlite3
import os

db_path = os.path.join('instance', 'clinical_assistant.db')

if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    try:
        cursor.execute("ALTER TABLE patients ADD COLUMN is_hidden BOOLEAN NOT NULL DEFAULT 0")
        print("Successfully added is_hidden column to patients table.")
    except sqlite3.OperationalError as e:
        print(f"Operational error (might already exist): {e}")
    
    conn.commit()
    conn.close()
else:
    print(f"Database not found at {db_path}")
=======
import sqlite3
import os

db_path = os.path.join('instance', 'clinical_assistant.db')

if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    try:
        cursor.execute("ALTER TABLE patients ADD COLUMN is_hidden BOOLEAN NOT NULL DEFAULT 0")
        print("Successfully added is_hidden column to patients table.")
    except sqlite3.OperationalError as e:
        print(f"Operational error (might already exist): {e}")
    
    conn.commit()
    conn.close()
else:
    print(f"Database not found at {db_path}")
>>>>>>> 21d5d1dd93ec57f1b541daadb89588e7896dc201
