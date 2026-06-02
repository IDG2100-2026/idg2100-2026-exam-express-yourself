import { useState } from "react";
import { Link } from "react-router";
import { requestResetPassword } from "../../services/auth-service.js";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
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
      <div className="forgot-password__card stack-m">
        <form className="forgot-password__form stack-m" onSubmit={handleSubmit}>
          <h1>Forgot password</h1>
          {success && <p className="forgot-password__success">{success}</p>}
          {error && <p className="forgot-password__error">{error}</p>}
          <div className="forgot-password__field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); }}
              placeholder="name@example.com"
              required
            />
          </div>
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
