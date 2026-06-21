import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CategoryPieChart } from '../CategoryPieChart';

// Mock Recharts components for reliable JSDOM rendering
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  PieChart: ({ children }: { children: React.ReactNode }) => <div data-testid="pie-chart">{children}</div>,
  Pie: ({ children }: { children: React.ReactNode }) => <div data-testid="pie">{children}</div>,
  Cell: () => null,
  Tooltip: () => null,
  Legend: () => null,
}));

describe('CategoryPieChart Component', () => {
  const mockData = [
    { name: 'Transport', percentage: 60, raw: 120 },
    { name: 'Energy', percentage: 40, raw: 80 }
  ];

  test('should render empty state when no category values are greater than zero', () => {
    const zeroData = [
      { name: 'Transport', percentage: 0, raw: 0 },
      { name: 'Energy', percentage: 0, raw: 0 }
    ];
    render(<CategoryPieChart data={zeroData} />);
    expect(screen.getByText('No category data available.')).toBeInTheDocument();
  });

  test('should render chart container when data exists', () => {
    render(<CategoryPieChart data={mockData} />);
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
  });
});
