import { BrowserRouter, Routes, Route } from "react-router";
import { AuthProvider } from "./providers/AuthProvider.jsx";
import { AppearanceProvider } from "./providers/AppearanceProvider.jsx";
import MainLayout from "./layouts/main-layout/MainLayout.jsx";
import ProtectedRoute from "./routes/ProtectedRoute.jsx";
import Home from "./pages/home/Home.jsx";
import Lobby from "./pages/lobby/Lobby.jsx";
import CreateGame from "./pages/create-game/CreateGame.jsx";
import IndividualGame from "./pages/individual-game/IndividualGame.jsx";
import TournamentList from "./pages/tournament-list/TournamentList.jsx";
import IndividualTournament from "./pages/individual-tournament/IndividualTournament.jsx";
import Login from "./pages/login/Login.jsx";
import Register from "./pages/register/Register.jsx";
import Profile from "./pages/profile/Profile.jsx";
import AboutUs from "./pages/about-us/AboutUs.jsx";
import AboutGame from "./pages/about-game/AboutGame.jsx";
import TermsConditions from "./pages/terms-conditions/TermsConditions.jsx";
import PrivacyPolicy from "./pages/privacy-policy/PrivacyPolicy.jsx";

function App() {
  return (
    <AppearanceProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route element={<MainLayout />} >
              <Route path="/about-game" element={<AboutGame />} />
              <Route path="/about-us" element={<AboutUs />} />
              <Route path="/" element={<Home />} />
              <Route path="/game/:id" element={<IndividualGame />} />
              <Route path="/tournament/:id" element={<IndividualTournament />} />
              <Route path="/lobby" element={<Lobby />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-conditions" element={<TermsConditions />} />
              <Route path="/tournaments" element={<TournamentList />} />
              <Route element={<ProtectedRoute />} >
                <Route path="/create-game" element={<CreateGame />} />
                <Route path="/profile" element={<Profile />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </AppearanceProvider>
  );
}

export default App;
