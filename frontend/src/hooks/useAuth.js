import { useContext } from "react";
import { AuthContext } from "../contexts/auth-context.js";

export const useAuth = () => useContext(AuthContext);
