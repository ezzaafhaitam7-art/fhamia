import { Navigate } from "react-router-dom";
import { getSession } from "../api";

export default function AdminRoute({ children }) {
  const session = getSession();

  if (!session) return <Navigate to="/login" replace />;
  if (!session.is_admin) return <Navigate to="/dashboard" replace />;

  return children;
}
