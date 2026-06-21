"use server";

import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function joinChallenge(challengeId: string) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'User is not authenticated' };
    }

    await prisma.challengeParticipation.create({
      data: {
        userId,
        challengeId,
        progress: 0,
      }
    });

    revalidatePath('/challenges');
    return { success: true };
  } catch (error) {
    console.error("Failed to join challenge:", error);
    return { success: false, error: 'Failed to join challenge' };
  }
}
