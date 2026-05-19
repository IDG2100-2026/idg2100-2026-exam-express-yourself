import { NavLink } from "react-router";
import styles from './FooterNavigationLinks.module.css';
export default function FooterNavigationLinks(){
    return(
        <section className={styles.footerWrapper}>
            <div className={styles.footerLinksContainer}>
                <NavLink to='/about-us' className={styles.footerLinks}>About Us</NavLink>
                <NavLink to='/privacy-policy' className={styles.footerLinks}>Privacy Policy</NavLink>
                <NavLink to='/terms-and-conditions' className={styles.footerLinks}>Terms and Conditions</NavLink>
            </div>
            <div className={styles.footerNameOfPlatform}>
                <span>Spanish Dice Poker &copy; 2026</span>
            </div>
        </section>
    );
}