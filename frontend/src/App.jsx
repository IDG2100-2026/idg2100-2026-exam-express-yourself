import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./providers/AuthProvider.jsx";
import { AppearanceProvider } from "./providers/AppearanceProvider.jsx";
import MainLayout from "./layouts/main-layout/MainLayout.jsx";
import ProtectedRoute from "./routes/ProtectedRoute.jsx";
import Home from "./pages/home/Home.jsx";
import Lobby from "./pages/lobby/Lobby.jsx";
import Login from "./pages/login/Login.jsx";
import Register from "./pages/register/Register.jsx";
import Game from "./pages/game/Game.jsx";
import CreateGame from "./pages/create-game/CreateGame.jsx";
import Profile from "./pages/profile/Profile.jsx";
import AllGames from "./pages/all-games/AllGames.jsx";
import TournamentList from "./pages/tournament-list/TournamentList.jsx";
import Tournament from "./pages/tournament/Tournament.jsx";
import AboutUs from "./pages/about-us/AboutUs.jsx";
import AboutGame from "./pages/about-game/AboutGame.jsx";
import Terms from "./pages/terms/Terms.jsx";
import Privacy from "./pages/privacy/Privacy.jsx";
import NotFound from "./pages/not-found/NotFound.jsx";
import ResetPassword from "./pages/ResetPassword/ResetPassword.jsx";
function App() {
  return (
    <AppearanceProvider>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route element={<MainLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/lobby" element={<Lobby />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/game/:id" element={<Game />} />
              <Route path="/tournaments" element={<TournamentList />} />
              <Route path="/tournament/:id" element={<Tournament />} />
              <Route path="/profile/:id" element={<Profile />} />
              <Route path="/profile/:id/games" element={<AllGames />} />
              <Route path="/about-us" element={<AboutUs />} />
              <Route path="/about-game" element={<AboutGame />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route element={<ProtectedRoute />}>
                <Route path="/create-game" element={<CreateGame />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </AppearanceProvider>
  );
}

export default App;
