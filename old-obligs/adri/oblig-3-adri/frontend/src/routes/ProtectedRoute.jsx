import { Outlet, Navigate } from "react-router";
import { useAuth } from "../hooks/useAuth.js";

export default function ProtectedRoute() {
    const auth = useAuth();
    const user = auth.user;

    return user ? <Outlet /> : <Navigate to="/login" />; //show page if logged in, else redirect
}

//approach from course material (repo: aliaksem/idg2100-26-lib.app.frontend)
