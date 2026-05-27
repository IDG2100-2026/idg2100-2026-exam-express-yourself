import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./providers/AuthProvider.jsx";
import { AppearanceProvider } from "./providers/AppearanceProvider.jsx";
import MainLayout from "./layouts/main-layout/MainLayout.jsx";
import AdminLayout from "./layouts/admin-layout/AdminLayout.jsx";
import ProtectedRoute from "./routes/ProtectedRoute.jsx";
import AdminRoute from "./routes/AdminRoute.jsx";
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
import AdminDashboard from "./pages/admin/dashboard/AdminDashboard.jsx";
import AdminUsers from "./pages/admin/users/AdminUsers.jsx";
import AdminComments from "./pages/admin/comments/AdminComments.jsx";
import AdminTournamentCreate from "./pages/admin/tournament-create/AdminTournamentCreate.jsx";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppearanceProvider>
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

            <Route element={<AdminRoute />}>
              <Route element={<AdminLayout />}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/users" element={<AdminUsers />} />
                <Route path="/admin/comments" element={<AdminComments />} />
                <Route path="/admin/tournament/create" element={<AdminTournamentCreate />} />
                <Route path="/admin/tournament/:id/edit" element={<AdminTournamentCreate />} />
              </Route>
            </Route>
          </Routes>
        </AppearanceProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
