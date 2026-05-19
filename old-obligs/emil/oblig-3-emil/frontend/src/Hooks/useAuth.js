import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";

export const useAuth = () => useContext(AuthContext); // Custom hook to make it cleaner so we don't have to use 2 imports every place we need to use this
// It returns that the Provider is giving, the user object, the login function and logout function