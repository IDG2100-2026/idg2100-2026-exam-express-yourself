import { Outlet, Navigate } from "react-router";
import { useAuth } from "../hooks/useAuth.js";

export default function ProtectedRoute() {
  const { user } = useAuth();
  return user ? <Outlet /> : <Navigate to="/login" />;
}
