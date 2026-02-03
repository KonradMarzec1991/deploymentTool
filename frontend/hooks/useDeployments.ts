"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

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

  useEffect(() => {
    api
      .get<Deployment[]>("/deployments")
      .then((res) => setData(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}