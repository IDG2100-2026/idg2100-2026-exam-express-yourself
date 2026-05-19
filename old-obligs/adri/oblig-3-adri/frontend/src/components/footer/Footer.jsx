import { NavLink } from "react-router";
import styles from "./Footer.module.css";

export default function Footer() {
    return(
        <footer className={styles.footer}>
            <ul>
                <li><NavLink to="/about-us">About us</NavLink></li>
                <li><NavLink to="/privacy-policy">Privacy policy</NavLink></li>
                <li><NavLink to="/terms-conditions">Terms & conditions</NavLink></li>
            </ul>
            <p>Spanish Dice Poker © 2025 - 2026</p>
        </footer>
    );
}
