import { useState, useEffect, useCallback } from "react";
import { getComments } from "../services/comments-service.js";

export function useComments(targetType, targetId) {
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchComments = useCallback(async (staleObj = { stale: false }) => {
    setIsLoading(true);
    try {
      const data = await getComments(targetType, targetId);
      if (!staleObj.stale) setComments(data.results || []); // comments are in data.results, not the whole data object
    } catch (err) {
      if (!staleObj.stale) setError(err.message);
    } finally {
      if (!staleObj.stale) setIsLoading(false);
    }
  }, [targetType, targetId]);

  useEffect(() => {
    const staleObj = { stale: false };
    fetchComments(staleObj);
    return () => { staleObj.stale = true; };
  }, [fetchComments]);

  return { comments, isLoading, error, refetch: fetchComments };
}
