import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser, getUser } from "../../api/users.js";
import { useAuth } from "../../context/AuthContext";
import { useAppearance } from "../../context/AppearanceContext";

function LoginPage() {
  const [formdata, setFormdata] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const { loadAppearance } = useAppearance();

  async function handleChange(e) {
    const { name, value } = e.target;
    setFormdata((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { userId, role } = await loginUser(formdata);

      const userResponse = await getUser(userId);
      const {
        username = "",
        profileImageUrl = "",
        appearance,
      } = userResponse;

      login(userId, role, username, profileImageUrl);
      loadAppearance(appearance);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
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
            <input
              id="email"
              name="email"
              type="email"
              value={formdata.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="login__field">
            <label htmlFor="password">Password</label>
            <input
              name="password"
              id="password"
              type="password"
              value={formdata.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </div>

          <button type="button" className="login__forgot">
            Forgot password?
          </button>

          {error && <p className="login__error">{error}</p>}

          <button type="submit" className="login__submit" disabled={loading}>
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>

        <p className="login__register">
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
