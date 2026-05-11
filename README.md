# 🦷 FYP Dental Management System

A comprehensive dental practice management solution with AI-powered clinical assistance, automated workflows, and modern web interface.

---

## 🌟 Key Features

### 🤖 AI-Powered Clinical Intelligence
- **Smart Chatbot Assistant**: Google Gemini-powered AI that understands complete patient context (vitals, history, dental records) to provide clinical insights
- **Automated Document Processing**: OCR and AI extraction from medical reports and documents
- **Interactive Dental Chart**: Digital 32-tooth mapping system with condition tracking (cavities, root canals, etc.)
- **Master Agent Orchestration**: Central AI brain coordinating specialized medical data processing agents

### 🏥 Comprehensive Patient Management
- **Electronic Health Records (EHR)**: Complete patient profiles with vitals, medical history, and family history
- **Medical Imaging Repository**: Support for PNG, JPG, and DICOM files with metadata tagging
- **Real-time Vitals Tracking**: Biometric data logging with historical visualization
- **Prescription Management**: Digital prescription creation, storage, and printing with medicine catalog

### 💼 Practice Administration
- **Dynamic Billing System**: Automated invoice generation with procedure catalogs, discounts, and payment tracking
- **Appointment Scheduling**: Calendar-based appointment management with SMS reminders
- **Role-Based Access Control**: Secure multi-user environment (Admin/Doctor roles)
- **SMS Notifications**: Twilio-powered automated alerts and appointment reminders

---

## 🏗️ Technical Architecture

### Backend Stack (Flask + Python)
- **Flask**: REST API framework handling all server-side logic
- **SQLAlchemy**: ORM for database operations with SQLite
- **Google Generative AI**: Gemini integration for AI-powered features
- **JWT Authentication**: Secure token-based authentication with Bcrypt
- **Twilio SMS**: Real-time SMS notifications and reminders

### Frontend Stack (React + Vite)
- **React 19**: Modern UI framework with hooks-based state management
- **Vite**: Fast development and optimized production builds
- **React Router 7**: Client-side routing and navigation
- **Axios**: HTTP client for API communication
- **Custom CSS**: Responsive design with clinical aesthetics

### Database Schema
- **Patients**: Core patient information and demographics
- **Appointments**: Scheduling with SMS integration
- **Prescriptions**: Medicine management with itemized details
- **Bills**: Invoicing with procedure catalogs
- **Medical Records**: Vitals, history, documents, and images
- **Users**: Authentication and role management

---

## 📁 Project Structure

```
FYP---Dental-Management-System/
├── backend/
│   ├── app.py                 # Main Flask application and API routes
│   ├── database.py             # SQLAlchemy models and database schema
│   ├── agents/                 # AI-powered processing agents
│   │   ├── master_agent.py     # Central AI orchestration
│   │   ├── chatbot_agent.py   # Gemini chatbot integration
│   │   └── teeth_agent.py     # Dental chart processing
│   ├── routes/                 # Modular API endpoints
│   │   ├── auth_routes.py      # Authentication logic
│   │   └── user_routes.py     # User management
│   ├── auth_utils.py           # Security utilities (JWT, Bcrypt)
│   ├── sms_service.py         # Twilio SMS integration
│   └── migrate_db.py          # Database migration scripts
├── frontend/
│   ├── src/
│   │   ├── pages/             # Main application pages
│   │   │   ├── PatientDetails.jsx   # 8-tab patient management interface
│   │   │   ├── Dashboard.jsx       # Main dashboard and patient creation
│   │   │   └── AuthPage.jsx       # Login/registration portal
│   │   ├── components/         # Reusable UI components
│   │   │   ├── ToothChart.jsx     # Interactive dental chart
│   │   │   └── Chatbot.jsx       # AI assistant interface
│   │   ├── styles/             # CSS styling files
│   │   │   ├── billing.css       # Invoice and prescription styling
│   │   │   └── main.css         # Global application styles
│   │   └── constants/          # Static data catalogs
│   │       ├── serviceCatalog.js  # Dental procedures and pricing
│   │       └── medicineList.js    # Prescription medication catalog
│   └── package.json           # Frontend dependencies
├── docker-compose.yml          # Container orchestration
└── README.md                 # This documentation
```

---

## 🚀 Quick Start Guide

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ and npm
- Python 3.9+

### Docker Deployment (Recommended)
1. **Clone the repository**:
   ```bash
   git clone https://github.com/Khizer-ali/FYP---Dental-Management-System.git
   cd FYP---Dental-Management-System
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Launch application**:
   ```bash
   docker-compose up --build -d
   ```

4. **Access the system**:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

### Manual Development Setup

#### Backend Setup
```bash
cd backend
pip install -r requirements.txt
python app.py
```

#### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## 💊 Prescription Management

The system includes a comprehensive prescription module with:

- **Medicine Catalog**: Pre-defined list of common dental medications
- **Digital Prescriptions**: Create, edit, and manage patient prescriptions
- **Print-Ready Format**: Optimized prescription templates for printing
- **Billing Integration**: Automatic invoice generation for prescribed medications

### Common Medications Available
| Category | Medication | Form |
|-----------|-------------|-------|
| Antibiotics | Augmentin, Velocef, Vibramycin | Tablets |
| Pain Relief | Panadol, Ansaid | Tablets |
| Supplements | Ca-C 1000 | Effervescent |
| Topical | Dicloran, Removate | Gel |
| Oral Hygiene | Enziclor | Mouthwash |

---

## 🔧 Configuration

### Environment Variables
Create a `.env` file with the following variables:

```env
# Database
DATABASE_URL=sqlite:///clinical_assistant.db

# Google Gemini AI
GOOGLE_API_KEY=your_gemini_api_key_here

# Twilio SMS
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=your_twilio_number

# Application
SECRET_KEY=your_secret_key_here
FLASK_ENV=development
```

---

## 📊 Key Features in Detail

### Patient Management
- Complete patient profiles with demographics
- Medical history tracking
- Family medical history
- Vital signs monitoring
- Document and image storage

### Clinical Tools
- Interactive dental chart with 32 teeth
- Condition tracking (cavities, fillings, root canals)
- AI-powered clinical assistance
- Prescription writing and management

### Administrative Functions
- Automated billing and invoicing
- Appointment scheduling with reminders
- SMS notifications for appointments
- Role-based access control
- Comprehensive reporting

---

## 🤝 Contributing

This is a Final Year Project (FYP) developed for educational purposes. The system demonstrates modern web development practices, AI integration, and healthcare application design.

---

## 📄 License

Proprietary software for educational use only.

Developed with ❤️ for the dental community.
