import { Navigate } from "react-router-dom";
import { useAuthUser } from "../store/authstore";

export default function ProtectedRoute({ allowedRoles, children }) {
  const user = useAuthUser();

  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/login" replace />;

  return children;
}