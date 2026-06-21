/**
 * @jest-environment node
 */
import { submitCalculator } from '../calculator';
import { prisma } from '@/lib/prisma';
import { CalculatorAnswers } from '@/lib/calculator';
import { auth } from '@clerk/nextjs/server';

jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn().mockResolvedValue({ userId: 'test-user-123' })
}));

jest.mock('@/lib/prisma', () => ({
  prisma: {
    activity: {
      createMany: jest.fn()
    }
  }
}));

describe('Calculator Actions', () => {
  const mockAnswers: CalculatorAnswers = {
    transport: { vehicleType: 'gas', weeklyMileage: 100 },
    energy: { homeSize: 'medium', energySource: 'mixed' },
    food: { dietType: 'average' },
    waste: { recycleHabit: 'sometimes' },
    shopping: { frequency: 'average' },
    water: { showerDuration: 'average' }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (auth as jest.Mock).mockResolvedValue({ userId: 'test-user-123' });
  });

  describe('submitCalculator', () => {
    test('should fail if user is not authenticated', async () => {
      (auth as jest.Mock).mockResolvedValueOnce({ userId: null });

      const result = await submitCalculator(mockAnswers);

      expect(prisma.activity.createMany).not.toHaveBeenCalled();
      expect(result.success).toBe(false);
      expect(result.error).toBe('User is not authenticated');
    });

    test('should process calculation and save activities', async () => {
      (prisma.activity.createMany as jest.Mock).mockResolvedValueOnce({ count: 6 });

      const result = await submitCalculator(mockAnswers);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.total).toBeGreaterThan(0);
      expect(result.data?.categories.length).toBe(6);

      // Verify that prisma.activity.createMany was called with correct structure
      expect(prisma.activity.createMany).toHaveBeenCalledWith({
        data: expect.arrayContaining([
          expect.objectContaining({
            userId: 'test-user-123',
            type: 'transport',
            description: expect.any(String),
            carbonValue: expect.any(Number),
            date: expect.any(Date)
          })
        ])
      });
    });

    test('should return failure if database operation throws error', async () => {
      (prisma.activity.createMany as jest.Mock).mockRejectedValueOnce(new Error('DB Error'));

      const result = await submitCalculator(mockAnswers);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to save calculator results');
    });
  });
});
