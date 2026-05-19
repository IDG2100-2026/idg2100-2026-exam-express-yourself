import { Link } from "react-router";
import styles from "./Home.module.css";
import { useMatches } from "../../hooks/useMatches.js";
import { useAuth } from "../../hooks/useAuth.js";
import { useAppearance } from "../../hooks/useAppearance.js";

export default function Home() {
    //data fetching
    const result = useMatches();
    const matches = result.matches;
    const ifLoading = result.ifLoading;
    const error = result.error;

    const auth = useAuth();
    const user = auth.user;

    const appearanceResult = useAppearance();
    const appearance = appearanceResult.appearance;

    if (ifLoading) {
        return (<p>Loading..</p>);
    }
    if (error) {
        return (<p>Error: {error.toString()}</p>)
    }

    //lobby page preview
    const joinableMatches = []; //holds only matches that are waiting for another player

    for (let i = 0; i < matches.length; i++) {
        const match = matches[i];
        if (match.status !== "waiting") { //skip matches that are not waiting for a player
            continue;
        }
        if (!match.playerOne) { //skip matches with no host
            continue;
        }
        if (!user && !match.allowAnonymous) { //skip matches that dont allow anonymous if not logged in
            continue;
        }
        joinableMatches.push(match);
    }

    const lobbyPreviewLimit = appearance.lobbyCount; //how many games to show, set in appearance customizer

    const lobbyPreviewItems = []; //hold matches for lobby preview

    for (let i = 0; i < joinableMatches.length && i < lobbyPreviewLimit; i++) { //keep going as long as there are more matches and limit is not hit yet, whichever runs out first stops it
        const match = joinableMatches[i];
        lobbyPreviewItems.push(
            <li key={match._id}> {/* key lets react track and update items individually */}
                <Link to={"/game/" + match._id}>
                    <p className={styles.home__card__title}>{match.playerOne.username} vs waiting</p>
                    <p>Player elo: {match.playerOne.elo}</p>
                    <p>Status: {match.status}</p>
                    <p>Best of: {match.bestOf}</p>
                    <p>Straights: {match.straightsAllowed ? "yes" : "no"}</p>
                    <p>Time per round: {match.timeControl} seconds</p>
                    <p>Anonymous allowed: {match.allowAnonymous ? "yes" : "no"}</p>
                </Link>
            </li>
        );
    }

    //top 5 games
    const activeMatches = [];

    for (let i = 0; i < matches.length; i++) {
        const match = matches[i];
        if (match.status === "active" && match.playerOne && match.playerTwo) {
            match.averageElo = (match.playerOne.elo + match.playerTwo.elo) / 2; //store average elo on the match so we can sort later
            activeMatches.push(match);
        }
    }

    activeMatches.sort((matchA, matchB) => {
        return matchB.averageElo - matchA.averageElo; //highest average elo first
    });

    const highestEloMatches = []; //to hold highest elo matches

    for (let i = 0; i < activeMatches.length && i < 5; i++) {
        highestEloMatches.push(activeMatches[i]); //move first matches in activeMatches and since sorted will always be highest elo matches
    }

    if (highestEloMatches.length < 5) { //fill remaining with recent finished games
        const finishedMatches = [];

        for (let i = 0; i < matches.length; i++) {
            const match = matches[i];
            if (match.status === "finished" && match.playerOne && match.playerTwo) { //go through all matches, only add if match is finished and both players exist
                match.averageElo = (match.playerOne.elo + match.playerTwo.elo) / 2;
                finishedMatches.push(match);
            }
        }

        for (let i = 0; i < finishedMatches.length && highestEloMatches.length < 5; i++) { //go through finishedMatches and add one by one until hit 5
            highestEloMatches.push(finishedMatches[i]);
        }
    }

    const highestEloMatchItems = [];

    for (let i = 0; i < highestEloMatches.length; i++) {
        const match = highestEloMatches[i];
        highestEloMatchItems.push(
            <li key={match._id}>
                <Link to={"/game/" + match._id}>
                    <p className={styles.home__card__title}>{match.playerOne.username} vs {match.playerTwo.username}</p>
                    <p>Average Elo: {match.averageElo}</p>
                    <p>Status: {match.status}</p>
                    <p>Best of: {match.bestOf}</p>
                    <p>Straights: {match.straightsAllowed ? "yes" : "no"}</p>
                    <p>Time per round: {match.timeControl} seconds</p>
                    <p>Anonymous allowed: {match.allowAnonymous ? "yes" : "no"}</p>
                </Link>
            </li>
        );
    }

    //upcoming tournaments

    return(
        <div className={styles.home}>
            <section> {/* Intro */}
                <h1>Spanish Dice Poker</h1>
                <p>Lo and behold, the internets hottest dice poker game!</p>
                <p>Quickplay, tournaments, skillbased matchups, you name it.</p>
                <p>Sign up to start tracking your score and customize your experience.</p>
                <Link to="/create-game" title="Create game" className={styles.home__cta}>CREATE GAME</Link>
            </section>
            <section> {/* Lobby page preview */}
                <h2>Joinable games</h2>
                <ul>
                    {lobbyPreviewItems}
                </ul>
            </section>
            <section> {/* Top 5 games */}
                <h2>Highest elo live games</h2>
                <ul>
                    {highestEloMatchItems}
                </ul>
            </section>
            <section> {/* Tournament list */}
                <h2>Upcoming tournaments</h2>
                <p>No tournaments found</p>
            </section>
        </div>
    );
}
