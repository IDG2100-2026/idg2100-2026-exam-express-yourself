import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
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
  const { login } = useAuth();
  const { loadAppearance } = useAppearance();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const code = searchParams.get("code");
    if (!code) return;
    const verifyUserEmail = async () => {
      setIsLoading(true);
      try {
        const data = await verifyEmail(code);
        setSuccess(data.message);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    verifyUserEmail();
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => {
      return { ...prev, [name]: value };
    });
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
        navigate("/");
      }, 3000);
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
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="login">
        <div className="login__card">
          <p className="login__status">Verifying your email...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="login">
      <div className="login__card stack-m">
        {!showForgotPassword ? (
          <form className="login__form stack-m" onSubmit={handleSubmit}>
            <h1>Log in</h1>
            {success && <p className="login__success">{success}</p>}
            <div className="login__field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="name@example.com"
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
                placeholder="********"
                required
              />
            </div>
            {error && <p className="login__error">{error}</p>}
            <button type="submit" className="btn btn--primary login__submit" disabled={isSubmitting}>
              {isSubmitting ? "Logging in..." : "Log in"}
            </button>
            <button
              type="button"
              className="login__forgot btn--link"
              onClick={() => { setShowForgotPassword(true); }}
            >
              Forgot password?
            </button>
          </form>
        ) : (
          <form className="login__form stack-m" onSubmit={sendForgotPasswordMail}>
            <h2>Forgot password</h2>
            {resetMsg && <p className="login__success">{resetMsg}</p>}
            {error && <p className="login__error">{error}</p>}
            <div className="login__field">
              <label htmlFor="resetEmail">Email</label>
              <input
                id="resetEmail"
                type="email"
                value={sendMail}
                onChange={(e) => { setSendMail(e.target.value); }}
                placeholder="name@example.com"
              />
            </div>
            <button type="submit" className="btn btn--primary login__submit" disabled={isSubmitting}>
              {isSubmitting ? "Sending..." : "Send reset link"}
            </button>
            <button
              type="button"
              className="login__forgot btn--link"
              onClick={() => { setShowForgotPassword(false); }}
            >
              Back to login
            </button>
          </form>
        )}
        <p className="login__register">
          Don't have an account? <Link to="/register" className="btn--link">Register</Link>
        </p>
      </div>
    </div>
  );
}
