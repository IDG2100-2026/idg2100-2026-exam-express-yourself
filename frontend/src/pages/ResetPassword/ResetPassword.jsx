import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router";
import { resetPassword } from "../../services/auth-service.js";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [invalidLink, setInvalidLink] = useState(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const code = searchParams.get("code");

  useEffect(() => {
    if (!code) { // if user enters this page without the code we show this msg
      setInvalidLink("Invalid or missing reset link.");
    }
  }, [code]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const data = await resetPassword(code, password);
      setSuccess(data.message);
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="reset-password">
      <div className="reset-password__card stack-m">
        {invalidLink ? (
          <p className="reset-password__error">{invalidLink}</p>
        ) : (
          <form className="reset-password__form stack-m" onSubmit={handleSubmit}>
            <h1>Reset password</h1>
            {success && <p className="reset-password__success">{success}</p>}
            {error && <p className="reset-password__error">{error}</p>}
            <div className="reset-password__field">
              <label htmlFor="password">New password</label>
              <input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); }}
                placeholder="********"
                required
              />
            </div>
            <button type="submit" className="btn btn--primary reset-password__submit" disabled={isLoading}>
              {isLoading ? "Resetting..." : "Reset password"}
            </button>
            <Link to="/login" className="reset-password__back btn--link">
              Back to log in
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}
