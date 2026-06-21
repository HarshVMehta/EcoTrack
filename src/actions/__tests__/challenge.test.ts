/**
 * @jest-environment node
 */
import { joinChallenge } from '../challenge';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { auth } from '@clerk/nextjs/server';

jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn().mockResolvedValue({ userId: 'test-user-123' })
}));

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn()
}));

jest.mock('@/lib/prisma', () => ({
  prisma: {
    challengeParticipation: {
      create: jest.fn()
    }
  }
}));

describe('Challenge Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (auth as unknown as jest.Mock).mockResolvedValue({ userId: 'test-user-123' });
  });

  describe('joinChallenge', () => {
    test('should fail if user is not authenticated', async () => {
      (auth as unknown as jest.Mock).mockResolvedValueOnce({ userId: null });

      const result = await joinChallenge('challenge-101');

      expect(prisma.challengeParticipation.create).not.toHaveBeenCalled();
      expect(result.success).toBe(false);
      expect(result.error).toBe('User is not authenticated');
    });

    test('should successfully join challenge and revalidate path', async () => {
      (prisma.challengeParticipation.create as jest.Mock).mockResolvedValueOnce({ id: 'cp-1' });

      const result = await joinChallenge('challenge-101');

      expect(prisma.challengeParticipation.create).toHaveBeenCalledWith({
        data: {
          userId: 'test-user-123',
          challengeId: 'challenge-101',
          progress: 0
        }
      });
      expect(revalidatePath).toHaveBeenCalledWith('/challenges');
      expect(result.success).toBe(true);
    });

    test('should return failure if database creation throws error', async () => {
      (prisma.challengeParticipation.create as jest.Mock).mockRejectedValueOnce(new Error('DB Error'));

      const result = await joinChallenge('challenge-101');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to join challenge');
    });
  });
});
