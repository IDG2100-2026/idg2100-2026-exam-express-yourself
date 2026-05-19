import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import AppearanceMenu from '../AppearanceMenu/AppearanceMenu'
import Avatar from '../Avatar/Avatar'

function Header() {
  const { isLoggedIn, userId, username, profileImageUrl, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <header className="header">
      <div className="header__inner">

        <Link to="/" className="header__logo">
          🎲 PokerDados
        </Link>

        <nav className="header__nav">
          <Link to="/" className="header__nav-link">Home</Link>
          <Link to="/lobby" className="header__nav-link">Lobby</Link>
          <Link to="/tournaments" className="header__nav-link">Tournaments</Link>
          <Link to="/about-game" className="header__nav-link">About the Game</Link>
        </nav>

        <div className="header__right">
          <AppearanceMenu />

          <div className="header__auth">
            {isLoggedIn ? (
              <>
                <Link to={`/profile/${userId}`} className="header__greeting">
                  <Avatar imageUrl={profileImageUrl} size={28} />
                  <span>Hello, {username}</span>
                </Link>
                <button className="header__logout" onClick={handleLogout}>Log out</button>
              </>
            ) : (
              <>
                <Link to="/login" className="header__nav-link">Log in</Link>
                <Link to="/register" className="header__register">Register</Link>
              </>
            )}
          </div>
        </div>

      </div>
    </header>
  )
}

export default Header
