import { useState } from "react";
import { useAuth } from "../../hooks/useAuth.js";
import { useUser } from "../../hooks/useUser.js";
import { updateUser } from "../../services/users-service.js";
import styles from "./Profile.module.css";

export default function Profile() {
    const auth = useAuth();
    const currentUser = auth.user; //the logged in user from context

    const userResult = useUser(currentUser._id); //fetch profile data using logged in user id
    const user = userResult.user;
    const ifLoading = userResult.ifLoading;
    const error = userResult.error;

    const [email, setEmail] = useState("");
    const [aboutMe, setAboutMe] = useState("");
    const [password, setPassword] = useState("");
    const [saveError, setSaveError] = useState(null);
    const [saveSuccess, setSaveSuccess] = useState(false);

    async function submitHandler(e) {
        e.preventDefault();
        setSaveError(null); //clear previous feedback before trying again
        setSaveSuccess(false); //reset success message so it doesnt stay visible from a previous save
        try {
            const updateData = {}; //only send fields the user actually filled in
            if (email) {
                updateData.email = email;
            }
            if (aboutMe) {
                updateData.aboutMe = aboutMe;
            }
            if (password) {
                updateData.password = password;
            }
            await updateUser(currentUser._id, updateData);
            setSaveSuccess(true);
        } catch (err) {
            setSaveError(err.message);
        }
    }

    if (ifLoading) {
        return (<p>Loading...</p>);
    }
    if (error) {
        return (<p>Error: {error.toString()}</p>);
    }
    if (!user) {
        return (<p>User not found</p>);
    }

    return(
        <div className={styles.profile}>
            <h1>Profile</h1>
            <section className={styles.profile__section}>
            <h2>Edit profile</h2>
            <form onSubmit={submitHandler} className={styles.profile__form}>
                <div className={styles.profile__field}>
                    <label>Username:</label>
                    <p>{user.username}</p>
                </div>
                <div className={styles.profile__field}>
                    <label htmlFor="email">Email:</label>
                    <input
                        type="text"
                        id="email"
                        placeholder={user.email}
                        value={email}
                        onChange={(e) => {
                            setEmail(e.target.value);
                        }}
                    />
                </div>
                <div className={styles.profile__field}>
                    <label htmlFor="aboutMe">About me:</label>
                    <textarea
                        id="aboutMe"
                        placeholder={user.aboutMe || "Write something about yourself..."} //show saved text as placeholder
                        value={aboutMe}
                        onChange={(e) => {
                            setAboutMe(e.target.value);
                        }}
                    />
                </div>
                <div className={styles.profile__field}>
                    <label htmlFor="password">New password:</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => {
                            setPassword(e.target.value);
                        }}
                    />
                </div>
                <button type="submit">Save changes</button>
                {saveSuccess ? (
                    <p>Profile updated!</p>
                ) : (
                    null
                )}
                {saveError ? (
                    <p>{saveError}</p>
                ) : (
                    null
                )}
            </form>
            </section>

            <section className={styles.profile__section}>
                <h2>Stats</h2>
                <p>Elo: {user.elo}</p>
            </section>
            <section className={styles.profile__section}>
                <h2>Trophies</h2>
                <p>No trophies yet</p>
            </section>
            <section className={styles.profile__section}>
                <h2>Last 10 games</h2>
                <p>No games played yet</p>
            </section>
        </div>
    );
}
