'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';
import FragranceCard from '../fragrance/FragranceCard';
import QuickFilters from '../filters/QuickFilters';
import { Fragrance, FilterOptions } from '@/lib/data/types';
import Image from 'next/image';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  recommendations?: Fragrance[];
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Welcome. I'm here to help you discover your signature scent. What occasion are you shopping for?"
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId] = useState(() => Math.random().toString(36).substring(7));
  const [filters, setFilters] = useState<FilterOptions>({});
  const [showHero, setShowHero] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (messages.length > 1) {
      setShowHero(false);
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          conversationId,
          filters,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.response,
        recommendations: data.recommendations || []
      }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'My apologies. Could you try that again?'
      }]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="relative min-h-screen bg-white">
      {/* Hero Section - Only shows initially */}
      {showHero && (
        <div className="relative h-[60vh] overflow-hidden">
          <div className="absolute inset-0">
            <Image
              src="/background.jpg"
              alt="Fragrance background"
              fill
              className="object-cover"
              priority
              quality={100}
            />
            <div className="absolute inset-0 hero-gradient" />
          </div>

          <div className="relative h-full flex flex-col items-center justify-center px-6 text-center">
            <h1 className="text-6xl md:text-8xl font-semibold tracking-tight text-white mb-6 hero-text-shadow">
              The Scent
            </h1>
            <p className="text-xl md:text-2xl text-white font-normal max-w-2xl hero-text-shadow">
              Discover your signature fragrance through conversation
            </p>
          </div>
        </div>
      )}

      {/* Main Chat Container */}
      <div className={`${showHero ? 'relative -mt-32' : 'pt-24'} px-4 pb-32`}>
        <div className="max-w-3xl mx-auto">
          {/* Filters - Only show after hero */}
          {!showHero && (
            <div className="mb-8">
              <QuickFilters onFilterChange={setFilters} />
            </div>
          )}

          {/* Messages */}
          <div className="space-y-6">
            {messages.slice(showHero ? 0 : 1).map((msg, idx) => (
              <div key={idx} className="space-y-4">
                <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] ${
                    msg.role === 'user'
                      ? 'bg-black text-white px-6 py-4 rounded-2xl'
                      : 'text-neutral-800'
                  }`}>
                    <p className="text-sm md:text-base leading-relaxed font-light">
                      {msg.content}
                    </p>
                  </div>
                </div>

                {/* Recommendations */}
                {msg.recommendations && msg.recommendations.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
                    {msg.recommendations.map((fragrance, i) => (
                      <FragranceCard key={i} fragrance={fragrance} />
                    ))}
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 text-neutral-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm font-light">Thinking...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Fixed Input Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-heavy border-t border-neutral-200">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <div className="flex gap-3 items-center">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Describe what you're looking for..."
              disabled={isLoading}
              className="flex-1 px-5 py-3 bg-neutral-50 border border-neutral-200 rounded-full focus:outline-none focus:ring-1 focus:ring-black focus:border-black disabled:opacity-50 disabled:cursor-not-allowed text-sm font-light placeholder:text-neutral-400 transition-all"
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              className="p-3 bg-black text-white rounded-full hover:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all refined-shadow"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
