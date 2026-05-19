import { useContext } from "react";
import { AppearanceContext } from "../contexts/AppearanceContext.js";

export function useAppearance() {
    return useContext(AppearanceContext); //shortcut to access appearance state anywhere
}
