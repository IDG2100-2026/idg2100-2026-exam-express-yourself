import { useContext } from "react";
import { AppearanceContext } from "../contexts/AppearanceContext.js";

export const useAppearance = () => useContext(AppearanceContext);
