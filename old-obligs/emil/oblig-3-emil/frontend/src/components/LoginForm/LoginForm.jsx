import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { loginUser } from "../../services/login.js";
import styles from "./LoginForm.module.css";
import { useAuth } from "../../hooks/useAuth.js";

export default function LoginForm() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loginError, setLoginError] = useState(null);
  const [isLoadingLogin, setIsLoadingLogin] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const navigate = useNavigate();
  const { user, login } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoadingLogin(true);
    setIsLoggingIn(true);
    try {
      const loginData = await loginUser(formData);
      login(loginData.user); // every time this runs, every component that is using useAuth is re-rendered with the new data
      setLoginSuccess(true);
      setTimeout(() => { // Shows a confirmation message that the user has successfully logged in, so we give them 3 sec to read then redirect back to homepage
        navigate("/"); // If successful login, we navigate back to homepage!
      }, 3000)
    } catch (err) {
      setLoginError(err.message);
    } finally {
      setIsLoadingLogin(false);
      setIsLoggingIn(false);
    }
  };

  return (
    <form className={styles.formWrapper} onSubmit={handleSubmit}>
      <div className={styles.formContainer}>
        <h1 className={styles.formHeading}>Login</h1>
        {
          // if successful login, we display the success msg, else we display the error msg at the top in red, 
          loginSuccess ? <p className={styles.loginConfirmation}>Login successful! You will be redirected to the homepage page</p> : <p className={styles.formErrorMsg}>{loginError}</p>
        }
        <label className={styles.loginLabel} htmlFor="email">
          Email
        </label>
        <input
          className={styles.loginInput}
          type="email"
          name="email"
          id="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <label className={styles.loginLabel} htmlFor="pwd">Password</label>
        <input
          className={styles.loginInput}
          type="password"
          name="password"
          id="pwd"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <Link className={styles.forgotPassword} to="#">Forgot password?</Link> {/*Does not do anything! */}
        <button className={styles.loginBtn} disabled={isLoggingIn}>
          {isLoggingIn ? "Logging in..." : "Login"}
        </button>

        <span className={styles.noAccount}>Don't have a account yet? <Link className={styles.registerLink} to="/register">Register here</Link></span>
      </div>
    </form>
  );
}
