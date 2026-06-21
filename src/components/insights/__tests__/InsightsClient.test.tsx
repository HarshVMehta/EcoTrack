import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { InsightsClient } from '../InsightsClient';

// Mock Router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      refresh: jest.fn(),
      push: jest.fn(),
    };
  },
}));

// Mock Server Actions
jest.mock('@/actions/insights', () => ({
  getAIInsights: jest.fn(),
}));

jest.mock('@/actions/goal', () => ({
  createGoal: jest.fn(),
}));

describe('InsightsClient Component', () => {
  const mockInsights = {
    summary: 'You are doing great at reducing energy emissions, but transport needs work.',
    ecoScore: 78,
    potentialSavings: 80,
    recommendations: [
      {
        title: 'Use E-Bike for Commute',
        description: 'Trade 2 driving trips a week for e-bike riding.',
        impact: 'High' as const,
        category: 'transport' as const,
        potentialSaving: 35
      },
      {
        title: 'Switch to LEDs',
        description: 'Swap Halogen bulbs to LED bulbs.',
        impact: 'Medium' as const,
        category: 'energy' as const,
        potentialSaving: 15
      }
    ],
    forecast: {
      currentMonthly: 120,
      projectedMonthly: 70,
      reductionPercent: 41
    },
    goalSuggestions: [
      {
        title: 'Commute by Bike',
        targetValue: 40,
        reasoning: 'Reduces driving emissions by 40kg.'
      }
    ],
    behavioralInsights: [
      'Your transport footprint was higher on weekends.',
      'Log energy usage regularly.'
    ]
  };

  const mockMetrics = {
    totalEmissions: 120,
    totalSaved: 30,
    streak: 4,
    offsetProgress: 15
  };

  test('should render Eco Score and Summary correctly', () => {
    render(
      <InsightsClient
        initialInsights={mockInsights}
        score={78}
        metrics={mockMetrics}
      />
    );

    // Check summary text
    expect(screen.getByText(/You are doing great at reducing energy emissions/)).toBeInTheDocument();
    
    // Check Eco Score gauge text
    expect(screen.getByText('78')).toBeInTheDocument();
  });

  test('should display AI recommendations cards', () => {
    render(
      <InsightsClient
        initialInsights={mockInsights}
        score={78}
        metrics={mockMetrics}
      />
    );

    // Check recommendation titles
    expect(screen.getByText('Use E-Bike for Commute')).toBeInTheDocument();
    expect(screen.getByText('Switch to LEDs')).toBeInTheDocument();
    
    // Check potential savings values
    expect(screen.getByText('-35 kg CO₂')).toBeInTheDocument();
    expect(screen.getByText('-15 kg CO₂')).toBeInTheDocument();
  });
});
