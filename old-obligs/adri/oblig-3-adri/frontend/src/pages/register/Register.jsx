import { registerUser } from "../../services/users-service.js";
import { useState } from "react";
import { useNavigate, Link } from "react-router";
import styles from "./Register.module.css";

export default function Register() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [repeatPassword, setRepeatPassword] = useState("");
    const [dateOfBirth, setDateOfBirth] = useState("");
    const [tc, setTc] = useState(false); //tracks tc checkbox
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    async function submitHandler(e) {
        e.preventDefault();

        if (password !== repeatPassword) {
            return setError("Passwords do not match");
        }

        if (!tc) {
            return setError("You must accept the terms and conditions");
        }

        const age = (new Date() - new Date(dateOfBirth)) / 1000 / 60 / 60 / 24 / 365.25; //milliseconds alive divided down to years

        if (age < 18) {
            return setError("You must be at least 18 years old");
        }

        try {
            const userData = { username, email, password, dateOfBirth };
            await registerUser(userData);
            navigate("/login");
        } catch (err) {
            setError(err.message);
        }
    }

    return(
        <main className={styles.register}>
            <form onSubmit={submitHandler} className={styles.register__form}>
                <p><Link to="/">To homepage</Link></p>
                <div className={styles.register__field}>
                    <label htmlFor="username">Username:</label>
                    <input type="text" id="username" value={username} onChange={(e) => {
                        setUsername(e.target.value);
                    }}  />
                </div>
                <div className={styles.register__field}>
                    <label htmlFor="email">Email:</label>
                    <input type="text" id="email" value={email} onChange={(e) => {
                        setEmail(e.target.value);
                    }} />
                </div>
                <div className={styles.register__field}>
                    <label htmlFor="password">Password:</label>
                    <input type="password" id="password" value={password} onChange={(e) => {
                        setPassword(e.target.value);
                    }} />
                </div>
                <div className={styles.register__field}>
                    <label htmlFor="repeatPassword">Repeat password</label>
                    <input type="password" id="repeatPassword" value={repeatPassword} onChange={(e) => {
                        setRepeatPassword(e.target.value);
                    }} />
                </div>
                <div className={styles.register__field}>
                    <label htmlFor="dateOfBirth">Date of birth</label>
                    <input type="date" id="dateOfBirth" value={dateOfBirth} onChange={(e) => {
                        setDateOfBirth(e.target.value);
                    }} />
                </div>
                <div className={styles.register__field}>
                    <label htmlFor="tc">I agree to <Link to="/terms-conditions" target="_blank">terms and conditions</Link>.</label>
                    <input type="checkbox" id="tc" checked={tc} onChange={(e) => {
                        setTc(e.target.checked);
                    }} />
                </div>
                <div>
                    <button type="submit">Register</button>
                </div>
                <p><Link to="/login">Already have an account?</Link></p>
            </form>
            {error ? (
                <p className={styles.register__error}>{error}</p>
            ) : (
                null
            )}
        </main>
    );
}
