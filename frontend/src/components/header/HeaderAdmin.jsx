import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";

export default function HeaderAdmin() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <header className="admin-header">
      <div className="admin-header__inner">
        <Link to="/" className="admin-header__logo">🎲 PokerDados</Link>
        <nav className="admin-header__nav">
          <NavLink to="/admin" end className="admin-header__link">Dashboard</NavLink>
          <NavLink to="/admin/users" className="admin-header__link">Users</NavLink>
          <NavLink to="/admin/comments" className="admin-header__link">Comments</NavLink>
          <NavLink to="/admin/tournament/create" className="admin-header__link">Create Tournament</NavLink>
        </nav>
        <button className="btn btn--red" onClick={handleLogout}>Log out</button>
      </div>
    </header>
  );
}
