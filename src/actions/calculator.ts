"use server";

import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { CalculatorAnswers, calculateCarbonFootprint } from '@/lib/calculator';

export async function submitCalculator(answers: CalculatorAnswers) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: 'User is not authenticated' };
    }

    const { total, categories } = calculateCarbonFootprint(answers);

    // Save each category calculation as an Activity row in PostgreSQL
    const activitiesToCreate = categories.map((cat) => ({
      userId,
      type: cat.type,
      description: cat.description,
      carbonValue: cat.carbonValue,
      date: new Date(),
    }));

    await prisma.activity.createMany({
      data: activitiesToCreate,
    });

    return { 
      success: true, 
      data: { total, categories }
    };
  } catch (error) {
    console.error("Failed to submit calculator:", error);
    return { success: false, error: 'Failed to save calculator results' };
  }
}
