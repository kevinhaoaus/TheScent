'use client';

import { useState } from 'react';
import { FilterOptions } from '@/lib/data/types';

const OCCASIONS = [
  { id: 'office', label: 'Office' },
  { id: 'date', label: 'Date Night' },
  { id: 'casual', label: 'Casual' },
  { id: 'gym', label: 'Sport' },
  { id: 'formal', label: 'Formal' },
];

const PRICE_TIERS = [
  { id: 'budget', label: 'Under $40' },
  { id: 'mid', label: '$40–100' },
  { id: 'premium', label: '$100+' },
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
    <div className="bg-neutral-50 border border-neutral-200 p-6 space-y-6">
      {/* Occasions */}
      <div>
        <p className="text-xs font-normal text-neutral-500 uppercase tracking-wide mb-3">
          Occasion
        </p>
        <div className="flex flex-wrap gap-2">
          {OCCASIONS.map((occasion) => {
            const isSelected = selectedOccasion === occasion.id;
            return (
              <button
                key={occasion.id}
                onClick={() => handleOccasionClick(occasion.id)}
                className={`px-4 py-2 text-xs font-light uppercase tracking-wide transition-all ${
                  isSelected
                    ? 'bg-black text-white'
                    : 'bg-white border border-neutral-300 text-neutral-700 hover:border-neutral-900'
                }`}
              >
                {occasion.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Price */}
      <div>
        <p className="text-xs font-normal text-neutral-500 uppercase tracking-wide mb-3">
          Budget
        </p>
        <div className="flex flex-wrap gap-2">
          {PRICE_TIERS.map((tier) => {
            const isSelected = selectedPrice === tier.id;
            return (
              <button
                key={tier.id}
                onClick={() => handlePriceClick(tier.id)}
                className={`px-4 py-2 text-xs font-light uppercase tracking-wide transition-all ${
                  isSelected
                    ? 'bg-black text-white'
                    : 'bg-white border border-neutral-300 text-neutral-700 hover:border-neutral-900'
                }`}
              >
                {tier.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
