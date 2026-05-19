import { NavLink } from "react-router";
import styles from "./NavBar.module.css";
import { useAuth } from "../../hooks/useAuth";
import { ThemeToggle } from '../Theme/ThemeOption';
import { ToggleSoundMute } from "../SoundMuter/SoundMuter";

export default function NavBar() {
  const { user, logout } = useAuth();

  return (
    <nav className={styles.navBar}>
      <div className={styles.navBarLeft}>
        <NavLink className={`${styles.navLink} ${styles.logo}`} to="/">Spanish Dice Poker</NavLink>
      </div>

      <div className={styles.navBarLinks}>
        <NavLink className={styles.navLink} to="/">Homepage</NavLink>
        <NavLink className={styles.navLink} to="/lobby">Lobby</NavLink>
        <NavLink className={styles.navLink} to="#">Tournaments</NavLink>
        <NavLink className={styles.navLink} to="/about-spanish-poker">About Spanish Poker</NavLink>
      </div>

      <div className={styles.navBarControls}>
        {user ? (
          <>
            <span className={styles.greetingMsg}>Welcome {user.username}</span>
            <button onClick={logout} className={styles.logoutBtn}>Logout</button>
          </>
        ) : (
          <>
            <NavLink className={styles.navBarLoginBtn} to="/register">Register</NavLink>
            <NavLink className={styles.navBarLoginBtn} to="/login">Log in</NavLink>
          </>
        )}
        <ToggleSoundMute />
        <ThemeToggle />
      </div>
    </nav>
  );
}
