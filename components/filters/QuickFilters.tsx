'use client';

import { useState } from 'react';
import { Briefcase, Heart, Coffee, Dumbbell, Sparkles } from 'lucide-react';
import { FilterOptions } from '@/lib/data/types';

const OCCASIONS = [
  { id: 'office', label: 'Office', icon: Briefcase },
  { id: 'date', label: 'Date Night', icon: Heart },
  { id: 'casual', label: 'Everyday', icon: Coffee },
  { id: 'gym', label: 'Gym/Sports', icon: Dumbbell },
  { id: 'formal', label: 'Formal', icon: Sparkles },
];

const PRICE_TIERS = [
  { id: 'budget', label: 'Budget', range: '<$40' },
  { id: 'mid', label: 'Mid-Range', range: '$40-100' },
  { id: 'premium', label: 'Premium', range: '$100+' },
];

interface QuickFiltersProps {
  onFilterChange: (filters: FilterOptions) => void;
}

export default function QuickFilters({ onFilterChange }: QuickFiltersProps) {
  const [selectedOccasion, setSelectedOccasion] = useState<string | null>(null);
  const [selectedPrice, setSelectedPrice] = useState<string | null>(null);

  const handleOccasionClick = (occasionId: string) => {
    const newOccasion = selectedOccasion === occasionId ? null : occasionId;
    setSelectedOccasion(newOccasion);
    onFilterChange({
      occasion: newOccasion || undefined,
      price_tier: selectedPrice || undefined,
    });
  };

  const handlePriceClick = (priceId: string) => {
    const newPrice = selectedPrice === priceId ? null : priceId;
    setSelectedPrice(newPrice);
    onFilterChange({
      occasion: selectedOccasion || undefined,
      price_tier: newPrice || undefined,
    });
  };

  return (
    <div className="bg-white border-b border-neutral-200 px-4 sm:px-6 py-4">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Occasions */}
        <div>
          <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">
            I need this for...
          </p>
          <div className="flex gap-2 flex-wrap">
            {OCCASIONS.map((occasion) => {
              const Icon = occasion.icon;
              const isSelected = selectedOccasion === occasion.id;
              return (
                <button
                  key={occasion.id}
                  onClick={() => handleOccasionClick(occasion.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-full border-2 transition-all text-sm font-medium ${
                    isSelected
                      ? 'bg-amber-600 border-amber-600 text-white shadow-md'
                      : 'bg-white border-neutral-300 text-neutral-700 hover:border-amber-500 hover:text-amber-600'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{occasion.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Price */}
        <div>
          <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">
            My budget
          </p>
          <div className="flex gap-2 flex-wrap">
            {PRICE_TIERS.map((tier) => {
              const isSelected = selectedPrice === tier.id;
              return (
                <button
                  key={tier.id}
                  onClick={() => handlePriceClick(tier.id)}
                  className={`px-4 py-2 rounded-full border-2 transition-all ${
                    isSelected
                      ? 'bg-amber-600 border-amber-600 text-white shadow-md'
                      : 'bg-white border-neutral-300 text-neutral-700 hover:border-amber-500 hover:text-amber-600'
                  }`}
                >
                  <span className="text-sm font-medium">{tier.label}</span>
                  <span className="text-xs ml-1 opacity-75">({tier.range})</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
