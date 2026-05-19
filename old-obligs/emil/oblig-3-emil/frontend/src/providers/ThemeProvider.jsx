import { useState, useEffect, useContext } from "react";
import { ThemeContext } from "../contexts/ThemeContext";

export const ThemeProvider = ({children}) => {

    // We get from localStorage, if no default is set to light
    const [ theme, setTheme ] = useState(() => localStorage.getItem("theme"));
    
    const toggleTheme = () => {
        setTheme((prev) => (prev === 'light' ? 'dark' : 'light')); // If the previous theme is light, we set to dark, else we set to light!
    }

    useEffect(() => {
        localStorage.setItem("theme", theme);
        document.documentElement.className = theme;
    }, [theme]); // will only render on hook, and when theme is changed!

    return (
        <ThemeContext.Provider value={{theme, toggleTheme}}>
            {children}
        </ThemeContext.Provider>
    );
};