import { auth, currentUser } from '@clerk/nextjs/server';
import { getChallengesData, getCommunityComparison } from '@/lib/data-service';
import { ChallengesClient } from '@/components/dashboard/ChallengesClient';
import { prisma } from '@/lib/prisma';

export default async function ChallengesPage() {
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId) {
    return <div>Please sign in.</div>;
  }

  const challenges = await getChallengesData(userId);
  const communityRank = await getCommunityComparison(userId);

  // Reconstruct the leaderboard
  const rawLeaderboard = communityRank.allUsersStats || [];
  
  // We need names for these users. Since some are seeded, let's just query users.
  const topUserIds = rawLeaderboard.map(u => u.userId);
  const dbUsers = await prisma.user.findMany({
    where: { id: { in: topUserIds } },
    select: { id: true, name: true }
  });

  const userMap = new Map(dbUsers.map(u => [u.id, u.name || 'Anonymous']));

  const leaderboard = rawLeaderboard.map((l, index) => ({
    rank: index + 1,
    name: l.userId === userId ? (user?.firstName || 'You') : (userMap.get(l.userId) || 'Anonymous'),
    points: l._sum.carbonValue || 0,
    isYou: l.userId === userId
  }));

  // If user is not in the list, add them at the bottom
  if (!leaderboard.find(l => l.isYou)) {
    leaderboard.push({
      rank: communityRank.rank || leaderboard.length + 1,
      name: user?.firstName || 'You',
      points: communityRank.totalPoints || 0,
      isYou: true
    });
  }

  return <ChallengesClient challenges={challenges} leaderboard={leaderboard} />;
}
