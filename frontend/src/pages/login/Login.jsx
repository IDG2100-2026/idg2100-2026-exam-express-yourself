import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  loginUser,
  requestResetPassword,
  verifyEmail,
} from "../../services/auth-service.js";
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
    const verifyUserEmail = async () => {
      setIsLoading(true);
      try {
        const data = await verifyEmail(code); // runs the verify-email endpoint
        setSuccess(data.message);
      } catch (err) {
        setError(err.message); // error msg
      } finally {
        setIsLoading(false);
      }
    };

    verifyUserEmail();
  }, []);

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
      setSuccess(`Login successful ${result.user?.username}! You will be redirected to the homepage`);
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

  const sendForgotPasswordMail = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const data = await requestResetPassword(sendMail);
      setResetMsg(data.message);
    } catch (err) {
      setError(err.message);
    }finally{
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="login"><div className="login__card"><p className="login__status">Verifying your email...</p></div></div>;

  return (
    <div className="login">
      <div className="login__card">
        {!showForgotPassword ? (
          <form className="login__form" onSubmit={handleSubmit}>
            <h1 className="login__title">Log In</h1>
            <p className="login__subtitle">Welcome back to PokerDados</p>
            {success && (
              <p>{success}</p>
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
              type="button"
              className="login__forgot"
              onClick={() => setShowForgotPassword(true)}
            >
              Forgot Password?
            </button>

            {error && <p className="login__error">{error}</p>}

            <button
              type="submit"
              className="btn btn--primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Logging in..." : "Log In"}
            </button>
          </form>
        ) : (
          <form className="login__field" onSubmit={sendForgotPasswordMail}>
            <h2 className="login__title">Forgot Password</h2>
            {resetMsg ? <p>{resetMsg}</p> : <p>{error}</p>}
            <input
              type="email"
              value={sendMail}
              onChange={(e) => setSendMail(e.target.value)}
              placeholder="Enter your email.."
            />
            <button className="btn btn--primary">
              {isSubmitting ? "Sending email" : "Send reset link"}
            </button>
            <button
              className="login__forgot"
              onClick={() => setShowForgotPassword(false)}
            >
              Back to login
            </button>
          </form>
        )}

        <p className="login__register">
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}
