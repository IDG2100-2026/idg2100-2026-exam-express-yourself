import styles from "./TermsConditions.module.css";

export default function TermsConditions() {
    return(
        <div className={styles["terms-conditions"]}>
            <h1>Terms and conditions</h1>
            <section className={styles["terms-conditions__section"]}>
                <p>By using Spanish Dice Poker you agree to these terms:</p>
                <ul>
                    <li>You must be at least 18 years old to register.</li>
                    <li>You are responsible for keeping your account secure.</li>
                    <li>The platform is provided as is. We do not guarantee uptime or availability.</li>
                    <li>We may update these terms at any time.</li>
                </ul>
            </section>
        </div>
    );
}
