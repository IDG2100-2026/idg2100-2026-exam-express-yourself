import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import { AuthContext } from "../contexts/AuthContext.js";
import { logoutUser } from "../services/authService.js";
import { setAccessToken, clearAccessToken } from "../services/tokenManager.js";
import { apiFetch, refreshAccessToken } from "../api.js";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const restoreSession = async () => {
      try {
        setLoading(true);
        const refresh = await refreshAccessToken();
        if (refresh) {
          setAccessToken(refresh.accessToken);
          setUser(refresh.user);
        }
      } catch (err) {
        setUser(null); // if session could not be restored, we set user to null
        console.error("Could not restore session");
      }finally{
        setLoading(false);
      }
    };

    restoreSession();
  }, []); // render only on mount

  const login = useCallback((userData, accessToken) => {
    setUser(userData);
    setAccessToken(accessToken);
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutUser();
    } catch (err) {
      console.error(err.message);
    } finally {
      setUser(null);
      clearAccessToken();
    }
  }, []);

  useEffect(() => {
    const handleExpiredSession = () => {
      setUser(null);
      clearAccessToken();
      navigate("/login");
    }

    window.addEventListener("auth-expired", handleExpiredSession);


    return () => {
      window.removeEventListener("auth-expired", handleExpiredSession);
    }
  }, [navigate]);

  if(loading) return <p>Loading...</p>;
  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
