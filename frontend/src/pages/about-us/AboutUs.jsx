export default function AboutUs() {
  return (
    <div className="about-us stack-l">
      <h1>About us</h1>
      <section className="about-us__section stack-s">
        <h2>Our story</h2>
        <p>
          PokerDados was created by a team of students at NTNU for the IDG2100
          fullstack exam. The assignment challenged us to build a complete
          online gaming platform from scratch: backend, frontend, real-time
          gameplay, and a comment section for users to talk to each other.
        </p>
      </section>
      <section className="about-us__section stack-s">
        <h2>Our mission</h2>
        <p>
          Spanish poker dice is an underrated game and this platform is our
          attempt to give it the online home it deserves. We want to build
          something fun, competitive, and fair.
        </p>
      </section>
      <section className="about-us__section stack-s">
        <h2>The team</h2>
        <ul className="about-us__team">
          <li className="about-us__member">
            <div className="about-us__member-avatar">EL</div>
            <strong>Emil</strong>
          </li>
          <li className="about-us__member">
            <div className="about-us__member-avatar">NB</div>
            <strong>Nicolai</strong>
          </li>
          <li className="about-us__member">
            <div className="about-us__member-avatar">AM</div>
            <strong>Adrian</strong>
          </li>
        </ul>
      </section>
    </div>
  );
}
