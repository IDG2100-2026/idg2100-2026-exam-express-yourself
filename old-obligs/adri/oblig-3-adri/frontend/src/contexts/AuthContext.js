import { createContext } from "react";

export const AuthContext = createContext({ user: null, login: () => {}, logout: () => {} }); //just the shape, real values come from AuthProvider

//approach from course material (repo: aliaksem/idg2100-26-lib.app.frontend)