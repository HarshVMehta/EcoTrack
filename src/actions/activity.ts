"use server";

import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function logQuickActivity(type: string, description: string, carbonValue: number, isReduction: boolean) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'User is not authenticated' };
    }

    await prisma.activity.create({
      data: {
        userId,
        type: type.toLowerCase(),
        carbonValue,
        isReduction,
        description: description
      }
    });

    revalidatePath('/dashboard');
    revalidatePath('/activities');
    revalidatePath('/reports');
    return { success: true };
  } catch (error) {
    console.error("Failed to log activity:", error);
    return { success: false, error: 'Failed to log activity' };
  }
}

export async function deleteActivity(id: string) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'User is not authenticated' };
    }

    // Ensure they own it
    const activity = await prisma.activity.findUnique({ where: { id } });
    if (!activity || activity.userId !== userId) {
      return { success: false, error: 'Unauthorized' };
    }

    await prisma.activity.delete({ where: { id } });

    revalidatePath('/dashboard');
    revalidatePath('/activities');
    revalidatePath('/reports');
    return { success: true };
  } catch (error) {
    console.error("Failed to delete activity:", error);
    return { success: false, error: 'Failed to delete activity' };
  }
}
