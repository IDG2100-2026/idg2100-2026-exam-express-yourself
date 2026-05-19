
function AboutGamePage() {
  return (
    <div className="about-game">
      <h1 className="about-game__title">About Spanish Poker Dice</h1>

      <section className="about-game__section">
        <h2>What is it?</h2>
        <p>
          Spanish Poker Dice is a classic dice game popular across Spain and Latin America.
          It is played with five special dice showing playing card symbols — 9, 10, Jack,
          Queen, King and Ace — instead of numbers. Players roll the dice and try to form
          the best poker hand possible.
        </p>
      </section>

      <section className="about-game__section">
        <h2>How to play</h2>
        <p>
          Each round, a player rolls all five dice and may keep any they like, then roll
          the remaining dice again. The goal is to form the strongest hand. Bluffing and
          reading your opponent are just as important as the roll itself.
        </p>
      </section>

      <section className="about-game__section">
        <h2>Hand rankings</h2>
        <ol className="about-game__list">
          <li>Five of a Kind</li>
          <li>Four of a Kind</li>
          <li>Full House</li>
          <li>Straight (straights variant only)</li>
          <li>Three of a Kind</li>
          <li>Two Pair</li>
          <li>One Pair</li>
          <li>High Card</li>
        </ol>
      </section>

      <section className="about-game__section">
        <h2>Game variants on PokerDados</h2>
        <p>
          Every game uses a three-part format: <strong>Best of 3, 5 or 7</strong> rounds,
          <strong> straights allowed or not</strong>, and a time limit of
          <strong> 5, 10 or 15 seconds</strong> per round.
        </p>
      </section>
    </div>
  )
}

export default AboutGamePage
