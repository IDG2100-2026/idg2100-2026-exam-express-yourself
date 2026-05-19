import { useState, useEffect, useCallback } from "react";
import { getUser } from "../services/users-service.js";

export function useUser(id) {
    const [user, setUser] = useState(null); //starts null, fills when fetch is complete
    const [ifLoading, setIfLoading] = useState(false); //true when waiting for backend response
    const [error, setError] = useState(null); //holds error if fetch fails

    const fetchUser = useCallback(async (ifRequestStaleObj = { stale: false }) => { //useCallback prevents useEffect from looping on rerender within the same mount
        setIfLoading(true);
        try {
            const data = await getUser(id); //wait for backend response
            if (!ifRequestStaleObj.stale) {
                setUser(data);
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
    }, [id]); //recreate fetchUser if id changes

    useEffect(() => { //runs once when component first loads
        const ifRequestStaleObj = { stale: false };
        fetchUser(ifRequestStaleObj);
        return () => {
            ifRequestStaleObj.stale = true;
        }; //if user leaves page in middle of fetch, stop updating state
    }, [fetchUser]);

    return { user, ifLoading, error }; //Profile.jsx gets these back when calling useUser()
}
