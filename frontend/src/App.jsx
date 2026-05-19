import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { AppearanceProvider } from './context/AppearanceContext'
import Layout from './components/Layout/Layout'
import HomePage from './pages/HomePage/HomePage'
import LobbyPage from './pages/LobbyPage/LobbyPage'
import TournamentsPage from './pages/TournamentsPage/TournamentsPage'
import LoginPage from './pages/LoginPage/LoginPage'
import RegisterPage from './pages/RegisterPage/RegisterPage'
import AboutUsPage from './pages/AboutUsPage/AboutUsPage'
import AboutGamePage from './pages/AboutGamePage/AboutGamePage'
import TermsPage from './pages/TermsPage/TermsPage'
import PrivacyPage from './pages/PrivacyPage/PrivacyPage'
import GamePage from './pages/GamePage/GamePage'
import CreateGamePage from './pages/CreateGamePage/CreateGamePage'
import TournamentPage from './pages/TournamentPage/TournamentPage'
import ProfilePage from './pages/ProfilePage/ProfilePage'
import AllGamesPage from './pages/AllGamesPage/AllGamesPage'

function App() {
  return (
    <BrowserRouter>
      <AppearanceProvider>
        <AuthProvider>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/lobby" element={<LobbyPage />} />
              <Route path="/tournaments" element={<TournamentsPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/about-us" element={<AboutUsPage />} />
              <Route path="/about-game" element={<AboutGamePage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/game/:id" element={<GamePage />} />
              <Route path="/create-game" element={<CreateGamePage />} />
              <Route path="/tournament/:id" element={<TournamentPage />} />
              <Route path="/profile/:id" element={<ProfilePage />} />
              <Route path="/profile/:id/games" element={<AllGamesPage />} />
            </Route>
          </Routes>
        </AuthProvider>
      </AppearanceProvider>
    </BrowserRouter>
  )
}

export default App
