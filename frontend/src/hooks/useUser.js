import { useState, useEffect, useCallback } from "react";
import { getUser } from "../services/users-service.js";

export function useUser(id) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUser = useCallback(async (staleObj = { stale: false }) => {
    setIsLoading(true);
    try {
      const raw = await getUser(id);
      // API returns { user, stats, recentMatches: { results, total } }
      const normalized = {
        ...(raw.user ?? raw),
        recentMatches: raw.recentMatches?.results ?? (Array.isArray(raw.recentMatches) ? raw.recentMatches : []),
        recentMatchesTotal: raw.recentMatches?.total ?? 0,
      };
      if (!staleObj.stale) setUser(normalized);
    } catch (err) {
      if (!staleObj.stale) setError(err.message);
    } finally {
      if (!staleObj.stale) setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    const staleObj = { stale: false };
    fetchUser(staleObj);
    return () => { staleObj.stale = true; };
  }, [fetchUser]);

  return { user, isLoading, error, refetch: fetchUser };
}
