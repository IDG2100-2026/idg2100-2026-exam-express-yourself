import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import AppearanceMenu from "../appearance-menu/AppearanceMenu.jsx";
import Avatar from "../avatar/Avatar.jsx";

function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <header className="header">
      <div className="header__inner">
        <Link to="/" className="header__logo">🎲 PokerDados</Link>

        <nav className="header__nav">
          <Link to="/" className="header__nav-link">Home</Link>
          <Link to="/lobby" className="header__nav-link">Lobby</Link>
          <Link to="/tournaments" className="header__nav-link">Tournaments</Link>
          <Link to="/about-game" className="header__nav-link">About the Game</Link>
        </nav>

        <div className="header__right">
          <AppearanceMenu />
          <div className="header__auth">
            {user ? (
              <>
                <Link to={`/profile/${user._id || user.userId}`} className="header__greeting">
                  <Avatar imageUrl={user.profileImageUrl} size={28} />
                  <span>Hello, {user.username}</span>
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
  );
}

export default Header;
