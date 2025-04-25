import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx"; 

export default function Sidebar() {
  const { auth, logout } = useAuth();

  return (
    <aside className="w-60 bg-white border-r p-6 flex flex-col gap-6">
      <h2 className="text-xl font-bold mb-8 text-blue-800">Medix App</h2>
      <nav className="flex flex-col gap-4">
        {/* Show dashboard link for all roles */}
        {["admin", "provider", "patient"].includes(auth.role) && (
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `block py-2 px-4 rounded ${isActive ? "bg-blue-200" : ""}`
            }
          >
            Dashboard
          </NavLink>
        )}
        {["admin", "patient"].includes(auth.role) && (
          <NavLink
            to="/access"
            className={({ isActive }) =>
              `block py-2 px-4 rounded ${isActive ? "bg-blue-200" : ""}`
            }
          >
            Manage Access
          </NavLink>
        )}
        {["admin", "provider"].includes(auth.role) && (
          <NavLink
            to="/patients"
            className={({ isActive }) =>
              `block py-2 px-4 rounded ${isActive ? "bg-blue-200" : ""}`
            }
          >
            Patients
          </NavLink>
        )}
        {["admin", "provider", "patient"].includes(auth.role) && (
          <NavLink
            to="/appointments"
            className={({ isActive }) =>
              `block py-2 px-4 rounded ${isActive ? "bg-blue-200" : ""}`
            }
          >
            Appointments
          </NavLink>
        )}
        {["admin", "provider", "patient"].includes(auth.role) && (
          <NavLink
            to="/prescriptions"
            className={({ isActive }) =>
              `block py-2 px-4 rounded ${isActive ? "bg-blue-200" : ""}`
            }
          >
            Prescriptions
          </NavLink>
        )}
        {["admin", "provider"].includes(auth.role) && (
          <NavLink
            to="/analytics"
            className={({ isActive }) =>
              `block py-2 px-4 rounded ${isActive ? "bg-blue-200" : ""}`
            }
          >
            Analytics
          </NavLink>
        )}
        {["admin", "provider", "patient"].includes(auth.role) && (
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `block py-2 px-4 rounded ${isActive ? "bg-blue-200" : ""}`
            }
          >
            Profile
          </NavLink>
        )}
        {/* Show login/logout based on auth state */}
        {!auth.accessToken && (
          <NavLink
            to="/login"
            className={({ isActive }) =>
              `block py-2 px-4 rounded ${isActive ? "bg-blue-200" : ""}`
            }
          >
            Login
          </NavLink>
        )}
        {auth.accessToken && (
          <button
            onClick={logout}
            className="block py-2 px-4 rounded bg-red-100 text-red-800 mt-6"
          >
            Logout
          </button>
        )}
      </nav>
    </aside>
  );
}
