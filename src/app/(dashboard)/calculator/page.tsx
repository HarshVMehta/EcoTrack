"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Car, Home, Utensils, Trash2, ArrowRight, ArrowLeft, Zap, BatteryCharging, ShoppingCart, Droplets, Loader2, CheckCircle2 } from 'lucide-react';
import { submitCalculator } from '@/actions/calculator';
import type { CalculatorAnswers } from '@/lib/calculator';

export default function CarbonCalculatorPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [answers, setAnswers] = useState<CalculatorAnswers>({
    transport: { vehicleType: 'gas', weeklyMileage: 150 },
    energy: { homeSize: 'medium', energySource: 'mixed' },
    food: { dietType: 'average' },
    waste: { recycleHabit: 'sometimes' },
    shopping: { frequency: 'average' },
    water: { showerDuration: 'average' }
  });

  const steps = [
    { id: 1, label: 'Transport', icon: Car },
    { id: 2, label: 'Energy', icon: Home },
    { id: 3, label: 'Food', icon: Utensils },
    { id: 4, label: 'Waste', icon: Trash2 },
    { id: 5, label: 'Shopping', icon: ShoppingCart },
    { id: 6, label: 'Water', icon: Droplets },
  ];

  const updateAnswer = (category: keyof CalculatorAnswers, field: string, value: any) => {
    setAnswers(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }));
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      const result = await submitCalculator(answers);
      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      } else {
        alert("Failed to save results: " + result.error);
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 w-full max-w-5xl mx-auto">
        <CheckCircle2 className="w-24 h-24 text-primary animate-in zoom-in mb-6" />
        <h2 className="text-3xl font-heading font-bold text-foreground mb-4">Calculation Complete!</h2>
        <p className="text-muted-foreground text-lg mb-8 text-center max-w-md">Your carbon footprint has been estimated and saved to your profile. Redirecting to your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-start pt-8 pb-24 md:pb-8 px-4 sm:px-6 lg:px-8 w-full max-w-5xl mx-auto overflow-y-auto">
      {/* Header & Progress */}
      <div className="w-full max-w-2xl mb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-heading font-bold text-primary mb-2">Carbon Calculator</h1>
        <p className="text-muted-foreground text-lg leading-relaxed mb-8">Let's estimate your environmental impact. Small steps lead to big changes.</p>
        
        {/* Progress Bar */}
        <div className="flex items-center justify-between relative px-2">
          {/* Line background */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-muted rounded-full z-0"></div>
          {/* Active Line */}
          <div 
            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary rounded-full z-0 transition-all duration-500 ease-in-out" 
            style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
          ></div>
          
          {/* Steps */}
          {steps.map((s) => {
            const isActive = step >= s.id;
            const Icon = s.icon;
            return (
              <div 
                key={s.id}
                className="relative z-10 flex flex-col items-center gap-2 group cursor-pointer"
                onClick={() => setStep(s.id)}
              >
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shadow-sm transition-transform group-hover:scale-110 ${isActive ? 'bg-primary text-primary-foreground' : 'bg-card border border-border text-muted-foreground'}`}>
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <span className={`text-[10px] sm:text-xs font-bold ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>{s.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Calculator Card Container */}
      <div className="w-full max-w-2xl bg-card rounded-[2rem] p-6 md:p-10 shadow-soft border border-border/50 relative overflow-hidden min-h-[400px] flex flex-col">
        
        {/* STEP 1: TRANSPORTATION */}
        {step === 1 && (
          <div className="flex-1 flex flex-col animate-in slide-in-from-right-4 duration-300">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-primary/20 rounded-2xl text-primary"><Car className="w-8 h-8" /></div>
              <div>
                <h2 className="font-heading text-2xl font-bold text-foreground">Transportation</h2>
                <p className="text-muted-foreground text-sm mt-1">How do you usually get around?</p>
              </div>
            </div>
            
            <div className="space-y-6 flex-1">
              <div>
                <label className="block text-sm font-bold text-foreground mb-3">Primary Vehicle Type</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { id: 'gas', label: 'Gasoline' },
                    { id: 'hybrid', label: 'Hybrid' },
                    { id: 'ev', label: 'Electric' },
                    { id: 'none', label: 'None/Transit' }
                  ].map(type => (
                    <label key={type.id} className="cursor-pointer relative">
                      <input type="radio" name="car_type" value={type.id} className="peer sr-only" checked={answers.transport.vehicleType === type.id} onChange={(e) => updateAnswer('transport', 'vehicleType', e.target.value)} />
                      <div className="p-3 rounded-xl border border-border bg-background text-center hover:bg-muted peer-checked:border-primary peer-checked:bg-primary/5 peer-checked:ring-1 peer-checked:ring-primary transition-all">
                        <span className="font-bold text-sm text-foreground">{type.label}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-foreground mb-3">Average Weekly Mileage</label>
                <div className="flex items-center gap-4">
                  <input type="range" min="0" max="1000" value={answers.transport.weeklyMileage} onChange={(e) => updateAnswer('transport', 'weeklyMileage', parseInt(e.target.value))} className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary" />
                  <span className="font-bold text-primary w-24 text-right">{answers.transport.weeklyMileage} miles</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: HOME ENERGY */}
        {step === 2 && (
          <div className="flex-1 flex flex-col animate-in slide-in-from-right-4 duration-300">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-tertiary/20 rounded-2xl text-tertiary"><Home className="w-8 h-8" /></div>
              <div>
                <h2 className="font-heading text-2xl font-bold text-foreground">Home Energy</h2>
                <p className="text-muted-foreground text-sm mt-1">Tell us about your home power.</p>
              </div>
            </div>
            <div className="space-y-6 flex-1">
              <div>
                <label className="block text-sm font-bold text-foreground mb-3">Home Size</label>
                <div className="grid grid-cols-3 gap-3">
                  {['small', 'medium', 'large'].map(size => (
                    <label key={size} className="cursor-pointer relative">
                      <input type="radio" name="home_size" value={size} className="peer sr-only" checked={answers.energy.homeSize === size} onChange={(e) => updateAnswer('energy', 'homeSize', e.target.value)} />
                      <div className="p-3 rounded-xl border border-border bg-background text-center hover:bg-muted peer-checked:border-primary peer-checked:bg-primary/5 peer-checked:ring-1 peer-checked:ring-primary transition-all capitalize">
                        <span className="font-bold text-sm text-foreground">{size}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-foreground mb-3">Energy Source</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'renewable', label: '100% Renewable' },
                    { id: 'mixed', label: 'Mixed Grid' },
                    { id: 'fossil', label: 'Mostly Fossil Fuels' }
                  ].map(source => (
                    <label key={source.id} className="cursor-pointer relative">
                      <input type="radio" name="energy_source" value={source.id} className="peer sr-only" checked={answers.energy.energySource === source.id} onChange={(e) => updateAnswer('energy', 'energySource', e.target.value)} />
                      <div className="p-3 rounded-xl border border-border bg-background text-center hover:bg-muted peer-checked:border-primary peer-checked:bg-primary/5 peer-checked:ring-1 peer-checked:ring-primary transition-all">
                        <span className="font-bold text-sm text-foreground">{source.label}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: FOOD & DIET */}
        {step === 3 && (
          <div className="flex-1 flex flex-col animate-in slide-in-from-right-4 duration-300">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-secondary/20 rounded-2xl text-secondary-foreground"><Utensils className="w-8 h-8" /></div>
              <div>
                <h2 className="font-heading text-2xl font-bold text-foreground">Food & Diet</h2>
                <p className="text-muted-foreground text-sm mt-1">What does your typical diet look like?</p>
              </div>
            </div>
            <div className="space-y-6 flex-1">
              <div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { id: 'meat-heavy', label: 'Meat Heavy (Daily)' },
                    { id: 'average', label: 'Average (Mixed)' },
                    { id: 'vegetarian', label: 'Vegetarian' },
                    { id: 'vegan', label: 'Vegan / Plant-Based' }
                  ].map(diet => (
                    <label key={diet.id} className="cursor-pointer relative">
                      <input type="radio" name="diet" value={diet.id} className="peer sr-only" checked={answers.food.dietType === diet.id} onChange={(e) => updateAnswer('food', 'dietType', e.target.value)} />
                      <div className="p-4 rounded-xl border border-border bg-background text-center hover:bg-muted peer-checked:border-primary peer-checked:bg-primary/5 peer-checked:ring-1 peer-checked:ring-primary transition-all">
                        <span className="font-bold text-sm text-foreground">{diet.label}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: WASTE */}
        {step === 4 && (
          <div className="flex-1 flex flex-col animate-in slide-in-from-right-4 duration-300">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-primary/20 rounded-2xl text-primary"><Trash2 className="w-8 h-8" /></div>
              <div>
                <h2 className="font-heading text-2xl font-bold text-foreground">Waste & Recycling</h2>
                <p className="text-muted-foreground text-sm mt-1">How often do you recycle or compost?</p>
              </div>
            </div>
            <div className="space-y-6 flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: 'rarely', label: 'Rarely' },
                  { id: 'sometimes', label: 'Sometimes' },
                  { id: 'always', label: 'Always' }
                ].map(habit => (
                  <label key={habit.id} className="cursor-pointer relative">
                    <input type="radio" name="waste" value={habit.id} className="peer sr-only" checked={answers.waste.recycleHabit === habit.id} onChange={(e) => updateAnswer('waste', 'recycleHabit', e.target.value)} />
                    <div className="p-4 rounded-xl border border-border bg-background text-center hover:bg-muted peer-checked:border-primary peer-checked:bg-primary/5 peer-checked:ring-1 peer-checked:ring-primary transition-all">
                      <span className="font-bold text-sm text-foreground">{habit.label}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: SHOPPING */}
        {step === 5 && (
          <div className="flex-1 flex flex-col animate-in slide-in-from-right-4 duration-300">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-tertiary/20 rounded-2xl text-tertiary"><ShoppingCart className="w-8 h-8" /></div>
              <div>
                <h2 className="font-heading text-2xl font-bold text-foreground">Shopping</h2>
                <p className="text-muted-foreground text-sm mt-1">How often do you buy new clothing or electronics?</p>
              </div>
            </div>
            <div className="space-y-6 flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: 'rarely', label: 'Rarely (Mostly Secondhand)' },
                  { id: 'average', label: 'Average (When Needed)' },
                  { id: 'frequently', label: 'Frequently (Fast Fashion)' }
                ].map(freq => (
                  <label key={freq.id} className="cursor-pointer relative">
                    <input type="radio" name="shopping" value={freq.id} className="peer sr-only" checked={answers.shopping.frequency === freq.id} onChange={(e) => updateAnswer('shopping', 'frequency', e.target.value)} />
                    <div className="p-4 rounded-xl border border-border bg-background text-center hover:bg-muted peer-checked:border-primary peer-checked:bg-primary/5 peer-checked:ring-1 peer-checked:ring-primary transition-all">
                      <span className="font-bold text-sm text-foreground">{freq.label}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 6: WATER */}
        {step === 6 && (
          <div className="flex-1 flex flex-col animate-in slide-in-from-right-4 duration-300">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-secondary/20 rounded-2xl text-secondary-foreground"><Droplets className="w-8 h-8" /></div>
              <div>
                <h2 className="font-heading text-2xl font-bold text-foreground">Water Usage</h2>
                <p className="text-muted-foreground text-sm mt-1">How long is your average shower?</p>
              </div>
            </div>
            <div className="space-y-6 flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: 'short', label: 'Under 5 Mins' },
                  { id: 'average', label: '5 - 15 Mins' },
                  { id: 'long', label: 'Over 15 Mins' }
                ].map(duration => (
                  <label key={duration.id} className="cursor-pointer relative">
                    <input type="radio" name="water" value={duration.id} className="peer sr-only" checked={answers.water.showerDuration === duration.id} onChange={(e) => updateAnswer('water', 'showerDuration', e.target.value)} />
                    <div className="p-4 rounded-xl border border-border bg-background text-center hover:bg-muted peer-checked:border-primary peer-checked:bg-primary/5 peer-checked:ring-1 peer-checked:ring-primary transition-all">
                      <span className="font-bold text-sm text-foreground">{duration.label}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="mt-8 pt-6 border-t border-border flex justify-between">
          <button 
            onClick={() => setStep(s => Math.max(1, s - 1))}
            disabled={step === 1 || isSubmitting}
            className={`bg-background border border-border text-primary font-bold py-3 px-6 rounded-xl hover:bg-muted transition-colors duration-200 ${step === 1 ? 'opacity-0 pointer-events-none' : ''}`}
          >
            <ArrowLeft className="w-5 h-5 inline mr-1" /> Back
          </button>
          
          {step < 6 ? (
            <button 
              onClick={() => setStep(s => s + 1)}
              className="bg-primary text-primary-foreground font-bold py-3 px-8 rounded-xl shadow-sm hover:shadow-md transition-shadow active:scale-95 duration-200 flex items-center gap-2"
            >
              Next Step <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <button 
              onClick={handleComplete}
              disabled={isSubmitting}
              className="bg-primary text-primary-foreground font-bold py-3 px-8 rounded-xl shadow-sm hover:shadow-md transition-shadow active:scale-95 duration-200 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? <><Loader2 className="w-5 h-5 animate-spin" /> Saving...</> : 'Complete'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
