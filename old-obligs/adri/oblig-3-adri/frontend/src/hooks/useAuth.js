import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext.js";

export function useAuth() {
    return useContext(AuthContext); //shortcut to access auth state anywhere
}

//approach from course material (repo: aliaksem/idg2100-26-lib.app.frontend)
