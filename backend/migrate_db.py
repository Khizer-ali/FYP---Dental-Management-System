import sqlite3
import os

# Check both instance and data directories since docker might use /app/data
possible_paths = [
    os.path.join('instance', 'clinical_assistant.db'),
    os.path.join('data', 'clinical_assistant.db'),
    'clinical_assistant.db'
]

for db_path in possible_paths:
    if os.path.exists(db_path):
        print(f"Migrating database at {db_path}...")
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Add is_hidden
        try:
            cursor.execute("ALTER TABLE patients ADD COLUMN is_hidden BOOLEAN NOT NULL DEFAULT 0")
            print("Successfully added is_hidden column.")
        except sqlite3.OperationalError:
            print("is_hidden column already exists or table doesn't exist.")
            
        # Add doctor_id
        try:
            cursor.execute("ALTER TABLE patients ADD COLUMN doctor_id INTEGER REFERENCES users(id)")
            print("Successfully added doctor_id column.")
        except sqlite3.OperationalError:
            print("doctor_id column already exists or table doesn't exist.")

        # Create prescriptions table if not exists (to be safe)
        try:
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS prescriptions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    patient_id INTEGER REFERENCES patients(id),
                    invoice_number VARCHAR(50) UNIQUE NOT NULL,
                    staff_name VARCHAR(200),
                    appointment_date VARCHAR(50),
                    date VARCHAR(50),
                    subtotal FLOAT DEFAULT 0.0,
                    discount_percent FLOAT DEFAULT 0.0,
                    discount_amount FLOAT DEFAULT 0.0,
                    outstanding_amount FLOAT DEFAULT 0.0,
                    grand_total FLOAT DEFAULT 0.0,
                    payment_method VARCHAR(100) DEFAULT 'ONLINE BANK TRANSFER',
                    payment_datetime VARCHAR(100),
                    created_at DATETIME
                )
            ''')
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS prescription_items (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    prescription_id INTEGER REFERENCES prescriptions(id) NOT NULL,
                    medicine_name VARCHAR(255) NOT NULL,
                    quantity INTEGER DEFAULT 1,
                    price FLOAT DEFAULT 0.0,
                    total FLOAT DEFAULT 0.0
                )
            ''')
            print("Successfully ensured prescription tables exist.")
            
            # Remove dosage and duration columns from existing prescription_items table
            # SQLite doesn't support DROP COLUMN, so we need to recreate the table
            try:
                # Check if the old table has dosage/duration columns
                cursor.execute("PRAGMA table_info(prescription_items)")
                columns = cursor.fetchall()
                has_dosage = any(col[1] == 'dosage' for col in columns)
                has_duration = any(col[1] == 'duration' for col in columns)
                
                if has_dosage or has_duration:
                    # Create new table without dosage/duration columns
                    cursor.execute('''
                        CREATE TABLE prescription_items_new (
                            id INTEGER PRIMARY KEY AUTOINCREMENT,
                            prescription_id INTEGER REFERENCES prescriptions(id) NOT NULL,
                            medicine_name VARCHAR(255) NOT NULL,
                            quantity INTEGER DEFAULT 1,
                            price FLOAT DEFAULT 0.0,
                            total FLOAT DEFAULT 0.0
                        )
                    ''')
                    
                    # Copy data from old table to new table
                    cursor.execute('''
                        INSERT INTO prescription_items_new 
                        (id, prescription_id, medicine_name, quantity, price, total)
                        SELECT id, prescription_id, medicine_name, quantity, price, total
                        FROM prescription_items
                    ''')
                    
                    # Drop old table and rename new table
                    cursor.execute("DROP TABLE prescription_items")
                    cursor.execute("ALTER TABLE prescription_items_new RENAME TO prescription_items")
                    
                    print("Successfully removed dosage and duration columns from prescription_items.")
                else:
                    print("Dosage and duration columns already removed from prescription_items.")
                    
            except sqlite3.OperationalError as e:
                print(f"Error removing dosage/duration columns: {e}")
        except sqlite3.OperationalError as e:
            print(f"Error creating prescription tables: {e}")
        
        conn.commit()
        conn.close()
    else:
        print(f"Database not found at {db_path}")
