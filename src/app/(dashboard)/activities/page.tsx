import React from 'react';
import { auth } from '@clerk/nextjs/server';
import { getDashboardMetrics, getAllActivities } from '@/lib/data-service';
import { ActivitiesClient } from '@/components/activities/ActivitiesClient';

export default async function ActivitiesPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string; page?: string }>;
}) {
  const { userId } = await auth();

  if (!userId) {
    return <div>Please sign in.</div>;
  }

  // Await search params in Next.js 15
  const params = await searchParams;
  const filter = params.filter || 'all';
  const page = parseInt(params.page || '1', 10);

  const [metrics, { activities, totalPages }] = await Promise.all([
    getDashboardMetrics(userId),
    getAllActivities(userId, filter, page, 5),
  ]);

  return (
    <ActivitiesClient 
      metrics={metrics}
      initialActivities={activities}
      totalPages={totalPages}
      currentPage={page}
      currentFilter={filter}
    />
  );
}
