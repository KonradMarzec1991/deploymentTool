'use client';

import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';

export type Deployment = {
  id: string;
  repo: string;
  env: string;
  status: string;
};

export function useDeployments() {
  const [data, setData] = useState<Deployment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDeployments = useCallback(() => {
    setLoading(true);
    setError(null);
    return api
      .get<Deployment[]>('/deployments')
      .then((res) => setData(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    void fetchDeployments();
  }, [fetchDeployments]);

  return { data, loading, error, refetch: fetchDeployments };
}
