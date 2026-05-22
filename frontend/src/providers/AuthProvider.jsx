import { useState } from "react";
import { AuthContext } from "../contexts/AuthContext.js";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  function login(userData) {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    // Also store userId and role separately for apiFetch headers
    localStorage.setItem("userId", userData._id || userData.userId);
    localStorage.setItem("role", userData.role || "user");
  }

  function logout() {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("userId");
    localStorage.removeItem("role");
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
