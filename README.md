# Dental Management System (FYP)

A full-stack Dental/Clinical Assistant system:

- **Frontend**: React (Vite) UI for patients, appointments, billing invoices, and chatbot
- **Backend**: Flask REST API + SQLAlchemy + “agent” modules (documents, vitals, family history, images, teeth, chatbot)

For detailed docs, see:

- `backend/README.md`
- `frontend/README.md`

---

## Quick start (dev)

### Backend (Flask API)

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python app.py
```

Backend runs on `http://localhost:5000`.

### Frontend (React)

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173` (Vite default) and calls the backend at `http://localhost:5000/api`.

---

## Configuration (env vars)

Copy `.env.example` to `backend/.env` and fill what you need:

- `GEMINI_API_KEY`: enables Gemini chatbot
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER`: enables real SMS sending

Optional:

- `GEMINI_MODEL`: override chatbot model (default: `models/gemini-flash-latest`)

---

## How the system works (high level)

### Data flow

1. **Frontend** sends requests to Flask under `/api/*` (and auth under `/auth/*` and `/users/*`)
2. **Flask** routes in `backend/app.py` receive requests and use SQLAlchemy models in `backend/database.py`
3. **MasterAgent** in `backend/agents/master_agent.py` orchestrates specialized agents (documents/vitals/family/images/teeth/chatbot)
4. Responses go back to the frontend; the UI updates local React state

### Database

- SQLite by default (configurable via `DATABASE_URL`)
- Tables are created on startup via `db.create_all()` in `backend/app.py`

### Auth

- Endpoints live in `backend/routes/auth_routes.py` and `backend/routes/user_routes.py`
- JWT helpers + password hashing live in `backend/auth_utils.py`

### Billing

- Frontend billing UI is on the **Billing tab** in `frontend/src/pages/PatientDetails.jsx`
- Backend persistence is in `backend/app.py` (bill creation) + models in `backend/database.py` (`Bill`, `BillItem`)

---

## “Where do I change X?” (common edits)

### Frontend UI

- **Patient tabs UI (documents/vitals/images/teeth/billing/chatbot/appointments)**: `frontend/src/pages/PatientDetails.jsx`
- **Dashboard**: `frontend/src/pages/Dashboard.jsx`
- **Billing invoice styling**: `frontend/src/styles/billing.css`
- **Billing procedure dropdown list**: `frontend/src/constants/serviceCatalog.js`

### Backend APIs + logic

- **Main Flask app + routes**: `backend/app.py`
- **DB models**: `backend/database.py`
- **JWT + password**: `backend/auth_utils.py`
- **Auth endpoints**: `backend/routes/auth_routes.py`, `backend/routes/user_routes.py`
- **Agents**: `backend/agents/*`
  - Chatbot config/model: `backend/agents/chatbot_agent.py`
  - Context aggregation: `backend/agents/master_agent.py`

### Chatbot (Gemini)

- Configure keys in `backend/.env`
- Model defaults / overrides in `backend/agents/chatbot_agent.py` (supports `GEMINI_MODEL`)

### SMS (Twilio)

- Env vars in `backend/.env`
- SMS implementation in `backend/sms_service.py`
- Trigger endpoint documented in `backend/README.md` (`/api/cron/send-sms`)

---

## Project structure

```
.
├── backend/                 # Flask API + DB + agents
├── frontend/                # React UI (Vite)
├── .env.example             # Env template (copy to backend/.env)
└── README.md                # This file
```

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
