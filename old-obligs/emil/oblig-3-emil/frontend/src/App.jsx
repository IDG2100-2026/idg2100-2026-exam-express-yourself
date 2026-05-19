import { useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router";
import MainLayout from "./layouts/MainLayout";
import Homepage from "./pages/Homepage/Homepage";
import LobbyPage from "./pages/LobbyPage/LobbyPage";
import AboutSpanishPoker from "./pages/AboutSpanishPoker/AboutSpanishPoker";
import Tournaments from "./pages/Tournaments/Tournaments";
import TermsAndConditions from "./pages/TermsAndConditions/TermsAndConditions";
import PrivacyPolicy from "./pages/PrivacyPolicy/PrivacyPolicy";
import AboutUs from "./pages/AboutUs/AboutUs";
import RegistrationPage from "./pages/RegistrationPage/RegistrationPage";
import CreateGame from "./components/CreateGame/CreateGame";
import LoginPage from "./pages/LoginPage/LoginPage";
import GamePage from "./pages/IndividualGame/IndividualGame";
import UserProfile from "./pages/UserProfile/UserProfile";
import "./App.css";
import { AuthProvider } from "./providers/AuthProvider";
import { ThemeProvider } from "./providers/ThemeProvider";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        {" "}
        {/* Every component has access to user, login and logout */}
        <BrowserRouter>
          <Routes>
            <Route element={<MainLayout />}>
              <Route path="/" element={<Homepage />} />
              <Route path="/lobby" element={<LobbyPage />} />
              <Route path="/tournaments" element={<Tournaments />} />
              <Route
                path="/about-spanish-poker"
                element={<AboutSpanishPoker />}
              />
              <Route path="/about-us" element={<AboutUs />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route
                path="/terms-and-conditions"
                element={<TermsAndConditions />}
              />
              <Route path="/register" element={<RegistrationPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/create-game" element={<CreateGame />} />
              <Route path="/game/:id" element={<GamePage />} />
              <Route path="/user-profile" element={<UserProfile />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
