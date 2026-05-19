import styles from "./AboutUs.module.css";

export default function AboutUs() {
    return(
        <div className={styles["about-us"]}>
            <h1>About us</h1>
            <section className={styles["about-us__section"]}>
                <p>Spanish Dice Poker started in 2025 as a side project to bring the classic dice game online. It quickly grew into a full platform as the community expanded.</p>
                <p>We are a small team of developers who want everyone to enjoy this game.</p>
                <p>Got a suggestion or want to report an issue? Reach out to us at <a href="mailto:spanishdicepoker@gmail.com">spanishdicepoker@gmail.com</a></p>
            </section>
        </div>
    );
}
