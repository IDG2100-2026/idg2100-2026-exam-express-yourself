import { Link } from "react-router";
import styles from "./Lobby.module.css";
import { useMatches } from "../../hooks/useMatches.js";
import { useAuth } from "../../hooks/useAuth.js";

export default function Lobby() {
    const result = useMatches();
    const matches = result.matches;
    const ifLoading = result.ifLoading;
    const error = result.error;

    const auth = useAuth();
    const user = auth.user;

    if (ifLoading) {
        return (<p>Loading..</p>);
    }
    if (error) {
        return (<p>Error: {error.toString()}</p>);
    }

    const joinableMatches = [];

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

    const matchItems = [];

    for (let i = 0; i < joinableMatches.length; i++) {
        const match = joinableMatches[i];
        matchItems.push(
            <li key={match._id}>
                <Link to={"/game/" + match._id}>
                    <p className={styles.lobby__card__title}>{match.playerOne.username} vs waiting</p>
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

    return (
        <div className={styles.lobby}>
            <h1>Lobby</h1>
            <p>Games available to join</p>
            <ul>
                {matchItems}
            </ul>
        </div>
    );
}
