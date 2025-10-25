'use client';

import { Star } from 'lucide-react';
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

  const canShowCheaper = showSimilarCheaper &&
    (fragrance.price_tier === 'mid' || fragrance.price_tier === 'premium' || fragrance.price_tier === 'luxury');

  return (
    <div className="group">
      <div className="bg-white border border-neutral-200 hover:border-neutral-300 transition-all duration-300 p-5">
        {/* Header */}
        <div className="mb-4">
          <h3 className="font-normal text-base text-neutral-900 mb-1 tracking-tight">
            {fragrance.name}
          </h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 fill-neutral-900 text-neutral-900" />
              <span className="text-xs text-neutral-600 font-light">
                {fragrance.rating.toFixed(1)}
              </span>
              <span className="text-xs text-neutral-400 font-light">
                ({fragrance.ratingCount})
              </span>
            </div>
            <span className="text-xs text-neutral-500 font-light">
              {priceDisplay}
            </span>
          </div>
        </div>

        {/* Accords */}
        {fragrance.mainAccords && fragrance.mainAccords.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {fragrance.mainAccords.slice(0, 3).map((accord, i) => (
              <span
                key={i}
                className="text-xs px-2 py-0.5 bg-neutral-100 text-neutral-700 font-light uppercase tracking-wide"
              >
                {accord}
              </span>
            ))}
          </div>
        )}

        {/* Description */}
        {fragrance.description && (
          <p className="text-xs text-neutral-600 leading-relaxed font-light line-clamp-2 mb-4">
            {fragrance.description}
          </p>
        )}

        {/* Footer */}
        <div className="pt-4 border-t border-neutral-100 flex items-center justify-between">
          {fragrance.occasions && fragrance.occasions.length > 0 && (
            <span className="text-xs text-neutral-500 uppercase tracking-wide font-light">
              {fragrance.occasions[0]}
            </span>
          )}
          {fragrance.compliment_getter && (
            <span className="text-xs text-neutral-900 font-light">
              ★ Compliment magnet
            </span>
          )}
        </div>
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
