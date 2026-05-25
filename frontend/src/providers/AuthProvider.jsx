import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import { AuthContext } from "../contexts/auth-context.js";
import { logoutUser } from "../services/auth-service.js";
import { setAccessToken, clearAccessToken } from "../services/token-manager.js";
import { apiFetch, refreshAccessToken } from "../api.js";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  useEffect(() => { // on app startup, we check if the user has a valid session from a previous visit
    const restoreSession = async () => {
      try {
        setLoading(true); // Show loading state while checking session
        const refresh = await refreshAccessToken(); // auth/sessions/token! sends refreshToken cookie automaticly
        if (refresh) { // if session is still valid, we store the new access token and user data
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
    setUser(userData); // update react state to show logged in user
    setAccessToken(accessToken); // stores the access token in memory for future api calls
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutUser(); // logs out the user, and deletes the session from db
    } catch (err) {
      console.error(err.message);
    } finally {
      setUser(null);
      clearAccessToken(); // deletes access token from client side. 
    }
  }, []);

  useEffect(() => {
    const handleExpiredSession = () => { // what to do if session is expired. 
      setUser(null); // set user to null, have to log in again
      clearAccessToken(); // clears access token from client side to have a clean slate
      navigate("/login"); // navigates to login page for user to login again
    }

    window.addEventListener("auth-expired", handleExpiredSession); // custom event from api.js if refreshAccessToken did not go trough

    // cleanup
    return () => {
      window.removeEventListener("auth-expired", handleExpiredSession); // cleanup to prevent memory leak and prevent other event listeners
    }
  }, [navigate]); // re-render when user is navigated to login

  if(loading) return <p>Loading...</p>; // show a loading txt
  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
