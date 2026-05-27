import { useState, useEffect } from "react";
import { AppearanceContext } from "../contexts/appearance-context.js";
import { updateUser } from "../services/users-service.js";

const defaultAppearance = {
  theme: "dark",
  boardColor: "#1c2130",
  sound: true,
  lobbySize: 5,
};

function loadFromLocalStorage() {
  const saved = localStorage.getItem("appearance");
  return saved ? JSON.parse(saved) : defaultAppearance;
}

export function AppearanceProvider({ children }) {
  const [appearance, setAppearance] = useState(loadFromLocalStorage);

  // Apply theme to body whenever it changes
  useEffect(() => {
    document.body.setAttribute("data-theme", appearance.theme);
  }, [appearance.theme]);

  async function saveAppearance(updated) {
    setAppearance(updated);
    localStorage.setItem("appearance", JSON.stringify(updated));

    // Sync to backend for logged-in users
    const userId = localStorage.getItem("userId");
    if (userId) {
      try {
        await updateUser(userId, { appearance: updated });
      } catch (err) {
        // Silently fail, appearance sync is non-critical
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
