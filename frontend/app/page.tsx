"use client";

import { useRepositories } from "@/hooks/useRepositories";
import { useDeployments } from "@/hooks/useDeployments";

export default function HomePage() {
  const {
    data: repos,
    loading: reposLoading,
    error: reposError,
  } = useRepositories();

  const {
    data: deployments,
    loading: deploymentsLoading,
    error: deploymentsError,
  } = useDeployments();

  if (reposLoading || deploymentsLoading) {
    return <p>Loading data…</p>;
  }

  if (reposError) {
    return <p style={{ color: "red" }}>Repos error: {reposError}</p>;
  }

  if (deploymentsError) {
    return <p style={{ color: "red" }}>Deployments error: {deploymentsError}</p>;
  }

  return (
    <main>
      <h1>CI/CD Platform</h1>

      <section>
        <h2>Repositories</h2>
        {repos.map((repo) => (
          <div key={repo.id}>{repo.name}</div>
        ))}
      </section>

      <section>
        <h2>Deployments</h2>
        {deployments.map((d) => (
          <div key={d.id}>
            {d.repo} → {d.env} → {d.status}
          </div>
        ))}
      </section>
    </main>
  );
}