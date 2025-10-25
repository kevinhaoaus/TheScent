'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Loader2 } from 'lucide-react';
import FragranceCard from '../fragrance/FragranceCard';
import QuickFilters from '../filters/QuickFilters';
import { Fragrance, FilterOptions } from '@/lib/data/types';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  recommendations?: Fragrance[];
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hey! I'm here to help you find your perfect scent. Are you looking for something for a specific occasion, or just exploring?"
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId] = useState(() => Math.random().toString(36).substring(7));
  const [filters, setFilters] = useState<FilterOptions>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
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
        content: 'Sorry, something went wrong. Can you try again?'
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
    <div className="flex flex-col h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 px-4 sm:px-6 py-4 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-amber-600" />
          <div>
            <h1 className="text-xl font-bold text-neutral-900">The Scent</h1>
            <p className="text-xs text-neutral-500">AI Fragrance Discovery</p>
          </div>
        </div>
      </header>

      {/* Filters */}
      <QuickFilters onFilterChange={setFilters} />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-6">
        <div className="max-w-4xl mx-auto">
          {messages.map((msg, idx) => (
            <div key={idx} className="mb-6">
              <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] sm:max-w-[70%] rounded-2xl px-4 py-3 ${
                  msg.role === 'user'
                    ? 'bg-amber-600 text-white'
                    : 'bg-white text-neutral-900 border border-neutral-200 shadow-sm'
                }`}>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>

              {/* Show recommendations if present */}
              {msg.recommendations && msg.recommendations.length > 0 && (
                <div className="mt-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {msg.recommendations.map((fragrance, i) => (
                      <FragranceCard key={i} fragrance={fragrance} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-neutral-200 rounded-2xl px-4 py-3 shadow-sm">
                <div className="flex gap-2 items-center">
                  <Loader2 className="w-4 h-4 text-amber-600 animate-spin" />
                  <span className="text-sm text-neutral-600">Thinking...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="bg-white border-t border-neutral-200 px-4 sm:px-6 py-4 shadow-lg">
        <div className="max-w-4xl mx-auto flex gap-3">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Tell me what you're looking for..."
            disabled={isLoading}
            className="flex-1 px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            className="px-6 py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors font-medium"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </div>
      </div>
    </div>
  );
}
