import { useState, useEffect, useCallback } from "react";
import { getComments } from "../services/comments-service.js";

export function useComments(matchId) {
    const [comments, setComments] = useState([]); //starts empty, fills when fetch is complete
    const [ifLoading, setIfLoading] = useState(false); //true when waiting for backend response
    const [error, setError] = useState(null); //holds error if fetch fails

    const fetchComments = useCallback(async (ifRequestStaleObj = { stale: false }) => { //useCallback prevents useEffect from looping on rerender within the same mount
        setIfLoading(true);
        try {
            const data = await getComments(matchId); //wait for backend response
            if (!ifRequestStaleObj.stale) {
                setComments(data);
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
    }, [matchId]);

    useEffect(() => { //runs once when component first loads
        const ifRequestStaleObj = { stale: false };
        fetchComments(ifRequestStaleObj);
        return () => {
            ifRequestStaleObj.stale = true;
        }; //if user leaves page in middle of fetch, stop updating state
    }, [fetchComments]);

    return { comments, ifLoading, error, refetch: fetchComments }; //IndividualGame.jsx gets these back when calling useComments()
}