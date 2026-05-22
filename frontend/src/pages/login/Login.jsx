import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser, getUser } from "../../services/users-service.js";
import { useAuth } from "../../hooks/useAuth.js";
import { useAppearance } from "../../hooks/useAppearance.js";

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const { loadAppearance } = useAppearance();

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const result = await loginUser(formData.email, formData.password);

      // Fetch full user data for context
      const userData = await getUser(result.userId);
      login({ ...userData, role: result.role });

      // Load user appearance preferences
      loadAppearance(result.appearance || userData.appearance);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="login">
      <div className="login__card">
        <h1 className="login__title">Log In</h1>
        <p className="login__subtitle">Welcome back to PokerDados</p>

        <form className="login__form" onSubmit={handleSubmit}>
          <div className="login__field">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" name="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" required />
          </div>

          <div className="login__field">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" required />
          </div>

          <button type="button" className="login__forgot">Forgot password?</button>

          {error && <p className="login__error">{error}</p>}

          <button type="submit" className="login__submit" disabled={isSubmitting}>
            {isSubmitting ? "Logging in..." : "Log In"}
          </button>
        </form>

        <p className="login__register">
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}
