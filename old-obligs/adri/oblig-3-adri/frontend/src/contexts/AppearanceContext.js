import { createContext } from "react";

export const AppearanceContext = createContext({ appearance: null, saveAppearance: () => {} }); //just the shape, real values come from AppearanceProvider