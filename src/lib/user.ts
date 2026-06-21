import { currentUser } from '@clerk/nextjs/server';
import { prisma } from './prisma';

export async function syncUser() {
  try {
    const user = await currentUser();
    
    if (!user) {
      console.error("syncUser called but no user is authenticated via Clerk");
      return null;
    }

    const email = user.emailAddresses[0]?.emailAddress ?? '';
    const name = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || 'EcoTrack User';

    // Upsert the user in our PostgreSQL database
    const dbUser = await prisma.user.upsert({
      where: { id: user.id },
      update: {
        email: email,
        name: name,
      },
      create: {
        id: user.id,
        email: email,
        name: name,
      },
    });

    return dbUser;
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message.includes('Dynamic server usage') ||
       (error as { digest?: string }).digest === 'DYNAMIC_SERVER_USAGE')
    ) {
      throw error;
    }
    console.error("Error syncing user to database:", error);
    return null;
  }
}
