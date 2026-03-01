# Dental System — Backend

# Dental System — Backend

Flask REST API and **agentic workflow** for the Clinical Assistant: document parsing, vitals, family history, medical images, teeth (dental) annotations, AI chatbot, and billing integration. Uses SQLAlchemy (SQLite by default) and a Master Agent that orchestrates specialist agents.

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| **Flask 3** | Web framework |
| **Flask-CORS** | Cross-origin for frontend |
| **Flask-SQLAlchemy** | ORM and DB setup |
| **python-dotenv** | Env from `.env` |
| **PyPDF2, pdf2image, pytesseract, Pillow** | Document and image processing |
| **google-generativeai** | Chatbot (Gemini API); set `GEMINI_API_KEY` in `.env` |

---

## Project Structure

```
backend/
├── agents/
│   ├── __init__.py
│   ├── master_agent.py      # Orchestrates sub-agents
│   ├── document_agent.py    # PDF/TXT/image parsing, OCR
│   ├── vitals_agent.py      # Validate and store vitals
│   ├── family_history_agent.py
│   ├── image_agent.py       # Validate and store medical images
│   ├── teeth_agent.py       # Tooth conditions (root, cavity, both)
│   └── chatbot_agent.py     # AI answers using patient context
├── instance/                 # SQLite DB (created at runtime)
├── uploads/                  # documents/, images/ (created at runtime)
├── app.py                    # Flask app and routes
├── config.py                 # Config from env
├── database.py               # Models: Patient, Document, Vital, etc.
├── requirements.txt
└── README.md
```

---

## Setup

### 1. Virtual environment

```bash
cd backend
python -m venv venv

# Windows:
venv\Scripts\activate

# macOS/Linux:
source venv/bin/activate
```

### 2. Dependencies

```bash
pip install -r requirements.txt
```

### 3. Tesseract (for document OCR)

- **Windows:** [Tesseract installer](https://github.com/UB-Mannheim/tesseract/wiki)
- **macOS:** `brew install tesseract`
- **Linux:** `sudo apt-get install tesseract-ocr`

### 4. Run

```bash
python app.py
```

Runs at **http://localhost:5000** (debug).  
On startup: `db.create_all()`, `uploads/` and `uploads/documents`, `uploads/images` are created.

---

## Environment

| Variable | Description | Default |
|----------|-------------|---------|
| `SECRET_KEY` | Flask secret | `dev-secret-key-change-in-production` |
| `DATABASE_URL` | SQLAlchemy URI | `sqlite:///clinical_assistant.db` |
| `GEMINI_API_KEY` | Google Gemini API key for chatbot | — (chatbot uses fallback if unset) |

Create `.env` in `backend/` if you need to override. `config.py` uses `python-dotenv`. Get a free API key at [Google AI Studio](https://aistudio.google.com/app/apikey).

---

## Database Models

- **Patient** — `id`, `reference_number`, `name`, `created_at`, `updated_at`
- **Document** — `patient_id`, `filename`, `file_path`, `parsed_text`, `document_type`, `uploaded_at`
- **Vital** — `patient_id`, temperature, weight, height, BP, heart rate, respiratory rate, SpO₂, `recorded_at`
- **FamilyHistory** — `patient_id`, `condition`, `relation`, `age_of_onset`, `notes`, `recorded_at`
- **MedicalImage** — `patient_id`, `filename`, `file_path`, `image_type`, `description`, `uploaded_at`
- **DentalAssessment** — `patient_id`, `tooth_id`, `condition` (root/cavity/both), `updated_at`; unique per `(patient_id, tooth_id)`
- **Bill** — `patient_id`, `invoice_number`, `staff_name`, `appointment_date`, subtotals/totals, `payment_method`, `created_at`
- **BillItem** — `bill_id`, `service_name`, `quantity`, `price`, `total`

---

## API Endpoints

### System

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | `{"status": "backend running"}` |
| `/api/agents/status` | GET | Status of master + document, vitals, family_history, chatbot, image, teeth |

### Patients

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/patients` | GET | List all patients |
| `/api/patients` | POST | Create (JSON: `name`, optional `reference_number`) |
| `/api/patients/<id>` | GET | Get one patient |
| `/api/patients/<id>/context` | GET | Full context for chatbot (docs, vitals, family, etc.) |

### Documents

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/patients/<id>/documents` | GET | List documents |
| `/api/patients/<id>/documents` | POST | `multipart/form-data`: `file`, `document_type` (default "Medical Report") |

### Vitals

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/patients/<id>/vitals` | GET | List vitals |
| `/api/patients/<id>/vitals` | POST | JSON: temperature, weight, height, blood_pressure_systolic/diastolic, heart_rate, respiratory_rate, oxygen_saturation |

### Family History

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/patients/<id>/family-history` | GET | List entries |
| `/api/patients/<id>/family-history` | POST | JSON: `condition`, `relation`, `age_of_onset`, `notes` |

### Images

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/patients/<id>/images` | GET | List images |
| `/api/patients/<id>/images` | POST | `multipart/form-data`: `file`, `image_type`, `description` |

### Teeth

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/patients/<id>/teeth` | GET | `{ tooth_id: condition, ... }` |
| `/api/patients/<id>/teeth` | POST | JSON: `tooth_id`, `condition` (`"root"`, `"cavity"`, `"both"`, or `""` to clear) |

### Chatbot

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/patients/<id>/chat` | POST | JSON: `question` → `{ question, response, patient_context_used }` |

### Billing

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/bills` | POST | Save a new bill and its items |
| `/api/patients/<id>/bills` | GET | List bills for a patient |

### Static

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/uploads/<path>` | GET | Serve files from `uploads/` |

---

## Agents

- **Master Agent** — `get_patient_context()`, `get_agent(name)`
- **Document Agent** — `parse_document()`, `store_document()`; PDF, TXT, images; OCR via Tesseract
- **Vitals Agent** — `validate_vitals()`, `store_vitals()`
- **Family History Agent** — `validate_family_history()`, `store_family_history()`
- **Image Agent** — `validate_image()`, `process_image()`, `store_image()`; PNG, JPG, DICOM
- **Teeth Agent** — `get_teeth()`, `update_tooth_condition()`; `tooth_id` (e.g. `t1`–`t32`), `condition`: root/cavity/both or empty
- **Chatbot Agent** — `generate_response(question, context)`; uses patient context; can use local transformers or fallback

---

## File Uploads

- **Config:** `UPLOAD_FOLDER='uploads'`, `MAX_CONTENT_LENGTH=16MB`
- **Document types:** `pdf`, `txt`, `png`, `jpg`, `jpeg`, `dicom`, `dcm`
- **Paths:** `uploads/documents/`, `uploads/images/`; filenames prefixed with `YYYYMMDD_HHMMSS_`

---

## Production Notes

- Set `SECRET_KEY` and, if needed, `DATABASE_URL` (e.g. PostgreSQL).
- Run with a WSGI server (e.g. Gunicorn): `gunicorn -w 4 -b 0.0.0.0:5000 app:app`
- Ensure `uploads/` is writable and, if applicable, served or proxied for `/uploads/`.
- For OCR, Tesseract must be installed and on `PATH` where the app runs.

---

## License

Proprietary / Internal use.
