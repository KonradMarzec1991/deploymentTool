'use client';

import { useRouter } from 'next/navigation';

export default function IntegratePage() {
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
      e.preventDefault();
      // ...handleSubmit
      router.push('/');
  }

  return (
      <form onSubmit={handleSubmit}>
        <h1>IntegratePage</h1>
        {/* poal */}
        <button type="submit">Save</button>
      </form>
  )
}
