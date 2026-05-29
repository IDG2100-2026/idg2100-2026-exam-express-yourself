import { Link, NavLink, useNavigate } from "react-router";
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
          <NavLink to="/" end className="header__nav-link">Home</NavLink>
          <NavLink to="/lobby" className="header__nav-link">Lobby</NavLink>
          <NavLink to="/tournaments" className="header__nav-link">Tournaments</NavLink>
          <NavLink to="/about-game" className="header__nav-link">About the Game</NavLink>
          {user?.role === "admin" && (
            <NavLink to="/admin" className="header__nav-link">Dashboard</NavLink>
          )}
        </nav>

        <div className="header__right">
          <AppearanceMenu />
          <div className="header__auth">
            {user ? (
              <>
                <Link to={`/profile/${user._id || user.userId}`} className="header__greeting btn btn--secondary">
                  <span>Hello,</span>
                  <Avatar imageUrl={user.profileImageUrl} size="1em" />
                </Link>
                <button className="btn btn--red" onClick={handleLogout}>Log out</button>
              </>
            ) : (
              <>
                <NavLink to="/login" className="header__nav-link">Log in</NavLink>
                <Link to="/register" className="btn btn--primary">Register</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
