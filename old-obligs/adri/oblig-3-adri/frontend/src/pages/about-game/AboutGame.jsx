import styles from "./AboutGame.module.css";

export default function AboutGame() {
    return(
        <div className={styles["about-game"]}>
            <h1>About Spanish Poker Dice</h1>
            <section className={styles["about-game__section"]}>
                <p>Spanish Poker Dice is a 1 vs 1 game played with five dice, that has the sides: 9 10 Jack Queen King Ace.</p>
                <p>The goal is to roll the best poker hand possible within a predefined allowed number of rolls per round.</p>
                <p>Each round a player rolls all five dice, then chooses which to keep and re-rolls the rest.</p>
                <p>The best poker hand wins the round. Games are either best of 3, 5 or 7 rounds.</p>
                <p>Depending on the game settings, straights may or may not count as a valid hand.</p>
                <p>Each round also has a time limit of 3, 10 or 30 seconds.</p>
            </section>
            <img src="/spanish-dice-poker-dice.jpg" alt="Spanish poker dice" />
        </div>
    );
}
