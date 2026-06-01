import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { loginUser, verifyEmail, resendVerifyEmail } from "../../services/auth-service.js";
import { useAuth } from "../../hooks/useAuth.js";
import { useAppearance } from "../../hooks/useAppearance.js";

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [verificationFailed, setVerificationFailed] = useState(false);
  const [resendEmail, setResendEmail] = useState("");
  const [resendSuccess, setResendSuccess] = useState(null);
  const [resendError, setResendError] = useState(null);
  const [isResending, setIsResending] = useState(false);
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
        setVerificationFailed(true);
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

  async function handleResend(event) {
    event.preventDefault();
    setResendError(null);
    setResendSuccess(null);
    setIsResending(true);
    try {
      const data = await resendVerifyEmail(resendEmail);
      setResendSuccess(data.message);
    } catch (err) {
      setResendError(err.message);
    } finally {
      setIsResending(false);
    }
  }

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
          <Link to="/forgot-password" className="login__forgot btn--link">
            Forgot password?
          </Link>
        </form>
        <p className="login__register">
          Don't have an account? <Link to="/register" className="btn--link">Register</Link>
        </p>

        {verificationFailed && (
          <form className="login__form stack-m" onSubmit={handleResend}>
            <p className="login__status">Enter your email to receive a new verification link.</p>
            {resendError && <p className="login__error">{resendError}</p>}
            {resendSuccess && <p className="login__success">{resendSuccess}</p>}
            <div className="login__field">
              <label htmlFor="resendEmail">Email</label>
              <input
                id="resendEmail"
                type="email"
                value={resendEmail}
                onChange={(e) => { setResendEmail(e.target.value); }}
                placeholder="name@example.com"
                required
              />
            </div>
            <button type="submit" className="btn btn--secondary login__submit" disabled={isResending}>
              {isResending ? "Sending..." : "Resend verification email"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
