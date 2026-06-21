"use client";

import React from 'react';
import { Filter, Download, CloudRain, TreePine, Trophy, Zap, TrendingDown, ArrowRight } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend
} from 'recharts';

interface ReportsProps {
  metrics: { totalSaved: number; totalEmissions: number; offsetProgress: number; };
  trendData: { name: string; emissions: number; }[];
  categoryData: { name: string; percentage: number; raw: number; }[];
  comparisonData: { name: string; you: number; community: number; }[];
  communityRank: { rankPercentile: number; topPercentage: number; };
}

export function ReportsClient({ metrics, trendData, categoryData, comparisonData, communityRank }: ReportsProps) {
  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8">
      {/* Page Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <h2 className="font-heading text-3xl font-bold text-foreground mb-2">Reports & Analytics</h2>
          <p className="font-sans text-muted-foreground text-base">Deep dive into your environmental impact over time.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-card text-primary border border-border rounded-lg hover:bg-muted transition-colors font-sans text-sm font-semibold shadow-sm">
            <Filter className="w-5 h-5" />
            Filters
          </button>
          <button className="flex items-center gap-2 px-5 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-sans text-sm font-semibold shadow-sm">
            <Download className="w-5 h-5" />
            Download Report
          </button>
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Overview Stats Cards */}
        <div className="md:col-span-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-card p-6 rounded-3xl shadow-soft border border-border/50 relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/20 rounded-full blur-xl"></div>
            <div className="flex justify-between items-start mb-4">
              <span className="text-muted-foreground font-sans text-sm font-semibold">Total Emissions</span>
              <CloudRain className="text-primary w-5 h-5" />
            </div>
            <h3 className="font-heading text-3xl font-bold text-foreground mb-1">{(metrics.totalEmissions / 1000).toFixed(2)}<span className="text-lg text-muted-foreground font-normal ml-1">tons</span></h3>
          </div>

          <div className="bg-card p-6 rounded-3xl shadow-soft border border-border/50 relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#705c30]/10 rounded-full blur-xl"></div>
            <div className="flex justify-between items-start mb-4">
              <span className="text-muted-foreground font-sans text-sm font-semibold">Offset Progress</span>
              <TreePine className="text-[#705c30] w-5 h-5" />
            </div>
            <h3 className="font-heading text-3xl font-bold text-foreground mb-1">{metrics.offsetProgress}<span className="text-lg text-muted-foreground font-normal ml-1">%</span></h3>
            <div className="w-full bg-muted h-1.5 rounded-full mt-3 overflow-hidden">
              <div className="bg-[#705c30] h-full rounded-full" style={{ width: `${metrics.offsetProgress}%` }}></div>
            </div>
          </div>

          <div className="bg-card p-6 rounded-3xl shadow-soft border border-border/50">
            <div className="flex justify-between items-start mb-4">
              <span className="text-muted-foreground font-sans text-sm font-semibold">Community Rank</span>
              <Trophy className="text-primary w-5 h-5" />
            </div>
            <h3 className="font-heading text-3xl font-bold text-foreground mb-1">Top {communityRank.topPercentage}%</h3>
            <p className="font-sans text-xs text-muted-foreground mt-2 leading-relaxed">You are doing better than {communityRank.rankPercentile}% of users.</p>
          </div>

          <div className="bg-card p-6 rounded-3xl shadow-soft border border-border/50">
            <div className="flex justify-between items-start mb-4">
              <span className="text-muted-foreground font-sans text-sm font-semibold">Carbon Saved</span>
              <Zap className="text-[#705c30] w-5 h-5" />
            </div>
            <h3 className="font-heading text-3xl font-bold text-foreground mb-1">{metrics.totalSaved.toFixed(0)}<span className="text-lg text-muted-foreground font-normal ml-1">kg</span></h3>
            <p className="font-sans text-xs text-muted-foreground mt-2 leading-relaxed">Total reductions from logged actions.</p>
          </div>
        </div>

        {/* Main Line Chart - Trends */}
        <div className="md:col-span-8 bg-card p-6 lg:p-8 rounded-3xl shadow-soft border border-border/50 min-h-[400px] flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-heading text-lg font-bold text-foreground">Emission Trends</h3>
              <p className="font-sans text-sm text-muted-foreground">Your footprint over the last 6 months</p>
            </div>
            <select className="bg-background border-none text-sm font-sans text-muted-foreground rounded-lg focus:ring-0 cursor-pointer">
              <option>Last 6 Months</option>
            </select>
          </div>
          <div className="flex-1 w-full relative min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorEmissionsReports" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} dx={-10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                  itemStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Area type="monotone" dataKey="emissions" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorEmissionsReports)" activeDot={{ r: 6, fill: 'hsl(var(--primary))', stroke: 'hsl(var(--background))', strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Heatmap / Bar Chart */}
        <div className="md:col-span-4 bg-card p-6 rounded-3xl shadow-soft border border-border/50 flex flex-col">
          <div className="mb-6">
            <h3 className="font-heading text-lg font-bold text-foreground">By Category</h3>
            <p className="font-sans text-sm text-muted-foreground">Where you impact most</p>
          </div>
          <div className="flex-1 flex flex-col justify-center space-y-5">
            {categoryData.slice(0, 4).map((cat, idx) => {
              const colors = ['bg-primary', 'bg-[#705c30]', 'bg-[#78a886]', 'bg-muted-foreground'];
              return (
                <div key={cat.name}>
                  <div className="flex justify-between text-sm font-sans text-foreground mb-1">
                    <span className="flex items-center gap-2"><span className={`w-2 h-2 rounded-full ${colors[idx]}`}></span>{cat.name}</span>
                    <span>{cat.percentage}%</span>
                  </div>
                  <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                    <div className={`${colors[idx]} h-full rounded-full`} style={{ width: `${cat.percentage}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Community Comparison */}
        <div className="md:col-span-12 bg-card p-6 lg:p-8 rounded-3xl shadow-soft border border-border/50">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="w-full md:w-1/3 space-y-4">
              <h3 className="font-heading text-2xl font-bold text-foreground">Community Average</h3>
              <p className="font-sans text-muted-foreground leading-relaxed">See how your sustainable habits stack up against the EcoTrack community. You are doing well!</p>
              <button className="text-primary font-bold font-sans text-sm flex items-center gap-1 hover:underline mt-4">
                View Leaderboard <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div className="w-full md:w-2/3 h-[250px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }} width={100} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                  />
                  <Legend iconType="circle" />
                  <Bar dataKey="you" name="You" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={12} />
                  <Bar dataKey="community" name="Community Avg" fill="hsl(var(--muted-foreground))" radius={[0, 4, 4, 0]} barSize={12} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
      <div className="h-8"></div>
    </div>
  );
}
