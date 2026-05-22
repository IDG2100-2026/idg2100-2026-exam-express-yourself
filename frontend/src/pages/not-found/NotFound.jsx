import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="not-found">
      <h1 className="not-found__title">404</h1>
      <p className="not-found__text">Page not found. The dice rolled off the table.</p>
      <Link to="/" className="not-found__link">← Back to Home</Link>
    </div>
  );
}
