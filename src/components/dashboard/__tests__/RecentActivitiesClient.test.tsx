import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { RecentActivitiesClient } from '../RecentActivitiesClient';

describe('RecentActivitiesClient Component', () => {
  const mockActivities = [
    {
      id: 'act-1',
      type: 'transport',
      carbonValue: 15,
      isReduction: false,
      date: new Date()
    },
    {
      id: 'act-2',
      type: 'food',
      carbonValue: 5,
      isReduction: true,
      date: new Date(Date.now() - 60000) // 1 minute ago
    }
  ];

  test('should render empty state when no activities are present', () => {
    render(<RecentActivitiesClient activities={[]} />);
    expect(screen.getByText('No recent activities found.')).toBeInTheDocument();
  });

  test('should render activities list with correct emission descriptions and values', () => {
    render(<RecentActivitiesClient activities={mockActivities} />);

    // Check transport log details
    expect(screen.getByText('transport logged')).toBeInTheDocument();
    expect(screen.getByText('+15 kg')).toBeInTheDocument();

    // Check food reduction details
    expect(screen.getByText('Saved Carbon')).toBeInTheDocument();
    expect(screen.getByText('-5 kg')).toBeInTheDocument();
  });
});
