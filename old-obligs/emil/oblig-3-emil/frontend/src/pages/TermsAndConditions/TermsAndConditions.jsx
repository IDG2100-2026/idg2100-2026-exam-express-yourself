import styles from './TermsAndConditions.module.css';

export default function TermsAndConditions() {
  return (
    <article className={styles.wrapper}>
      <div className={styles.container}>
        <h1 className={styles.title}>Terms and Conditions</h1>
        <span className={styles.lastUpdated}>Last updated: April 23, 2026</span>
        <p className={styles.intro}>
          Welcome to Spanish Dice Poker. By accessing or using this platform, you agree to the
          following terms. If you do not agree, please do not use the platform.
        </p>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>1. About the Platform</h2>
          <p className={styles.sectionBody}>
            Spanish Dice Poker is a university project developed by Emil Larsen as part of
            coursework at NTNU Gjøvik. The platform is provided for educational and entertainment
            purposes only. It is not a commercial product and does not involve real money,
            gambling, or monetary prizes of any kind.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>2. User Accounts</h2>
          <p className={styles.sectionBody}>
            You may use the platform as an anonymous user or create a registered account. When
            registering, you must provide a valid email address and accurate information. You are
            responsible for keeping your login credentials secure. Each user may only maintain one
            account.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>3. User Conduct</h2>
          <p className={styles.sectionBody}>
            By using the platform, you agree to not use offensive or inappropriate usernames,
            harass or abuse other users through the comment system, attempt to exploit bugs,
            manipulate Elo ratings, or interfere with the platform's functionality, or create
            multiple accounts to gain an unfair advantage.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>4. Elo Rating System</h2>
          <p className={styles.sectionBody}>
            The platform uses an Elo-based rating system to rank players and facilitate
            matchmaking. Elo ratings are calculated automatically based on game outcomes. Any
            attempt to manipulate ratings through intentional losing, match fixing, or abuse of
            the system may result in your account being banned.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>5. Game Rules</h2>
          <p className={styles.sectionBody}>
            All games are governed by the rules of Spanish Dice Poker as implemented on the
            platform. By creating or joining a game, you agree to play in good faith and respect
            the outcome. Game variants (rounds, time control, straight hands) are chosen at game
            creation and cannot be changed once a match begins.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>6. Comments</h2>
          <p className={styles.sectionBody}>
            Registered users may post comments on games. Comments must not contain hate speech,
            threats, spam, or any form of abusive language. The platform administrators reserve
            the right to delete any comment that violates these rules without prior notice.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>7. Privacy</h2>
          <p className={styles.sectionBody}>
            Your email address is only visible to you on your own profile page. Other users can
            see your username, Elo rating, game history, and profile information. Passwords are
            stored in a hashed format and are never visible to anyone, including administrators.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>8. Account Bans</h2>
          <p className={styles.sectionBody}>
            Administrators reserve the right to ban any user who violates these terms. Banned
            users will be unable to join games or tournaments. Ban decisions are made at the
            discretion of the platform administrators.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>9. Data and Availability</h2>
          <p className={styles.sectionBody}>
            As this is a university project, no guarantees are made regarding data persistence,
            uptime, or long-term availability. The platform may be taken offline or modified at
            any time without notice.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>10. Limitation of Liability</h2>
          <p className={styles.sectionBody}>
            This platform is provided as-is with no warranties of any kind. Emil Larsen and NTNU
            Gjøvik are not liable for any loss of data, account issues, or any other damages
            arising from the use of this platform.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>11. Changes to These Terms</h2>
          <p className={styles.sectionBody}>
            These terms may be updated at any time. Continued use of the platform after changes
            are made constitutes acceptance of the updated terms.
          </p>
        </section>

        <p className={styles.contact}>
          If you have any questions about these terms, feel free to reach out through the platform.
        <span className={styles.textItalic}>This Terms And Conditions was generated by Claude Code</span>
        </p>
      </div>
    </article>
  );
}
