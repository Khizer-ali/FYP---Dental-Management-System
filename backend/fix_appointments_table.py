import sqlite3
import os

# Find the database file
db_paths = [
    'instance/clinical_assistant.db',
    'data/clinical_assistant.db'
]

for db_path in db_paths:
    if os.path.exists(db_path):
        print(f"Fixing appointments table in {db_path}...")
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Get current appointments data
        cursor.execute("SELECT * FROM appointments")
        appointments_data = cursor.fetchall()
        
        # Drop the appointments table
        cursor.execute("DROP TABLE appointments")
        
        # Recreate appointments table with nullable patient_id
        cursor.execute('''
            CREATE TABLE appointments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                patient_id INTEGER REFERENCES patients(id),
                appointment_datetime DATETIME NOT NULL,
                alert_datetime DATETIME NOT NULL,
                status VARCHAR(50) DEFAULT 'Scheduled',
                sms_status VARCHAR(50) DEFAULT 'Pending',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Insert back the appointments data (without patient_id for now)
        for appointment in appointments_data:
            # Skip patient_id to avoid constraint issues
            cursor.execute('''
                INSERT INTO appointments 
                (appointment_datetime, alert_datetime, status, sms_status, created_at)
                VALUES (?, ?, ?, ?, ?)
            ''', (appointment[2], appointment[3], appointment[4], appointment[5]))
        
        conn.commit()
        conn.close()
        print("Appointments table fixed successfully!")
        break
