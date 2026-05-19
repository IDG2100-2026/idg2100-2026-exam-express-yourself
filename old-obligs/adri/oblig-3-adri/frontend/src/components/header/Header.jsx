import { useState } from "react";
import { NavLink } from "react-router";
import { useAuth } from "../../hooks/useAuth.js";
import styles from "./Header.module.css";
import appearanceIcon from "../../assets/icons/appearance-icon.svg";
import profileIcon from "../../assets/icons/profile-icon.svg";
import AppCustomizer from "../app-customizer/AppCustomizer.jsx";

export default function Header() {
    const auth = useAuth();
    const user = auth.user;
    const logout = auth.logout;

    const [showCustomizer, setShowCustomizer] = useState(false); //tracks whether the modal is open

    return (
        <header className={styles.header}>
            <div> {/* Platform logo */}
                <NavLink to="/"><img src="/favicon.svg" alt="Logo" className={styles.header__logo} /></NavLink>
            </div>

            <nav className={styles.header__nav}> {/* Nav */}
                <ul>
                    <li><NavLink to="/">HOME</NavLink></li>
                    <li><NavLink to="/lobby">LOBBY</NavLink></li>
                    <li><NavLink to="/tournaments">TOURNAMENTS</NavLink></li>
                    <li><NavLink to="/about-game">ABOUT GAME</NavLink></li>
                </ul>
            </nav>

            <div className={styles.header__customizer}> {/* Appearance customizer */}
                <button
                    onClick={() => {
                        setShowCustomizer(true);
                    }}
                >
                    <img
                        src={appearanceIcon}
                        alt="Appearance customizer icon"
                        className={styles.header__icons}
                    />
                </button>
            </div>

            <div className={styles.header__greeting}> {/* Greeting component */}
                {user ? (
                    <>
                        <p>Hi, {user.username}</p>
                        <NavLink to="/profile">
                            <img src={profileIcon} alt="Profile icon" className={styles.header__icons} />
                        </NavLink>
                        <button onClick={logout}>LOGOUT</button>
                    </>
                ) : (
                    <ul>
                        <li><NavLink to="/login">LOGIN</NavLink></li>
                        <li><NavLink to="/register">REGISTER</NavLink></li>
                    </ul>
                )}
            </div>
            {showCustomizer ? (
                <AppCustomizer
                    onClose={() => {
                        setShowCustomizer(false);
                    }}
                />
            ) : (
                null
            )}
        </header>
    );
}
