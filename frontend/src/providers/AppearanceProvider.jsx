import { useState, useEffect } from "react";
import { AppearanceContext } from "../contexts/appearance-context.js";
import { updateUser } from "../services/users-service.js";
import { useAuth } from "../hooks/useAuth.js";
import { getAccessToken } from "../services/token-manager.js";

const defaultAppearance = {
  theme: "dark",
  boardColor: "#1c2130",
  sound: true,
  lobbySize: 5,
};

function loadFromLocalStorage() {
  const saved = localStorage.getItem("appearance");
  if (!saved) return defaultAppearance;
  try {
    return JSON.parse(saved);
  } catch {
    return defaultAppearance;
  }
}

export function AppearanceProvider({ children }) {
  const { user } = useAuth();
  const [appearance, setAppearance] = useState(loadFromLocalStorage);

  // Apply theme to body whenever it changes
  useEffect(() => {
    document.body.setAttribute("data-theme", appearance.theme);
  }, [appearance.theme]);

  async function saveAppearance(updated) {
    setAppearance(updated);
    localStorage.setItem("appearance", JSON.stringify(updated));

    // Sync to backend only when we have a valid session
    if (user?._id && getAccessToken()) {
      try {
        await updateUser(user._id, { appearance: updated });
      } catch {
        // Silently fail — appearance sync is non-critical
      }
    }
  }

  // Load appearance from backend data (after login)
  function loadAppearance(backendAppearance) {
    if (!backendAppearance) return;
    const merged = { ...defaultAppearance, ...backendAppearance };
    setAppearance(merged);
    localStorage.setItem("appearance", JSON.stringify(merged));
  }

  return (
    <AppearanceContext.Provider value={{ appearance, saveAppearance, loadAppearance }}>
      {children}
    </AppearanceContext.Provider>
  );
}
