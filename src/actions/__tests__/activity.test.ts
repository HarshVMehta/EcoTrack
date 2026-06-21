/**
 * @jest-environment node
 */
import { logQuickActivity, deleteActivity } from '../activity';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

jest.mock('@clerk/nextjs/server', () => ({
  auth: () => ({ userId: 'test-user-123' })
}));

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn()
}));

jest.mock('@/lib/prisma', () => ({
  prisma: {
    activity: {
      create: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn()
    }
  }
}));

describe('Activity Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('logQuickActivity should create a new activity and revalidate paths', async () => {
    const result = await logQuickActivity('transport', 'Biked to work', 2, true);

    expect(prisma.activity.create).toHaveBeenCalledWith({
      data: {
        userId: 'test-user-123',
        type: 'transport',
        carbonValue: 2,
        isReduction: true,
        description: 'Biked to work'
      }
    });
    expect(revalidatePath).toHaveBeenCalledWith('/dashboard');
    expect(result.success).toBe(true);
  });

  test('deleteActivity should fail if user does not own it', async () => {
    (prisma.activity.findUnique as jest.Mock).mockResolvedValueOnce({
      id: 'act-99',
      userId: 'some-other-user'
    });

    const result = await deleteActivity('act-99');

    expect(prisma.activity.delete).not.toHaveBeenCalled();
    expect(result.success).toBe(false);
    expect(result.error).toBe('Unauthorized');
  });

  test('deleteActivity should delete activity if user owns it', async () => {
    (prisma.activity.findUnique as jest.Mock).mockResolvedValueOnce({
      id: 'act-99',
      userId: 'test-user-123'
    });

    const result = await deleteActivity('act-99');

    expect(prisma.activity.delete).toHaveBeenCalledWith({ where: { id: 'act-99' } });
    expect(result.success).toBe(true);
  });
});
