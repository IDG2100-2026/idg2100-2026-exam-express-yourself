
function AboutUsPage() {
  return (
    <div className="about-us">
      <h1 className="about-us__title">About Us</h1>

      <section className="about-us__section">
        <h2>Our Story</h2>
        <p>
          PokerDados was created by Nicolai Buseth, a student at NTNU grinding through
          IDG2100. The assignment was given by Aliaksei and Carlos, two course instructors
          who apparently thought it would be fun to ask one person to build an entire
          full-stack online gaming platform from scratch. For a grade.
        </p>
        <p>
          This is Obligatory Assignment 3. There was also an Obligatory Assignment 1 and 2.
          Each one harder than the last. By the time Nicolai reached number 3, he had
          already built a backend API, documented it, and somehow still had to build
          the entire frontend on top of it. Alone. With a deadline.
        </p>
        <p>
          It has been a journey. Not always a fun one. But the dice are rolling, the
          pages are rendering, and the code compiles. That counts for something.
        </p>
      </section>

      <section className="about-us__section">
        <h2>Our Mission</h2>
        <p>
          Nicolai's mission is to pass IDG2100. Beyond that, he genuinely wanted to build
          something he could be proud of, not just something that technically meets the
          requirements. Spanish poker dice is an underrated game and this platform is his
          attempt to give it the online home it deserves. If Aliaksei and Carlos are reading
          this: he tried his best, and he hopes it shows.
        </p>
      </section>

      <section className="about-us__section">
        <h2>The Team</h2>
        <div className="about-us__team">
          <div className="about-us__member">
            <div className="about-us__member-avatar">NB</div>
            <strong>Nicolai Buseth</strong>
            <span>Founder, Developer & Chief Dice Officer</span>
          </div>
        </div>
      </section>
    </div>
  )
}

export default AboutUsPage
