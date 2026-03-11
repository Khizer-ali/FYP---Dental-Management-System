import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import DatabasePage from "./pages/DatabasePage";
import PatientDetails from "./pages/PatientDetails";
import AppointmentsPage from "./pages/AppointmentsPage";
import BillingHistoryPage from "./pages/BillingHistoryPage";
import AuthPage from "./pages/AuthPage";
import DoctorsPage from "./pages/DoctorsPage";
import RequireAuth from "./components/RequireAuth";
import "./index.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing page = authentication */}
        <Route path="/" element={<AuthPage />} />
        <Route path="/login" element={<Navigate to="/" replace />} />

        {/* Protected app routes */}
        <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
        <Route path="/database" element={<RequireAuth><DatabasePage /></RequireAuth>} />
        <Route path="/patient/:patientId" element={<RequireAuth><PatientDetails /></RequireAuth>} />
        <Route path="/appointments" element={<RequireAuth><AppointmentsPage /></RequireAuth>} />
        <Route path="/billing" element={<RequireAuth><BillingHistoryPage /></RequireAuth>} />
        <Route path="/doctors" element={<RequireAuth><DoctorsPage /></RequireAuth>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
