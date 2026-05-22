import { useState, useEffect, useCallback } from "react";
import { getMatch } from "../services/matches-service.js";

export function useMatch(id) {
  const [match, setMatch] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMatch = useCallback(async (staleObj = { stale: false }) => {
    setIsLoading(true);
    try {
      const data = await getMatch(id);
      if (!staleObj.stale) setMatch(data);
    } catch (err) {
      if (!staleObj.stale) setError(err.message);
    } finally {
      if (!staleObj.stale) setIsLoading(false);
    }
  }, [id]);

  // Initial fetch
  useEffect(() => {
    const staleObj = { stale: false };
    fetchMatch(staleObj);
    return () => { staleObj.stale = true; };
  }, [fetchMatch]);

  // Poll every 15s while waiting for players
  useEffect(() => {
    if (!match || match.status !== "waiting") return;
    const interval = setInterval(() => fetchMatch(), 15000);
    return () => clearInterval(interval);
  }, [match, fetchMatch]);

  return { match, isLoading, error, refetch: fetchMatch };
}
