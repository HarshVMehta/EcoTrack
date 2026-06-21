import { auth } from '@clerk/nextjs/server';
import { getDashboardMetrics, getTrendData, getCategoryData, getCommunityComparison } from '@/lib/data-service';
import { ReportsClient } from '@/components/dashboard/ReportsClient';
import { prisma } from '@/lib/prisma';

export default async function ReportsPage() {
  const { userId } = await auth();

  if (!userId) {
    return <div>Please sign in.</div>;
  }

  const [metrics, trendData, categoryData, communityRank] = await Promise.all([
    getDashboardMetrics(userId),
    getTrendData(userId),
    getCategoryData(userId),
    getCommunityComparison(userId),
  ]);

  // Calculate Community Averages for comparisonData
  const allUsersCategories = await prisma.activity.groupBy({
    by: ['type'],
    where: { isReduction: false },
    _avg: { carbonValue: true }
  });

  const communityAverages: Record<string, number> = {};
  allUsersCategories.forEach(c => {
    communityAverages[c.type] = c._avg.carbonValue || 0;
  });

  const userCategoryMap: Record<string, number> = {};
  categoryData.forEach(c => {
    let key = c.name.toLowerCase();
    if (key === 'home energy') key = 'energy';
    userCategoryMap[key] = c.raw;
  });

  const comparisonData = [
    { name: 'Transport', you: userCategoryMap['transport'] || 0, community: communityAverages['transport'] || 0 },
    { name: 'Energy', you: userCategoryMap['energy'] || 0, community: communityAverages['energy'] || 0 },
    { name: 'Food', you: userCategoryMap['food'] || 0, community: communityAverages['food'] || 0 },
    { name: 'Shopping', you: userCategoryMap['shopping'] || 0, community: communityAverages['shopping'] || 0 },
  ];

  return (
    <ReportsClient 
      metrics={metrics} 
      trendData={trendData} 
      categoryData={categoryData} 
      comparisonData={comparisonData}
      communityRank={communityRank}
    />
  );
}
