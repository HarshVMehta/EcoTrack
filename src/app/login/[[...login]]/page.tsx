import React from 'react';
import { Leaf } from 'lucide-react';
import { SignIn } from '@clerk/nextjs';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex antialiased bg-background">
      <div className="flex flex-col md:flex-row w-full h-screen">
        
        {/* Left Side: Image/Illustration */}
        <div className="hidden md:flex md:w-1/2 lg:w-[55%] relative overflow-hidden bg-muted rounded-r-3xl md:rounded-r-[2.5rem] shadow-soft z-10">
          <div 
            className="absolute inset-0 w-full h-full bg-cover bg-center" 
            style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBsaWmZS-uyEGlCVhUDEbmvK7CjFYVmq2mqBtOcEeXCsX6G1g7EyjuJJqmlqKiJHe2Y5AF4feuQIYN9x9ZMIlTlTD0q_nMK6TCN0O2P8DgQKQcgK4zJAwAHnO1qncxI9oC_IZg_JV0EyR5kuCWCzFYU-HeG9LLHDPnU81Fqg_01M-f0Ujq0W3bndeMCDtVccTIWEg7IYOcxapliGZ4wVHnDw3nPeAcJ1duhMG9xPaK6wkHjzowvANRjCruZmnKuNu2iMmoYN-pmk2q5')" }}
          ></div>
          {/* Decorative Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent"></div>
          <div className="absolute inset-0 bg-primary/10 mix-blend-multiply"></div>
          
          <div className="absolute bottom-12 left-12 right-12 z-20 text-white">
            <div className="flex items-center gap-3 mb-6">
              <Leaf className="w-10 h-10 fill-current text-white" />
              <h2 className="font-heading text-3xl font-bold tracking-tight">EcoTrack</h2>
            </div>
            <p className="font-sans text-xl font-light leading-relaxed max-w-lg opacity-90">
              Rooted in nature, designed for community. Join us in making a sustainable impact, one step at a time.
            </p>
          </div>
        </div>

        {/* Right Side: Auth Form */}
        <div className="flex-1 flex items-center justify-center p-6 md:p-12 lg:p-24 bg-card relative z-0">
          {/* Mobile Logo */}
          <div className="absolute top-8 left-8 md:hidden flex items-center gap-2">
            <Leaf className="text-primary w-8 h-8 fill-current" />
            <span className="font-heading font-bold text-xl text-primary">EcoTrack</span>
          </div>

          <div className="w-full max-w-md flex justify-center">
            <SignIn path="/login" routing="path" signUpUrl="/signup" fallbackRedirectUrl="/dashboard" />
          </div>
        </div>
      </div>
    </div>
  );
}
