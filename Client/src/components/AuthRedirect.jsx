import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

export default function AuthRedirect() {
  const { auth } = useAuth();
  return auth.accessToken
    ? <Navigate to="/dashboard" />
    : <Navigate to="/login" />;
}
