'use client';

import { Star, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { Fragrance } from '@/lib/data/types';
import SimilarCheaper from './SimilarCheaper';

interface FragranceCardProps {
  fragrance: Fragrance;
  showSimilarCheaper?: boolean;
}

export default function FragranceCard({ fragrance, showSimilarCheaper = true }: FragranceCardProps) {
  const [showAlternatives, setShowAlternatives] = useState(false);

  const priceDisplay = {
    budget: '$',
    mid: '$$',
    premium: '$$$',
    luxury: '$$$$'
  }[fragrance.price_tier || 'mid'];

  // Show "Similar but Cheaper" button only for mid-tier and above
  const canShowCheaper = showSimilarCheaper &&
    (fragrance.price_tier === 'mid' || fragrance.price_tier === 'premium' || fragrance.price_tier === 'luxury');

  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-4 hover:shadow-lg transition-all duration-200 animate-fade-in">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-neutral-900 text-base leading-tight">
            {fragrance.name}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex items-center gap-1 text-sm text-amber-600">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="font-medium">{fragrance.rating.toFixed(1)}</span>
            </div>
            <span className="text-xs text-neutral-400">
              ({fragrance.ratingCount} reviews)
            </span>
          </div>
        </div>
        <span className="text-sm font-semibold text-neutral-700 ml-2">
          {priceDisplay}
        </span>
      </div>

      {/* Main Accords */}
      {fragrance.mainAccords && fragrance.mainAccords.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {fragrance.mainAccords.slice(0, 4).map((accord, i) => (
            <span
              key={i}
              className="px-2 py-0.5 bg-amber-50 text-amber-700 text-xs rounded-full font-medium"
            >
              {accord}
            </span>
          ))}
        </div>
      )}

      {/* Description (truncated) */}
      {fragrance.description && (
        <p className="text-xs text-neutral-600 line-clamp-2 mb-3">
          {fragrance.description}
        </p>
      )}

      {/* Footer */}
      <div className="flex justify-between items-center pt-3 border-t border-neutral-100">
        {fragrance.occasions && fragrance.occasions.length > 0 && (
          <span className="text-xs text-neutral-500 capitalize">
            {fragrance.occasions[0]}
          </span>
        )}
        {fragrance.compliment_getter && (
          <span className="flex items-center gap-1 text-amber-600">
            <Sparkles className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">Compliment magnet</span>
          </span>
        )}
      </div>

      {/* Similar but Cheaper */}
      {canShowCheaper && !showAlternatives && (
        <div className="mt-2">
          <SimilarCheaper targetFragrance={fragrance} />
        </div>
      )}
    </div>
  );
}
