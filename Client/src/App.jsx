import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Patients from "./pages/Patients";
import Appointments from "./pages/Appointments";
import Profile from "./pages/Profile";
import Unauthorized from "./pages/Unautharized";
import ProtectedRoute from "./components/ProtectedRoutes";
import Sidebar from "./components/Sidebar";
import Prescriptions from "./pages/Prescriptions";
import Analytics from "./pages/Analytics";
import Access from "./pages/Access";
import AuthRedirect from "./components/AuthRedirect"; // import the redirector

function Layout() {
  const location = useLocation();
  const hideSidebar = location.pathname === "/login";

  return (
    <div className="flex min-h-screen">
      {!hideSidebar && <Sidebar />}
      <main className="flex-1">
        <Routes>
          {/* ... your routes ... */}
          <Route path="/" element={<AuthRedirect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={
            <ProtectedRoute allowedRoles={["admin", "provider", "patient"]}>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/access" element={
            <ProtectedRoute allowedRoles={["admin", "patient"]}>
              <Access />
            </ProtectedRoute>
          } />
          <Route path="/patients" element={
            <ProtectedRoute allowedRoles={["admin", "provider"]}>
              <Patients />
            </ProtectedRoute>
          } />
          <Route path="/appointments" element={
            <ProtectedRoute allowedRoles={["admin", "provider", "patient"]}>
              <Appointments />
            </ProtectedRoute>
          } />
          <Route path="/prescriptions" element={
            <ProtectedRoute allowedRoles={["admin", "provider", "patient"]}>
              <Prescriptions />
            </ProtectedRoute>
          } />
          <Route path="/analytics" element={
            <ProtectedRoute allowedRoles={["admin", "provider"]}>
              <Analytics />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute allowedRoles={["admin", "provider", "patient"]}>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="*" element={<AuthRedirect />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}
