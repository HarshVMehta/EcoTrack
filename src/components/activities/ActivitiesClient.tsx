"use client";

import React, { useState, useTransition } from 'react';
import { Star, Cloud, Bike, Lightbulb, Utensils, Search, Filter, Trash2, Plus, ArrowRight, ArrowLeft, Flame } from 'lucide-react';
import { logQuickActivity, deleteActivity } from '@/actions/activity';
import { useRouter } from 'next/navigation';

interface ActivityType {
  id: string;
  type: string;
  carbonValue: number;
  isReduction: boolean;
  date: Date;
  description?: string | null;
}

interface ActivitiesClientProps {
  metrics: { totalSaved: number; streak: number; offsetProgress: number; };
  initialActivities: ActivityType[];
  totalPages: number;
  currentPage: number;
  currentFilter: string;
}

// Native relative time formatter
const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
function formatRelativeTime(date: Date) {
  const now = new Date();
  const diffInSeconds = Math.floor((date.getTime() - now.getTime()) / 1000);
  if (Math.abs(diffInSeconds) < 60) return rtf.format(diffInSeconds, 'second');
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (Math.abs(diffInMinutes) < 60) return rtf.format(diffInMinutes, 'minute');
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (Math.abs(diffInHours) < 24) return rtf.format(diffInHours, 'hour');
  const diffInDays = Math.floor(diffInHours / 24);
  return rtf.format(diffInDays, 'day');
}

export function ActivitiesClient({ metrics, initialActivities, totalPages, currentPage, currentFilter }: ActivitiesClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  // Custom Form State
  const [desc, setDesc] = useState('');
  const [cat, setCat] = useState('transport');
  const [impact, setImpact] = useState('small');

  const handleQuickLog = async (type: string, description: string, value: number, isReduction: boolean = true) => {
    setLoadingAction(description);
    await logQuickActivity(type, description, value, isReduction);
    setLoadingAction(null);
  };

  const handleCustomLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc) return;
    setLoadingAction('custom');
    
    // Convert impact string to fixed carbon value
    let val = 1;
    if (impact === 'medium') val = 5;
    if (impact === 'large') val = 15;

    // We assume custom logs here are Reductions (Carbon Saved). 
    // The user can use the calculator for complex emissions.
    await logQuickActivity(cat, desc, val, true);
    
    setDesc('');
    setLoadingAction(null);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this activity?")) {
      setLoadingAction(`del-${id}`);
      await deleteActivity(id);
      setLoadingAction(null);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    startTransition(() => {
      router.push(`/activities?filter=${val}&page=1`);
    });
  };

  const handlePageChange = (newPage: number) => {
    startTransition(() => {
      router.push(`/activities?filter=${currentFilter}&page=${newPage}`);
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-6 lg:px-12 py-8 lg:py-12 space-y-12">
      {/* Page Header & Summary */}
      <section className="flex flex-col lg:flex-row gap-8 justify-between items-start lg:items-end">
        <div>
          <h2 className="font-heading text-3xl lg:text-4xl text-foreground mb-2 tracking-tight">Today's Impact</h2>
          <p className="font-sans text-muted-foreground text-lg max-w-2xl leading-relaxed">
            Log your daily sustainable choices and watch your positive environmental impact grow.
          </p>
        </div>
        
        <div className="flex gap-4 w-full lg:w-auto">
          {/* Points/Streak Summary */}
          <div className="bg-card border border-border rounded-xl p-5 flex items-center gap-4 shadow-soft flex-1 lg:flex-none min-w-[160px]">
            <div className="w-12 h-12 rounded-full bg-[#f8e0a8] flex items-center justify-center text-[#705c30]">
              <Star className="w-6 h-6 fill-current" />
            </div>
            <div>
              <p className="font-sans text-sm font-bold text-muted-foreground uppercase tracking-wider">Current Streak</p>
              <p className="font-heading text-2xl font-bold text-foreground">{metrics.streak} <span className="text-lg font-sans font-normal text-muted-foreground ml-1">Days</span></p>
            </div>
          </div>
          
          {/* Offset Summary */}
          <div className="bg-card border border-border rounded-xl p-5 flex items-center gap-4 shadow-soft flex-1 lg:flex-none min-w-[160px]">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary">
              <Cloud className="w-6 h-6 fill-current" />
            </div>
            <div>
              <p className="font-sans text-sm font-bold text-muted-foreground uppercase tracking-wider">Carbon Offset</p>
              <p className="font-heading text-2xl font-bold text-foreground">{(metrics.totalSaved / 1000).toFixed(2)}<span className="text-lg font-sans font-normal text-muted-foreground ml-1">tons</span></p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Log Grid */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-heading text-2xl font-bold text-foreground">Quick Check-in</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Transport Card */}
          <div className="bg-muted/30 rounded-2xl p-6 shadow-soft border border-border hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors"></div>
            <div className="flex justify-between items-start mb-6 relative z-10">
              <div className="w-12 h-12 rounded-xl bg-card flex items-center justify-center text-primary shadow-sm border border-border">
                <Bike className="w-6 h-6" />
              </div>
            </div>
            <h4 className="font-heading font-bold text-xl text-foreground mb-2 relative z-10">Transport</h4>
            <div className="flex flex-col gap-2 relative z-10 mt-6">
              <button 
                onClick={() => handleQuickLog('transport', 'Biked to Work', 2)}
                disabled={!!loadingAction}
                className="w-full py-2.5 px-4 bg-card text-foreground border border-border rounded-xl text-sm font-bold hover:border-primary/50 hover:bg-muted transition-colors flex justify-between items-center group/btn disabled:opacity-50">
                <span>{loadingAction === 'Biked to Work' ? 'Logging...' : 'Biked to Work'}</span>
                <Plus className="w-4 h-4 text-muted-foreground group-hover/btn:text-primary transition-colors" />
              </button>
              <button 
                onClick={() => handleQuickLog('transport', 'Public Transit', 1.5)}
                disabled={!!loadingAction}
                className="w-full py-2.5 px-4 bg-card text-foreground border border-border rounded-xl text-sm font-bold hover:border-primary/50 hover:bg-muted transition-colors flex justify-between items-center group/btn disabled:opacity-50">
                <span>{loadingAction === 'Public Transit' ? 'Logging...' : 'Public Transit'}</span>
                <Plus className="w-4 h-4 text-muted-foreground group-hover/btn:text-primary transition-colors" />
              </button>
            </div>
          </div>

          {/* Energy Card */}
          <div className="bg-muted/30 rounded-2xl p-6 shadow-soft border border-border hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-[#705c30]/5 rounded-full blur-2xl group-hover:bg-[#705c30]/10 transition-colors"></div>
            <div className="flex justify-between items-start mb-6 relative z-10">
              <div className="w-12 h-12 rounded-xl bg-card flex items-center justify-center text-[#705c30] shadow-sm border border-border">
                <Lightbulb className="w-6 h-6" />
              </div>
            </div>
            <h4 className="font-heading font-bold text-xl text-foreground mb-2 relative z-10">Energy</h4>
            <div className="flex flex-col gap-2 relative z-10 mt-6">
              <button 
                onClick={() => handleQuickLog('energy', 'Lowered Heat/AC', 1.2)}
                disabled={!!loadingAction}
                className="w-full py-2.5 px-4 bg-card text-foreground border border-border rounded-xl text-sm font-bold hover:border-[#705c30]/50 hover:bg-muted transition-colors flex justify-between items-center group/btn disabled:opacity-50">
                <span>{loadingAction === 'Lowered Heat/AC' ? 'Logging...' : 'Lowered Heat'}</span>
                <Plus className="w-4 h-4 text-muted-foreground group-hover/btn:text-[#705c30] transition-colors" />
              </button>
              <button 
                onClick={() => handleQuickLog('energy', 'Unplugged Devices', 0.5)}
                disabled={!!loadingAction}
                className="w-full py-2.5 px-4 bg-card text-foreground border border-border rounded-xl text-sm font-bold hover:border-[#705c30]/50 hover:bg-muted transition-colors flex justify-between items-center group/btn disabled:opacity-50">
                <span>{loadingAction === 'Unplugged Devices' ? 'Logging...' : 'Unplugged Devices'}</span>
                <Plus className="w-4 h-4 text-muted-foreground group-hover/btn:text-[#705c30] transition-colors" />
              </button>
            </div>
          </div>

          {/* Food Card */}
          <div className="bg-muted/30 rounded-2xl p-6 shadow-soft border border-border hover:shadow-md transition-shadow relative overflow-hidden group lg:col-span-2">
            <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors"></div>
            <div className="flex flex-col lg:flex-row gap-6 h-full relative z-10">
              <div className="flex-1">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 rounded-xl bg-card flex items-center justify-center text-primary shadow-sm border border-border">
                    <Utensils className="w-6 h-6" />
                  </div>
                </div>
                <h4 className="font-heading font-bold text-xl text-foreground mb-2">Food & Dining</h4>
                <p className="text-sm text-muted-foreground mb-6">Plant-based meals, local produce, zero food waste.</p>
              </div>
              <div className="flex-1 flex flex-col justify-end gap-2">
                <button 
                  onClick={() => handleQuickLog('food', 'Plant-Based Meal', 2.5)}
                  disabled={!!loadingAction}
                  className="w-full py-3 px-4 bg-primary text-primary-foreground rounded-xl text-sm font-bold shadow-soft hover:bg-primary/90 transition-colors flex justify-between items-center disabled:opacity-50">
                  <span>{loadingAction === 'Plant-Based Meal' ? 'Logging...' : 'Plant-Based Meal'}</span>
                  <Plus className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleQuickLog('food', 'Zero Food Waste', 0.8)}
                  disabled={!!loadingAction}
                  className="w-full py-2.5 px-4 bg-card text-foreground border border-border rounded-xl text-sm font-bold hover:border-primary/50 hover:bg-muted transition-colors flex justify-between items-center group/btn disabled:opacity-50">
                  <span>{loadingAction === 'Zero Food Waste' ? 'Logging...' : 'Zero Food Waste'}</span>
                  <Plus className="w-4 h-4 text-muted-foreground group-hover/btn:text-primary transition-colors" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Activity Feed Section */}
      <section className="bg-card rounded-2xl p-6 md:p-8 border border-border shadow-soft">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h3 className="font-heading font-bold text-2xl text-foreground">Activity Feed</h3>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search activities..." 
                className="w-full pl-9 pr-4 py-2 bg-muted rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div className="relative">
              <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <select 
                value={currentFilter}
                onChange={handleFilterChange}
                className="pl-9 pr-8 py-2 bg-muted rounded-lg text-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="all">All Categories</option>
                <option value="transport">Transport</option>
                <option value="energy">Energy</option>
                <option value="food">Food</option>
                <option value="waste">Waste</option>
                <option value="shopping">Shopping</option>
              </select>
            </div>
          </div>
        </div>

        {/* Feed Table/List */}
        <div className="space-y-3 relative min-h-[200px]">
          {isPending && (
            <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px] flex items-center justify-center z-10 rounded-xl">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          )}
          
          {initialActivities.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No activities found.
            </div>
          ) : (
            initialActivities.map(act => (
              <div key={act.id} className="flex items-center justify-between p-4 rounded-xl border border-border hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${act.isReduction ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                    {act.isReduction ? <Cloud className="w-5 h-5" /> : <Flame className="w-5 h-5" />}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-foreground capitalize">
                      {act.description || act.type}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {formatRelativeTime(new Date(act.date))} • {act.type}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`text-sm font-bold ${act.isReduction ? 'text-primary' : 'text-foreground'}`}>
                    {act.isReduction ? '-' : '+'}{act.carbonValue} kg
                  </span>
                  <button 
                    onClick={() => handleDelete(act.id)}
                    disabled={loadingAction === `del-${act.id}`}
                    className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 border-t border-border pt-6">
            <button 
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || isPending}
              className="px-4 py-2 border border-border rounded-lg text-sm font-bold hover:bg-muted transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Previous
            </button>
            <span className="text-sm text-muted-foreground font-bold">
              Page {currentPage} of {totalPages}
            </span>
            <button 
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || isPending}
              className="px-4 py-2 border border-border rounded-lg text-sm font-bold hover:bg-muted transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              Next <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </section>

      {/* Custom Entry Section */}
      <section className="bg-muted/50 rounded-2xl p-8 border border-border shadow-soft">
        <div className="max-w-2xl">
          <h3 className="font-heading font-bold text-2xl text-foreground mb-2">Log Custom Activity</h3>
          <p className="text-muted-foreground mb-6">Did something else green today? Tell us about it.</p>
          <form className="space-y-4" onSubmit={handleCustomLog}>
            <div>
              <label className="block text-sm font-bold text-foreground mb-1" htmlFor="activity_name">Activity Description</label>
              <input 
                type="text" 
                id="activity_name" 
                value={desc}
                onChange={e => setDesc(e.target.value)}
                required
                placeholder="e.g. Started a compost bin" 
                className="w-full rounded-xl bg-card border border-border text-foreground focus:ring-2 focus:ring-primary focus:border-primary py-3 px-4"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-foreground mb-1" htmlFor="category">Category</label>
                <select 
                  id="category" 
                  value={cat}
                  onChange={e => setCat(e.target.value)}
                  className="w-full rounded-xl bg-card border border-border text-foreground focus:ring-2 focus:ring-primary py-3 px-4"
                >
                  <option value="transport">Transport</option>
                  <option value="energy">Energy</option>
                  <option value="food">Food</option>
                  <option value="waste">Waste & Recycling</option>
                  <option value="water">Water Conservation</option>
                  <option value="shopping">Shopping & Consumption</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-foreground mb-1" htmlFor="duration">Impact Level</label>
                <select 
                  id="duration" 
                  value={impact}
                  onChange={e => setImpact(e.target.value)}
                  className="w-full rounded-xl bg-card border border-border text-foreground focus:ring-2 focus:ring-primary py-3 px-4"
                >
                  <option value="small">Small (Everyday) - 1kg</option>
                  <option value="medium">Medium (Notable) - 5kg</option>
                  <option value="large">Large (Major Event) - 15kg</option>
                </select>
              </div>
            </div>
            <button 
              type="submit" 
              disabled={loadingAction === 'custom' || !desc}
              className="mt-4 px-6 py-3 bg-card text-primary border border-primary rounded-xl font-bold text-sm hover:bg-primary/10 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {loadingAction === 'custom' ? (
                 <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Plus className="w-5 h-5" />
              )}
              Add Custom Log
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
