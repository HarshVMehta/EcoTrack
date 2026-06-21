import { prisma } from './prisma';

export async function getDashboardMetrics(userId: string) {
  // 1. Total carbon saved
  const savings = await prisma.activity.aggregate({
    where: { userId, isReduction: true },
    _sum: { carbonValue: true }
  });
  const totalSaved = savings._sum.carbonValue || 0;

  // 2. Total emissions
  const emissions = await prisma.activity.aggregate({
    where: { userId, isReduction: false },
    _sum: { carbonValue: true }
  });
  const totalEmissions = emissions._sum.carbonValue || 0;

  // 3. Streak Calculation
  const reductionActivities = await prisma.activity.findMany({
    where: { userId, isReduction: true },
    orderBy: { date: 'desc' },
    select: { date: true }
  });

  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  const uniqueDates = [...new Set(reductionActivities.map(a => {
    const d = new Date(a.date);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  }))].sort((a, b) => b - a); // sort descending

  if (uniqueDates.length > 0) {
    const lastActivity = uniqueDates[0];
    const diffDays = Math.floor((currentDate.getTime() - lastActivity) / (1000 * 60 * 60 * 24));
    
    // If last activity was today or yesterday
    if (diffDays <= 1) {
      let expectedDate = lastActivity;
      streak = 1;
      for (let i = 1; i < uniqueDates.length; i++) {
        expectedDate -= (1000 * 60 * 60 * 24);
        if (uniqueDates[i] === expectedDate) {
          streak++;
        } else {
          break;
        }
      }
    }
  }

  // 4. Offset progress calculation based on goals
  const goals = await prisma.goal.findMany({
    where: { userId }
  });
  
  let offsetProgress = 0;
  if (goals.length > 0) {
    const totalTarget = goals.reduce((sum, g) => sum + g.targetValue, 0);
    if (totalTarget > 0) {
       offsetProgress = Math.min(100, Math.round((totalSaved / totalTarget) * 100));
    }
  } else if (totalSaved > 0) {
    // Arbitrary offset if no goals exist but they saved something
    offsetProgress = Math.min(100, Math.round((totalSaved / 500) * 100));
  }

  return {
    totalSaved,
    totalEmissions,
    streak,
    offsetProgress
  };
}

export async function getTrendData(userId: string) {
  // Aggregate emissions over the last 6 months
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const activities = await prisma.activity.findMany({
    where: { 
      userId, 
      isReduction: false,
      date: { gte: sixMonthsAgo }
    },
    orderBy: { date: 'asc' }
  });

  // Group by month
  const grouped: Record<string, number> = {};
  
  // Initialize last 6 months
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const monthName = d.toLocaleString('default', { month: 'short' });
    grouped[monthName] = 0;
  }

  for (const act of activities) {
    const monthName = act.date.toLocaleString('default', { month: 'short' });
    if (grouped[monthName] !== undefined) {
      grouped[monthName] += act.carbonValue;
    }
  }

  return Object.keys(grouped).map(key => ({
    name: key,
    emissions: Number((grouped[key] / 1000).toFixed(2)) // return in tons for trend chart
  }));
}

export async function getCategoryData(userId: string) {
  const activities = await prisma.activity.findMany({
    where: { userId, isReduction: false }
  });

  const totals: Record<string, number> = { transport: 0, energy: 0, food: 0, waste: 0, shopping: 0, water: 0 };
  let grandTotal = 0;

  for (const act of activities) {
    if (totals[act.type] !== undefined) {
      totals[act.type] += act.carbonValue;
    } else {
      totals[act.type] = act.carbonValue;
    }
    grandTotal += act.carbonValue;
  }

  if (grandTotal === 0) {
    return [
      { name: 'Transport', percentage: 0 },
      { name: 'Energy', percentage: 0 },
      { name: 'Food', percentage: 0 },
      { name: 'Shopping', percentage: 0 }
    ];
  }

  return [
    { name: 'Transport', percentage: Math.round((totals.transport / grandTotal) * 100), raw: totals.transport },
    { name: 'Home Energy', percentage: Math.round((totals.energy / grandTotal) * 100), raw: totals.energy },
    { name: 'Food', percentage: Math.round((totals.food / grandTotal) * 100), raw: totals.food },
    { name: 'Shopping', percentage: Math.round((totals.shopping / grandTotal) * 100), raw: totals.shopping }
  ].sort((a, b) => b.percentage - a.percentage);
}

export async function getCommunityComparison(userId: string) {
  // Compare this user's carbon saved against all users
  const allUsersStats = await prisma.activity.groupBy({
    by: ['userId'],
    where: { isReduction: true },
    _sum: { carbonValue: true }
  });

  if (allUsersStats.length === 0) {
     return { rankPercentile: 0, topPercentage: 100 };
  }

  allUsersStats.sort((a, b) => (b._sum.carbonValue || 0) - (a._sum.carbonValue || 0));
  
  const totalUsers = allUsersStats.length;
  const userRankIndex = allUsersStats.findIndex(u => u.userId === userId);
  
  // If user hasn't saved anything, they are at the bottom
  if (userRankIndex === -1) {
    return { rankPercentile: 0, topPercentage: 100, totalPoints: 0, rank: totalUsers + 1, allUsersStats };
  }

  const rank = userRankIndex + 1;
  const topPercentage = Math.round((rank / totalUsers) * 100);
  
  return { 
    rankPercentile: 100 - topPercentage, 
    topPercentage, 
    totalPoints: allUsersStats[userRankIndex]._sum.carbonValue || 0,
    rank,
    allUsersStats 
  };
}

export async function getChallengesData(userId: string) {
  const allChallenges = await prisma.challenge.findMany({
    include: {
      participations: true
    },
    orderBy: { endDate: 'asc' }
  });

  const activeChallenges = allChallenges.filter(c => c.endDate > new Date());
  
  // Format for the UI
  return activeChallenges.map(challenge => {
    const userParticipation = challenge.participations.find(p => p.userId === userId);
    return {
      id: challenge.id,
      title: challenge.title,
      description: challenge.description,
      targetMetric: challenge.targetMetric,
      rewardPoints: challenge.rewardPoints,
      endDate: challenge.endDate,
      totalParticipants: challenge.participations.length,
      userProgress: userParticipation?.progress || 0,
      isParticipating: !!userParticipation
    };
  });
}
export async function getGoals(userId: string) {
  const goals = await prisma.goal.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' }
  });

  const enrichedGoals = await Promise.all(goals.map(async (goal) => {
    const progressActivities = await prisma.activity.aggregate({
      where: {
        userId,
        isReduction: true,
        date: { gte: goal.createdAt }
      },
      _sum: { carbonValue: true }
    });
    
    const currentValue = progressActivities._sum.carbonValue || 0;
    const isNowComplete = currentValue >= goal.targetValue;

    // Auto-mark as completed in DB if newly completed
    if (isNowComplete && !goal.completed) {
      await prisma.goal.update({
        where: { id: goal.id },
        data: { completed: true, currentValue }
      });
    }

    return {
      ...goal,
      currentValue,
      completed: isNowComplete || goal.completed
    };
  }));

  return enrichedGoals;
}

export async function getAchievements(userId: string) {
  // Run all queries in parallel for speed
  const [savingsAgg, emissionsAgg, activities, goals] = await Promise.all([
    prisma.activity.aggregate({ where: { userId, isReduction: true }, _sum: { carbonValue: true } }),
    prisma.activity.aggregate({ where: { userId, isReduction: false }, _sum: { carbonValue: true } }),
    prisma.activity.findMany({ where: { userId }, select: { type: true, date: true, isReduction: true } }),
    prisma.goal.findMany({ where: { userId } })
  ]);

  const totalSaved = savingsAgg._sum.carbonValue || 0;
  const totalActivities = activities.length;
  const foodActivities = activities.filter(a => a.type === 'food').length;
  const transportActivities = activities.filter(a => a.type === 'transport' && a.isReduction).length;
  const completedGoals = goals.filter(g => g.completed).length;

  // Calculate streak inline
  const reductionDates = [...new Set(activities.filter(a => a.isReduction).map(a => {
    const d = new Date(a.date); d.setHours(0,0,0,0); return d.getTime();
  }))].sort((a, b) => b - a);
  let streak = 0;
  if (reductionDates.length > 0) {
    const now = new Date(); now.setHours(0,0,0,0);
    const diff = Math.floor((now.getTime() - reductionDates[0]) / 86400000);
    if (diff <= 1) {
      let expected = reductionDates[0]; streak = 1;
      for (let i = 1; i < reductionDates.length; i++) {
        expected -= 86400000;
        if (reductionDates[i] === expected) streak++; else break;
      }
    }
  }

  const achievements = [
    {
      id: 'first-log',
      title: 'Eco Pioneer',
      description: 'Log your first activity',
      iconType: 'sun',
      color: 'from-blue-300 to-blue-500',
      textColor: 'text-blue-900',
      earned: totalActivities > 0,
      points: 10
    },
    {
      id: 'saver-10',
      title: 'Seedling',
      description: 'Save 10kg of CO₂',
      iconType: 'leaf',
      color: 'from-[#c8e8d0] to-[#78a886]',
      textColor: 'text-[#002110]',
      earned: totalSaved >= 10,
      points: 25
    },
    {
      id: 'saver-100',
      title: '100kg Saver',
      description: 'Save 100kg of CO₂',
      iconType: 'bike',
      color: 'from-[#f8e0a8] to-[#c4a66a]',
      textColor: 'text-[#705c30]',
      earned: totalSaved >= 100,
      points: 50
    },
    {
      id: 'saver-500',
      title: 'Carbon Crusher',
      description: 'Save 500kg of CO₂',
      iconType: 'tree',
      color: 'from-emerald-300 to-emerald-600',
      textColor: 'text-emerald-900',
      earned: totalSaved >= 500,
      points: 100
    },
    {
      id: 'streak-7',
      title: 'Week Warrior',
      description: '7 day logging streak',
      iconType: 'flame',
      color: 'from-orange-200 to-orange-400',
      textColor: 'text-orange-900',
      earned: streak >= 7,
      points: 30
    },
    {
      id: 'streak-30',
      title: 'Monthly Master',
      description: '30 day logging streak',
      iconType: 'flame',
      color: 'from-red-300 to-red-500',
      textColor: 'text-red-900',
      earned: streak >= 30,
      points: 100
    },
    {
      id: 'food-hero',
      title: 'Food Hero',
      description: 'Log 5 food activities',
      iconType: 'utensils',
      color: 'from-purple-200 to-purple-400',
      textColor: 'text-purple-900',
      earned: foodActivities >= 5,
      points: 30
    },
    {
      id: 'transport-hero',
      title: 'Green Commuter',
      description: 'Log 10 green transport actions',
      iconType: 'bike',
      color: 'from-teal-200 to-teal-400',
      textColor: 'text-teal-900',
      earned: transportActivities >= 10,
      points: 50
    },
    {
      id: 'goal-setter',
      title: 'Goal Crusher',
      description: 'Complete a goal',
      iconType: 'target',
      color: 'from-indigo-200 to-indigo-400',
      textColor: 'text-indigo-900',
      earned: completedGoals >= 1,
      points: 75
    }
  ];

  const totalPoints = achievements.filter(a => a.earned).reduce((sum, a) => sum + a.points, 0);
  const earnedCount = achievements.filter(a => a.earned).length;

  return { achievements, totalPoints, earnedCount, totalBadges: achievements.length };
}

export async function getSustainabilityScore(userId: string) {
  const { topPercentage } = await getCommunityComparison(userId);
  const metrics = await getDashboardMetrics(userId);
  
  // Base score 50
  let score = 50;

  // Rank points (up to 30 points)
  // If top 1%, 30 points. If top 100%, 0 points.
  const rankPoints = Math.max(0, 30 * (1 - (topPercentage / 100)));
  score += rankPoints;

  // Offset points (up to 20 points)
  // If offsetProgress is 100%, 20 points.
  const offsetPoints = Math.min(20, (metrics.offsetProgress / 100) * 20);
  score += offsetPoints;

  return Math.min(100, Math.round(score));
}

export async function getRecentActivities(userId: string) {
  const activities = await prisma.activity.findMany({
    where: { userId },
    orderBy: { date: 'desc' },
    take: 5
  });

  return activities;
}

export async function getEmissionsComparison(userId: string) {
  const now = new Date();
  
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(now.getDate() - 7);
  
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(now.getDate() - 30);

  const weeklyActivities = await prisma.activity.aggregate({
    where: { 
      userId, 
      isReduction: false,
      date: { gte: sevenDaysAgo }
    },
    _sum: { carbonValue: true }
  });

  const monthlyActivities = await prisma.activity.aggregate({
    where: { 
      userId, 
      isReduction: false,
      date: { gte: thirtyDaysAgo }
    },
    _sum: { carbonValue: true }
  });

  return {
    weekly: weeklyActivities._sum.carbonValue || 0,
    monthly: monthlyActivities._sum.carbonValue || 0
  };
}

export async function getAllActivities(
  userId: string, 
  filterType: string = 'all',
  page: number = 1,
  pageSize: number = 10
) {
  const whereClause: any = { userId };
  if (filterType !== 'all') {
    whereClause.type = filterType;
  }

  const activities = await prisma.activity.findMany({
    where: whereClause,
    orderBy: { date: 'desc' },
    skip: (page - 1) * pageSize,
    take: pageSize,
  });

  const totalCount = await prisma.activity.count({
    where: whereClause
  });

  return {
    activities,
    totalPages: Math.ceil(totalCount / pageSize),
    totalCount
  };
}

