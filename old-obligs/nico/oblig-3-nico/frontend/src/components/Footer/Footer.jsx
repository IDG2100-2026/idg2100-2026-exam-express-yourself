import { Link } from 'react-router-dom'

function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">

        <div className="footer__brand">
          <span className="footer__name">🎲 PokerDados</span>
          <span className="footer__copy">© 2020–2026</span>
        </div>

        <nav className="footer__links">
          <Link to="/about-us" className="footer__link">About Us</Link>
          <Link to="/privacy" className="footer__link">Privacy Policy</Link>
          <Link to="/terms" className="footer__link">Terms & Conditions</Link>
        </nav>

      </div>
    </footer>
  )
}

export default Footer
