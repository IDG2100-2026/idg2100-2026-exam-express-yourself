import { NavLink } from "react-router";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__brand">
          <span className="footer__name">🎲 PokerDados</span>
          <span className="footer__copy">© 2020-2026</span>
        </div>
        <nav className="footer__links">
          <NavLink to="/about-us" className="footer__link">About Us</NavLink>
          <NavLink to="/privacy" className="footer__link">Privacy Policy</NavLink>
          <NavLink to="/terms" className="footer__link">Terms & Conditions</NavLink>
        </nav>
      </div>
    </footer>
  );
}

export default Footer;
