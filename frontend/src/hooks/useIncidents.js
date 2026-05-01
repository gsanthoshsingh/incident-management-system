import { useState, useEffect, useCallback } from 'react';
import { getWorkItems } from '../api/client';

export const useIncidents = (pollInterval = 5000) => {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    try {
      const res = await getWorkItems();
      setIncidents(res.data);
      setError(null);
    } catch (e) {
      setError('Failed to load incidents');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
    const id = setInterval(fetch, pollInterval);
    return () => clearInterval(id);
  }, [fetch, pollInterval]);

  return { incidents, loading, error, refetch: fetch };
};