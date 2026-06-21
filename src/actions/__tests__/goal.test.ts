/**
 * @jest-environment node
 */
import { createGoal, deleteGoal } from '../goal';
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
    goal: {
      create: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn()
    }
  }
}));

describe('Goal Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (auth as unknown as jest.Mock).mockResolvedValue({ userId: 'test-user-123' });
  });

  describe('createGoal', () => {
    test('should fail if user is not authenticated', async () => {
      (auth as unknown as jest.Mock).mockResolvedValueOnce({ userId: null });

      const result = await createGoal('Reduce emissions', 100);

      expect(prisma.goal.create).not.toHaveBeenCalled();
      expect(result.success).toBe(false);
      expect(result.error).toBe('User is not authenticated');
    });

    test('should create goal and revalidate paths with valid arguments', async () => {
      (prisma.goal.create as jest.Mock).mockResolvedValueOnce({ id: 'goal-1' });

      const result = await createGoal('Save Water', 150, '2026-12-31');

      expect(prisma.goal.create).toHaveBeenCalledWith({
        data: {
          userId: 'test-user-123',
          title: 'Save Water',
          targetValue: 150,
          deadline: new Date('2026-12-31'),
          currentValue: 0
        }
      });
      expect(revalidatePath).toHaveBeenCalledWith('/goals');
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard');
      expect(result.success).toBe(true);
    });

    test('should create goal without optional deadline', async () => {
      (prisma.goal.create as jest.Mock).mockResolvedValueOnce({ id: 'goal-2' });

      const result = await createGoal('Save Electricity', 200);

      expect(prisma.goal.create).toHaveBeenCalledWith({
        data: {
          userId: 'test-user-123',
          title: 'Save Electricity',
          targetValue: 200,
          deadline: null,
          currentValue: 0
        }
      });
      expect(result.success).toBe(true);
    });

    test('should return failure if database creation throws error', async () => {
      (prisma.goal.create as jest.Mock).mockRejectedValueOnce(new Error('DB Error'));

      const result = await createGoal('Fail Goal', 50);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to create goal');
    });
  });

  describe('deleteGoal', () => {
    test('should fail if user is not authenticated', async () => {
      (auth as unknown as jest.Mock).mockResolvedValueOnce({ userId: null });

      const result = await deleteGoal('goal-1');

      expect(prisma.goal.delete).not.toHaveBeenCalled();
      expect(result.success).toBe(false);
      expect(result.error).toBe('User is not authenticated');
    });

    test('should fail if goal is not found', async () => {
      (prisma.goal.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const result = await deleteGoal('goal-nonexistent');

      expect(prisma.goal.delete).not.toHaveBeenCalled();
      expect(result.success).toBe(false);
      expect(result.error).toBe('Unauthorized');
    });

    test('should fail if user does not own the goal', async () => {
      (prisma.goal.findUnique as jest.Mock).mockResolvedValueOnce({
        id: 'goal-1',
        userId: 'other-user-abc'
      });

      const result = await deleteGoal('goal-1');

      expect(prisma.goal.delete).not.toHaveBeenCalled();
      expect(result.success).toBe(false);
      expect(result.error).toBe('Unauthorized');
    });

    test('should delete goal and revalidate paths if owned by user', async () => {
      (prisma.goal.findUnique as jest.Mock).mockResolvedValueOnce({
        id: 'goal-1',
        userId: 'test-user-123'
      });
      (prisma.goal.delete as jest.Mock).mockResolvedValueOnce({ id: 'goal-1' });

      const result = await deleteGoal('goal-1');

      expect(prisma.goal.delete).toHaveBeenCalledWith({ where: { id: 'goal-1' } });
      expect(revalidatePath).toHaveBeenCalledWith('/goals');
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard');
      expect(result.success).toBe(true);
    });

    test('should return failure if database deletion throws error', async () => {
      (prisma.goal.findUnique as jest.Mock).mockResolvedValueOnce({
        id: 'goal-1',
        userId: 'test-user-123'
      });
      (prisma.goal.delete as jest.Mock).mockRejectedValueOnce(new Error('DB Error'));

      const result = await deleteGoal('goal-1');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to delete goal');
    });
  });
});
