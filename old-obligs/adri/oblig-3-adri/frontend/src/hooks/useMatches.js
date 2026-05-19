import { useState, useEffect, useCallback } from "react";
import { getMatches } from "../services/matches-service.js";

export function useMatches() {
    const [matches, setMatches] = useState([]); //starts empty, fills when fetch is complete
    const [ifLoading, setIfLoading] = useState(false); //true when waiting for backend response
    const [error, setError] = useState(null); //holds error if fetch fails

    const fetchMatches = useCallback(async (ifRequestStaleObj = { stale: false }) => { //useCallback prevents useEffect from looping on rerender within the same mount
        setIfLoading(true);
        try {
            const data = await getMatches(); //wait for backend response
            if (!ifRequestStaleObj.stale) {
                setMatches(data);
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
    }, []);

    useEffect(() => { //runs once when component first loads
        const ifRequestStaleObj = { stale: false };
        fetchMatches(ifRequestStaleObj);
        return () => { 
            ifRequestStaleObj.stale = true; 
        }; //if user leaves page in middle of fetch, stop updating state
    }, [fetchMatches]);

    return { matches, ifLoading, error }; //Home.jsx and Lobby.jsx get these back when calling useMatches()
}
