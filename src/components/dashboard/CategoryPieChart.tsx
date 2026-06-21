"use client";

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface CategoryPieChartProps {
  data: { name: string; percentage: number; raw: number; }[];
}

const COLORS = ['hsl(var(--primary))', '#705c30', '#78a886', 'hsl(var(--muted-foreground))'];

export function CategoryPieChart({ data }: CategoryPieChartProps) {
  // Filter out 0 values for better pie chart rendering
  const validData = data.filter(d => d.percentage > 0);

  if (validData.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
        No category data available.
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[250px] relative">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={validData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="percentage"
            stroke="none"
          >
            {validData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
            itemStyle={{ color: 'hsl(var(--foreground))' }}
            formatter={(value: number, name: string, props: any) => [`${value}% (${props.payload.raw} kg)`, name]}
          />
          <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
