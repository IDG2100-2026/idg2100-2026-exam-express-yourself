import styles from "./PrivacyPolicy.module.css";

export default function PrivacyPolicy() {
    return(
        <div className={styles["privacy-policy"]}>
            <h1>Privacy policy</h1>
            <section className={styles["privacy-policy__section"]}>
                <p>We collect only what we need to run your account:</p>
                <ul>
                    <li>Username</li>
                    <li>Email address</li>
                    <li>Date of birth</li>
                </ul>
                <p>We do not sell or share your data with anyone. Your data is stored securely and used only to provide the service.</p>
                <p>To request deletion of your account and data, contact us at <a href="mailto:spanishdicepoker@gmail.com">spanishdicepoker@gmail.com</a></p>
            </section>
        </div>
    );
}
