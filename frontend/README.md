# Dental System — Frontend

# Dental System — Frontend

React frontend for the **Clinical Assistant** application. It provides the dashboard, patient management, and UIs for documents, vitals, family history, images, teeth annotations, the medical chatbot, and billing invoices.

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| **React 19** | UI and state |
| **Vite 7** | Build tool and dev server |
| **React Router 7** | Routing |
| **Axios** | HTTP (used where applicable) |

---

## Project Structure

```
frontend/
├── public/              # Static assets
├── src/
│   ├── assets/          # Images, etc.
│   ├── components/      # Reusable components
│   ├── pages/           # Route pages
│   │   ├── Dashboard.jsx
│   │   ├── DatabasePage.jsx
│   │   ├── PatientDetails.jsx
│   │   ├── AppointmentsPage.jsx
│   │   ├── BillingHistoryPage.jsx
│   │   └── AuthPage.jsx
│   ├── styles/          # CSS
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── vite.config.js
├── package.json
└── README.md
```

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (default: http://localhost:5173) |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

---

## Setup

```bash
npm install
npm run dev
```

The app expects the **clinical Flask backend** at **http://localhost:5000**.  
`API_BASE` is set to `http://localhost:5000/api` in the page components.

If you add authenticated endpoints to the React app, you can also call the **FastAPI auth service** running at **http://localhost:8000** for:

- `/auth/login` — obtain a JWT (`access_token`)
- `/auth/me` — fetch current user
- other `/users/*` endpoints (admin/doctor only)

Store the `access_token` in memory or secure storage and send it as:

```text
Authorization: Bearer <access_token>
```

---

## Routes

| Path | Page | Description |
|------|------|-------------|
| `/` | Dashboard | Create patient, list patients, analytics, quick actions |
| `/database` | DatabasePage | Grid view of all patients, delete & drill-down |
| `/patient/:patientId` | PatientDetails | Tabs: Documents, Vitals, Family History, Images, Teeth X-Ray, Billing, Chatbot, Appointments |
| `/appointments` | AppointmentsPage | Overview of all appointments across patients |
| `/billing` | BillingHistoryPage | Overview of all bills across patients |
| `/login` | AuthPage | Login / first-admin signup, integrated with FastAPI auth API |

---

## Main Features

- **Dashboard**
  - Create patient (name, optional reference number)
  - List patients (cards); click to open PatientDetails
  - Agent cards (informational; full use is in PatientDetails)

- **PatientDetails**
  - **Documents** — Upload PDF/TXT/images; list parsed documents
  - **Vitals** — Form for vitals; list past records
  - **Family History** — Form (condition, relation, age of onset, notes); list entries
  - **Images** — Upload PNG/JPG/DICOM; list with type and description
  - **Teeth X-Ray** — 32-tooth SVG; click to set root/cavity/both or clear
  - **Billing** — Dynamic invoice generator; add services, apply discounts, save to DB, print to PDF
  - **Chatbot** — Chat input; answers use patient context from the backend

---

## API Base URL

API calls for clinical data use `http://localhost:5000/api`. To change it, update `API_BASE` in:

- `src/pages/Dashboard.jsx`
- `src/pages/PatientDetails.jsx`

For any future auth-aware components, consider exposing an `AUTH_BASE` (e.g. `http://localhost:8000`) via `import.meta.env` and using it for `/auth/*` and `/users/*` routes.

For production, use env or build-time config (e.g. Vite `import.meta.env`) for both `API_BASE` and any `AUTH_BASE` you introduce.

---

## Build & Deploy

```bash
npm run build
```

Output is in `dist/`. Serve with any static host. Ensure the backend is reachable at the URL used for `API_BASE`.

---

## Linting

```bash
npm run lint
```

Uses ESLint with React-related rules from `eslint.config.js`.
