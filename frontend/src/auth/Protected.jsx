import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function Protected({ children, requireAdmin = false }) {
  const auth = useAuth();

  if (!auth.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !auth.isAdmin()) {
    return <Navigate to="/" replace />;
  }

  return children;
}
