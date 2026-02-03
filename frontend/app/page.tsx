"use client";

import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function Home() {
  const [repos, setRepos] = useState([]);
  const [deployments, setDeployments] = useState([]);


  useEffect(() => {
    fetch(`${API_URL}/repos`)
      .then(res => res.json())
      .then(setRepos);

    fetch(`${API_URL}/deployments`)
      .then(res => res.json())
      .then(setDeployments);
  }, []);

  const approve = async (id: number) => {
    await fetch(`${API_URL}/${id}/approve`, {
      method: "POST",
    });
    location.reload();
  };

  return (
    <main style={{ padding: 40 }}>
      <h1>CI/CD Platform</h1>

      <h2>Repositories</h2>
      <ul>
        {repos.map((r: any) => (
          <li key={r.id}>
            {r.name} – {r.git_url}
          </li>
        ))}
      </ul>

      <h2>Deployments</h2>
      <ul>
        {deployments.map((d: any) => (
          <li key={d.id}>
            {d.repo} | {d.env} | {d.status}
            {d.status === "WAITING_FOR_APPROVAL" && (
              <button onClick={() => approve(d.id)}>
                Approve
              </button>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}