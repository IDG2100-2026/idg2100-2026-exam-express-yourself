import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../../api/users";

function RegisterPage() {
  // const [username, setUsername] = useState('')
  // const [email, setEmail] = useState('')
  // const [password, setPassword] = useState('')
  // const [confirmPassword, setConfirmPassword] = useState('')
  // const [dateOfBirth, setDateOfBirth] = useState('')
  const [formdata, setFormdata] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    email: "",
    age: "",
  });
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  async function handleChange(e) {
    const { name, value } = e.target; // name is where the user is typing, and value is what the user typed!
    setFormdata((prev) => ({ ...prev, [name]: value }));
  }
  async function handleSubmit(e) {
    e.preventDefault();
    setIsSubmitting(true); // Will disable the submit button, the the user cannot input multiple times

    if (formdata.password !== formdata.confirmPassword) {
      setError("Passwords does not match!"); // if the passwords does match
      setIsSubmitting(false);
      return;
    }

    if (!agreedToTerms) {
      setError("You must agree to the terms and conditions"); // if user forgot to check the checkbox
      return;
    }

    setLoading(true);

    try {
      const birthDate = new Date(dateOfBirth);
      const age = Math.floor(
        (Date.now() - birthDate) / (365.25 * 24 * 60 * 60 * 1000),
      );

      if (age < 18) {
        setError("You must be 18 or older to register.");
        setLoading(false);
        return;
      }

      await registerUser({
        ...formdata, // insert the formdata
        age: Number(formdata.age), // Convert the age from string to number
      });
      setIsSuccess(true);
      setFormdata({
        username: "",
        password: "",
        confirmPassword: "",
        email: "",
        age: "",
      }); // reset the form to blank after successful register
      setTimeout(() => {
        navigate("/login"); // navigate to login page after 3 seconds
      }, 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setIsSubmitting(false);
    }
  }

  return (
    <div className="register">
      <div className="register__card">
        <h1 className="register__title">Create Account</h1>
        <p className="register__subtitle">Join PokerDados today</p>
        {isSuccess ? (
          <p>Registration successful! you will be redirected to login page</p>
        ) : (
          <p className="register__error">{error}</p>
        )}
        <form className="register__form" onSubmit={handleSubmit}>
          <div className="register__field">
            <label htmlFor="username">Username</label>
            <input
              name="username"
              id="username"
              type="text"
              value={formdata.username}
              onChange={handleChange}
              placeholder="coolplayer42"
              required
            />
          </div>

          <div className="register__field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={formdata.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="register__field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              value={formdata.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </div>

          <div className="register__field">
            <label htmlFor="confirmPassword">Repeat Password</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formdata.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </div>

          <div className="register__field">
            <label htmlFor="dateOfBirth">Date of Birth</label>
            <input
              name="dateOfBirth"
              id="dateOfBirth"
              type="date"
              value={formdata.dateOfBirth}
              onChange={handleChange}
              required
            />
          </div>

          <div className="register__checkbox">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
            />
            <label htmlFor="terms">
              I agree to the <Link to="/terms">Terms & Conditions</Link>
            </label>
          </div>

          <button className="register__submit" disabled={loading}>
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

export default RegisterPage;
