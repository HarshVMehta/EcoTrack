"use client";

import React, { useState } from 'react';
import { Camera, User, Lock, MapPin, Car, Utensils, Zap, Trash2, Eye } from 'lucide-react';
import Image from 'next/image';

export default function SettingsPage() {
  const [isPublic, setIsPublic] = useState(true);
  const [showActivity, setShowActivity] = useState(false);

  return (
    <div className="flex-1 ml-0 pt-6 md:pt-0 p-6 md:p-10 lg:p-12 overflow-y-auto max-w-5xl mx-auto w-full">
      {/* Header Section */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="font-heading text-4xl text-foreground font-bold tracking-tight mb-2">Profile Settings</h1>
          <p className="text-muted-foreground text-lg">Manage your personal information, privacy, and tracking preferences.</p>
        </div>
        <div className="flex gap-4 shrink-0">
          <button className="px-6 py-2.5 rounded-lg border border-border bg-card text-primary font-bold hover:bg-muted transition-colors active:scale-95">
            Cancel
          </button>
          <button className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors active:scale-95 shadow-sm">
            Save Changes
          </button>
        </div>
      </div>

      {/* Bento Grid Layout for Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Column 1: Profile & Security */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          
          {/* Account Info Card */}
          <section className="bg-card rounded-xl p-8 shadow-soft border border-border/50">
            <h2 className="font-heading text-2xl text-foreground font-bold mb-6 flex items-center gap-2 border-b border-border pb-4">
              <User className="text-primary w-6 h-6" />
              Account Information
            </h2>
            
            <div className="flex flex-col md:flex-row gap-8 items-start mb-8">
              {/* Avatar Upload Area */}
              <div className="flex flex-col items-center gap-4 shrink-0">
                <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-muted group cursor-pointer">
                  <Image 
                    alt="Current Profile Picture" 
                    width={128}
                    height={128}
                    unoptimized
                    className="w-full h-full object-cover transition-opacity group-hover:opacity-60" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCgAwdBJig4mnS_QXiYIY7m3TH8sxuGkymwrm3AqvoSTtXbDAte6bRkzl-XmXwyJOt_hgNKzUn1ofrHTFfGnU1ROFaVd1afPakA1yLACmMrAsibKoHDaq5RIZ8U1TOdRUyBO4VBpzbGjz5OfGb1vcX-I5HolbGBbACEmjPWzcD4tw4DJLPapD755nMtnx1AVpawwWFiMbZW4wz4L9QVxDjxVbSSRwl1cJId6eFaA9PmXW4q30EG4MxT5JECmC2DKDKiG5qskG2hSxPn"
                  />
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="text-white w-8 h-8" />
                  </div>
                </div>
                <button className="text-primary font-bold text-sm hover:underline">Change Photo</button>
              </div>
              
              {/* Core Info Fields */}
              <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="font-bold text-muted-foreground text-sm" htmlFor="first_name">First Name</label>
                  <input className="w-full bg-background border border-border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-shadow text-foreground" id="first_name" type="text" defaultValue="Alex"/>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-bold text-muted-foreground text-sm" htmlFor="last_name">Last Name</label>
                  <input className="w-full bg-background border border-border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-shadow text-foreground" id="last_name" type="text" defaultValue="Rivera"/>
                </div>
                <div className="flex flex-col gap-2 md:col-span-2">
                  <label className="font-bold text-muted-foreground text-sm" htmlFor="email">Email Address</label>
                  <input className="w-full bg-background border border-border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-shadow text-foreground" id="email" type="email" defaultValue="alex.rivera@example.com"/>
                </div>
                <div className="flex flex-col gap-2 md:col-span-2">
                  <label className="font-bold text-muted-foreground text-sm" htmlFor="location">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                    <input className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-shadow text-foreground" id="location" type="text" defaultValue="Portland, OR"/>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Security Card */}
          <section className="bg-card rounded-xl p-8 shadow-soft border border-border/50">
            <h2 className="font-heading text-2xl text-foreground font-bold mb-6 flex items-center gap-2 border-b border-border pb-4">
              <Lock className="text-primary w-6 h-6" />
              Security
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="font-bold text-muted-foreground text-sm" htmlFor="current_password">Current Password</label>
                <input className="w-full bg-background border border-border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-shadow text-foreground" id="current_password" placeholder="••••••••" type="password"/>
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-bold text-muted-foreground text-sm" htmlFor="new_password">New Password</label>
                <input className="w-full bg-background border border-border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-shadow text-foreground" id="new_password" placeholder="New Password" type="password"/>
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-bold text-muted-foreground text-sm" htmlFor="confirm_password">Confirm Password</label>
                <input className="w-full bg-background border border-border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-shadow text-foreground" id="confirm_password" placeholder="Confirm Password" type="password"/>
              </div>
              <div className="md:col-span-2 mt-2">
                <button className="text-primary font-bold text-sm hover:underline">Forgot password?</button>
              </div>
            </div>
          </section>
        </div>

        {/* Column 2: Preferences & Privacy */}
        <div className="lg:col-span-1 flex flex-col gap-8">
          
          {/* Impact Preferences Card */}
          <section className="bg-card rounded-xl p-8 shadow-soft border border-border/50 h-fit">
            <h2 className="font-heading text-2xl text-foreground font-bold mb-6 flex items-center gap-2 border-b border-border pb-4">
              <User className="text-[#705c30] w-6 h-6" />
              Impact Focus
            </h2>
            <p className="text-muted-foreground text-sm mb-6">Select the primary areas you want to track to customize your dashboard metrics.</p>
            
            <div className="flex flex-col gap-4">
              {/* Preference Toggle 1 */}
              <label className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-muted transition-colors cursor-pointer group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Car className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-foreground">Transport</span>
                </div>
                <input type="checkbox" defaultChecked className="w-5 h-5 rounded text-primary border-border focus:ring-primary focus:ring-offset-background" />
              </label>
              
              {/* Preference Toggle 2 */}
              <label className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-muted transition-colors cursor-pointer group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Utensils className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-foreground">Food & Diet</span>
                </div>
                <input type="checkbox" defaultChecked className="w-5 h-5 rounded text-primary border-border focus:ring-primary focus:ring-offset-background" />
              </label>
              
              {/* Preference Toggle 3 */}
              <label className="flex items-center justify-between p-4 rounded-lg border border-primary bg-primary/5 transition-colors cursor-pointer group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                    <Zap className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-primary">Energy Usage</span>
                </div>
                <input type="checkbox" defaultChecked className="w-5 h-5 rounded text-primary border-border focus:ring-primary focus:ring-offset-background" />
              </label>
              
              {/* Preference Toggle 4 */}
              <label className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-muted transition-colors cursor-pointer group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Trash2 className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-foreground">Waste Reduction</span>
                </div>
                <input type="checkbox" className="w-5 h-5 rounded text-primary border-border focus:ring-primary focus:ring-offset-background" />
              </label>
            </div>
          </section>

          {/* Privacy Settings Card */}
          <section className="bg-card rounded-xl p-8 shadow-soft border border-border/50 h-fit">
            <h2 className="font-heading text-2xl text-foreground font-bold mb-6 flex items-center gap-2 border-b border-border pb-4">
              <Eye className="text-secondary-foreground w-6 h-6" />
              Privacy
            </h2>
            <div className="flex flex-col gap-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-bold text-foreground mb-1">Public Profile</h3>
                  <p className="text-muted-foreground text-sm">Allow other community members to see your impact stats and projects.</p>
                </div>
                {/* Custom Toggle Switch */}
                <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                  <input type="checkbox" id="public_profile_toggle" aria-label="Public Profile Toggle" className="sr-only peer" checked={isPublic} onChange={() => setIsPublic(!isPublic)} />
                  <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
              
              <div className="flex items-start justify-between gap-4 pt-4 border-t border-border/50">
                <div>
                  <h3 className="font-bold text-foreground mb-1">Activity Tracking</h3>
                  <p className="text-muted-foreground text-sm">Show my recent logged activities in the community feed.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                  <input type="checkbox" id="activity_tracking_toggle" aria-label="Activity Tracking Toggle" className="sr-only peer" checked={showActivity} onChange={() => setShowActivity(!showActivity)} />
                  <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>
          </section>

        </div>
      </div>

      {/* Danger Zone */}
      <div className="mt-12 mb-20 pt-8 border-t border-border/50 max-w-3xl">
        <h3 className="font-heading text-xl text-destructive font-bold mb-2">Danger Zone</h3>
        <p className="text-muted-foreground mb-4">Once you delete your account, there is no going back. Please be certain.</p>
        <button className="px-4 py-2 rounded-lg border border-destructive text-destructive font-bold hover:bg-destructive hover:text-destructive-foreground transition-colors">
          Delete Account
        </button>
      </div>
    </div>
  );
}
