"""
Clinical Assistant Application - Flask Backend
Main application file with API endpoints
"""
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import re

from werkzeug.utils import secure_filename
from datetime import datetime
import uuid
from config import Config
from database import db, User, UserRole, Patient, Document, Vital, FamilyHistory, MedicalImage, DentalAssessment, Bill, BillItem, Appointment, Prescription, PrescriptionItem
from agents.master_agent import MasterAgent
from sms_service import send_sms
from routes.auth_routes import auth_bp
from routes.user_routes import user_bp

from apscheduler.schedulers.background import BackgroundScheduler

app = Flask(__name__)
app.config.from_object(Config)
CORS(app)

# Initialize database
db.init_app(app)

# Initialize master agent
master_agent = MasterAgent()

# Register blueprints
app.register_blueprint(auth_bp)
app.register_blueprint(user_bp)

# Create upload directory
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
os.makedirs(os.path.join(app.config['UPLOAD_FOLDER'], 'documents'), exist_ok=True)
os.makedirs(os.path.join(app.config['UPLOAD_FOLDER'], 'images'), exist_ok=True)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

@app.route('/api/health')
@app.route('/health')
def health():
    return jsonify({
        "status": "backend running",
        "auth_service": "integrated",
        "version": "1.0.0"
    })

@app.route('/api/agents/status')
def agents_status():
    """Get status of all agents"""
    status = {
        "master_agent": "initialized",
        "agents": {
            "document": {
                "status": "ready",
                "supported_formats": master_agent.document_agent.supported_formats
            },
            "vitals": {
                "status": "ready",
                "fields": master_agent.vitals_agent.vital_fields
            },
            "family_history": {
                "status": "ready",
                "common_relations": master_agent.family_history_agent.common_relations
            },
            "chatbot": {
                "status": "ready" if master_agent.chatbot_agent.chatbot else "fallback_mode",
                "model": master_agent.chatbot_agent.model_name if hasattr(master_agent.chatbot_agent, 'model_name') else None
            },
            "image": {
                "status": "ready",
                "supported_formats": master_agent.image_agent.supported_formats
            },
            "teeth": {
                "status": "ready",
                "allowed_conditions": list(master_agent.teeth_agent.allowed_conditions)
            }
        }
    }
    return jsonify(status)


# ==================== API Routes ====================

# Patient Management
@app.route('/api/patients', methods=['GET'])
def get_patients():
    """Get patients, optionally filtered by doctor"""
    doctor_id = request.args.get('doctor_id')
    query = Patient.query
    if doctor_id:
        query = query.filter_by(doctor_id=doctor_id)
    patients = query.all()
    return jsonify([p.to_dict() for p in patients])

@app.route('/api/patients', methods=['POST'])
def create_patient():
    """Create a new patient"""
    data = request.json
    name = data.get('name')
    
    if not name:
        return jsonify({'error': 'Patient name is required'}), 400
    
    # Generate reference number
    ref_number = data.get('reference_number') or f"PAT-{datetime.now().strftime('%Y%m%d')}-{str(uuid.uuid4())[:8].upper()}"
    
    # Check if reference number already exists
    if Patient.query.filter_by(reference_number=ref_number).first():
        ref_number = f"{ref_number}-{str(uuid.uuid4())[:4].upper()}"
    
    phone_number = data.get('phone_number')
    
    # Pakistan Phone Number Validation
    if phone_number:
        # Regex for Pakistan: Mobile (3xx) and Landline codes
        pak_regex = r'^(\+92|92|0|0092)?(3\d{9}|(2[1-2]|25|4[1-2]|4[4,6-8]|5[1-3,5-8]|6[1-8]|7[1,4]|81|91|9[3-4,6])\d{7,8})$'
        if not re.match(pak_regex, phone_number):
            return jsonify({'error': 'Invalid'}), 400

    doctor_id = data.get('doctor_id')

    patient = Patient(reference_number=ref_number, name=name, phone_number=phone_number, doctor_id=doctor_id)
    db.session.add(patient)
    db.session.commit()
    
    return jsonify(patient.to_dict()), 201

@app.route('/api/patients/<int:patient_id>', methods=['GET'])
def get_patient(patient_id):
    """Get single patient details"""
    patient = Patient.query.get_or_404(patient_id)
    return jsonify(patient.to_dict())

@app.route('/api/patients/<int:patient_id>', methods=['DELETE'])
def delete_patient(patient_id):
    """Delete a patient and all their associated records"""
    patient = Patient.query.get_or_404(patient_id)
    try:
        # Delete the patient - cascade should handle associated records
        db.session.delete(patient)
        db.session.commit()
        return jsonify({'message': 'Patient deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/patients/<int:patient_id>/context', methods=['GET'])
def get_patient_context(patient_id):
    """Get full patient context for chatbot"""
    context = master_agent.get_patient_context(patient_id, db.session)
    if not context:
        return jsonify({'error': 'Patient not found'}), 404
    return jsonify(context)

@app.route('/api/patients/<int:patient_id>/visibility', methods=['PATCH'])
def toggle_patient_visibility(patient_id):
    """Toggle a patient's hidden status"""
    patient = Patient.query.get_or_404(patient_id)
    data = request.json
    
    if 'is_hidden' in data:
        patient.is_hidden = bool(data['is_hidden'])
        db.session.commit()
        return jsonify(patient.to_dict()), 200
        
    return jsonify({'error': 'is_hidden field required'}), 400

# Document Agent Routes
@app.route('/api/patients/<int:patient_id>/documents', methods=['POST'])
def upload_document(patient_id):
    """Upload and process medical document"""
    patient = Patient.query.get_or_404(patient_id)
    
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"{timestamp}_{filename}"
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], 'documents', filename)
        file.save(file_path)
        
        # Parse document
        document_agent = master_agent.get_agent('document')
        parsed_text = document_agent.parse_document(file_path, filename)
        
        # Store in database
        document_type = request.form.get('document_type', 'Medical Report')
        doc = document_agent.store_document(
            patient_id, filename, file_path, parsed_text, document_type, db.session
        )
        
        return jsonify(doc), 201
    
    return jsonify({'error': 'Invalid file type'}), 400

@app.route('/api/patients/<int:patient_id>/documents', methods=['GET'])
def get_documents(patient_id):
    """Get all documents for a patient"""
    patient = Patient.query.get_or_404(patient_id)
    return jsonify([doc.to_dict() for doc in patient.documents])

@app.route('/api/documents/<int:doc_id>', methods=['DELETE'])
def delete_document(doc_id):
    """Delete a medical document"""
    doc = Document.query.get_or_404(doc_id)
    try:
        # Also remove the file from filesystem
        if os.path.exists(doc.file_path):
            os.remove(doc.file_path)
        db.session.delete(doc)
        db.session.commit()
        return jsonify({'message': 'Document deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# Vitals Agent Routes
@app.route('/api/patients/<int:patient_id>/vitals', methods=['POST'])
def add_vitals(patient_id):
    """Add vital signs for a patient"""
    patient = Patient.query.get_or_404(patient_id)
    data = request.json
    
    vitals_agent = master_agent.get_agent('vitals')
    
    # Validate
    errors = vitals_agent.validate_vitals(data)
    if errors:
        return jsonify({'error': 'Validation failed', 'errors': errors}), 400
    
    # Store
    vital = vitals_agent.store_vitals(patient_id, data, db.session)
    return jsonify(vital), 201

@app.route('/api/patients/<int:patient_id>/vitals', methods=['GET'])
def get_vitals(patient_id):
    """Get all vital signs for a patient"""
    patient = Patient.query.get_or_404(patient_id)
    return jsonify([v.to_dict() for v in patient.vitals])

# Family History Agent Routes
@app.route('/api/patients/<int:patient_id>/family-history', methods=['POST'])
def add_family_history(patient_id):
    """Add family history for a patient"""
    patient = Patient.query.get_or_404(patient_id)
    data = request.json
    
    family_history_agent = master_agent.get_agent('family_history')
    
    # Validate
    errors = family_history_agent.validate_family_history(data)
    if errors:
        return jsonify({'error': 'Validation failed', 'errors': errors}), 400
    
    # Store
    fh = family_history_agent.store_family_history(patient_id, data, db.session)
    return jsonify(fh), 201

@app.route('/api/patients/<int:patient_id>/family-history', methods=['GET'])
def get_family_history(patient_id):
    """Get all family history for a patient"""
    patient = Patient.query.get_or_404(patient_id)
    return jsonify([fh.to_dict() for fh in patient.family_history])

# Chatbot Agent Routes
@app.route('/api/patients/<int:patient_id>/chat', methods=['POST'])
def chat_with_patient(patient_id):
    """Chat with medical chatbot about patient"""
    data = request.json
    question = data.get('question', '')
    
    if not question:
        return jsonify({'error': 'Question is required'}), 400
    
    # Get patient context
    context = master_agent.get_patient_context(patient_id, db.session)
    if not context:
        return jsonify({'error': 'Patient not found'}), 404
    
    # Generate response
    chatbot_agent = master_agent.get_agent('chatbot')
    response = chatbot_agent.generate_response(question, context)
    
    return jsonify({
        'question': question,
        'response': response,
        'patient_context_used': True
    })

# Image Agent Routes
@app.route('/api/patients/<int:patient_id>/images', methods=['POST'])
def upload_image(patient_id):
    """Upload medical image"""
    patient = Patient.query.get_or_404(patient_id)
    
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"{timestamp}_{filename}"
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], 'images', filename)
        file.save(file_path)
        
        # Process image
        image_agent = master_agent.get_agent('image')
        is_valid, error = image_agent.validate_image(file_path)
        
        if not is_valid:
            os.remove(file_path)
            return jsonify({'error': error}), 400
        
        image_info = image_agent.process_image(file_path)
        
        # Store in database
        image_type = request.form.get('image_type', 'Medical Image')
        description = request.form.get('description', '')
        img = image_agent.store_image(
            patient_id, filename, file_path, image_type, description, db.session
        )
        
        return jsonify(img), 201
    
    return jsonify({'error': 'Invalid file type'}), 400

@app.route('/api/patients/<int:patient_id>/images', methods=['GET'])
def get_images(patient_id):
    """Get all images for a patient"""
    patient = Patient.query.get_or_404(patient_id)
    return jsonify([img.to_dict() for img in patient.images])

@app.route('/api/images/<int:image_id>', methods=['DELETE'])
def delete_image(image_id):
    """Delete a medical image"""
    img = MedicalImage.query.get_or_404(image_id)
    try:
        # Also remove the file from filesystem
        if os.path.exists(img.file_path):
            os.remove(img.file_path)
        db.session.delete(img)
        db.session.commit()
        return jsonify({'message': 'Image deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# Teeth Agent Routes
@app.route('/api/patients/<int:patient_id>/teeth', methods=['GET'])
def get_teeth(patient_id):
    """Get saved tooth conditions and canvas drawing for a patient"""
    patient = Patient.query.get_or_404(patient_id)
    teeth_agent = master_agent.get_agent('teeth')
    records = teeth_agent.get_teeth(patient_id, db.session)
    return jsonify({
        'teeth_data': records,
        'teeth_drawing': patient.teeth_drawing
    })

@app.route('/api/patients/<int:patient_id>/teeth', methods=['POST'])
def update_tooth(patient_id):
    """Create, update, or delete a tooth condition and optionally save the drawing"""
    patient = Patient.query.get_or_404(patient_id)
    data = request.get_json() or {}
    
    # Save base64 drawing if it's sent in the request
    if 'teeth_drawing' in data:
        patient.teeth_drawing = data['teeth_drawing']
        db.session.commit()
    
    # If the request only wanted to save the drawing, it might not have tooth_id
    tooth_id = data.get('tooth_id')
    if not tooth_id:
        return jsonify({'status': 'drawing saved'}), 200
        
    condition = data.get('condition', '')
    
    teeth_agent = master_agent.get_agent('teeth')
    result, status_code = teeth_agent.update_tooth_condition(
        patient_id, tooth_id, condition, db.session
    )
    return jsonify(result), status_code

# Billing Routes
@app.route('/api/bills', methods=['POST'])
def create_bill():
    data = request.json
    try:
        # Cast to int to prevent SQLAlchemy StatementError (Bug 4)
        p_id = int(data.get('patient_id'))
        
        bill = Bill(
            patient_id=p_id,
            invoice_number=data.get('invoice_number'),
            staff_name=data.get('staff_name'),
            appointment_date=data.get('appointment_date'),
            date=data.get('date'),
            subtotal=data.get('subtotal'),
            discount_percent=data.get('discount_percent'),
            discount_amount=data.get('discount_amount'),
            outstanding_amount=data.get('outstanding_amount'),
            grand_total=data.get('grand_total'),
            payment_method=data.get('payment_method'),
            payment_datetime=data.get('payment_datetime')
        )
        db.session.add(bill)
        
        for item in data.get('items', []):
            bill_item = BillItem(
                bill=bill,
                service_name=item.get('service_name'),
                quantity=item.get('quantity'),
                price=item.get('price'),
                total=item.get('total')
            )
            db.session.add(bill_item)
            
        db.session.commit()
        return jsonify(bill.to_dict()), 201
    except (ValueError, TypeError) as e:
        return jsonify({'error': 'Invalid patient_id format. Must be an integer.'}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/bills/<int:bill_id>', methods=['PUT'])
def update_bill(bill_id):
    """Update an existing bill"""
    bill = Bill.query.get_or_404(bill_id)
    data = request.json
    
    try:
        bill.staff_name = data.get('staff_name', bill.staff_name)
        bill.appointment_date = data.get('appointment_date', bill.appointment_date)
        bill.date = data.get('date', bill.date)
        bill.subtotal = float(data.get('subtotal', bill.subtotal))
        bill.discount_percent = float(data.get('discount_percent', bill.discount_percent))
        bill.discount_amount = float(data.get('discount_amount', bill.discount_amount))
        bill.outstanding_amount = float(data.get('outstanding_amount', bill.outstanding_amount))
        bill.grand_total = float(data.get('grand_total', bill.grand_total))
        bill.payment_method = data.get('payment_method', bill.payment_method)
        bill.payment_datetime = data.get('payment_datetime', bill.payment_datetime)
        
        # Update items
        if 'items' in data:
            # Simple approach: delete existing items and add new ones
            for item in bill.items:
                db.session.delete(item)
            
            for item_data in data['items']:
                item = BillItem(
                    bill_id=bill.id,
                    service_name=item_data.get('service_name', ''),
                    quantity=int(item_data.get('quantity', 1)),
                    price=float(item_data.get('price', 0)),
                    total=float(item_data.get('total', 0))
                )
                db.session.add(item)
        
        db.session.commit()
        return jsonify(bill.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@app.route('/api/prescriptions', methods=['POST'])
def create_prescription():
    data = request.json
    try:
        # Cast to int to prevent SQLAlchemy StatementError (Bug 4)
        p_id = int(data.get('patient_id'))
        
        presc = Prescription(
            patient_id=p_id,
            invoice_number=data.get('invoice_number'),
            staff_name=data.get('staff_name'),
            appointment_date=data.get('appointment_date'),
            date=data.get('date'),
            subtotal=float(data.get('subtotal', 0.0)),
            discount_percent=float(data.get('discount_percent', 0.0)),
            discount_amount=float(data.get('discount_amount', 0.0)),
            outstanding_amount=float(data.get('outstanding_amount', 0.0)),
            grand_total=float(data.get('grand_total', 0.0)),
            payment_method=data.get('payment_method', 'ONLINE BANK TRANSFER'),
            payment_datetime=data.get('payment_datetime')
        )
        db.session.add(presc)
        
        for item in data.get('items', []):
            p_item = PrescriptionItem(
                prescription=presc,
                medicine_name=item.get('medicine_name'),
                quantity=int(item.get('quantity', 1)),
                price=float(item.get('price', 0.0)),
                total=float(item.get('total', 0.0))
            )
            db.session.add(p_item)
            
        db.session.commit()
        return jsonify(presc.to_dict()), 201
    except (ValueError, TypeError) as e:
        return jsonify({'error': 'Invalid patient_id format.'}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/prescriptions/<int:prescription_id>', methods=['PUT'])
def update_prescription(prescription_id):
    """Update an existing prescription"""
    prescription = Prescription.query.get_or_404(prescription_id)
    data = request.json
    
    try:
        prescription.staff_name = data.get('staff_name', prescription.staff_name)
        prescription.appointment_date = data.get('appointment_date', prescription.appointment_date)
        prescription.date = data.get('date', prescription.date)
        prescription.subtotal = float(data.get('subtotal', prescription.subtotal))
        prescription.discount_percent = float(data.get('discount_percent', prescription.discount_percent))
        prescription.discount_amount = float(data.get('discount_amount', prescription.discount_amount))
        prescription.outstanding_amount = float(data.get('outstanding_amount', prescription.outstanding_amount))
        prescription.grand_total = float(data.get('grand_total', prescription.grand_total))
        prescription.payment_method = data.get('payment_method', prescription.payment_method)
        prescription.payment_datetime = data.get('payment_datetime', prescription.payment_datetime)
        
        # Update items
        if 'items' in data:
            # Delete existing items and add new ones
            for item in prescription.items:
                db.session.delete(item)
            
            for item_data in data['items']:
                item = PrescriptionItem(
                    prescription_id=prescription.id,
                    medicine_name=item_data.get('medicine_name', ''),
                    quantity=int(item_data.get('quantity', 1)),
                    price=float(item_data.get('price', 0)),
                    total=float(item_data.get('total', 0))
                )
                db.session.add(item)
        
        db.session.commit()
        return jsonify(prescription.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@app.route('/api/patients/<int:patient_id>/prescriptions', methods=['GET'])
def get_patient_prescriptions(patient_id):
    """Get all prescriptions for a patient"""
    Patient.query.get_or_404(patient_id) # Ensure patient exists
    prescriptions = Prescription.query.filter_by(patient_id=patient_id).order_by(Prescription.created_at.desc()).all()
    return jsonify([p.to_dict() for p in prescriptions])

@app.route('/api/patients/<int:patient_id>/bills', methods=['GET'])
def get_patient_bills(patient_id):
    """Get all bills for a patient"""
    Patient.query.get_or_404(patient_id) # Ensure patient exists
    bills = Bill.query.filter_by(patient_id=patient_id).order_by(Bill.created_at.desc()).all()
    return jsonify([bill.to_dict() for bill in bills])

# Appointment Routes
@app.route('/api/patients/<int:patient_id>/appointments', methods=['POST'])
def create_appointment(patient_id):
    """Schedule a new appointment for a patient"""
    patient = Patient.query.get_or_404(patient_id)
    data = request.json
    
    app_dt_str = data.get('appointment_datetime')
    alert_dt_str = data.get('alert_datetime')
    
    if not app_dt_str or not alert_dt_str:
        return jsonify({'error': 'appointment_datetime and alert_datetime are required'}), 400
        
    try:
        app_dt = datetime.fromisoformat(app_dt_str.replace('Z', '+00:00'))
        alert_dt = datetime.fromisoformat(alert_dt_str.replace('Z', '+00:00'))
        
        appointment = Appointment(
            patient_id=patient.id,
            appointment_datetime=app_dt,
            alert_datetime=alert_dt,
            status='Scheduled',
            sms_status='Pending'
        )
        db.session.add(appointment)
        db.session.commit()
        return jsonify(appointment.to_dict()), 201
    except ValueError as e:
        return jsonify({'error': f'Invalid datetime format. Please use ISO 8601 string. {str(e)}'}), 400

@app.route('/api/patients/<int:patient_id>/appointments', methods=['GET'])
def get_appointments(patient_id):
    """Get all appointments for a patient"""
    Patient.query.get_or_404(patient_id)
    appointments = Appointment.query.filter_by(patient_id=patient_id).order_by(Appointment.appointment_datetime.asc()).all()
    return jsonify([appt.to_dict() for appt in appointments])

@app.route('/api/appointments/<int:appointment_id>', methods=['PUT'])
def update_appointment(appointment_id):
    """Update an existing appointment"""
    appointment = Appointment.query.get_or_404(appointment_id)
    data = request.json
    
    app_dt_str = data.get('appointment_datetime')
    alert_dt_str = data.get('alert_datetime')
    status = data.get('status')
    
    try:
        if app_dt_str:
            appointment.appointment_datetime = datetime.fromisoformat(app_dt_str.replace('Z', '+00:00'))
        if alert_dt_str:
            appointment.alert_datetime = datetime.fromisoformat(alert_dt_str.replace('Z', '+00:00'))
        if status:
            appointment.status = status
            
        db.session.commit()
        return jsonify(appointment.to_dict()), 200
    except ValueError as e:
        return jsonify({'error': f'Invalid datetime format: {str(e)}'}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/appointments/<int:appointment_id>', methods=['DELETE'])
def delete_appointment(appointment_id):
    """Delete an existing appointment"""
    appointment = Appointment.query.get_or_404(appointment_id)
    try:
        db.session.delete(appointment)
        db.session.commit()
        return jsonify({'message': 'Appointment deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/analytics/patient-trends', methods=['GET'])
def patient_trends():
    """Return daily patient registration counts for the last 30 days"""
    from datetime import timedelta
    days_back = int(request.args.get('days', 30))
    doctor_id = request.args.get('doctor_id')
    end_date = datetime.utcnow().date()
    start_date = end_date - timedelta(days=days_back - 1)

    # Build a map of date -> count for patients
    query = Patient.query.filter(db.func.date(Patient.created_at) >= start_date)
    if doctor_id:
        query = query.filter_by(doctor_id=doctor_id)
    
    patients_all = query.all()

    counts = {}
    for p in patients_all:
        day_str = p.created_at.date().isoformat()
        counts[day_str] = counts.get(day_str, 0) + 1

    # Fill in all days (even empty ones)
    result = []
    for i in range(days_back):
        day = start_date + timedelta(days=i)
        day_str = day.isoformat()
        result.append({'date': day_str, 'count': counts.get(day_str, 0), 'day': i + 1})

    return jsonify(result)

@app.route('/api/appointments', methods=['GET'])
def get_all_appointments():
    """Get all appointments, optionally filtered by doctor"""
    doctor_id = request.args.get('doctor_id')
    query = db.session.query(Appointment, Patient).join(Patient)
    
    if doctor_id:
        query = query.filter(Patient.doctor_id == doctor_id)
        
    appointments_list = query.order_by(Appointment.appointment_datetime.asc()).all()
    
    result = []
    for appt, patient in appointments_list:
        appt_dict = appt.to_dict()
        appt_dict['patient_name'] = patient.name
        result.append(appt_dict)
        
    return jsonify(result)

@app.route('/api/analytics/doctor-stats', methods=['GET'])
def get_doctor_stats():
    """Get patient counts for each doctor"""
    doctors = User.query.filter_by(role=UserRole.DOCTOR).all()
    stats = []
    for doc in doctors:
        count = Patient.query.filter_by(doctor_id=doc.id).count()
        stats.append({
            'id': doc.id,
            'name': doc.name,
            'patient_count': count
        })
    return jsonify(stats)

@app.route('/api/bills', methods=['GET'])
def get_all_bills():
    """Get all bills across all patients"""
    bills_list = db.session.query(Bill, Patient).join(Patient).order_by(Bill.created_at.desc()).all()
    
    result = []
    for bill, patient in bills_list:
        bill_dict = bill.to_dict()
        bill_dict['patient_name'] = patient.name
        result.append(bill_dict)
        
    return jsonify(result)

def check_and_send_sms_alerts():
    """Background task to check for pending SMS alerts and send them"""
    with app.app_context():
        now = datetime.utcnow()
        
        # Find all appointments where the alert time has passed and sms_status is still Pending
        pending_alerts = Appointment.query.filter(
            Appointment.alert_datetime <= now,
            Appointment.sms_status == 'Pending'
        ).all()
        
        sent_count = 0
        for appt in pending_alerts:
            patient = Patient.query.get(appt.patient_id)
            if patient and patient.phone_number:
                doctor = User.query.get(patient.doctor_id)
                doctor_name = doctor.name if doctor else "your doctor"
                body = (
                    f"Hello {patient.name}, this is a reminder for your appointment with Dr. {doctor_name} "
                    f"on {appt.appointment_datetime.strftime('%Y-%m-%d')} at {appt.appointment_datetime.strftime('%H:%M')}."
                )
                result = send_sms(patient.phone_number, body)
                if result.ok:
                    appt.sms_status = 'Sent'
                    sent_count += 1
                else:
                    appt.sms_status = f"Failed - {result.provider}: {result.error}"
            else:
                appt.sms_status = 'Failed - No Phone'
        
        db.session.commit()
        return sent_count

# Start background scheduler
scheduler = BackgroundScheduler()
scheduler.add_job(func=check_and_send_sms_alerts, trigger="interval", seconds=60)
scheduler.start()

@app.route('/api/cron/send-sms', methods=['POST'])
def trigger_sms_alerts():
    """Endpoint to manually trigger SMS alerts check"""
    sent_count = check_and_send_sms_alerts()
    return jsonify({'status': 'success', 'alerts_processed': sent_count})

# Serve uploaded files
@app.route('/uploads/<path:filename>')
def uploaded_file(filename):
    """Serve uploaded files"""
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, host='0.0.0.0', port=5000)

