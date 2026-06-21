import React from 'react';
import { auth } from '@clerk/nextjs/server';
import { getDashboardMetrics, getSustainabilityScore } from '@/lib/data-service';
import { generateInsights } from '@/lib/openai';
import { InsightsClient } from '@/components/insights/InsightsClient';

export default async function InsightsPage() {
  const { userId } = await auth();
  
  if (!userId) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground">Access Denied</h2>
          <p className="text-muted-foreground mt-2">Please sign in to view your AI Insights.</p>
        </div>
      </div>
    );
  }

  const [metrics, score, insights] = await Promise.all([
    getDashboardMetrics(userId),
    getSustainabilityScore(userId),
    generateInsights(userId),
  ]);

  return (
    <InsightsClient 
      initialInsights={insights}
      score={score}
      metrics={metrics}
    />
  );
}
