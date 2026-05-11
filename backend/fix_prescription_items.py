import sqlite3
import os

# Check both instance and data directories
possible_paths = [
    'instance/clinical_assistant.db',
    'data/clinical_assistant.db'
]

for db_path in possible_paths:
    if os.path.exists(db_path):
        print(f"Fixing database at {db_path}...")
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Check current schema
        cursor.execute("PRAGMA table_info(prescription_items)")
        columns = cursor.fetchall()
        column_names = [col[1] for col in columns]
        print(f"Current columns: {column_names}")
        
        # Check if we need to remove dosage/duration columns
        if 'dosage' in column_names or 'duration' in column_names:
            print("Removing dosage and duration columns...")
            
            # Create new table without dosage/duration
            cursor.execute('''
                CREATE TABLE prescription_items_temp (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    prescription_id INTEGER REFERENCES prescriptions(id) NOT NULL,
                    medicine_name VARCHAR(255) NOT NULL,
                    quantity INTEGER DEFAULT 1,
                    price FLOAT DEFAULT 0.0,
                    total FLOAT DEFAULT 0.0
                )
            ''')
            
            # Copy data (excluding dosage/duration)
            cursor.execute('''
                INSERT INTO prescription_items_temp 
                (id, prescription_id, medicine_name, quantity, price, total)
                SELECT id, prescription_id, medicine_name, quantity, price, total
                FROM prescription_items
            ''')
            
            # Drop old table and rename
            cursor.execute("DROP TABLE prescription_items")
            cursor.execute("ALTER TABLE prescription_items_temp RENAME TO prescription_items")
            
            print("Successfully removed dosage and duration columns.")
        else:
            print("Dosage and duration columns already removed.")
        
        conn.commit()
        conn.close()
        break
    else:
        print(f"Database not found at {db_path}")
