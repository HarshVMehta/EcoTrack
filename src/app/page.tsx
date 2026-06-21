import { Leaf, Wind, Droplet, ArrowRight, Zap, Target } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="bg-primary/20 p-2 rounded-xl">
            <Leaf className="w-6 h-6 text-primary" />
          </div>
          <span className="font-heading font-semibold text-2xl text-sidebar-foreground">
            EcoTrack
          </span>
        </div>
        <div className="hidden md:flex gap-8 text-muted-foreground font-medium">
          <Link href="#features" className="hover:text-primary transition-colors">Features</Link>
          <Link href="#how-it-works" className="hover:text-primary transition-colors">How it Works</Link>
          <Link href="#impact" className="hover:text-primary transition-colors">Impact</Link>
        </div>
        <div className="flex gap-4">
          <Link href="/login" className="px-6 py-2 rounded-xl font-semibold text-primary border border-border hover:bg-secondary transition-colors inline-block">
            Log In
          </Link>
          <Link href="/signup" className="px-6 py-2 rounded-xl font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-soft inline-block">
            Start Tracking
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center mt-12 md:mt-24 max-w-4xl mx-auto w-full">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary text-secondary-foreground font-medium mb-8">
          <Zap className="w-4 h-4 text-tertiary" />
          <span>AI-Powered Sustainability Insights</span>
        </div>
        
        <h1 className="font-heading text-5xl md:text-7xl font-bold leading-tight mb-6 text-foreground">
          Rooted in Nature.<br />
          <span className="text-primary">Driven by Data.</span>
        </h1>
        
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10 leading-relaxed">
          Understand, track, and reduce your carbon footprint with personalized AI insights. Join the movement towards a more sustainable future, one step at a time.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link href="/calculator" className="px-8 py-4 rounded-xl font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-soft flex items-center justify-center gap-2 text-lg">
            Calculate My Footprint <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        {/* Feature Cards Showcase */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 w-full text-left">
          <div className="bg-card p-8 rounded-2xl shadow-soft border border-border/50 flex flex-col gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Target className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-heading text-xl font-semibold">Smart Goals</h3>
            <p className="text-muted-foreground leading-relaxed">
              Set achievable reduction targets. Our AI helps you break down big goals into manageable daily actions.
            </p>
          </div>
          
          <div className="bg-card p-8 rounded-2xl shadow-soft border border-border/50 flex flex-col gap-4">
            <div className="w-12 h-12 rounded-full bg-tertiary/10 flex items-center justify-center">
              <Wind className="w-6 h-6 text-tertiary" />
            </div>
            <h3 className="font-heading text-xl font-semibold">Emission Forecast</h3>
            <p className="text-muted-foreground leading-relaxed">
              Predict your future carbon impact based on current habits and get actionable recommendations.
            </p>
          </div>

          <div className="bg-card p-8 rounded-2xl shadow-soft border border-border/50 flex flex-col gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
              <Droplet className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-heading text-xl font-semibold">Holistic Tracking</h3>
            <p className="text-muted-foreground leading-relaxed">
              Monitor transport, energy, food, waste, and water usage in one beautiful dashboard.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
