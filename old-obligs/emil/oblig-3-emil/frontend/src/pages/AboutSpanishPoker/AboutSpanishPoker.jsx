import styles from './AboutSpanishPoker.module.css';
export default function AboutSpanishPoker(){
    return(
        <article className={styles.aboutSpanishPokerWrapper}>
            <h1>About Spanish Poker</h1>
            <div className={styles.aboutSpanishPokerContainer}>
                <p>Spanish Dice Poker is a variant of regular poker as we all know it, but changes the cards with dices. The point of the game is to get the highest pair of hands from your dices, and the player who gets the best hand, wins the round.</p>
                <p>On this platform, you can choose when you create a game if you want to play a best of 3, 5 or 7 rounds. Each round also have a time control. What that means is you will choose if you want a 3, 10 or 30 seconds of playtime each round. (e.g, if you choose 10, you have 10 seconds to roll 3 times, and to decide what dices you want, If you do not finish within the time control you chose, the round will end, and the dices you had on the end of that round, is your hand to compare against your opponent.</p>
                <p>We also offer to choose if you want to include straight hands (e.g, 7, 8, J, Q or  8, J, Q, K) or not. What ever you choose in best of rounds, time control and straight hands allowed, this will be displayed to the other opponent, so there are no surprises when entering the game.</p>
                <p>We offer that the users can comment on the game, but if anything inappropriate or harassment, you will be banned.</p>
            </div>
        </article>
    );
};