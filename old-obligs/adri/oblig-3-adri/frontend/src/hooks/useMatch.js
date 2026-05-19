import { useState, useEffect, useCallback } from "react";
import { getMatch } from "../services/matches-service.js";

export function useMatch(id) {
    const [match, setMatch] = useState(null); //starts null, fills when fetch is complete
    const [ifLoading, setIfLoading] = useState(false); //true when waiting for backend response
    const [error, setError] = useState(null); //holds error if fetch fails

    const fetchMatch = useCallback(async (ifRequestStaleObj = { stale: false }) => { //useCallback prevents useEffect from looping on rerender within the same mount
        setIfLoading(true);
        try {
            const data = await getMatch(id); //wait for backend response
            if (!ifRequestStaleObj.stale) {
                setMatch(data);
            }
        } catch(err) {
            if (!ifRequestStaleObj.stale) {
                setError(err); //something went wrong when fetching
            }
        } finally {
            if (!ifRequestStaleObj.stale) {
                setIfLoading(false); //success or fail, always runs
            }
        }
    }, [id]);

    useEffect(() => { //runs once when component first loads
        const ifRequestStaleObj = { stale: false };
        fetchMatch(ifRequestStaleObj);
        return () => {
            ifRequestStaleObj.stale = true;
        }; //if user leaves page in middle of fetch, stop updating state
    }, [fetchMatch]);

    useEffect(() => { //poll every 15 seconds while waiting for a second player
        if (!match || match.status !== "waiting") {
            return;
        }
        const interval = setInterval(() => {
            fetchMatch();
        }, 15000); //15seconds in milliseconds
        return () => {
            clearInterval(interval);
        }; //clear interval when status changes or component unmounts
    }, [match, fetchMatch]);

    return { match, ifLoading, error }; //IndividualGame.jsx gets these back when calling useMatch()
}
