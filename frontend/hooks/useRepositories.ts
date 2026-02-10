'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export type Repository = {
  id: string;
  name: string;
  url: string;
  github_full_name: string;
};

export function useRepositories() {
  const [data, setData] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<Repository[]>('/repos')
      .then((res) => setData(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}
