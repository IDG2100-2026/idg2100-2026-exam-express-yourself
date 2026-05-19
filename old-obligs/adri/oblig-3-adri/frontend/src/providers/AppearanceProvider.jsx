import { useState, useEffect } from "react";
import { AppearanceContext } from "../contexts/AppearanceContext.js";
import { updateUser } from "../services/users-service.js";

const defaultAppearance = {
    theme: "light",
    boardColor: "white",
    sound: true,
    lobbyCount: 5
};

function loadFromLocalStorage() { //read saved appearance from localStorage or fall back to defaults
    const saved = localStorage.getItem("appearance");
    if (saved) {
        return JSON.parse(saved);
    }
    return defaultAppearance;
}

export function AppearanceProvider({ children }) {
    const [appearance, setAppearance] = useState(loadFromLocalStorage()); //call function to get starting value from localStorage

    useEffect(() => { //toggle dark class on body when theme changes
        if (appearance.theme === "dark") {
            document.body.classList.add("dark");
        } else {
            document.body.classList.remove("dark");
        }
    }, [appearance.theme]);

    async function saveAppearance(newAppearance, user) {
        setAppearance(newAppearance);
        localStorage.setItem("appearance", JSON.stringify(newAppearance)); //save for all users
        if (user) {
            await updateUser(user._id, { appearance: newAppearance }); //also save to backend for registered users
        }
    }

    return (
        <AppearanceContext.Provider value={{ appearance, saveAppearance }}>
            {children}
        </AppearanceContext.Provider>
    );
}
