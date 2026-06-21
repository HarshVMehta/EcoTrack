"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Bot, Recycle, Zap, UtensilsCrossed, Send, Loader2 } from 'lucide-react';
import { askAIAssistant } from '@/actions/insights';
import { useUser } from '@clerk/nextjs';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function AssistantPage() {
  const { user } = useUser();
  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      content: "Hello! I'm your EcoTrack Sustainability Assistant. 🌱\n\nI can help you analyze your carbon footprint, suggest ways to reduce waste, or provide personalized insights based on your recent activity. How can we make a positive impact today?",
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [inputText]);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || isLoading) return;

    // Add user message
    const userMessage: Message = {
      id: Math.random().toString(36).substring(7),
      sender: 'user',
      content: trimmed,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText("");
    setIsLoading(true);

    try {
      const res = await askAIAssistant(trimmed);
      if (res.success && res.reply) {
        const assistantMessage: Message = {
          id: Math.random().toString(36).substring(7),
          sender: 'assistant',
          content: res.reply,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        const errorMessage: Message = {
          id: Math.random().toString(36).substring(7),
          sender: 'assistant',
          content: "I'm sorry, I'm having trouble connecting right now. Please try again in a few moments.",
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (err) {
      console.error(err);
      const errorMessage: Message = {
        id: Math.random().toString(36).substring(7),
        sender: 'assistant',
        content: "An unexpected error occurred. Please try again.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(inputText);
    }
  };

  return (
    <div className="flex-1 flex flex-col relative bg-card overflow-hidden">
      {/* Atmospheric Background Element */}
      <div 
        className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" 
        style={{ backgroundImage: "radial-gradient(circle at 50% 0%, hsl(var(--primary)) 0%, transparent 70%)" }}
      ></div>
      
      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 z-10 relative space-y-6 flex flex-col">
        {/* Welcome Message / System */}
        <div className="flex justify-center mb-4">
          <div className="bg-muted border border-border text-muted-foreground px-4 py-2 rounded-full text-xs font-sans shadow-sm">
            Chatting with EcoTrack AI Assistant
          </div>
        </div>
        
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div 
              key={msg.id} 
              className={`flex items-start gap-4 max-w-3xl ${isUser ? 'self-end flex-row-reverse' : ''}`}
            >
              {isUser ? (
                user?.imageUrl ? (
                  <img 
                    src={user.imageUrl} 
                    alt="User" 
                    className="w-10 h-10 rounded-full object-cover border border-border flex-shrink-0" 
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 shadow-sm font-bold text-sm">
                    {user?.firstName?.charAt(0) || 'U'}
                  </div>
                )
              ) : (
                <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Bot className="w-6 h-6" />
                </div>
              )}
              <div 
                className={`p-5 rounded-2xl shadow-sm border font-sans leading-relaxed text-[15px] whitespace-pre-line ${
                  isUser 
                    ? 'bg-primary text-primary-foreground border-transparent rounded-tr-sm' 
                    : 'bg-background text-foreground border-border rounded-tl-sm'
                }`}
              >
                {msg.content}
              </div>
            </div>
          );
        })}
        
        {/* AI typing indicator */}
        {isLoading && (
          <div className="flex items-start gap-4 max-w-3xl opacity-60">
            <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center flex-shrink-0 scale-90">
              <Bot className="w-5 h-5" />
            </div>
            <div className="bg-background py-3 px-4 rounded-2xl rounded-tl-sm border border-border flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "0ms" }}></div>
              <div className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "150ms" }}></div>
              <div className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "300ms" }}></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input Area & Suggestions */}
      <div className="bg-background border-t border-border p-4 md:p-6 z-20">
        <div className="max-w-4xl mx-auto">
          {/* Quick Reply Chips */}
          <div className="flex flex-wrap gap-2 mb-4">
            <button 
              onClick={() => handleSend("How can I reduce waste in my daily life?")}
              disabled={isLoading}
              className="bg-card border border-border text-muted-foreground hover:bg-muted hover:text-primary hover:border-primary/40 text-sm font-sans px-4 py-2 rounded-full transition-all duration-200 shadow-sm flex items-center gap-2 disabled:opacity-50"
            >
              <Recycle className="w-4 h-4" /> How can I reduce waste?
            </button>
            <button 
              onClick={() => handleSend("Give me some tips to reduce my home energy consumption.")}
              disabled={isLoading}
              className="bg-card border border-border text-muted-foreground hover:bg-muted hover:text-primary hover:border-primary/40 text-sm font-sans px-4 py-2 rounded-full transition-all duration-200 shadow-sm flex items-center gap-2 disabled:opacity-50"
            >
              <Zap className="w-4 h-4" /> Analyze home energy
            </button>
            <button 
              onClick={() => handleSend("Can you suggest some easy plant-based recipes to reduce carbon emissions?")}
              disabled={isLoading}
              className="bg-card border border-border text-muted-foreground hover:bg-muted hover:text-primary hover:border-primary/40 text-sm font-sans px-4 py-2 rounded-full transition-all duration-200 shadow-sm flex items-center gap-2 disabled:opacity-50"
            >
              <UtensilsCrossed className="w-4 h-4" /> Plant-based recipes
            </button>
          </div>
          
          {/* Input Box */}
          <div className="relative flex items-end gap-2 bg-card rounded-2xl border border-border p-2 shadow-sm focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
            <div className="p-3 text-muted-foreground shrink-0">
              <Bot className="w-6 h-6 text-primary/70 animate-pulse" />
            </div>
            <textarea 
              ref={textareaRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full bg-transparent border-none focus:ring-0 resize-none py-3 px-2 font-sans text-foreground placeholder-muted-foreground/60 max-h-32 focus:outline-none" 
              placeholder={isLoading ? "Thinking..." : "Ask the assistant about your eco-goals, stats or carbon reductions..."} 
              rows={1}
              disabled={isLoading}
            ></textarea>
            <button 
              onClick={() => handleSend(inputText)}
              disabled={isLoading || !inputText.trim()}
              className="p-3 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl transition-colors shrink-0 flex items-center justify-center shadow-sm disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
          <div className="text-center mt-2 text-xs text-muted-foreground/60 font-sans">
            AI Assistant can make mistakes. Consider verifying important sustainability data.
          </div>
        </div>
      </div>
    </div>
  );
}
