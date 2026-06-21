import React from 'react';
import { Leaf, Flame, ArrowUpRight, TrendingUp, Plus, Activity, PieChart as PieChartIcon } from 'lucide-react';
import { auth, currentUser } from '@clerk/nextjs/server';
import { 
  getDashboardMetrics, 
  getTrendData, 
  getSustainabilityScore, 
  getRecentActivities, 
  getEmissionsComparison,
  getCategoryData,
  getGoals
} from '@/lib/data-service';
import { DashboardTrendChart } from '@/components/dashboard/TrendChartClient';
import { CategoryPieChart } from '@/components/dashboard/CategoryPieChart';
import { RecentActivitiesClient } from '@/components/dashboard/RecentActivitiesClient';
import Link from 'next/link';

export default async function DashboardPage() {
  const { userId } = await auth();
  const user = await currentUser();
  const firstName = user?.firstName || 'EcoTrack User';

  if (!userId) {
    return <div>Please sign in.</div>;
  }

  const [metrics, trendData, sustainabilityScore, recentActivities, emissionsComparison, categoryData, goals] = await Promise.all([
    getDashboardMetrics(userId),
    getTrendData(userId),
    getSustainabilityScore(userId),
    getRecentActivities(userId),
    getEmissionsComparison(userId),
    getCategoryData(userId),
    getGoals(userId),
  ]);

  // Render days array for the streak
  const days = ['M','T','W','T','F','S','S'];

  return (
    <div className="p-6 md:p-8 lg:p-10 max-w-7xl mx-auto w-full pb-32 lg:pb-10 space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="font-heading text-3xl font-bold text-foreground">Welcome back, {firstName}</h2>
          <p className="text-muted-foreground mt-1 text-lg">You're making a measurable difference this week.</p>
        </div>
        <Link href="/activities" className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 transition-all shadow-sm active:scale-95 w-fit">
          <Plus className="w-5 h-5" />
          Log New Action
        </Link>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        
        {/* Sustainability Score Hero Card */}
        <div className="col-span-1 md:col-span-2 lg:col-span-2 bg-card rounded-[2rem] p-8 shadow-soft relative overflow-hidden flex flex-col justify-between min-h-[320px] border border-border/50">
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="relative z-10 flex flex-col h-full">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="font-heading text-xl font-bold text-foreground">Sustainability Score</h3>
                <p className="text-sm text-muted-foreground mt-1">Based on actions and community rank</p>
              </div>
              <Leaf className="text-primary w-8 h-8" />
            </div>
            
            <div className="flex-1 flex items-center justify-center py-4">
              <div className="relative w-48 h-48 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle className="text-muted stroke-current" cx="50" cy="50" fill="transparent" r="40" strokeWidth="8"></circle>
                  <circle 
                    className="text-primary stroke-current transition-all duration-1000 ease-out" 
                    cx="50" cy="50" fill="transparent" r="40" 
                    strokeDasharray="251.2" 
                    strokeDashoffset={251.2 - (251.2 * sustainabilityScore) / 100} 
                    strokeLinecap="round" strokeWidth="8">
                  </circle>
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-4xl font-heading font-bold text-primary">{sustainabilityScore}</span>
                  <span className="text-sm text-muted-foreground font-bold uppercase tracking-wider mt-1">/ 100</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-auto pt-4 border-t border-border">
              <div className="flex items-center gap-2">
                <TrendingUp className="text-[#705c30] w-4 h-4" />
                <span className="text-sm text-[#705c30] font-bold">Carbon Saved: {Math.round(metrics.totalSaved)} kg CO₂</span>
              </div>
              <Link href="/reports" className="text-sm font-bold text-primary hover:text-primary/80 transition-colors">View Reports</Link>
            </div>
          </div>
        </div>

        {/* Streak Card */}
        <div className="col-span-1 bg-gradient-to-br from-card to-secondary/30 rounded-[2rem] p-8 shadow-soft flex flex-col justify-between min-h-[320px] border border-border/50">
          <div>
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-heading text-xl font-bold text-foreground">Daily Streak</h3>
              <Flame className="text-[#705c30] w-6 h-6" />
            </div>
            <p className="text-sm text-muted-foreground">Consistent logging</p>
          </div>
          <div className="flex flex-col items-center justify-center my-8">
            <span className="text-6xl font-heading font-black text-foreground mb-2">{metrics.streak}</span>
            <span className="text-lg font-bold text-muted-foreground uppercase tracking-widest">Days</span>
          </div>
          <div className="flex justify-between items-center gap-2 mt-auto">
            {days.map((day, i) => (
              <div key={i} className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${i < Math.min(metrics.streak, 7) ? 'bg-primary text-primary-foreground' : 'bg-muted border border-border text-muted-foreground'}`}>{day}</div>
            ))}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="col-span-1 md:col-span-3 lg:col-span-1 bg-card rounded-[2rem] p-6 shadow-soft flex flex-col border border-border/50 max-h-[400px]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-heading text-lg font-bold text-foreground">Recent Activities</h3>
            <Activity className="w-5 h-5 text-muted-foreground" />
          </div>
          <RecentActivitiesClient activities={recentActivities} />
        </div>

        {/* Carbon Trend Chart */}
        <div className="col-span-1 md:col-span-2 lg:col-span-2 bg-card rounded-[2rem] p-8 shadow-soft border border-border/50">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="font-heading text-xl font-bold text-foreground">Carbon Trend</h3>
              <p className="text-sm text-muted-foreground mt-1">Your emissions over the last 6 months</p>
            </div>
            <div className="flex bg-muted rounded-lg p-1">
              <button className="px-4 py-1.5 text-sm font-bold bg-card text-primary rounded-md shadow-sm">6M</button>
            </div>
          </div>
          
          <DashboardTrendChart data={trendData} />
        </div>

        {/* Category Pie Chart */}
        <div className="col-span-1 md:col-span-1 lg:col-span-1 bg-card rounded-[2rem] p-8 shadow-soft border border-border/50 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-heading text-xl font-bold text-foreground">By Category</h3>
              <p className="text-sm text-muted-foreground mt-1">Total footprint distribution</p>
            </div>
            <PieChartIcon className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="flex-1 -mx-4 -mb-4 min-h-[200px]">
            <CategoryPieChart data={categoryData} />
          </div>
        </div>

        {/* Active Goals Summary */}
        <div className="col-span-1 md:col-span-2 lg:col-span-2 bg-card rounded-[2rem] p-8 shadow-soft border border-border/50 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-heading text-xl font-bold text-foreground">Active Goals</h3>
              <p className="text-sm text-muted-foreground mt-1">Your current reduction targets</p>
            </div>
            <Link href="/goals" className="text-sm font-bold text-primary hover:text-primary/80 transition-colors">View All</Link>
          </div>
          <div className="space-y-4 flex-1">
            {goals.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">No active goals.</div>
            ) : (
              goals.slice(0, 2).map((goal: any) => {
                const progress = Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100));
                return (
                  <div key={goal.id} className="bg-muted/50 rounded-xl p-4 border border-border">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-sm text-foreground">{goal.title}</h4>
                      <span className="text-xs font-bold text-primary">{progress}%</span>
                    </div>
                    <div className="w-full bg-muted-foreground/20 rounded-full h-2 mb-2">
                      <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${progress}%` }}></div>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{Math.round(goal.currentValue)}kg saved</span>
                      <span>Target: {goal.targetValue}kg</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Weekly vs Monthly Emissions */}
        <div className="col-span-1 md:col-span-1 lg:col-span-1 bg-card rounded-[2rem] p-8 shadow-soft border border-border/50 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-6">
            <h3 className="font-heading text-xl font-bold text-foreground">Period Comparison</h3>
            <ArrowUpRight className="text-muted-foreground w-6 h-6" />
          </div>
          
          <div className="space-y-6 flex-1">
            <div>
              <div className="flex justify-between text-sm font-bold text-foreground mb-2">
                <span>Last 7 Days</span>
                <span>{emissionsComparison.weekly.toFixed(0)} kg</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: `${Math.min(100, (emissionsComparison.weekly / 100) * 100)}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm font-bold text-foreground mb-2">
                <span>Last 30 Days</span>
                <span>{emissionsComparison.monthly.toFixed(0)} kg</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-[#705c30] h-2 rounded-full" style={{ width: `${Math.min(100, (emissionsComparison.monthly / 500) * 100)}%` }}></div>
              </div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-4 leading-relaxed">
            Keep your weekly emissions under 100kg to meet the recommended global goals.
          </p>
        </div>

      </div>
    </div>
  );
}
