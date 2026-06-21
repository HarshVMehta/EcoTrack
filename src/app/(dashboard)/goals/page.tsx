import React from 'react';
import { auth } from '@clerk/nextjs/server';
import { getGoals, getDashboardMetrics, getAchievements } from '@/lib/data-service';
import { GoalsClient } from '@/components/goals/GoalsClient';

export default async function GoalsPage() {
  const { userId } = await auth();

  if (!userId) {
    return <div>Please sign in.</div>;
  }

  const [goals, metrics, achievementsData] = await Promise.all([
    getGoals(userId),
    getDashboardMetrics(userId),
    getAchievements(userId),
  ]);

  return (
    <div className="p-6 md:p-8 lg:p-10 max-w-7xl mx-auto w-full space-y-10 pb-32 lg:pb-10">
      <GoalsClient 
        goals={goals} 
        metrics={metrics} 
        achievementsData={achievementsData} 
      />
    </div>
  );
}
