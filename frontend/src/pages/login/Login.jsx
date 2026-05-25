import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  loginUser,
  requestResetPassword,
  verifyEmail,
} from "../../services/authService.js";
import { getUser } from "../../services/users-service.js";
import { useAuth } from "../../hooks/useAuth.js";
import { useAppearance } from "../../hooks/useAppearance.js";

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [sendMail, setSendMail] = useState("");
  const [resetMsg, setResetMsg] = useState("");
  const navigate = useNavigate();
  const { user, login } = useAuth();
  const { loadAppearance } = useAppearance();
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const code = searchParams.get("code");
    if (!code) return;
    setSearchParams({}); // clear the code from the url

    const verifyUserEmail = async () => {
      try {
        const data = await verifyEmail(code); // runs the verify-email endpoint
      } catch (err) {
        setError(err.message); // error msg
      }
    };

    verifyUserEmail();
  }, [searchParams]);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const result = await loginUser(formData);
      login(result.user, result.accessToken);
      setSuccess(true);
      setTimeout(() => {
        navigate("/"); // navigate to homepage after 3 sec
      }, 3000);

      // Load user appearance preferences
      loadAppearance(result.appearance);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  const sendForgotPasswordMail = async () => {
    try {
      const data = await requestResetPassword(sendMail);
      setResetMsg(data.message);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="login">
      <div className="login__card">
        {!showForgotPassword ? (
          <form className="login__form" onSubmit={handleSubmit}>
            <h1 className="login__title">Log In</h1>
            <p className="login__subtitle">Welcome back to PokerDados</p>
            {success && (
              <p>Login successful! You will be redirected to the homepage</p>
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
            </div>

            <div className="login__field">
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
            </div>
            <button
              className="login__forgot"
              onClick={() => setShowForgotPassword(true)}
            >
              Forgot Password?
            </button>

            {error && <p className="login__error">{error}</p>}

            <button
              type="submit"
              className="login__submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Logging in..." : "Log In"}
            </button>
          </form>
        ) : (
          <div className="login__field">
            <h2 className="login__title">Forgot Password</h2>
            {resetMsg ? <p>{resetMsg}</p> : <p>{error}</p>}
            <input
              type="email"
              value={sendMail}
              onChange={(e) => setSendMail(e.target.value)}
              placeholder="Enter your email.."
            />
            <button className="login__submit" onClick={sendForgotPasswordMail}>
              Send reset link
            </button>
            <button
              className="login__forgot"
              onClick={() => setShowForgotPassword(false)}
            >
              Back to login
            </button>
          </div>
        )}

        <p className="login__register">
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}
