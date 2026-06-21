"use client";

import React, { useState } from 'react';
import { Clock, Droplets, Trophy, Star, Heart, MessageCircle } from 'lucide-react';
import { joinChallenge } from '@/actions/challenge';

interface ChallengeType {
  id: string;
  title: string;
  description: string;
  targetMetric: number;
  rewardPoints: number;
  endDate: Date;
  totalParticipants: number;
  userProgress: number;
  isParticipating: boolean;
}

interface ChallengesClientProps {
  challenges: ChallengeType[];
  leaderboard: { rank: number; name: string; points: number; isYou: boolean }[];
}

export function ChallengesClient({ challenges, leaderboard }: ChallengesClientProps) {
  const [loadingIds, setLoadingIds] = useState<Record<string, boolean>>({});

  const handleJoin = async (id: string) => {
    setLoadingIds(prev => ({ ...prev, [id]: true }));
    try {
      await joinChallenge(id);
    } catch (e) {
      console.error(e);
    }
    setLoadingIds(prev => ({ ...prev, [id]: false }));
  };

  const featured = challenges[0];
  const activeChallenges = challenges.slice(1);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      <section className="mb-12">
        <h2 className="text-4xl md:text-5xl font-heading font-bold text-foreground mb-4">Community Challenges</h2>
        <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
          Join forces with the community. Take on collective goals, track your progress, and celebrate sustainable living together.
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[minmax(180px,_auto)]">
        
        {/* Featured Challenge */}
        {featured && (
          <div className="md:col-span-8 md:row-span-2 rounded-2xl overflow-hidden relative group bg-card">
            <div 
              className="absolute inset-0 bg-cover bg-center w-full h-full opacity-80 group-hover:opacity-100 transition-opacity duration-500" 
              style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCX-W5HEFYwxGyjD-mu4qOVcbEBMZcVNS8ZMNY6R3lR-X53_dZkCF55pqbXgkOVrc8p2yghTmlp_JWqRfHPXXMBRAR2sudRALjU0TxGEXElpRDmdETpIYOiXHyW4Bmy9AKD3m02NCdDW-kbULk1zjDzCDSOQbakFtMK6rOUzDNmgMC6sMDWoop7-vnsbEZI1MC8YMb8mIY3yS1N8Yb-bEL2sWhILs1VvNiPfAVsdb7g3WL5WpDFFk9WbCQr3WblgWr2jh0LEz0LOPp6')" }}
            ></div>
            <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/40 to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 p-8 flex flex-col justify-end h-full z-10">
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-[#705c30] text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Featured</span>
                <span className="bg-black/40 text-white backdrop-blur-md text-xs px-3 py-1 rounded-full flex items-center gap-1 font-bold">
                  <Clock className="w-4 h-4" /> {Math.max(1, Math.ceil((new Date(featured.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))} days left
                </span>
              </div>
              <h3 className="text-3xl md:text-4xl font-heading font-bold text-white mb-2">{featured.title}</h3>
              <p className="text-white/80 mb-6 max-w-lg line-clamp-2">{featured.description}</p>
              <div className="flex items-center justify-between mt-auto">
                <div className="flex items-center text-white/80 text-sm font-bold">
                  {featured.totalParticipants} participating
                </div>
                {featured.isParticipating ? (
                  <div className="bg-primary/50 text-white px-6 py-3 rounded-xl font-bold cursor-default">Joined</div>
                ) : (
                  <button 
                    onClick={() => handleJoin(featured.id)}
                    disabled={loadingIds[featured.id]}
                    className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold hover:bg-primary/90 transition-colors"
                  >
                    {loadingIds[featured.id] ? 'Joining...' : 'Join Now'}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Other Active Challenges */}
        {activeChallenges.map(c => (
          <div key={c.id} className="md:col-span-4 rounded-2xl bg-card p-6 flex flex-col border border-border shadow-soft">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                <Droplets className="w-6 h-6 fill-current" />
              </div>
              {c.isParticipating && <span className="text-xs font-bold text-[#705c30] bg-[#f8e0a8] px-2 py-1 rounded-md">Active</span>}
            </div>
            <h4 className="font-heading font-bold text-xl text-foreground mb-2">{c.title}</h4>
            <p className="text-sm text-muted-foreground mb-6 flex-1">{c.description}</p>
            
            {c.isParticipating ? (
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-muted-foreground font-bold">
                  <span>Progress</span>
                  <span className="text-primary">{Math.round((c.userProgress / c.targetMetric) * 100)}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: `${Math.min(100, (c.userProgress / c.targetMetric) * 100)}%` }}></div>
                </div>
                <p className="text-xs text-muted-foreground text-right mt-1">{c.userProgress}/{c.targetMetric} completed</p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-muted-foreground font-bold">
                  <span>Reward</span>
                  <span className="text-foreground">{c.rewardPoints} pts</span>
                </div>
                <button 
                  onClick={() => handleJoin(c.id)}
                  disabled={loadingIds[c.id]}
                  className="w-full py-2 border border-primary text-primary rounded-xl font-bold hover:bg-primary/5 transition-colors mt-2 text-sm"
                >
                  {loadingIds[c.id] ? '...' : 'Opt In'}
                </button>
              </div>
            )}
          </div>
        ))}

        {/* Leaderboard */}
        <div className="md:col-span-4 md:row-span-2 rounded-2xl bg-card p-6 border border-border shadow-soft flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-heading font-bold text-xl text-foreground flex items-center gap-2">
              <Trophy className="text-[#705c30] w-6 h-6" /> Leaderboard
            </h3>
          </div>
          <div className="flex-1 space-y-4">
            {leaderboard.slice(0, 5).map((l, idx) => (
              <div key={idx} className={`flex items-center gap-4 p-3 rounded-xl ${l.isYou ? 'bg-[#f8e0a8]/30 border border-[#705c30]/10' : 'hover:bg-muted transition-colors'}`}>
                <div className={`w-6 text-center font-heading font-bold ${l.isYou ? 'text-[#705c30]' : 'text-muted-foreground'}`}>{l.rank}</div>
                <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm">
                  {l.name[0]}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-sm text-foreground">{l.name}</p>
                  <p className="text-xs text-muted-foreground">{l.points.toFixed(0)} pts</p>
                </div>
                {l.rank === 1 && <Star className="text-[#705c30] w-5 h-5 fill-current" />}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
