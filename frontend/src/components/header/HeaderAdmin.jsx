import { useState, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router";
import { useIsMobile } from "../../hooks/useIsMobile.js";
import BurgerIcon from "../../assets/icons/BurgerIcon.jsx";
import CloseIcon from "../../assets/icons/CloseIcon.jsx";

export default function HeaderAdmin() {
  const { key } = useLocation();
  const isMobile = useIsMobile();
  const [burgerOpen, setBurgerOpen] = useState(false);

  // Close the mobile menu on every navigation
  useEffect(() => {
    setBurgerOpen(false);
  }, [key]);

  return (
    <header className="admin-header">
      <div className="admin-header__inner">
        <Link to="/" className="admin-header__logo">PokerDados</Link>

        {!isMobile && (
          <nav className="admin-header__nav">
            <NavLink to="/admin" end className="admin-header__link">Dashboard</NavLink>
            <NavLink to="/admin/users" className="admin-header__link">Users</NavLink>
            <NavLink to="/admin/comments" className="admin-header__link">Comments</NavLink>
            <NavLink to="/admin/tournament/create" className="admin-header__link">Create tournament</NavLink>
          </nav>
        )}

        {isMobile && (
          <button
            className="admin-header__burger"
            onClick={() => { setBurgerOpen(!burgerOpen); }}
          >
            {!burgerOpen && <BurgerIcon size={24} />}
            {burgerOpen && <CloseIcon size={24} />}
          </button>
        )}
      </div>

      {isMobile && burgerOpen && (
        <nav className="admin-header__mobile-menu">
          <NavLink to="/admin" end className="admin-header__link">Dashboard</NavLink>
          <NavLink to="/admin/users" className="admin-header__link">Users</NavLink>
          <NavLink to="/admin/comments" className="admin-header__link">Comments</NavLink>
          <NavLink to="/admin/tournament/create" className="admin-header__link">Create tournament</NavLink>
        </nav>
      )}
    </header>
  );
}
