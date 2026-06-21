"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { 
  Leaf, 
  Calculator, 
  Activity, 
  Users, 
  Settings, 
  HelpCircle,
  LayoutDashboard,
  Brain,
  MessageSquare,
  Flag,
  User,
  BarChart2
} from "lucide-react";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const sidebarLinks = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Calculator", href: "/calculator", icon: Calculator },
    { name: "Tracker", href: "/activities", icon: Activity },
    { name: "Community", href: "/challenges", icon: Users },
    { name: "AI Insights", href: "/insights", icon: Brain },
    { name: "Chatbot", href: "/assistant", icon: MessageSquare },
    { name: "Goals", href: "/goals", icon: Flag },
    { name: "Analytics", href: "/reports", icon: BarChart2 },
  ];

  const topNavLinks = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Calculator", href: "/calculator" },
    { name: "Community", href: "/challenges" },
    { name: "Goals", href: "/goals" },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <div className="font-sans antialiased flex h-screen overflow-hidden bg-background">
      {/* SideNavBar (WEB) */}
      <nav className="hidden lg:flex flex-col h-full p-4 gap-2 bg-card h-screen w-64 docked left-0 border-r border-border z-40">
        <div className="mb-8 px-2 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-sm">
            <Leaf className="w-6 h-6" />
          </div>
          <div>
            <div className="font-heading text-xl text-primary font-bold">EcoTrack</div>
            <div className="text-xs text-muted-foreground">Rooted in Nature</div>
          </div>
        </div>
        
        <div className="flex-1 space-y-1 overflow-y-auto pr-2">
          {sidebarLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-all duration-200 ease-in-out group ${
                  active
                    ? "bg-primary/10 text-primary font-bold"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <Icon className={`w-5 h-5 transition-colors ${active ? "text-primary" : "group-hover:text-primary"}`} />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </div>

        <div className="mt-auto pt-4 space-y-1 border-t border-border">
          <Link href="/calculator" className="w-full mb-4 py-3 bg-primary text-primary-foreground rounded-xl font-bold shadow-sm hover:bg-primary/90 transition-colors block text-center">
            Reduce Footprint
          </Link>
          <Link
            href="/settings"
            className={`flex items-center gap-3 px-4 py-2 text-sm rounded-xl transition-colors ${
              isActive("/settings")
                ? "bg-primary/10 text-primary font-bold"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            <Settings className="w-5 h-5" />
            <span className="font-bold">Settings</span>
          </Link>
          <button
            onClick={() => window.open("mailto:support@ecotrack.app", "_blank")}
            className="flex items-center gap-3 px-4 py-2 text-sm text-muted-foreground hover:bg-muted rounded-xl transition-colors w-full"
          >
            <HelpCircle className="w-5 h-5" />
            <span className="font-bold">Support</span>
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto relative bg-background">
        {/* TopNavBar (WEB/MOBILE Header) */}
        <header className="sticky top-0 z-50 flex justify-between items-center px-6 py-4 w-full bg-background/95 backdrop-blur-md shadow-sm border-b border-border">
          <div className="flex items-center gap-4 lg:hidden">
            <Leaf className="text-primary w-8 h-8" />
            <h1 className="text-2xl font-heading font-bold text-primary">EcoTrack</h1>
          </div>
          
          <div className="hidden lg:flex flex-1 items-center justify-between px-4">
            <div className="flex-1 max-w-md"></div>
            <div className="flex items-center gap-6">
              <nav className="flex gap-6">
                {topNavLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`font-bold font-sans leading-relaxed pb-1 transition-transform active:scale-95 ${
                      isActive(link.href)
                        ? "text-primary border-b-2 border-primary"
                        : "text-muted-foreground hover:text-primary hover:bg-muted/50 transition-colors"
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Link href="/activities" className="hidden md:block px-4 py-2 bg-secondary text-secondary-foreground rounded-lg font-bold text-sm hover:bg-secondary/80 transition-colors">
              Track Activity
            </Link>
            <div className="w-10 h-10 rounded-full flex items-center justify-center">
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        </header>

        {children}
      </main>

      {/* BottomNavBar (MOBILE) */}
      <nav className="lg:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 py-3 bg-card rounded-t-xl shadow-[0_-4px_20px_rgba(46,50,48,0.08)] pb-safe border-t border-border">
        {[
          { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
          { href: "/activities", icon: Activity, label: "Track" },
          { href: "/goals", icon: Flag, label: "Goals", highlight: true },
          { href: "/challenges", icon: Users, label: "Social" },
          { href: "/settings", icon: User, label: "Profile" },
        ].map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
                active ? "text-primary font-bold" : "text-muted-foreground hover:text-primary"
              } ${item.highlight ? "relative" : ""}`}
            >
              {item.highlight ? (
                <>
                  <div className={`absolute -top-3 p-2 rounded-full shadow-sm border border-border ${active ? "bg-primary/20 text-primary" : "bg-primary/10 text-primary"}`}>
                    <Icon className="w-6 h-6 fill-current" />
                  </div>
                  <span className="text-[10px] mt-6">{item.label}</span>
                </>
              ) : (
                <>
                  <Icon className="w-6 h-6 mb-1" />
                  <span className="text-[10px] font-bold font-sans">{item.label}</span>
                </>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
