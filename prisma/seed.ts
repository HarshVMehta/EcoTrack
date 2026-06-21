import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding fake community data...')

  // Create fake users
  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'alice@example.com' },
      update: {},
      create: { id: 'user_1', email: 'alice@example.com', name: 'Alice Green' },
    }),
    prisma.user.upsert({
      where: { email: 'bob@example.com' },
      update: {},
      create: { id: 'user_2', email: 'bob@example.com', name: 'Bob Eco' },
    }),
    prisma.user.upsert({
      where: { email: 'charlie@example.com' },
      update: {},
      create: { id: 'user_3', email: 'charlie@example.com', name: 'Charlie Earth' },
    }),
  ])

  // Create global challenges
  const c1 = await prisma.challenge.create({
    data: {
      title: 'Zero Waste Week',
      description: 'Produce zero non-recyclable waste for an entire week.',
      targetMetric: 7,
      rewardPoints: 500,
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    }
  })

  await prisma.challenge.create({
    data: {
      title: 'Bike to Work Month',
      description: 'Commute by bicycle for 20 days this month.',
      targetMetric: 20,
      rewardPoints: 1000,
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    }
  })

  // Create fake activities (savings) for community to build leaderboard
  const types = ['transport', 'energy', 'food', 'waste']
  
  for (const user of users) {
    // Each user gets some random activities over the last 30 days
    for (let i = 0; i < 20; i++) {
      const isReduction = Math.random() > 0.5;
      await prisma.activity.create({
        data: {
          userId: user.id,
          type: types[Math.floor(Math.random() * types.length)],
          description: isReduction ? 'Saved carbon' : 'Daily usage',
          carbonValue: Math.floor(Math.random() * 50) + 10,
          isReduction,
          points: isReduction ? Math.floor(Math.random() * 20) + 5 : 0,
          date: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
        }
      })
    }

    // Participate in challenges
    await prisma.challengeParticipation.create({
      data: {
        userId: user.id,
        challengeId: c1.id,
        progress: Math.floor(Math.random() * 7),
      }
    })
  }

  console.log('Seeding finished.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
