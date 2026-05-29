import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { resetPassword } from "../../services/auth-service.js";

const ResetPassword = () => {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [password, setPassword] = useState("");
  const [success, setSuccess] = useState(false);
  const [invalidReqError, setInvalidReqError] = useState(null);
  const navigate = useNavigate();

  const code = searchParams.get("code");

  useEffect(() => {
    if (!code) {
      setInvalidReqError("Invalid or missing reset link");
    }
  }, [code]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await resetPassword(code, password);
      setSuccess(true);
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="reset">
      <div className="reset__card">
        {invalidReqError ? (
          <p>{invalidReqError}</p>
        ) : (
          <form className="reset__form" onSubmit={handleSubmit}>
            <h2 className="reset__title">Reset Password</h2>
            {success ? (
              <p>
                Reset password successful. You will be redirected to the login
                page
              </p>
            ) : (
              <p>{error}</p>
            )}
            <div className="reset__field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="New Password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button className="reset__submit" disabled={loading}>
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
};

export default ResetPassword;