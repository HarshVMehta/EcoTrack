import { getDashboardMetrics, getSustainabilityScore } from '../data-service';
import { prisma } from '../prisma';

jest.mock('../prisma', () => ({
  prisma: {
    activity: {
      aggregate: jest.fn(),
      findMany: jest.fn(),
      groupBy: jest.fn(),
    },
    goal: {
      findMany: jest.fn(),
    },
  },
}));

describe('Data Service calculations', () => {
  const userId = 'test-user-123';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('getDashboardMetrics should calculate sums, streaks, and progress correctly', async () => {
    // 1. Mock aggregate for savings (reductions)
    (prisma.activity.aggregate as jest.Mock).mockResolvedValueOnce({
      _sum: { carbonValue: 120 }
    });

    // 2. Mock aggregate for emissions
    (prisma.activity.aggregate as jest.Mock).mockResolvedValueOnce({
      _sum: { carbonValue: 350 }
    });

    // 3. Mock findMany for streak activities (dates)
    const mockDates = [
      { date: new Date() }, // Today
      { date: new Date(Date.now() - 24 * 60 * 60 * 1000) }, // Yesterday
      { date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) } // 2 days ago
    ];
    (prisma.activity.findMany as jest.Mock).mockResolvedValueOnce(mockDates);

    // 4. Mock goals to check offset progress
    (prisma.goal.findMany as jest.Mock).mockResolvedValueOnce([
      { targetValue: 200 },
      { targetValue: 300 }
    ]); // Total target = 500. progress = (120/500) * 100 = 24%

    const metrics = await getDashboardMetrics(userId);

    expect(metrics.totalSaved).toBe(120);
    expect(metrics.totalEmissions).toBe(350);
    expect(metrics.streak).toBe(3); // 3 consecutive days
    expect(metrics.offsetProgress).toBe(24);
  });

  test('getDashboardMetrics fallback offset progress calculation', async () => {
    (prisma.activity.aggregate as jest.Mock).mockResolvedValueOnce({ _sum: { carbonValue: 50 } }); // savings
    (prisma.activity.aggregate as jest.Mock).mockResolvedValueOnce({ _sum: { carbonValue: 100 } }); // emissions
    (prisma.activity.findMany as jest.Mock).mockResolvedValueOnce([]); // no streak
    (prisma.goal.findMany as jest.Mock).mockResolvedValueOnce([]); // no goals

    const metrics = await getDashboardMetrics(userId);

    // If no goals but saved > 0, fallback offset is calculated against target of 500: (50/500) * 100 = 10%
    expect(metrics.offsetProgress).toBe(10);
  });

  test('getSustainabilityScore calculations based on metrics and ranking', async () => {
    // getSustainabilityScore calls getCommunityComparison which groups by userId
    (prisma.activity.groupBy as jest.Mock).mockResolvedValueOnce([
      { userId: 'other-user', _sum: { carbonValue: 500 } },
      { userId: userId, _sum: { carbonValue: 120 } }
    ]); // User is rank 2 out of 2 users (top 100%)

    // getDashboardMetrics call inside getSustainabilityScore
    (prisma.activity.aggregate as jest.Mock).mockResolvedValueOnce({ _sum: { carbonValue: 120 } }); // savings
    (prisma.activity.aggregate as jest.Mock).mockResolvedValueOnce({ _sum: { carbonValue: 350 } }); // emissions
    (prisma.activity.findMany as jest.Mock).mockResolvedValueOnce([]);
    (prisma.goal.findMany as jest.Mock).mockResolvedValueOnce([
      { targetValue: 500 }
    ]); // progress = (120/500)*100 = 24%

    const score = await getSustainabilityScore(userId);

    // base score = 50
    // rank points: topPercentage is 100% (index 1 of 2), rankPoints = 30 * (1 - 100/100) = 0
    // offset points: progress is 24%, offsetPoints = (24/100) * 20 = 4.8
    // expected total score = 50 + 0 + 4.8 = 54.8 -> rounded to 55
    expect(score).toBe(55);
  });
});
