import { Navigate, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { canAccess, ROLE_CONFIG } from "../config/roles";

export function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  if (loading) return <div className="flex min-h-screen items-center justify-center bg-slate-100">Loading TransSafe...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location }} />;
  return children;
}

export function RoleRoute({ children }) {
  const { user } = useAuth();
  const location = useLocation();
  if (!canAccess(user?.role, location.pathname)) {
    return <Navigate to={ROLE_CONFIG[user?.role]?.dashboard || "/"} replace />;
  }
  return children;
}
