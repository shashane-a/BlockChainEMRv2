import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx"; 

export default function Sidebar() {
  const { auth, logout } = useAuth();

  return (
    <aside className="w-60 bg-[#3F72AF]/30 p-6 flex flex-col h-screen">
      <h2 className="text-5xl font-bold text-center mb-8 text-[#112D4E]">Medix</h2>
      <nav className="flex flex-col gap-4 flex-grow">
        {/* Show dashboard link for all roles */}
        {["admin", "provider", "patient"].includes(auth.role) && (
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `block py-2 px-4 rounded ${isActive ? "bg-[#3F72AF] text-white font-semibold text-sm" : "bg-[#DBE2EF]/40 font-semibold text-sm"}`
            }
          >
            Dashboard
          </NavLink>
        )}
        {["admin", "patient"].includes(auth.role) && (
          <NavLink
            to="/access"
            className={({ isActive }) =>
              `block py-2 px-4 rounded ${isActive ? "bg-[#3F72AF] text-white font-semibold text-sm" : "bg-[#DBE2EF]/40 font-semibold text-sm"}` 
            }
          >
            Manage Access
          </NavLink>
        )}
        {["admin", "provider"].includes(auth.role) && (
          <NavLink
            to="/patients"
            className={({ isActive }) =>
              `block py-2 px-4 rounded ${isActive ? "bg-[#3F72AF] text-white font-semibold text-sm" : "bg-[#DBE2EF]/40 font-semibold text-sm"}` 
            }
          >
            Patients
          </NavLink>
        )}
        {["admin", "provider", "patient"].includes(auth.role) && (
          <NavLink
            to="/appointments"
            className={({ isActive }) =>
              `block py-2 px-4 rounded ${isActive ? "bg-[#3F72AF] text-white font-semibold text-sm" : "bg-[#DBE2EF]/40 font-semibold text-sm"}` 
            }
          >
            Appointments
          </NavLink>
        )}
        {["admin", "provider", "patient"].includes(auth.role) && (
          <NavLink
            to="/prescriptions"
            className={({ isActive }) =>
              `block py-2 px-4 rounded ${isActive ? "bg-[#3F72AF] text-white font-semibold text-sm" : "bg-[#DBE2EF]/40 font-semibold text-sm"}` 
            }
          >
            Prescriptions
          </NavLink>
        )}
        {["admin", "provider"].includes(auth.role) && (
          <NavLink
            to="/analytics"
            className={({ isActive }) =>
              `block py-2 px-4 rounded ${isActive ? "bg-[#3F72AF] text-white font-semibold text-sm" : "bg-[#DBE2EF]/40 font-semibold text-sm"}` 
            }
          >
            Analytics
          </NavLink>
        )}
        {["admin", "provider", "patient"].includes(auth.role) && (
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `block py-2 px-4 rounded ${isActive ? "bg-[#3F72AF] text-white font-semibold text-sm" : "bg-[#DBE2EF]/40 font-semibold text-sm"}` 
            }
          >
            Profile
          </NavLink>
        )}
        {/* Login link should still be part of the main nav */}
        {!auth.accessToken && (
          <NavLink
            to="/login"
            className={({ isActive }) =>
              `block py-2 px-4 rounded ${isActive ? "bg-[#3F72AF] text-white font-semibold text-sm" : "bg-[#DBE2EF]/40 font-semibold text-sm"}`
            }
          >
            Login
          </NavLink>
        )}
      </nav>
      
      {/* Logout button at the bottom of sidebar */}
      {auth.accessToken && (
        <div className="mt-auto pt-4">
          <button
            onClick={logout}
            className="block w-full py-2 px-4 rounded bg-[#cc6f6f] text-white font-semibold text-sm"
          >
            Logout
          </button>
        </div>
      )}
    </aside>
  );
}
