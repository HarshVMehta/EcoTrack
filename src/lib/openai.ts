import OpenAI from 'openai';
import { prisma } from './prisma';
import { getDashboardMetrics, getCategoryData, getSustainabilityScore, getAchievements } from './data-service';
import crypto from 'crypto';

const openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || 'mock-key-for-testing' });

function hashData(data: unknown): string {
  return crypto.createHash('md5').update(JSON.stringify(data)).digest('hex');
}

async function gatherUserContext(userId: string) {
  const [metrics, categoryData, score, achievementsData, recentActivities, goals] = await Promise.all([
    getDashboardMetrics(userId),
    getCategoryData(userId),
    getSustainabilityScore(userId),
    getAchievements(userId),
    prisma.activity.findMany({ where: { userId }, orderBy: { date: 'desc' }, take: 20 }),
    prisma.goal.findMany({ where: { userId } }),
  ]);

  return {
    metrics,
    categoryData,
    sustainabilityScore: score,
    earnedBadges: achievementsData.earnedCount,
    totalBadges: achievementsData.totalBadges,
    totalPoints: achievementsData.totalPoints,
    recentActivities: recentActivities.map(a => ({
      type: a.type,
      carbonValue: a.carbonValue,
      isReduction: a.isReduction,
      date: a.date.toISOString().split('T')[0],
      description: a.description
    })),
    goals: goals.map(g => ({
      title: g.title,
      targetValue: g.targetValue,
      currentValue: g.currentValue,
      completed: g.completed,
      deadline: g.deadline?.toISOString().split('T')[0]
    }))
  };
}

export async function generateInsights(userId: string, forceRefresh: boolean = false) {
  const context = await gatherUserContext(userId);
  const currentHash = hashData(context);

  // Check cache
  if (!forceRefresh) {
    const cached = await prisma.aIInsight.findUnique({
      where: { userId_type: { userId, type: 'full' } }
    });
    if (cached && cached.dataHash === currentHash) {
      return JSON.parse(cached.content);
    }
  }

  const prompt = `You are an expert sustainability analyst for EcoTrack, a carbon footprint tracking app.

Analyze this user's environmental data and generate personalized insights.

USER DATA:
- Sustainability Score: ${context.sustainabilityScore}/100
- Total Carbon Saved: ${context.metrics.totalSaved}kg CO₂
- Total Emissions: ${context.metrics.totalEmissions}kg CO₂
- Current Streak: ${context.metrics.streak} days
- Offset Progress: ${context.metrics.offsetProgress}%
- Badges Earned: ${context.earnedBadges}/${context.totalBadges}
- Reward Points: ${context.totalPoints}

EMISSION BREAKDOWN:
- Categories: ${context.categoryData.map((c: { name: string; percentage: number; raw?: number }) => `${c.name}: ${c.percentage}% (${c.raw || 0}kg)`).join(', ')}

ACTIVE GOALS:
${context.goals.length > 0 ? context.goals.map((g: { title: string; currentValue: number; targetValue: number; completed: boolean; deadline?: string }) => `- ${g.title}: ${g.currentValue}/${g.targetValue}kg ${g.completed ? '(COMPLETED)' : ''} ${g.deadline ? `deadline: ${g.deadline}` : ''}`).join('\n') : 'No active goals set.'}

RECENT ACTIVITIES (last 20):
${context.recentActivities.length > 0 ? context.recentActivities.map((a: { date: string; type: string; isReduction: boolean; carbonValue: number; description?: string | null }) => `- [${a.date}] ${a.type} ${a.isReduction ? 'SAVED' : 'EMITTED'} ${a.carbonValue}kg${a.description ? ': ' + a.description : ''}`).join('\n') : 'No activities logged yet.'}

Generate a JSON response with these exact fields:
{
  "summary": "A 2-3 sentence personalized sustainability summary of their current status and progress.",
  "ecoScore": ${context.sustainabilityScore},
  "potentialSavings": <number - estimated monthly kg CO2 they could save if they follow all recommendations>,
  "recommendations": [
    {
      "title": "<short action title>",
      "description": "<1-2 sentence description>",
      "impact": "<High|Medium|Low>",
      "category": "<transport|energy|food|waste|shopping|water>",
      "potentialSaving": <number in kg CO2>
    }
  ],
  "forecast": {
    "currentMonthly": <number - estimated current monthly emissions in kg>,
    "projectedMonthly": <number - projected emissions if recommendations followed>,
    "reductionPercent": <number - percentage reduction possible>
  },
  "goalSuggestions": [
    {
      "title": "<suggested goal title>",
      "targetValue": <number - target in kg>,
      "reasoning": "<why this goal makes sense for them>"
    }
  ],
  "behavioralInsights": [
    "<1 sentence behavioral insight about their patterns>"
  ]
}

Generate 4 recommendations, 2 goal suggestions, and 3 behavioral insights.
Return ONLY valid JSON.`;

  try {
    const response = await openaiClient.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' }
    });

    const text = response.choices[0]?.message?.content || '{}';
    const insights = JSON.parse(text);

    // Cache in DB
    await prisma.aIInsight.upsert({
      where: { userId_type: { userId, type: 'full' } },
      create: {
        userId,
        type: 'full',
        content: JSON.stringify(insights),
        dataHash: currentHash,
      },
      update: {
        content: JSON.stringify(insights),
        dataHash: currentHash,
      }
    });

    return insights;
  } catch (error) {
    console.error('OpenAI AI error, using fallback:', error);
    
    // Resiliency: try to retrieve ANY cached insights for this user
    try {
      const cached = await prisma.aIInsight.findFirst({
        where: { userId, type: 'full' },
        orderBy: { updatedAt: 'desc' }
      });
      if (cached) {
        const insights = JSON.parse(cached.content);
        insights.isStale = true;
        insights.isLocalFallback = false;
        return insights;
      }
    } catch (dbError) {
      console.error('Failed to get cached insights on fallback:', dbError);
    }

    // If no cache exists, generate a customized high-fidelity local fallback
    return generateLocalFallback(context);
  }
}

interface UserContext {
  sustainabilityScore: number;
  metrics: {
    totalEmissions: number;
    totalSaved: number;
    streak: number;
    offsetProgress: number;
  };
  categoryData: {
    name: string;
    percentage: number;
    raw?: number;
  }[];
  earnedBadges: number;
  totalBadges: number;
  totalPoints: number;
  recentActivities: {
    type: string;
    carbonValue: number;
    isReduction: boolean;
    date: string;
    description: string | null;
  }[];
  goals: {
    title: string;
    targetValue: number;
    currentValue: number;
    completed: boolean;
    deadline?: string;
  }[];
}

interface Recommendation {
  title: string;
  description: string;
  impact: string;
  category: string;
  potentialSaving: number;
}

interface GoalSuggestion {
  title: string;
  targetValue: number;
  reasoning: string;
}

interface InsightsData {
  summary: string;
  ecoScore: number;
  potentialSavings: number;
  recommendations: Recommendation[];
  forecast: {
    currentMonthly: number;
    projectedMonthly: number;
    reductionPercent: number;
  };
  goalSuggestions: GoalSuggestion[];
  behavioralInsights: string[];
  isLocalFallback?: boolean;
  isStale?: boolean;
}

export function generateLocalFallback(context: UserContext): InsightsData {
  const sortedCategories = [...context.categoryData].sort((a, b) => (b.raw || 0) - (a.raw || 0));
  const primaryCategory = sortedCategories[0]?.name?.toLowerCase() || 'general';

  const recommendations: Recommendation[] = [];
  const goalSuggestions: GoalSuggestion[] = [];
  const behavioralInsights: string[] = [];

  if (primaryCategory === 'transport' || primaryCategory === 'transportation') {
    recommendations.push({
      title: "Opt for Public Transit",
      description: "Swap 3 driving trips per week with bus or train travel to cut transit emissions.",
      impact: "High",
      category: "transport",
      potentialSaving: 45
    });
    recommendations.push({
      title: "Eco-Friendly Commuting",
      description: "Consider biking or walking for short trips under 5km.",
      impact: "Medium",
      category: "transport",
      potentialSaving: 20
    });
    behavioralInsights.push("Transportation represents your largest carbon source. Prioritize optimizing commutes.");
    goalSuggestions.push({
      title: "Transit Commute Challenge",
      targetValue: 40,
      reasoning: "A great way to cut down on transportation footprint based on your driving activity."
    });
  } else if (primaryCategory === 'energy') {
    recommendations.push({
      title: "Smart Thermostat Installation",
      description: "Lowering heat by 2 degrees in winter or raising AC in summer saves huge electricity.",
      impact: "High",
      category: "energy",
      potentialSaving: 50
    });
    recommendations.push({
      title: "Switch to LEDs",
      description: "Upgrade remaining high-use halogen bulbs to LED alternatives.",
      impact: "Medium",
      category: "energy",
      potentialSaving: 15
    });
    behavioralInsights.push("Your energy usage is a primary footprint driver. Simple hardware upgrades yield huge savings.");
    goalSuggestions.push({
      title: "Energy Saver Challenge",
      targetValue: 35,
      reasoning: "A small improvement in home efficiency yields major CO2 reduction."
    });
  } else {
    recommendations.push({
      title: "Meatless Mondays",
      description: "Adopt plant-based alternatives for one or two full days a week to lower food impact.",
      impact: "High",
      category: "food",
      potentialSaving: 35
    });
    recommendations.push({
      title: "Local Produce Sourcing",
      description: "Buy local ingredients to reduce food miles and associated transport CO2.",
      impact: "Medium",
      category: "food",
      potentialSaving: 15
    });
    behavioralInsights.push("Dietary choices offer an immediate leverage point for carbon footprint reductions.");
    goalSuggestions.push({
      title: "Plant-Based Week",
      targetValue: 30,
      reasoning: "Great way to cut down your food footprint."
    });
  }

  // Ensure 4 recommendations, 2 goals, 3 insights
  if (recommendations.length < 4) {
    recommendations.push({
      title: "Composting Organic Waste",
      description: "Compost organic waste to prevent methane generation in landfills.",
      impact: "Medium",
      category: "waste",
      potentialSaving: 25
    });
    recommendations.push({
      title: "Reduce Single-Use Items",
      description: "Switch to reusable bags, bottles, and food containers.",
      impact: "Low",
      category: "waste",
      potentialSaving: 10
    });
  }

  if (goalSuggestions.length < 2) {
    goalSuggestions.push({
      title: "Zero-Waste Fortnight",
      targetValue: 20,
      reasoning: "Helpful target for reducing weekly garbage footprint."
    });
  }

  if (behavioralInsights.length < 3) {
    behavioralInsights.push("Consistent activity logging helps identify micro-trends in emissions.");
    behavioralInsights.push("Your goal progress is progressing nicely - consider setting a water conservation target.");
  }

  const potentialSavings = recommendations.reduce((acc, r) => acc + r.potentialSaving, 0);
  const currentMonthly = Math.round(context.metrics.totalEmissions) || 120;
  const projectedMonthly = Math.max(20, currentMonthly - potentialSavings);
  const reductionPercent = Math.round(((currentMonthly - projectedMonthly) / currentMonthly) * 100) || 20;

  return {
    summary: `Based on your recent activity, your Eco Score is ${context.sustainabilityScore}/100. Optimizing your primary emission areas can help you save up to ${potentialSavings}kg of carbon monthly.`,
    ecoScore: context.sustainabilityScore,
    potentialSavings,
    recommendations,
    forecast: {
      currentMonthly,
      projectedMonthly,
      reductionPercent
    },
    goalSuggestions,
    behavioralInsights,
    isLocalFallback: true
  };
}

export async function chatWithAssistant(userId: string, message: string) {
  const context = await gatherUserContext(userId);

  const systemPrompt = `You are EcoTrack's AI Sustainability Assistant. You help users reduce their carbon footprint.

USER CONTEXT:
- Score: ${context.sustainabilityScore}/100, Streak: ${context.metrics.streak} days
- Total Saved: ${context.metrics.totalSaved}kg, Total Emitted: ${context.metrics.totalEmissions}kg
- Categories: ${context.categoryData.map((c: { name: string; percentage: number }) => `${c.name}: ${c.percentage}%`).join(', ')}
- Goals: ${context.goals.map((g: { title: string }) => g.title).join(', ') || 'None set'}

Be helpful, concise, and encouraging. Use specific numbers from their data. Keep responses under 150 words. Use emojis sparingly.`;

  try {
    const response = await openaiClient.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ]
    });

    return response.choices[0]?.message?.content || 'I apologize, I could not generate a response. Please try again.';
  } catch (error) {
    console.error('OpenAI chat error, using local reply:', error);
    const sortedCategories = [...context.categoryData].sort((a, b) => (b.raw || 0) - (a.raw || 0));
    const primaryCategory = sortedCategories[0]?.name || 'general';
    return `Hi! EcoTrack's AI is experiencing high demand right now, so I'm running in offline backup mode. 🛠️

Looking at your profile:
• Streak: ${context.metrics.streak} days
• Eco Score: ${context.sustainabilityScore}/100
• Primary Emission Category: ${primaryCategory}

Regarding your request: "${message}", I recommend checking out the AI Insights page, which contains customized recommendations to reduce your footprint! Let me know if you have specific questions about ${primaryCategory}.`;
  }
}
