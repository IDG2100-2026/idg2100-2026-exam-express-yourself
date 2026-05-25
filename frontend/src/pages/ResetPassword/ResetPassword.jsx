import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router";
import { resetPassword } from "../../services/authService.js";

export const ResetPassword = () => {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [password, setPassword] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const code = searchParams.get("code");

  useEffect(() => {
    if (!code) {
      setError("Invalid or missing reset link");
    }
  }, [code]);

  const handleSubmit = async () => {
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
    <div>
      <h2>Reset Password</h2>
      {error ? (
        <p>{error}</p>
      ) : (
        <div>
          {success && (
            <p>
              Reset password successful. You will be redirected to the login page
            </p>
          )}
          <input
            type="password"
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button onClick={handleSubmit} disabled={loading}>
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </div>
      )}
    </div>
  );
};

export default ResetPassword;
