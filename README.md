<<<<<<< HEAD
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

## Deployment using Docker (Step-by-Step for Beginners)

We have set up this project to use **Docker**, which makes deploying the application very simple. Think of Docker as a magic box that contains everything your application needs to run, so you don't have to install coding tools or databases directly on your computer or server.

Follow these simple steps to get your Dental Management System live:

### Step 1: Install Docker

**For Windows:**
1. Download [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop/).
2. Run the installer and follow the on-screen instructions.
3. Once installed, open the "Docker Desktop" application. Make sure it says "Running" in the bottom left corner. (You may need to enable WSL2 in Windows if prompted).

**For Linux (Ubuntu/Debian):**
1. Open your terminal.
2. Run the following command to install Docker and Docker Compose:
    ```bash
    sudo apt update
    sudo apt install -y docker.io docker-compose
    ```

**For Linux (Arch/Manjaro):**
1. Open your terminal.
2. Run the following command to install Docker and Docker Compose:
    ```bash
    sudo pacman -Syu docker docker-compose
    sudo systemctl start docker
    sudo systemctl enable docker
    ```
3. Add your user to the docker group (optional but recommended, so you don't have to type `sudo` every time):
    ```bash
    sudo usermod -aG docker $USER
    ```
    *(Note: You will need to log out and log back in for this to take effect).*

### Step 2: Open Your Project
Open a terminal (or command prompt/PowerShell on Windows) and navigate to the folder where this project is located. 
```bash
cd path/to/FYP---Dental-Management-System
```

### Step 3: Set up your Secret Keys
The system needs a few secret keys to work securely (like passwords). We store these in a file called `.env`.
1. Look for a file named `.env.example` in the project folder.
2. Make a copy of it and rename the copy to exactly `.env`.
3. Open the new `.env` file in any text editor (like Notepad) and fill in the values:
   *   `SECRET_KEY`: Type any random mix of letters and numbers (e.g., `my-super-secret-key-1234`). This keeps user sessions secure.
   *   `GEMINI_API_KEY`: Paste your Google Gemini API key here (the one that looks like `AIzaSy...`).
   *   Save and close the file.

### Step 4: Start the Application!
Now comes the magic part. In your terminal, while inside the project folder, run the startup command:

**For Windows (using PowerShell or Command Prompt):**
```cmd
docker-compose up --build -d
```
*(Or if you use newer Docker Desktop: `docker compose up --build -d`)*

**For Linux:**
```bash
sudo docker-compose up --build -d
```

**What is happening?**
Docker is reading the instructions we created and is automatically downloading Python, Node.js, the web server, and all the required tools. It is building your application and turning it on in the background. This might take a few minutes the first time.

### Step 5: Access Your Live Application
Once the terminal finishes and gives you control back, your application is officially running!
*   Open your web browser (Chrome, Safari, Edge, etc.).
*   Type `http://localhost` into the address bar and press Enter.
*   You should now see the login page of your Dental Management System!

### Step 6: How to Stop the Application
If you ever need to turn the system off, simply go back to your terminal, make sure you are in the project folder, and type:

**For Windows:**
```cmd
docker-compose down
```

**For Linux:**
```bash
sudo docker-compose down
```

This safely shuts down the application. Don't worry, your data (like patient records and uploaded files) is saved automatically in the `data` and `backend/uploads` folders, so nothing will be lost when you start it up again!

---

## License

Proprietary / Internal use.
=======
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
>>>>>>> 21d5d1dd93ec57f1b541daadb89588e7896dc201
