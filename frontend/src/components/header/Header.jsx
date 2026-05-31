import { useState, useEffect } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router";
import { useAuth } from "../../hooks/useAuth.js";
import { useIsMobile } from "../../hooks/useIsMobile.js";
import AppearanceMenu from "../appearance-menu/AppearanceMenu.jsx";
import Avatar from "../avatar/Avatar.jsx";
import BurgerIcon from "../../assets/icons/BurgerIcon.jsx";
import CloseIcon from "../../assets/icons/CloseIcon.jsx";
function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { key } = useLocation();
  const isMobile = useIsMobile();
  const [burgerOpen, setBurgerOpen] = useState(false);

  // Close the mobile menu on every navigation
  useEffect(() => {
    setBurgerOpen(false);
  }, [key]);

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <header className="header">
      <div className="header__inner">
        <Link to="/" className="header__logo">PokerDados</Link>

        {!isMobile && (
          <nav className="header__nav">
            <NavLink to="/" end className="header__nav-link">Home</NavLink>
            <NavLink to="/lobby" className="header__nav-link">Lobby</NavLink>
            <NavLink to="/tournaments" className="header__nav-link">Tournaments</NavLink>
            <NavLink to="/about-game" className="header__nav-link">About the game</NavLink>
            {user?.role === "admin" && (
              <NavLink to="/admin" className="header__nav-link">Dashboard</NavLink>
            )}
          </nav>
        )}

        <div className="header__right">
          <AppearanceMenu />

          {!isMobile && (
            <div className="header__auth">
              {user ? (
                <>
                  <Link to={`/profile/${user._id || user.userId}`} className="header__greeting btn btn--secondary">
                    <span>Hello, {user.username}</span>
                    <Avatar imageUrl={user.profileImageUrl} username={user.username} size={24} />
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
          )}

          {isMobile && (
            <button
              className="header__burger"
              onClick={() => { setBurgerOpen(!burgerOpen); }}
            >
              {!burgerOpen && <BurgerIcon size={24} />}
              {burgerOpen && <CloseIcon size={24} />}
            </button>
          )}
        </div>
      </div>

      {isMobile && burgerOpen && (
        <div className="header__mobile-menu">
          <nav className="header__mobile-nav">
            <NavLink to="/" end className="header__nav-link">Home</NavLink>
            <NavLink to="/lobby" className="header__nav-link">Lobby</NavLink>
            <NavLink to="/tournaments" className="header__nav-link">Tournaments</NavLink>
            <NavLink to="/about-game" className="header__nav-link">About the game</NavLink>
            {user?.role === "admin" && (
              <NavLink to="/admin" className="header__nav-link">Dashboard</NavLink>
            )}
          </nav>
          {user ? (
            <>
              <Link to={`/profile/${user._id || user.userId}`} className="header__greeting btn btn--secondary">
                <span>Hello, {user.username}</span>
                <Avatar imageUrl={user.profileImageUrl} username={user.username} size={24} />
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
      )}
    </header>
  );
}

export default Header;
