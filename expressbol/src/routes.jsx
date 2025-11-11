import { Route, Routes, Navigate } from "react-router-dom";
import CheckInPage from "./pages/CheckInPage.jsx";
import SignaturePage from "./pages/SignaturePage.jsx";
import StatusPage from "./pages/StatusPage.jsx";
import LogInPage from "./pages/Login.jsx";
import Layout from "./Layout.jsx";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LogInPage />} />
       <Route path="/admin-login" element={<LogInPage />} />
      <Route path="/admin/*" element={<Layout/>} />
      <Route path="/status/:appointmentId" element={<StatusPage />} />
      <Route path="/sign/:appId" element={<SignaturePage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
