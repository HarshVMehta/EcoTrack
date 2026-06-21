"use client";

import React, { useState } from 'react';
import { Target, Plus, Brain, Trophy, Bike, Flame, Sun, Trash2, Utensils, X, CheckCircle2, Star, Leaf, Award } from 'lucide-react';
import { createGoal, deleteGoal } from '@/actions/goal';
import { useRouter } from 'next/navigation';

interface EnrichedGoal {
  id: string;
  userId: string;
  title: string;
  targetValue: number;
  currentValue: number;
  deadline: Date | string | null;
  completed: boolean;
  createdAt: Date | string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  iconType: string;
  color: string;
  textColor: string;
  earned: boolean;
  points: number;
}

interface GoalsClientProps {
  goals: EnrichedGoal[];
  metrics: {
    streak: number;
    totalSaved: number;
  };
  achievementsData: {
    achievements: Achievement[];
    totalPoints: number;
    earnedCount: number;
    totalBadges: number;
  };
}

const GOAL_PRESETS = [
  { title: 'Reduce Monthly Emissions by 50kg', target: 50, icon: '🌍' },
  { title: 'Bike to Work 20 Times', target: 40, icon: '🚲' },
  { title: 'Plant-Based Meals for 30 Days', target: 75, icon: '🥗' },
  { title: 'Zero Waste Week', target: 15, icon: '♻️' },
  { title: 'Cut Energy Usage by 25%', target: 30, icon: '⚡' },
  { title: 'Save 200kg CO₂ This Quarter', target: 200, icon: '🌱' },
];

export function GoalsClient({ goals, metrics, achievementsData }: GoalsClientProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [targetValue, setTargetValue] = useState(50);
  const [deadline, setDeadline] = useState('');
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const { achievements, totalPoints, earnedCount, totalBadges } = achievementsData;

  const activeGoals = goals.filter((g: EnrichedGoal) => !g.completed);
  const completedGoals = goals.filter((g: EnrichedGoal) => g.completed);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !targetValue) return;
    setLoading(true);
    await createGoal(title, Number(targetValue), deadline || undefined);
    setIsModalOpen(false);
    setTitle('');
    setTargetValue(50);
    setDeadline('');
    setLoading(false);
    showNotification('🎯 Goal created!');
    router.refresh();
  };

  const handlePreset = (preset: typeof GOAL_PRESETS[0]) => {
    setTitle(preset.title);
    setTargetValue(preset.target);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this goal?")) {
      setDeleteLoading(id);
      await deleteGoal(id);
      setDeleteLoading(null);
      router.refresh();
    }
  };

  const getAchIcon = (type: string) => {
    switch (type) {
      case 'bike': return <Bike className="w-7 h-7" />;
      case 'flame': return <Flame className="w-7 h-7" />;
      case 'sun': return <Sun className="w-7 h-7" />;
      case 'utensils': return <Utensils className="w-7 h-7" />;
      case 'tree': return <Leaf className="w-7 h-7" />;
      case 'leaf': return <Leaf className="w-7 h-7" />;
      case 'target': return <Target className="w-7 h-7" />;
      default: return <Award className="w-7 h-7" />;
    }
  };

  return (
    <div className="space-y-10">
      {/* Achievement Notification Toast */}
      {notification && (
        <div role="status" aria-live="polite" className="fixed top-6 right-6 z-[100] bg-primary text-primary-foreground px-6 py-3 rounded-2xl shadow-lg font-bold flex items-center gap-2 animate-in slide-in-from-right-5 fade-in duration-300">
          {notification}
        </div>
      )}

      {/* Page Header & Overview */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <h1 className="font-heading text-4xl lg:text-5xl font-bold text-foreground mb-3 tracking-tight">Goals & Achievements</h1>
          <p className="font-sans text-lg text-muted-foreground max-w-2xl leading-relaxed">
            Set sustainability targets, earn badges, and track your environmental milestones.
          </p>
        </div>
        <div className="flex gap-4 flex-wrap">
          <div className="bg-primary/10 text-primary px-5 py-3 rounded-2xl shadow-sm flex items-center gap-3 border border-border">
            <Flame className="w-7 h-7 fill-current" />
            <div>
              <div className="text-xs font-semibold opacity-90">Streak</div>
              <div className="text-xl font-heading font-bold">{metrics.streak}d</div>
            </div>
          </div>
          <div className="bg-[#f8e0a8]/30 text-[#705c30] px-5 py-3 rounded-2xl shadow-sm flex items-center gap-3 border border-[#f8e0a8]">
            <Star className="w-7 h-7 fill-current" />
            <div>
              <div className="text-xs font-semibold opacity-90">Points</div>
              <div className="text-xl font-heading font-bold">{totalPoints}</div>
            </div>
          </div>
          <div className="bg-muted text-foreground px-5 py-3 rounded-2xl shadow-sm flex items-center gap-3 border border-border">
            <Trophy className="w-7 h-7 text-[#705c30]" />
            <div>
              <div className="text-xs font-semibold text-muted-foreground">Badges</div>
              <div className="text-xl font-heading font-bold">{earnedCount}/{totalBadges}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        
        {/* Left Column (Goals) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Active Goals */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-2xl font-bold text-foreground flex items-center gap-2">
                <Target className="text-primary w-6 h-6" />
                Active Targets
              </h2>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-primary text-primary-foreground font-bold text-sm px-4 py-2 rounded-xl hover:bg-primary/90 transition-colors flex items-center gap-1.5 shadow-sm">
                <Plus className="w-4 h-4" /> New Goal
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {activeGoals.length === 0 ? (
                <div className="col-span-1 md:col-span-2 bg-card p-12 rounded-2xl shadow-soft border border-border flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                    <Target className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-heading text-xl font-bold text-foreground mb-2">No Active Goals</h3>
                  <p className="text-muted-foreground mb-6 max-w-sm">Set a sustainability target to track your progress and earn rewards.</p>
                  <button 
                    onClick={() => setIsModalOpen(true)}
                    className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-bold shadow-sm hover:bg-primary/90 transition-colors">
                    Create a Goal
                  </button>
                </div>
              ) : (
                activeGoals.map((goal: EnrichedGoal) => {
                  const progress = Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100));
                  return (
                    <div key={goal.id} className="bg-card p-6 rounded-2xl shadow-soft border border-border hover:shadow-md transition-shadow relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110 pointer-events-none"></div>
                      <div className="flex items-start justify-between mb-3 relative z-10">
                        <div className="w-11 h-11 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                          <Target className="w-5 h-5" />
                        </div>
                        <div className="flex items-center gap-2">
                          {goal.deadline && (
                            <span className="bg-muted px-2.5 py-1 rounded-full text-[11px] font-bold text-muted-foreground border border-border">
                              {Math.max(0, Math.ceil((new Date(goal.deadline).getTime() - Date.now()) / 86400000))}d left
                            </span>
                          )}
                          <button 
                            onClick={() => handleDelete(goal.id)}
                            disabled={deleteLoading === goal.id}
                            className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
                            aria-label={`Delete goal: ${goal.title}`}
                          >
                            <Trash2 className="w-4 h-4" aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                      <h3 className="font-heading text-lg font-bold text-foreground mb-1 relative z-10">{goal.title}</h3>
                      <div className="space-y-2 relative z-10 mt-4">
                        <div className="flex justify-between text-sm font-semibold">
                          <span className="text-primary">{Math.round(goal.currentValue)}kg</span>
                          <span className="text-muted-foreground">{goal.targetValue}kg</span>
                        </div>
                        <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full transition-all duration-1000 ease-out" style={{ width: `${progress}%` }}></div>
                        </div>
                        <div className="text-xs text-right text-muted-foreground">{progress}%</div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Completed Goals */}
          {completedGoals.length > 0 && (
            <div>
              <h2 className="font-heading text-xl font-bold text-foreground flex items-center gap-2 mb-4">
                <CheckCircle2 className="text-primary w-5 h-5" />
                Completed ({completedGoals.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {completedGoals.map((goal: EnrichedGoal) => (
                  <div key={goal.id} className="bg-primary/5 p-5 rounded-2xl border border-primary/20 relative overflow-hidden">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-9 h-9 bg-primary/20 rounded-lg flex items-center justify-center text-primary">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <h3 className="font-bold text-foreground text-sm flex-1">{goal.title}</h3>
                      <button 
                        onClick={() => handleDelete(goal.id)}
                        className="p-1 text-muted-foreground hover:text-red-500 rounded transition-colors"
                        aria-label={`Delete goal: ${goal.title}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                    </div>
                    <div className="w-full h-2 bg-primary/20 rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full w-full"></div>
                    </div>
                    <div className="text-xs text-primary font-bold mt-1.5">{Math.round(goal.currentValue)}kg / {goal.targetValue}kg — Complete! 🎉</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Goal Presets */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Brain className="text-primary w-5 h-5" />
              <h2 className="font-heading text-xl font-bold text-foreground">Suggested Targets</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {GOAL_PRESETS.map((preset, i) => (
                <button 
                  key={i}
                  onClick={() => handlePreset(preset)}
                  className="bg-card p-4 rounded-xl border border-border hover:border-primary/40 hover:bg-muted/50 transition-all text-left group"
                >
                  <span className="text-2xl mb-2 block" aria-hidden="true">{preset.icon}</span>
                  <h4 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors leading-snug">{preset.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1">Target: {preset.target}kg CO₂</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (Achievements) */}
        <div className="space-y-6">
          {/* Badge Progress */}
          <div className="bg-card p-6 rounded-2xl shadow-soft border border-border">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-heading text-xl font-bold text-foreground flex items-center gap-2">
                <Trophy className="text-[#705c30] w-5 h-5" />
                Achievements
              </h2>
              <span className="text-xs font-bold text-muted-foreground bg-muted px-2.5 py-1 rounded-full">{earnedCount}/{totalBadges}</span>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden mb-6">
              <div className="h-full bg-[#705c30] rounded-full transition-all" style={{ width: `${(earnedCount / totalBadges) * 100}%` }}></div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {achievements.map((ach: Achievement) => (
                <div 
                  key={ach.id} 
                  className={`flex flex-col items-center text-center group cursor-help relative transition-all duration-300 ${ach.earned ? '' : 'opacity-35 grayscale'}`}
                  title={ach.description}
                >
                  <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${ach.earned ? ach.color : 'from-muted to-muted'} flex items-center justify-center shadow-sm mb-1.5 transform group-hover:scale-110 transition-transform ${ach.earned ? ach.textColor : 'text-muted-foreground'}`}>
                    {getAchIcon(ach.iconType)}
                  </div>
                  <span className="text-[10px] font-bold text-foreground leading-tight">{ach.title}</span>
                  {ach.earned && (
                    <span className="text-[9px] text-primary font-bold mt-0.5">+{ach.points}pts</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Milestones */}
          <div className="bg-card p-6 rounded-2xl shadow-soft border border-border">
            <h2 className="font-heading text-lg font-bold text-foreground mb-4">Carbon Milestones</h2>
            <div className="space-y-3">
              {[
                { label: '10kg saved', target: 10, icon: '🌱' },
                { label: '100kg saved', target: 100, icon: '🌿' },
                { label: '500kg saved', target: 500, icon: '🌳' },
                { label: '1 ton saved', target: 1000, icon: '🏔️' },
              ].map((m, i) => {
                const progress = Math.min(100, Math.round((metrics.totalSaved / m.target) * 100));
                const reached = metrics.totalSaved >= m.target;
                return (
                  <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${reached ? 'border-primary/30 bg-primary/5' : 'border-border'}`}>
                    <span className="text-xl">{m.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <span className={`text-sm font-bold ${reached ? 'text-primary' : 'text-foreground'}`}>{m.label}</span>
                        <span className="text-xs text-muted-foreground">{Math.round(Math.min(metrics.totalSaved, m.target))}/{m.target}kg</span>
                      </div>
                      <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all ${reached ? 'bg-primary' : 'bg-muted-foreground/30'}`} style={{ width: `${progress}%` }}></div>
                      </div>
                    </div>
                    {reached && <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Add Goal Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4" onClick={() => setIsModalOpen(false)}>
          <div className="bg-card border border-border rounded-3xl shadow-xl w-full max-w-md p-6 relative overflow-hidden" onClick={e => e.stopPropagation()}>
            <button 
              onClick={() => setIsModalOpen(false)}
              aria-label="Close modal"
              className="absolute top-4 right-4 p-2 text-muted-foreground hover:bg-muted rounded-full transition-colors"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
            <h2 className="font-heading text-2xl font-bold text-foreground mb-6">Create New Target</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-foreground mb-1" htmlFor="goal_title">Goal Title</label>
                <input 
                  type="text" 
                  id="goal_title"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g., Bike to work 10 times"
                  className="w-full rounded-xl bg-muted border border-transparent text-foreground focus:ring-2 focus:ring-primary focus:bg-card focus:border-primary py-3 px-4 transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-foreground mb-1" htmlFor="target_reduction">Target Reduction (kg CO₂)</label>
                <input 
                  type="number" 
                  id="target_reduction"
                  value={targetValue}
                  onChange={e => setTargetValue(Number(e.target.value))}
                  min="1"
                  className="w-full rounded-xl bg-muted border border-transparent text-foreground focus:ring-2 focus:ring-primary focus:bg-card focus:border-primary py-3 px-4 transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-foreground mb-1" htmlFor="goal_deadline">Deadline (Optional)</label>
                <input 
                  type="date" 
                  id="goal_deadline"
                  value={deadline}
                  onChange={e => setDeadline(e.target.value)}
                  className="w-full rounded-xl bg-muted border border-transparent text-foreground focus:ring-2 focus:ring-primary focus:bg-card focus:border-primary py-3 px-4 transition-all"
                />
              </div>
              <div className="pt-4">
                <button 
                  type="submit"
                  disabled={loading || !title}
                  className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? 'Creating...' : <><Plus className="w-5 h-5" /> Save Target</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
