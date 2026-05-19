import styles from './PrivacyPolicy.module.css';

export default function PrivacyPolicy() {
  return (
    <article className={styles.wrapper}>
      <div className={styles.container}>
        <h1 className={styles.title}>Privacy Policy</h1>
        <span className={styles.lastUpdated}>Last updated: April 23, 2026</span>
        <p className={styles.intro}>
          This privacy policy explains what information Spanish Dice Poker collects, how it is
          used, and how it is protected. This platform is a university project developed by Emil
          Larsen at NTNU Gjøvik and is not a commercial service.
        </p>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>1. Information We Collect</h2>
          <p className={styles.sectionBody}>
            When you register an account, we collect your username, email address, password, and
            age. Your password is hashed before being stored and is never visible to anyone,
            including administrators. When you use the platform, we also collect gameplay data
            such as game results, Elo ratings, and comments you post.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>2. How We Use Your Information</h2>
          <p className={styles.sectionBody}>
            Your information is used to provide the core features of the platform, including user
            authentication, Elo-based matchmaking, game history tracking, and displaying your
            profile to other users. We do not use your information for marketing, advertising, or
            any commercial purpose.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>3. What Other Users Can See</h2>
          <p className={styles.sectionBody}>
            Other users can see your username, Elo rating, game history, about me description,
            and profile image. Your email address is only visible to you on your own profile page.
            Your password is never displayed anywhere on the platform.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>4. Data Storage</h2>
          <p className={styles.sectionBody}>
            All data is stored in a MongoDB database. Passwords are hashed using a one-way
            hashing algorithm before storage. While we take reasonable measures to protect your
            data, this is a university project and no guarantees are made regarding the security
            or long-term storage of your information.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>5. Cookies and Local Storage</h2>
          <p className={styles.sectionBody}>
            The platform uses browser local storage to keep you logged in between sessions and to
            save your theme preference. No third-party cookies or tracking technologies are used.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>6. Comments</h2>
          <p className={styles.sectionBody}>
            Comments you post on games are visible to other registered users. Administrators can
            delete comments that violate the platform's terms and conditions. Deleted comments are
            permanently removed from the database.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>7. Account Deletion</h2>
          <p className={styles.sectionBody}>
            If you wish to have your account and associated data removed, please contact the
            platform administrator. As this is a university project, account deletion is handled
            manually.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>8. Children</h2>
          <p className={styles.sectionBody}>
            This platform is not intended for users under the age of 13. The registration form
            requires users to meet a minimum age requirement as defined in the platform's
            configuration.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>9. Third-Party Services</h2>
          <p className={styles.sectionBody}>
            This platform does not share your data with any third-party services. All data
            remains within the platform's own database.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>10. Changes to This Policy</h2>
          <p className={styles.sectionBody}>
            This privacy policy may be updated at any time. Continued use of the platform after
            changes are made constitutes acceptance of the updated policy.
          </p>
        </section>

        <p className={styles.contact}>
          If you have any questions or concerns about your data, feel free to reach out through
          the platform.
          <span className={styles.textItalic}>This privacy policy was generated by Claude Code</span>
        </p>
      </div>
    </article>
  );
}
