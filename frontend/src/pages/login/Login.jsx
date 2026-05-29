import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import { useAppearance } from "../../hooks/useAppearance.js";
import { loginUser } from "../../services/auth-service.js";

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { user, login } = useAuth();
  const { loadAppearance } = useAppearance();

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault(); // prevents that the page is refreshed
    setError(null); // if fails first, this will go away when successful
    setIsSubmitting(true); // disable the button when true
    try {
      const result = await loginUser(formData); // tries to login the user
      login(result.user, result.accessToken); // sets the user, and the accessToken
      setSuccess(
        `Login successful ${result.user?.username}! You will be redirected to the homepage`, // success msg
      );
      setTimeout(() => {
        navigate("/"); // navigate to homepage after 3 sec
      }, 3000);

      // Load user appearance preferences
      loadAppearance(result.user?.appearance);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="login">
      <div className="login__card">
        <form className="login__form" onSubmit={handleSubmit}>
          <h1 className="login__title">Log In</h1>
          <p className="login__subtitle">Welcome back to PokerDados</p>
          {success ? (
            <span className="login__success">{success}</span>
          ) : (
            <span className="login__error">{error}</span>
          )}
          <div className="login__field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
            />
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
            <Link to="/forgot-password" className="login__forgot">
              Forgot Password
            </Link>
            <button
              type="submit"
              className="login__submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Logging in..." : "Log In"}
            </button>
          </div>
        </form>
        <p className="login__register">
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  );
}
