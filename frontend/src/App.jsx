import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import DatabasePage from "./pages/DatabasePage";
import PatientDetails from "./pages/PatientDetails";
import AppointmentsPage from "./pages/AppointmentsPage";
import BillingHistoryPage from "./pages/BillingHistoryPage";
import "./index.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/database" element={<DatabasePage />} />
        <Route path="/patient/:patientId" element={<PatientDetails />} />
        <Route path="/appointments" element={<AppointmentsPage />} />
        <Route path="/billing" element={<BillingHistoryPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
