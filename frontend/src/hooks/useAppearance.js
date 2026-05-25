import { useContext } from "react";
import { AppearanceContext } from "../contexts/appearance-context.js";

export const useAppearance = () => useContext(AppearanceContext);
