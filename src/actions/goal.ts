"use server";

import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function createGoal(title: string, targetValue: number, deadlineDateStr?: string) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'User is not authenticated' };
    }

    const deadline = deadlineDateStr ? new Date(deadlineDateStr) : null;

    await prisma.goal.create({
      data: {
        userId,
        title,
        targetValue,
        deadline,
        currentValue: 0
      }
    });

    revalidatePath('/goals');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error("Failed to create goal:", error);
    return { success: false, error: 'Failed to create goal' };
  }
}

export async function deleteGoal(id: string) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'User is not authenticated' };
    }

    const goal = await prisma.goal.findUnique({ where: { id } });
    if (!goal || goal.userId !== userId) {
      return { success: false, error: 'Unauthorized' };
    }

    await prisma.goal.delete({ where: { id } });

    revalidatePath('/goals');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error("Failed to delete goal:", error);
    return { success: false, error: 'Failed to delete goal' };
  }
}
