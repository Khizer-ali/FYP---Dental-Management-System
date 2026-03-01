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
│   │   └── PatientDetails.jsx
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

The app expects the backend at **http://localhost:5000**.  
`API_BASE` is set to `http://localhost:5000/api` in the page components.

---

## Routes

| Path | Page | Description |
|------|------|-------------|
| `/` | Dashboard | Create patient, list patients, agent cards |
| `/patient/:patientId` | PatientDetails | Tabs: Documents, Vitals, Family History, Images, Teeth X-Ray, Billing, Chatbot |

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

API calls use `http://localhost:5000/api`. To change it, update `API_BASE` in:

- `src/pages/Dashboard.jsx`
- `src/pages/PatientDetails.jsx`

For production, use env or build-time config (e.g. Vite `import.meta.env`).

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
