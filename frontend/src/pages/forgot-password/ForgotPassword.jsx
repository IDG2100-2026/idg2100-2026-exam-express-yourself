import { useState } from "react";
import { Link } from "react-router";
import { requestResetPassword } from "../../services/auth-service.js";

const EMAIL_FORMAT = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email) {
      setError("Email is required.");
      return;
    }

    if (!EMAIL_FORMAT.test(email)) {
      setError("Must be a valid email address, e.g. user@mail.com.");
      return;
    }

    setIsSubmitting(true);
    try {
      const data = await requestResetPassword(email);
      setSuccess(data.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="forgot-password">
      <title>Forgot Password</title>
      <div className="forgot-password__card stack-m">
        <form noValidate className="forgot-password__form stack-m" onSubmit={handleSubmit}>
          <h1>Forgot password</h1>
          {success && <p className="forgot-password__success">{success}</p>}
          <div className="forgot-password__field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); }}
              placeholder="name@example.com"
            />
          </div>
          {error && <p className="forgot-password__error">{error}</p>}
          <button type="submit" className="btn btn--primary forgot-password__submit" disabled={isSubmitting}>
            {isSubmitting ? "Sending..." : "Send reset link"}
          </button>
          <Link to="/login" className="forgot-password__back btn--link">
            Back to log in
          </Link>
        </form>
      </div>
    </div>
  );
}
