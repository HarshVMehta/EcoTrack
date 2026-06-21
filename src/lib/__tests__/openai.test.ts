/**
 * @jest-environment node
 */
import { generateLocalFallback } from '../openai';

describe('generateLocalFallback', () => {
  const baseContext = {
    sustainabilityScore: 82,
    metrics: {
      totalEmissions: 150,
      totalSaved: 30,
      streak: 5,
      offsetProgress: 20
    },
    categoryData: [
      { name: 'Transport', percentage: 60, raw: 90 },
      { name: 'Energy', percentage: 30, raw: 45 },
      { name: 'Food', percentage: 10, raw: 15 }
    ],
    earnedBadges: 2,
    totalBadges: 9,
    totalPoints: 120,
    recentActivities: [],
    goals: []
  };

  test('should return transport-specific recommendations when transport is primary emission source', () => {
    const fallback = generateLocalFallback(baseContext);

    expect(fallback.ecoScore).toBe(82);
    expect(fallback.isLocalFallback).toBe(true);
    expect(fallback.recommendations.length).toBeGreaterThanOrEqual(4);
    
    // Check that at least one recommendation is transport category
    const transportRec = fallback.recommendations.find((r: { category: string }) => r.category === 'transport');
    expect(transportRec).toBeDefined();
    expect(transportRec?.title).toBe('Opt for Public Transit');
  });

  test('should return energy-specific recommendations when energy is primary source', () => {
    const energyContext = {
      ...baseContext,
      categoryData: [
        { name: 'Transport', percentage: 20, raw: 30 },
        { name: 'Energy', percentage: 70, raw: 105 },
        { name: 'Food', percentage: 10, raw: 15 }
      ]
    };

    const fallback = generateLocalFallback(energyContext);
    const energyRec = fallback.recommendations.find((r: { category: string }) => r.category === 'energy');
    
    expect(energyRec).toBeDefined();
    expect(energyRec?.title).toBe('Smart Thermostat Installation');
  });

  test('should calculate correct emission forecast projection', () => {
    const fallback = generateLocalFallback(baseContext);
    const expectedSavings = fallback.recommendations.reduce((acc: number, r: { potentialSaving: number }) => acc + r.potentialSaving, 0);

    expect(fallback.potentialSavings).toBe(expectedSavings);
    expect(fallback.forecast.currentMonthly).toBe(150);
    expect(fallback.forecast.projectedMonthly).toBe(150 - expectedSavings);
    expect(fallback.forecast.reductionPercent).toBe(Math.round((expectedSavings / 150) * 100));
  });
});
