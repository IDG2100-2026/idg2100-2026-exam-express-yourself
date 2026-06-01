import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { loginUser, verifyEmail } from "../../services/auth-service.js";
import { useAuth } from "../../hooks/useAuth.js";
import { useAppearance } from "../../hooks/useAppearance.js";

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
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
          <Link className="login__forgot btn--link">Re-send verification email</Link>
        </form>
        <p className="login__register">
          Don't have an account? <Link to="/register" className="btn--link">Register</Link>
        </p>
      </div>
    </div>
  );
}
