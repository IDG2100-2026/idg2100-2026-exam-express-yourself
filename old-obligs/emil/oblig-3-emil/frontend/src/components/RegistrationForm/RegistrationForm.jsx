import styles from "./RegistrationForm.module.css";
import { useState } from "react";
import { registerUser } from "../../services/createNewUser.js";
import { Link, useNavigate } from "react-router";
export default function RegistrationForm() {
  const [formData, setFormData] = useState({
    username: "",
    pwd: "",
    confirmPwd: "",
    email: "",
    age: "",
  });

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target; // name is where the user is typing, and value is what the user is typing
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // So the browser does not refresh after submitting
    setError(null); // If the user has an error, this will set it to null if they manages to fix it
    setIsSubmitting(true); // Will disable the submit button, the the user cannot input multiple times

    if(formData.pwd !== formData.confirmPwd){
      setError("Passwords do not match!");
      setIsSubmitting(false);
      return;
    }
    try {
      await registerUser({
        ...formData, // Inputs everything that was typed in the form
        age: Number(formData.age), // converting input string age to a number, so it complies with MongoDB
      });
      setSuccess(true);
      setFormData({ username: "", pwd: "", confirmPwd: "", email: "", age: "" }); // Resetting the form, so after we press input, it is blank again. This is needed because we are preventing default behavior over!
      setTimeout(() => {
        navigate("/login"); // Made this, so the user has time to read the confirmation msg, and then be redirected to login page
      }, 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.registrationWrapper}>
      <div className={styles.registrationContainer}>
        <h1>Register</h1>
        {success ? (
          <p>
            Registration successful! You will be redirected to the login page
          </p>
        ) : (
          <p className={styles.errorMsg}>{error}</p>
        )}
        {/*If there is an error, we display it at the top */}
        <label className={styles.registrationLabel} htmlFor="username">
          Username
        </label>
        <input
          className={styles.registrationInput}
          type="text"
          id="username"
          name="username"
          placeholder="e.g, johnDoe"
          value={formData.username}
          onChange={handleChange}
          required
        />
        <label className={styles.registrationLabel} htmlFor="email">
          Email
        </label>
        <input
          className={styles.registrationInput}
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="e.g, johnDoe@gmail.com"
          required
        />
        <label className={styles.registrationLabel} htmlFor="pwd">
          Password
        </label>
        <input
          className={styles.registrationInput}
          type="password"
          id="pwd"
          name="pwd"
          value={formData.pwd}
          onChange={handleChange}
          required
        />
          <label className={styles.registrationLabel} htmlFor="confirmPwd">
          Confirm Password
        </label>
        <input
          className={styles.registrationInput}
          type="password"
          id="confirmPwd"
          name="confirmPwd"
          value={formData.confirmPwd}
          onChange={handleChange}
          required
        />
        <label className={styles.registrationLabel} htmlFor="age">
          Age
        </label>
        <input
          className={styles.registrationInput}
          type="text"
          id="age"
          name="age"
          value={formData.age}
          onChange={handleChange}
          min={18}
          required
        />
        <div>
          <label htmlFor="termsAndService">
            <Link
              className={styles.termsAndConditionsText}
              target="_blank"
              to="/terms-and-conditions"
            >
              I agree to terms and conditions
            </Link>
          </label>
          <input type="checkbox" name="termsAndService" required />
        </div>
        <button className={styles.registerFormBtn} disabled={isSubmitting}>
          {isSubmitting ? "Registering" : "Register"}
        </button>
        <span className={styles.existingAccount}>
          Already have an account?{" "}
          <Link className={styles.loginLink} to="/login">
            Login here
          </Link>
        </span>
      </div>
    </form>
  );
}
