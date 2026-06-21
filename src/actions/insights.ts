"use server";

import { auth } from '@clerk/nextjs/server';
import { generateInsights, chatWithAssistant } from '@/lib/openai';
import { revalidatePath } from 'next/cache';

export async function getAIInsights(forceRefresh: boolean = false) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'User is not authenticated' };
    }

    const insights = await generateInsights(userId, forceRefresh);
    revalidatePath('/insights');
    return { success: true, data: insights };
  } catch (error) {
    console.error("Failed to generate AI insights:", error);
    return { success: false, error: 'Failed to generate AI insights' };
  }
}

export async function askAIAssistant(message: string) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'User is not authenticated' };
    }

    const reply = await chatWithAssistant(userId, message);
    return { success: true, reply };
  } catch (error) {
    console.error("Failed to chat with AI assistant:", error);
    return { success: false, error: 'Failed to chat with AI assistant' };
  }
}
