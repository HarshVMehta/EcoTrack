import React from 'react';
import { Leaf } from 'lucide-react';
import { SignUp } from '@clerk/nextjs';
import Image from 'next/image';

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center font-sans antialiased bg-background">
      <div className="flex flex-col md:flex-row w-full min-h-screen">
        
        {/* Illustration/Image Side (Left on Desktop, Top on Mobile) */}
        <div className="w-full md:w-1/2 relative bg-muted hidden md:block">
          <div className="absolute inset-0 z-0">
            <Image 
              alt="Signup background" 
              fill
              unoptimized
              className="w-full h-full object-cover rounded-none md:rounded-r-[2rem] shadow-soft" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBXuZ_AW27NDQfiQ3o9L3V510oRtaxufKdDGkJoeMPl8n6Z_JdcHBXXZWy-6AxIGB_GcFQTCQGEYNbvzMFZeIROmxdVBnBYwAghHqTPCqVplO3oT7wMkjoU3Ff8JMtMRdFWY6BF_6BYiKQfPdLfiiA70vyAOAETyMWulCP-0zEufmq1t4uVFVJhKaUXOj7zdBsw_-lFWtKSAfMury4KyNOpOTy7PLqACXRB0vhJBjw-RVSEBa4BfJeaM1CVOo--ofHj6ln0Fieb2GeG"
            />
          </div>
          {/* Overlay for brand anchoring */}
          <div className="absolute inset-0 bg-primary/20 mix-blend-multiply md:rounded-r-[2rem]"></div>
          
          <div className="absolute top-8 left-8 z-10 flex items-center gap-3">
            <Leaf className="w-10 h-10 text-primary fill-current" />
            <span className="font-heading font-bold text-3xl text-white drop-shadow-md">EcoTrack</span>
          </div>
        </div>

        {/* Form Side (Right on Desktop, Full on Mobile) */}
        <div className="w-full md:w-1/2 flex flex-col justify-center px-6 py-12 md:px-16 lg:px-24 bg-card overflow-y-auto">
          <div className="max-w-md w-full mx-auto space-y-8">
            
            {/* Mobile Logo */}
            <div className="md:hidden flex items-center justify-center gap-3 mb-8">
              <Leaf className="w-10 h-10 text-primary fill-current" />
              <span className="font-heading font-bold text-3xl text-primary">EcoTrack</span>
            </div>
            
          <div className="w-full max-w-md flex justify-center">
            <SignUp path="/signup" routing="path" signInUrl="/login" fallbackRedirectUrl="/dashboard" />
          </div>
        </div>
      </div>
    </div>
  </div>
);
}

