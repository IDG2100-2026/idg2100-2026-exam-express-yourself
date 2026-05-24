import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../../services/authService.js";

export default function Register() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    dateOfBirth: "",
    agreedToTerms: false,
  });
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      return setError("Passwords do not match");
    }

    if (!formData.agreedToTerms) {
      return setError("You must agree to the terms and conditions");
    }

    const birthDate = new Date(formData.dateOfBirth);
    const age = Math.floor(
      (Date.now() - birthDate) / (365.25 * 24 * 60 * 60 * 1000),
    );

    if (age < 18) {
      return setError("You must be at least 18 years old");
    }

    setIsSubmitting(true);

    try {
      await registerUser({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        age,
      });
      setSuccess(true); // for showing confirmation msg
      setTimeout(() => {
        navigate("/"); // navigate to homepage after 3 seconds
      }, 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="register">
      <div className="register__card">
        <h1 className="register__title">Create Account</h1>
        <p className="register__subtitle">Join PokerDados today</p>
        {success && <p>Registration successful! Confirm your account from the email you got to login</p>}
        <form className="register__form" onSubmit={handleSubmit}>
          <div className="register__field">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="coolplayer42"
              required
            />
          </div>

          <div className="register__field">
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

          <div className="register__field">
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

          <div className="register__field">
            <label htmlFor="confirmPassword">Repeat Password</label>
            <input
              id="confirmPassword"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </div>

          <div className="register__field">
            <label htmlFor="dateOfBirth">Date of Birth</label>
            <input
              id="dateOfBirth"
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              required
            />
          </div>

          <div className="register__checkbox">
            <input
              id="agreedToTerms"
              type="checkbox"
              name="agreedToTerms"
              checked={formData.agreedToTerms}
              onChange={handleChange}
            />
            <label htmlFor="agreedToTerms">
              I agree to the{" "}
              <Link to="/terms" target="_blank">
                Terms & Conditions
              </Link>
            </label>
          </div>

          {error && <p className="register__error">{error}</p>}

          <button
            className="register__submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="register__login">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}
