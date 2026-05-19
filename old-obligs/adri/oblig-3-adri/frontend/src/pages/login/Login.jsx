import { useState } from "react";
import { loginUser, getUser } from "../../services/users-service.js";
import { useAuth } from "../../hooks/useAuth.js";
import { useNavigate, Link } from "react-router";
import styles from "./Login.module.css";

export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null); //store error message to show user if login fail
    const auth = useAuth();
    const login = auth.login;
    const navigate = useNavigate();

    async function submitHandler(e) {
        e.preventDefault();
        try {
            const result = await loginUser(username, password); //send login request, get id back
            const userData = await getUser(result._id); //fetch user
            login(userData); //store user in context so app knows someone is logged in
            navigate("/");
        } catch (err) {
            setError(err.message); //show error message to user
        }
    }

    return(
        <main className={styles.login}>
            <form className={styles.login__form} onSubmit={submitHandler}>
                <Link to="/" title="To homepage"><img src="/favicon.svg" alt="Logo" /></Link>
                <div className={styles.login__fields}>
                    <label htmlFor="username">Username:</label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => { setUsername(e.target.value) }}
                    />
                </div>
                <div className={styles.login__fields}>
                    <label htmlFor="password">Password:</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => { setPassword(e.target.value) }} 
                    />
                </div>
                <button type="submit">Login</button>
                <button type="button">Forgot password</button>
                <p><Link to="/register">Dont have an account?</Link></p>
            </form>
            {error ? (
                <p className={styles.login__error}>{error}</p>
            ) : (
                null
            )}
        </main>
    );
}
