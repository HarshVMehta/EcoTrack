"use client";

import React, { useState, useTransition } from 'react';
import {
  Sparkles,
  Brain,
  TrendingUp,
  Plus,
  RefreshCw,
  Target,
  Zap,
  Car,
  Utensils,
  Trash2,
  ShoppingBag,
  Droplet,
  Info
} from 'lucide-react';
import { getAIInsights } from '@/actions/insights';
import { createGoal } from '@/actions/goal';
import { useRouter } from 'next/navigation';

interface Recommendation {
  title: string;
  description: string;
  impact: 'High' | 'Medium' | 'Low';
  category: 'transport' | 'energy' | 'food' | 'waste' | 'shopping' | 'water';
  potentialSaving: number;
}

interface GoalSuggestion {
  title: string;
  targetValue: number;
  reasoning: string;
}

interface InsightsData {
  summary: string;
  ecoScore: number;
  potentialSavings: number;
  recommendations: Recommendation[];
  forecast: {
    currentMonthly: number;
    projectedMonthly: number;
    reductionPercent: number;
  };
  goalSuggestions: GoalSuggestion[];
  behavioralInsights: string[];
}

interface InsightsClientProps {
  initialInsights: InsightsData;
  score: number;
  metrics: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export function InsightsClient({ initialInsights, score, metrics }: InsightsClientProps) {
  const router = useRouter();
  const [insights, setInsights] = useState<InsightsData>(initialInsights);
  const [isPending, startTransition] = useTransition();
  const [notification, setNotification] = useState<string | null>(null);
  const [adoptingGoals, setAdoptingGoals] = useState<Record<number, boolean>>({});

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleRefresh = () => {
    startTransition(async () => {
      const res = await getAIInsights(true);
      if (res.success && res.data) {
        setInsights(res.data);
        showNotification('⚡ AI Insights regenerated successfully!');
      } else {
        showNotification('❌ Failed to regenerate insights. Please try again.');
      }
    });
  };

  const handleAdoptGoal = async (suggestion: GoalSuggestion, index: number) => {
    if (adoptingGoals[index]) return;
    setAdoptingGoals(prev => ({ ...prev, [index]: true }));

    try {
      const res = await createGoal(suggestion.title, suggestion.targetValue);
      if (res.success) {
        showNotification(`🎯 Adopted goal: "${suggestion.title}"`);
        router.refresh();
      } else {
        showNotification('❌ Failed to adopt goal');
      }
    } catch (err) {
      console.error(err);
      showNotification('❌ Error adopting goal');
    } finally {
      setAdoptingGoals(prev => ({ ...prev, [index]: false }));
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'transport':
      case 'transportation':
        return <Car className="w-5 h-5" />;
      case 'energy':
        return <Zap className="w-5 h-5" />;
      case 'food':
      case 'diet':
        return <Utensils className="w-5 h-5" />;
      case 'waste':
      case 'recycling':
        return <Trash2 className="w-5 h-5" />;
      case 'shopping':
      case 'consumption':
        return <ShoppingBag className="w-5 h-5" />;
      case 'water':
        return <Droplet className="w-5 h-5" />;
      default:
        return <Brain className="w-5 h-5" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'transport':
      case 'transportation':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'energy':
        return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'food':
      case 'diet':
        return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'waste':
      case 'recycling':
        return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'shopping':
      case 'consumption':
        return 'bg-pink-500/10 text-pink-500 border-pink-500/20';
      case 'water':
        return 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20';
      default:
        return 'bg-primary/10 text-primary border-primary/20';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact.toLowerCase()) {
      case 'high':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'medium':
        return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'low':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      default:
        return 'bg-muted text-muted-foreground border-transparent';
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-10 lg:px-12 pb-24 space-y-8">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-6 right-6 z-[100] bg-primary text-primary-foreground px-6 py-3 rounded-2xl shadow-lg font-bold flex items-center gap-2 animate-in slide-in-from-right-5 fade-in duration-300">
          {notification}
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="font-heading text-4xl lg:text-5xl font-bold text-foreground mb-3 tracking-tight">AI Insights</h1>
          <p className="font-sans text-lg text-muted-foreground max-w-2xl leading-relaxed">
            Your predictive sustainability analysis powered by AI. Uncover deep patterns in your lifestyle.
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isPending}
          className="bg-primary text-primary-foreground font-bold text-sm px-5 py-3 rounded-xl hover:bg-primary/90 transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50 self-start md:self-auto shrink-0"
        >
          {isPending ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          {isPending ? 'Regenerating...' : 'Regenerate Insights'}
        </button>
      </div>

      {/* Top Section: Score, Summary & Forecast */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">

        {/* Eco Score Circular Gauge */}
        <div className="bg-card rounded-[2rem] p-8 shadow-soft border border-border flex flex-col items-center justify-center relative overflow-hidden group">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-colors duration-700"></div>
          <h2 className="font-heading text-xl font-bold text-foreground mb-6 self-start w-full z-10 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" /> Eco Score
          </h2>

          <div className="relative w-44 h-44 flex items-center justify-center z-10">
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle className="text-muted" cx="50" cy="50" fill="none" r="42" stroke="currentColor" strokeWidth="8"></circle>
              <circle className="text-primary transition-all duration-1000 ease-out" cx="50" cy="50" fill="none" r="42" stroke="currentColor" strokeDasharray="264" strokeDashoffset={264 - (264 * (insights.ecoScore || score)) / 100} strokeWidth="8" strokeLinecap="round"></circle>
            </svg>
            <div className="flex flex-col items-center">
              <span className="font-heading text-5xl font-bold text-primary">{insights.ecoScore || score}</span>
              <span className="text-muted-foreground text-sm mt-1">/ 100</span>
            </div>
          </div>

          <div className="mt-6 flex flex-col items-center gap-1 z-10 text-center">
            <span className="text-sm font-semibold text-muted-foreground">Potential Monthly Savings</span>
            <span className="text-2xl font-heading font-bold text-primary">-{insights.potentialSavings || 0} kg CO₂</span>
          </div>
        </div>

        {/* AI Summary Card */}
        <div className="lg:col-span-2 bg-card rounded-[2rem] p-8 shadow-soft border border-border flex flex-col relative overflow-hidden group">
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl"></div>
          <div className="flex items-center justify-between mb-6 z-10">
            <h2 className="font-heading text-xl font-bold text-foreground flex items-center gap-2">
              <Brain className="w-6 h-6 text-primary" /> AI Analysis
            </h2>
            <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold border border-primary/20">
              Personalized
            </span>
          </div>
          <div className="flex-1 flex flex-col justify-center z-10">
            <blockquote className="border-l-4 border-primary pl-4 py-1 my-2">
              <p className="font-sans text-lg text-foreground italic leading-relaxed">
                &ldquo;{insights.summary || 'Analyze your carbon metrics and activities with AI to get deep, actionable advice on lowering your environmental impact.'}&rdquo;
              </p>
            </blockquote>
          </div>
          <div className="mt-6 pt-4 border-t border-border flex items-center gap-2 text-xs text-muted-foreground z-10">
            <Info className="w-4 h-4 text-primary" />
            Insights are dynamically updated based on your actual carbon footprint data.
          </div>
        </div>

      </div>

      {/* Middle Section: Forecast & Behavioral Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">

        {/* Forecast Card */}
        <div className="lg:col-span-2 bg-card rounded-[2rem] p-8 shadow-soft border border-border flex flex-col justify-between">
          <div>
            <h2 className="font-heading text-xl font-bold text-foreground mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" /> Emission Forecast
            </h2>

            <div className="space-y-6">
              {/* Current Forecast */}
              <div>
                <div className="flex justify-between items-end mb-2">
                  <span className="text-sm font-bold text-foreground">Current Estimated Monthly CO₂</span>
                  <span className="font-heading text-lg font-bold text-foreground">{insights.forecast?.currentMonthly || Math.round(metrics.totalEmissions)} kg</span>
                </div>
                <div className="w-full h-4 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: '100%' }}></div>
                </div>
              </div>

              {/* Projected Forecast */}
              <div>
                <div className="flex justify-between items-end mb-2">
                  <span className="text-sm font-bold text-primary flex items-center gap-1">
                    Projected CO₂ (With AI Recommendations)
                  </span>
                  <span className="font-heading text-lg font-bold text-primary">
                    {insights.forecast?.projectedMonthly || Math.round(metrics.totalEmissions * 0.75)} kg
                  </span>
                </div>
                <div className="w-full h-4 bg-muted rounded-full overflow-hidden relative">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-1000"
                    style={{ width: `${100 - (insights.forecast?.reductionPercent || 25)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 bg-primary/10 border border-primary/20 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary font-bold">
                -{insights.forecast?.reductionPercent || 25}%
              </div>
              <div>
                <div className="text-sm font-bold text-foreground">Potential Carbon Reduction</div>
                <div className="text-xs text-muted-foreground">If all AI recommendations are successfully integrated</div>
              </div>
            </div>
          </div>
        </div>

        {/* Behavioral Insights */}
        <div className="bg-card rounded-[2rem] p-8 shadow-soft border border-border flex flex-col justify-between">
          <div>
            <h2 className="font-heading text-xl font-bold text-foreground mb-6 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" /> Behavioral Patterns
            </h2>

            <div className="space-y-4">
              {insights.behavioralInsights && insights.behavioralInsights.map((insight, idx) => (
                <div key={idx} className="flex gap-3 items-start p-3 rounded-xl border border-border bg-muted/30">
                  <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 text-xs font-bold">
                    {idx + 1}
                  </div>
                  <p className="text-sm text-foreground leading-relaxed">{insight}</p>
                </div>
              ))}
              {(!insights.behavioralInsights || insights.behavioralInsights.length === 0) && (
                <p className="text-sm text-muted-foreground text-center py-6">
                  No patterns identified yet. Log more transport, energy, and food activities.
                </p>
              )}
            </div>
          </div>

          <div className="mt-6 text-xs text-muted-foreground flex items-center gap-1.5 justify-center">
            <Info className="w-3.5 h-3.5 text-primary" />
            Analyzing daily, weekly, and category logs.
          </div>
        </div>

      </div>

      {/* Bottom Section: Actionable Recommendations & Suggested Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">

        {/* Recommendations */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="font-heading text-2xl font-bold text-foreground flex items-center gap-2">
            <Sparkles className="text-primary w-6 h-6" />
            Actionable Recommendations
          </h2>

          <div className="space-y-4">
            {insights.recommendations && insights.recommendations.map((rec, idx) => (
              <div key={idx} className="bg-card p-6 rounded-2xl shadow-soft border border-border flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-primary/45 transition-all">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${getCategoryColor(rec.category)}`}>
                    {getCategoryIcon(rec.category)}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <h3 className="font-heading text-base font-bold text-foreground leading-tight">
                        {rec.title}
                      </h3>
                      <span className={`text-[10px] font-extrabold tracking-wider uppercase px-2 py-0.5 rounded-full border ${getImpactColor(rec.impact)}`}>
                        {rec.impact} Impact
                      </span>
                      <span className={`text-[10px] font-extrabold tracking-wider uppercase px-2 py-0.5 rounded-full border ${getCategoryColor(rec.category)}`}>
                        {rec.category}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground max-w-xl">
                      {rec.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-t-0 pt-4 md:pt-0 border-border">
                  <div className="text-left md:text-right shrink-0">
                    <div className="text-xs text-muted-foreground font-semibold">Potential Saving</div>
                    <div className="text-lg font-heading font-bold text-primary">-{rec.potentialSaving} kg CO₂</div>
                  </div>
                  <button
                    onClick={() => handleAdoptGoal({ title: rec.title, targetValue: rec.potentialSaving, reasoning: rec.description }, idx + 100)}
                    disabled={adoptingGoals[idx + 100]}
                    className="bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground border border-primary/20 text-xs font-bold py-2.5 px-4 rounded-xl transition-all flex items-center gap-1.5"
                  >
                    {adoptingGoals[idx + 100] ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Plus className="w-3.5 h-3.5" />
                    )}
                    Adopt Goal
                  </button>
                </div>
              </div>
            ))}
            {(!insights.recommendations || insights.recommendations.length === 0) && (
              <div className="bg-card p-8 rounded-2xl border border-border text-center text-muted-foreground">
                No recommendations available. Try adding some activities to receive suggestions.
              </div>
            )}
          </div>
        </div>

        {/* Suggested Goals */}
        <div className="space-y-6">
          <h2 className="font-heading text-2xl font-bold text-foreground flex items-center gap-2">
            <Target className="text-primary w-6 h-6" />
            AI Goal Suggestions
          </h2>

          <div className="space-y-4">
            {insights.goalSuggestions && insights.goalSuggestions.map((sug, idx) => (
              <div key={idx} className="bg-card p-6 rounded-2xl shadow-soft border border-border flex flex-col justify-between gap-4">
                <div>
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <h3 className="font-heading text-base font-bold text-foreground leading-snug">
                      {sug.title}
                    </h3>
                    <span className="bg-primary/15 text-primary text-xs font-bold py-1 px-2.5 rounded-lg border border-primary/20 shrink-0">
                      {sug.targetValue} kg
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {sug.reasoning}
                  </p>
                </div>

                <button
                  onClick={() => handleAdoptGoal(sug, idx)}
                  disabled={adoptingGoals[idx]}
                  className="w-full bg-primary text-primary-foreground text-xs font-bold py-3 px-4 rounded-xl hover:bg-primary/90 transition-colors flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
                >
                  {adoptingGoals[idx] ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Plus className="w-3.5 h-3.5" />
                  )}
                  {adoptingGoals[idx] ? 'Adopting...' : 'Adopt as Target'}
                </button>
              </div>
            ))}
            {(!insights.goalSuggestions || insights.goalSuggestions.length === 0) && (
              <div className="bg-card p-8 rounded-2xl border border-border text-center text-muted-foreground text-sm">
                No goal suggestions yet.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
