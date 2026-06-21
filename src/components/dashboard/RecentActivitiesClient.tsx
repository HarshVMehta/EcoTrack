"use client";

import React from 'react';
import { Leaf, Flame, Utensils, Bike, ShoppingBag, Droplets, Car, Zap, Activity } from 'lucide-react';

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

interface RecentActivitiesProps {
  activities: {
    id: string;
    type: string;
    carbonValue: number;
    isReduction: boolean;
    date: Date;
  }[];
}

export function RecentActivitiesClient({ activities }: RecentActivitiesProps) {
  if (activities.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
        <Activity className="w-8 h-8 text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">No recent activities found.</p>
      </div>
    );
  }

  const getIcon = (type: string, isReduction: boolean) => {
    if (isReduction) return <Leaf className="w-5 h-5" />;
    
    switch (type.toLowerCase()) {
      case 'transport': return <Car className="w-5 h-5" />;
      case 'energy': return <Zap className="w-5 h-5" />;
      case 'food': return <Utensils className="w-5 h-5" />;
      case 'shopping': return <ShoppingBag className="w-5 h-5" />;
      case 'waste': return <Flame className="w-5 h-5" />;
      case 'water': return <Droplets className="w-5 h-5" />;
      default: return <Activity className="w-5 h-5" />;
    }
  };

  const getColorClass = (type: string, isReduction: boolean) => {
    if (isReduction) return 'bg-primary/20 text-primary';
    switch (type.toLowerCase()) {
      case 'transport': return 'bg-muted text-muted-foreground';
      case 'energy': return 'bg-[#f8e0a8]/50 text-[#705c30]';
      case 'food': return 'bg-[#c8e8d0] text-[#002110]';
      default: return 'bg-muted text-foreground';
    }
  };

  return (
    <div className="flex-1 space-y-4 overflow-y-auto pr-2">
      {activities.map((activity) => (
        <div key={activity.id} className="group flex items-start gap-4 p-3 rounded-xl hover:bg-muted/50 transition-colors border border-transparent hover:border-border/50">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 mt-1 ${getColorClass(activity.type, activity.isReduction)}`}>
            {getIcon(activity.type, activity.isReduction)}
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-sm text-foreground capitalize group-hover:text-primary transition-colors">
              {activity.isReduction ? 'Saved Carbon' : `${activity.type} logged`}
            </h4>
            <p className="text-xs text-muted-foreground mt-1">
              {formatRelativeTime(new Date(activity.date))}
            </p>
          </div>
          <div className="text-right">
            <span className={`text-sm font-bold ${activity.isReduction ? 'text-primary' : 'text-foreground'}`}>
              {activity.isReduction ? '-' : '+'}{activity.carbonValue} kg
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
