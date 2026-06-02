import { Link } from "react-router";

export default function NotFound() {
  return (
    <div className="not-found stack-s">
      <title>Not Found</title>
      <h1>404</h1>
      <p>Page not found. The dice rolled off the table.</p>
      <Link to="/" className="btn--link">Back to home</Link>
    </div>
  );
}
