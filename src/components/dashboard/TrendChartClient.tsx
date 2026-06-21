"use client";

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function DashboardTrendChart({ data }: { data: { name: string, emissions: number }[] }) {
  return (
    <div className="w-full h-64 relative">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorEmissionsDash" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4a7c59" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#4a7c59" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} dy={10} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} dx={-10} />
          <Tooltip 
            contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
            itemStyle={{ color: 'hsl(var(--foreground))' }}
          />
          <Area type="monotone" dataKey="emissions" stroke="#4a7c59" strokeWidth={3} fillOpacity={1} fill="url(#colorEmissionsDash)" activeDot={{ r: 6, fill: '#4a7c59', stroke: 'hsl(var(--background))', strokeWidth: 2 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
