export default function AboutUs() {
  return (
    <div className="about-us">
      <h1>About Us</h1>
      <section className="about-us__section">
        <h2>Our Story</h2>
        <p>
          PokerDados was created by a team of students at NTNU for the IDG2100
          fullstack exam. The assignment challenged us to build a complete
          online gaming platform from scratch: backend, frontend, real-time
          gameplay, and a comment section for users to talk to each other.
        </p>
      </section>
      <section className="about-us__section">
        <h2>Our Mission</h2>
        <p>
          Spanish poker dice is an underrated game and this platform is our
          attempt to give it the online home it deserves. We want to build
          something fun, competitive, and fair.
        </p>
      </section>
      <section className="about-us__section">
        <h2>The Team</h2>
        <div className="about-us__team">
          <div className="about-us__member">
            <div className="about-us__member-avatar">EL</div>
            <strong>Emil</strong>
          </div>
          <div className="about-us__member">
            <div className="about-us__member-avatar">NB</div>
            <strong>Nicolai</strong>
          </div>
          <div className="about-us__member">
            <div className="about-us__member-avatar">AM</div>
            <strong>Adrian</strong>
          </div>
        </div>
      </section>
    </div>
  );
}
