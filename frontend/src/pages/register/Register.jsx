import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { registerUser, resendVerifyEmail } from "../../services/auth-service.js";

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
  const [success, setSuccess] = useState(null);
  const [successfulCreate, setSuccessfulCreate] = useState(false);
  const navigate = useNavigate();

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => {
      let newValue;
      if (type === "checkbox") {
        newValue = checked;
      } else {
        newValue = value;
      }
      return { ...prev, [name]: newValue };
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!formData.agreedToTerms) {
      setError("You must agree to the terms and conditions");
      return;
    }

    const birthDate = new Date(formData.dateOfBirth);
    const age = Math.floor(
      (Date.now() - birthDate) / (365.25 * 24 * 60 * 60 * 1000),
    );

    if (age < 18) {
      setError("You must be at least 18 years old");
      return;
    }

    setIsSubmitting(true);

    try {
      const userData = await registerUser({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        age,
      });
      setSuccess(userData.message);
      setSuccessfulCreate(true);
      setFormData({
        username: "",
        email: formData.email,
        password: "",
        confirmPassword: "",
        dateOfBirth: "",
        agreedToTerms: false,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function resendUserVerification(email) {
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      const data = await resendVerifyEmail(email);
      setSuccess(data.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="register">
      <div className="register__card stack-m">
        <form className="register__form stack-m" onSubmit={handleSubmit}>
          <h1>Create account</h1>
          {success && <p className="register__success">{success}</p>}
          {error && <p className="register__error">{error}</p>}
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
              placeholder="name@example.com"
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
              placeholder="********"
              required
            />
          </div>
          <div className="register__field">
            <label htmlFor="confirmPassword">Repeat password</label>
            <input
              id="confirmPassword"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="********"
              required
            />
          </div>
          <div className="register__field">
            <label htmlFor="dateOfBirth">Date of birth</label>
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
              I agree to the <Link to="/terms" target="_blank" className="btn--link">Terms & Conditions</Link>
            </label>
          </div>
          <button type="submit" className="btn btn--primary register__submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating account..." : "Create account"}
          </button>
          {successfulCreate && (
            <button
              type="button"
              className="btn btn--secondary register__submit"
              disabled={isSubmitting}
              onClick={() => { resendUserVerification(formData.email); }}
            >
              {isSubmitting ? "Sending..." : "Resend verification email"}
            </button>
          )}
        </form>
        <p className="register__login">
          Already have an account? <Link to="/login" className="btn--link">Log in</Link>
        </p>
      </div>
    </div>
  );
}
