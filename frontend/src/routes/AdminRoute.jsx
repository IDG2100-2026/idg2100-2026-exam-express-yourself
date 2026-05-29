import { Outlet, Navigate } from "react-router";
import { useAuth } from "../hooks/useAuth.js";

export default function AdminRoute() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (user.role !== "admin") return <Navigate to="/" />;
  return <Outlet />;
}
