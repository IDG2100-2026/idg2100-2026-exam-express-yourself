import { useState } from "react";
import { AuthContext } from "../contexts/AuthContext";

export const AuthProvider = ({children}) => {
    const [ user, setUser ] = useState(() => {
        const savedUser = localStorage.getItem("user");
        return savedUser ? JSON.parse(savedUser) : null;
    });

    const login = (userData) =>{
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
    }  // Sets the user when logging in

    
    const logout = () =>{
        setUser(null);
        localStorage.removeItem("user");
    } // Removes the user when pressing the logout button

    return(
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}
