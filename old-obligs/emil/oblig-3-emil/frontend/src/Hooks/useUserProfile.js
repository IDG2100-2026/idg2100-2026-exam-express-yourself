import { updateUserProfile } from "../services/updateUserProfile.js";
import { useState, useEffect } from "react";
import { useAuth } from "./useAuth.js";

export async function useUserProfile() {
  const [username, setUsername] = useState("Hi");
  const [email, setEmail] = useState(null);
  const [password, setPassword] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  useEffect(() => {
    let isMounted = true;
    async function fetchUpdateUser() {
      try {
        await updateUserProfile(userId);
        
      } catch (err) {
      } finally {
      }
    }

    fetchUpdateUser();
    return () => {
      isMounted = false;
    };
  }, []);

  return { username, email, password, isLoading, error };
}
