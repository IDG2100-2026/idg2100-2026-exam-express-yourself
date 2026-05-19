import { useState } from "react";
import { AuthContext } from "../contexts/AuthContext.js";

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null); //null = no one is logged in

    function login(userData) {
        setUser(userData); //store user object from the backend response
    }

    function logout() {
        setUser(null); //clear user on logout
    }

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children} {/*renders entire app inside the provider*/}
        </AuthContext.Provider>
    );
}

//approach from course material (repo: aliaksem/idg2100-26-lib.app.frontend)