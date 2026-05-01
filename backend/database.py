<<<<<<< HEAD
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import enum

db = SQLAlchemy()

class UserRole(str, enum.Enum):
    ADMIN = "admin"
    DOCTOR = "doctor"

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.Enum(UserRole), nullable=False, index=True)
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'role': self.role.value if hasattr(self.role, 'value') else self.role,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class Patient(db.Model):
    __tablename__ = 'patients'
    
    id = db.Column(db.Integer, primary_key=True)
    reference_number = db.Column(db.String(50), unique=True, nullable=False, index=True)
    name = db.Column(db.String(200), nullable=False)
    phone_number = db.Column(db.String(50), nullable=True)
    cnic = db.Column(db.String(20), nullable=True)
    is_hidden = db.Column(db.Boolean, default=False, nullable=False)
    teeth_drawing = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    documents = db.relationship('Document', backref='patient', lazy=True, cascade='all, delete-orphan')
    vitals = db.relationship('Vital', backref='patient', lazy=True, cascade='all, delete-orphan')
    family_history = db.relationship('FamilyHistory', backref='patient', lazy=True, cascade='all, delete-orphan')
    images = db.relationship('MedicalImage', backref='patient', lazy=True, cascade='all, delete-orphan')
    dental_records = db.relationship('DentalAssessment', backref='patient', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'reference_number': self.reference_number,
            'name': self.name,
            'phone_number': self.phone_number,
            'cnic': self.cnic,
            'is_hidden': self.is_hidden,
            'teeth_drawing': self.teeth_drawing,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class Document(db.Model):
    __tablename__ = 'documents'
    
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patients.id'), nullable=False)
    filename = db.Column(db.String(255), nullable=False)
    file_path = db.Column(db.String(500), nullable=False)
    parsed_text = db.Column(db.Text)
    document_type = db.Column(db.String(100))
    uploaded_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'patient_id': self.patient_id,
            'filename': self.filename,
            'parsed_text': self.parsed_text,
            'document_type': self.document_type,
            'uploaded_at': self.uploaded_at.isoformat() if self.uploaded_at else None
        }

class Vital(db.Model):
    __tablename__ = 'vitals'
    
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patients.id'), nullable=False)
    temperature = db.Column(db.Float)
    weight = db.Column(db.Float)
    height = db.Column(db.Float)
    blood_pressure_systolic = db.Column(db.Integer)
    blood_pressure_diastolic = db.Column(db.Integer)
    heart_rate = db.Column(db.Integer)
    respiratory_rate = db.Column(db.Integer)
    oxygen_saturation = db.Column(db.Float)
    recorded_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'patient_id': self.patient_id,
            'temperature': self.temperature,
            'weight': self.weight,
            'height': self.height,
            'blood_pressure_systolic': self.blood_pressure_systolic,
            'blood_pressure_diastolic': self.blood_pressure_diastolic,
            'heart_rate': self.heart_rate,
            'respiratory_rate': self.respiratory_rate,
            'oxygen_saturation': self.oxygen_saturation,
            'recorded_at': self.recorded_at.isoformat() if self.recorded_at else None
        }

class FamilyHistory(db.Model):
    __tablename__ = 'family_history'
    
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patients.id'), nullable=False)
    condition = db.Column(db.String(200), nullable=False)
    relation = db.Column(db.String(100))
    age_of_onset = db.Column(db.Integer)
    notes = db.Column(db.Text)
    recorded_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'patient_id': self.patient_id,
            'condition': self.condition,
            'relation': self.relation,
            'age_of_onset': self.age_of_onset,
            'notes': self.notes,
            'recorded_at': self.recorded_at.isoformat() if self.recorded_at else None
        }

class MedicalImage(db.Model):
    __tablename__ = 'medical_images'
    
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patients.id'), nullable=False)
    filename = db.Column(db.String(255), nullable=False)
    file_path = db.Column(db.String(500), nullable=False)
    image_type = db.Column(db.String(100))
    description = db.Column(db.Text)
    uploaded_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'patient_id': self.patient_id,
            'filename': self.filename,
            'image_type': self.image_type,
            'description': self.description,
            'uploaded_at': self.uploaded_at.isoformat() if self.uploaded_at else None
        }

class DentalAssessment(db.Model):
    __tablename__ = 'dental_assessments'
    __table_args__ = (
        db.UniqueConstraint('patient_id', 'tooth_id', name='uq_patient_tooth'),
    )
    
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patients.id'), nullable=False)
    tooth_id = db.Column(db.String(20), nullable=False)
    condition = db.Column(db.String(2000), nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'patient_id': self.patient_id,
            'tooth_id': self.tooth_id,
            'condition': self.condition,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class Bill(db.Model):
    __tablename__ = 'bills'
    
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patients.id'), nullable=True) # Nullable for guest bills if needed
    invoice_number = db.Column(db.String(50), unique=True, nullable=False, index=True)
    staff_name = db.Column(db.String(200))
    appointment_date = db.Column(db.String(50))
    date = db.Column(db.String(50))
    
    # Financial fields
    subtotal = db.Column(db.Float, default=0.0)
    discount_percent = db.Column(db.Float, default=0.0)
    discount_amount = db.Column(db.Float, default=0.0)
    outstanding_amount = db.Column(db.Float, default=0.0)
    grand_total = db.Column(db.Float, default=0.0)
    
    payment_method = db.Column(db.String(100), default="ONLINE BANK TRANSFER")
    payment_datetime = db.Column(db.String(100))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationship
    items = db.relationship('BillItem', backref='bill', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'patient_id': self.patient_id,
            'invoice_number': self.invoice_number,
            'staff_name': self.staff_name,
            'appointment_date': self.appointment_date,
            'date': self.date,
            'subtotal': self.subtotal,
            'discount_percent': self.discount_percent,
            'discount_amount': self.discount_amount,
            'outstanding_amount': self.outstanding_amount,
            'grand_total': self.grand_total,
            'payment_method': self.payment_method,
            'payment_datetime': self.payment_datetime,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'items': [item.to_dict() for item in self.items]
        }

class BillItem(db.Model):
    __tablename__ = 'bill_items'
    
    id = db.Column(db.Integer, primary_key=True)
    bill_id = db.Column(db.Integer, db.ForeignKey('bills.id'), nullable=False)
    service_name = db.Column(db.String(255), nullable=False)
    quantity = db.Column(db.Integer, default=1)
    price = db.Column(db.Float, default=0.0)
    total = db.Column(db.Float, default=0.0)
    
    def to_dict(self):
        return {
            'id': self.id,
            'bill_id': self.bill_id,
            'service_name': self.service_name,
            'price': self.price,
            'total': self.total
        }

class Appointment(db.Model):
    __tablename__ = 'appointments'
    
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patients.id'), nullable=False)
    appointment_datetime = db.Column(db.DateTime, nullable=False)
    alert_datetime = db.Column(db.DateTime, nullable=False)
    
    # Scheduled, Completed, Cancelled
    status = db.Column(db.String(50), default='Scheduled')
    
    # Pending, Sent, Failed
    sms_status = db.Column(db.String(50), default='Pending')
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Note: adding a relationship to patient for easy access
    patient_rel = db.relationship('Patient', backref='appointments', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'patient_id': self.patient_id,
            'appointment_datetime': self.appointment_datetime.isoformat() if self.appointment_datetime else None,
            'alert_datetime': self.alert_datetime.isoformat() if self.alert_datetime else None,
            'status': self.status,
            'sms_status': self.sms_status,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

=======
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import enum

db = SQLAlchemy()

class UserRole(str, enum.Enum):
    ADMIN = "admin"
    DOCTOR = "doctor"

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.Enum(UserRole), nullable=False, index=True)
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'role': self.role.value if hasattr(self.role, 'value') else self.role,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class Patient(db.Model):
    __tablename__ = 'patients'
    
    id = db.Column(db.Integer, primary_key=True)
    reference_number = db.Column(db.String(50), unique=True, nullable=False, index=True)
    name = db.Column(db.String(200), nullable=False)
    phone_number = db.Column(db.String(50), nullable=True)
    cnic = db.Column(db.String(20), nullable=True)
    is_hidden = db.Column(db.Boolean, default=False, nullable=False)
    teeth_drawing = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    doctor_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    
    # Relationships
    documents = db.relationship('Document', backref='patient', lazy=True, cascade='all, delete-orphan')
    vitals = db.relationship('Vital', backref='patient', lazy=True, cascade='all, delete-orphan')
    family_history = db.relationship('FamilyHistory', backref='patient', lazy=True, cascade='all, delete-orphan')
    images = db.relationship('MedicalImage', backref='patient', lazy=True, cascade='all, delete-orphan')
    dental_records = db.relationship('DentalAssessment', backref='patient', lazy=True, cascade='all, delete-orphan')
    prescriptions = db.relationship('Prescription', backref='patient', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'reference_number': self.reference_number,
            'name': self.name,
            'phone_number': self.phone_number,
            'cnic': self.cnic,
            'is_hidden': self.is_hidden,
            'teeth_drawing': self.teeth_drawing,
            'doctor_id': self.doctor_id,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class Document(db.Model):
    __tablename__ = 'documents'
    
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patients.id'), nullable=False)
    filename = db.Column(db.String(255), nullable=False)
    file_path = db.Column(db.String(500), nullable=False)
    parsed_text = db.Column(db.Text)
    document_type = db.Column(db.String(100))
    uploaded_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'patient_id': self.patient_id,
            'filename': self.filename,
            'parsed_text': self.parsed_text,
            'document_type': self.document_type,
            'uploaded_at': self.uploaded_at.isoformat() if self.uploaded_at else None
        }

class Vital(db.Model):
    __tablename__ = 'vitals'
    
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patients.id'), nullable=False)
    temperature = db.Column(db.Float)
    weight = db.Column(db.Float)
    height = db.Column(db.Float)
    blood_pressure_systolic = db.Column(db.Integer)
    blood_pressure_diastolic = db.Column(db.Integer)
    heart_rate = db.Column(db.Integer)
    respiratory_rate = db.Column(db.Integer)
    oxygen_saturation = db.Column(db.Float)
    recorded_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'patient_id': self.patient_id,
            'temperature': self.temperature,
            'weight': self.weight,
            'height': self.height,
            'blood_pressure_systolic': self.blood_pressure_systolic,
            'blood_pressure_diastolic': self.blood_pressure_diastolic,
            'heart_rate': self.heart_rate,
            'respiratory_rate': self.respiratory_rate,
            'oxygen_saturation': self.oxygen_saturation,
            'recorded_at': self.recorded_at.isoformat() if self.recorded_at else None
        }

class FamilyHistory(db.Model):
    __tablename__ = 'family_history'
    
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patients.id'), nullable=False)
    condition = db.Column(db.String(200), nullable=False)
    relation = db.Column(db.String(100))
    age_of_onset = db.Column(db.Integer)
    notes = db.Column(db.Text)
    recorded_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'patient_id': self.patient_id,
            'condition': self.condition,
            'relation': self.relation,
            'age_of_onset': self.age_of_onset,
            'notes': self.notes,
            'recorded_at': self.recorded_at.isoformat() if self.recorded_at else None
        }

class MedicalImage(db.Model):
    __tablename__ = 'medical_images'
    
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patients.id'), nullable=False)
    filename = db.Column(db.String(255), nullable=False)
    file_path = db.Column(db.String(500), nullable=False)
    image_type = db.Column(db.String(100))
    description = db.Column(db.Text)
    uploaded_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'patient_id': self.patient_id,
            'filename': self.filename,
            'image_type': self.image_type,
            'description': self.description,
            'uploaded_at': self.uploaded_at.isoformat() if self.uploaded_at else None
        }

class DentalAssessment(db.Model):
    __tablename__ = 'dental_assessments'
    __table_args__ = (
        db.UniqueConstraint('patient_id', 'tooth_id', name='uq_patient_tooth'),
    )
    
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patients.id'), nullable=False)
    tooth_id = db.Column(db.String(20), nullable=False)
    condition = db.Column(db.String(2000), nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'patient_id': self.patient_id,
            'tooth_id': self.tooth_id,
            'condition': self.condition,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class Bill(db.Model):
    __tablename__ = 'bills'
    
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patients.id'), nullable=True) # Nullable for guest bills if needed
    invoice_number = db.Column(db.String(50), unique=True, nullable=False, index=True)
    staff_name = db.Column(db.String(200))
    appointment_date = db.Column(db.String(50))
    date = db.Column(db.String(50))
    
    # Financial fields
    subtotal = db.Column(db.Float, default=0.0)
    discount_percent = db.Column(db.Float, default=0.0)
    discount_amount = db.Column(db.Float, default=0.0)
    outstanding_amount = db.Column(db.Float, default=0.0)
    grand_total = db.Column(db.Float, default=0.0)
    
    payment_method = db.Column(db.String(100), default="ONLINE BANK TRANSFER")
    payment_datetime = db.Column(db.String(100))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationship
    items = db.relationship('BillItem', backref='bill', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'patient_id': self.patient_id,
            'invoice_number': self.invoice_number,
            'staff_name': self.staff_name,
            'appointment_date': self.appointment_date,
            'date': self.date,
            'subtotal': self.subtotal,
            'discount_percent': self.discount_percent,
            'discount_amount': self.discount_amount,
            'outstanding_amount': self.outstanding_amount,
            'grand_total': self.grand_total,
            'payment_method': self.payment_method,
            'payment_datetime': self.payment_datetime,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'items': [item.to_dict() for item in self.items]
        }

class BillItem(db.Model):
    __tablename__ = 'bill_items'
    
    id = db.Column(db.Integer, primary_key=True)
    bill_id = db.Column(db.Integer, db.ForeignKey('bills.id'), nullable=False)
    service_name = db.Column(db.String(255), nullable=False)
    quantity = db.Column(db.Integer, default=1)
    price = db.Column(db.Float, default=0.0)
    total = db.Column(db.Float, default=0.0)
    
    def to_dict(self):
        return {
            'id': self.id,
            'bill_id': self.bill_id,
            'service_name': self.service_name,
            'price': self.price,
            'total': self.total
        }

class Appointment(db.Model):
    __tablename__ = 'appointments'
    
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patients.id'), nullable=False)
    appointment_datetime = db.Column(db.DateTime, nullable=False)
    alert_datetime = db.Column(db.DateTime, nullable=False)
    
    # Scheduled, Completed, Cancelled
    status = db.Column(db.String(50), default='Scheduled')
    
    # Pending, Sent, Failed
    sms_status = db.Column(db.String(50), default='Pending')
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Note: adding a relationship to patient for easy access
    patient_rel = db.relationship('Patient', backref='appointments', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'patient_id': self.patient_id,
            'appointment_datetime': self.appointment_datetime.isoformat() if self.appointment_datetime else None,
            'alert_datetime': self.alert_datetime.isoformat() if self.alert_datetime else None,
            'status': self.status,
            'sms_status': self.sms_status,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class Prescription(db.Model):
    __tablename__ = 'prescriptions'
    
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patients.id'), nullable=True)
    invoice_number = db.Column(db.String(50), unique=True, nullable=False, index=True)
    staff_name = db.Column(db.String(200))
    appointment_date = db.Column(db.String(50))
    date = db.Column(db.String(50))
    
    subtotal = db.Column(db.Float, default=0.0)
    discount_percent = db.Column(db.Float, default=0.0)
    discount_amount = db.Column(db.Float, default=0.0)
    outstanding_amount = db.Column(db.Float, default=0.0)
    grand_total = db.Column(db.Float, default=0.0)
    
    payment_method = db.Column(db.String(100), default="ONLINE BANK TRANSFER")
    payment_datetime = db.Column(db.String(100))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    items = db.relationship('PrescriptionItem', backref='prescription', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'patient_id': self.patient_id,
            'invoice_number': self.invoice_number,
            'staff_name': self.staff_name,
            'appointment_date': self.appointment_date,
            'date': self.date,
            'subtotal': self.subtotal,
            'discount_percent': self.discount_percent,
            'discount_amount': self.discount_amount,
            'outstanding_amount': self.outstanding_amount,
            'grand_total': self.grand_total,
            'payment_method': self.payment_method,
            'payment_datetime': self.payment_datetime,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'items': [item.to_dict() for item in self.items]
        }

class PrescriptionItem(db.Model):
    __tablename__ = 'prescription_items'
    
    id = db.Column(db.Integer, primary_key=True)
    prescription_id = db.Column(db.Integer, db.ForeignKey('prescriptions.id'), nullable=False)
    medicine_name = db.Column(db.String(255), nullable=False)
    quantity = db.Column(db.Integer, default=1)
    price = db.Column(db.Float, default=0.0)
    total = db.Column(db.Float, default=0.0)
    
    def to_dict(self):
        return {
            'id': self.id,
            'prescription_id': self.prescription_id,
            'medicine_name': self.medicine_name,
            'price': self.price,
            'total': self.total
        }

>>>>>>> 21d5d1dd93ec57f1b541daadb89588e7896dc201
