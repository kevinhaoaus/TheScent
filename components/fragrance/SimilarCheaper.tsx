'use client';

import { useState, useEffect } from 'react';
import { TrendingDown } from 'lucide-react';
import FragranceCard from './FragranceCard';
import { Fragrance } from '@/lib/data/types';
import { SimilarFragrance } from '@/lib/utils/similarity';

interface SimilarCheaperProps {
  targetFragrance: Fragrance;
}

export default function SimilarCheaper({ targetFragrance }: SimilarCheaperProps) {
  const [alternatives, setAlternatives] = useState<SimilarFragrance[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (isExpanded && alternatives.length === 0) {
      fetchAlternatives();
    }
  }, [isExpanded]);

  const fetchAlternatives = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/similar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fragranceId: targetFragrance.id }),
      });

      if (response.ok) {
        const data = await response.json();
        setAlternatives(data.alternatives || []);
      }
    } catch (error) {
      console.error('Error fetching alternatives:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="w-full mt-2 py-2 px-4 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg transition-colors flex items-center justify-center gap-2 text-green-700 font-medium text-sm"
      >
        <TrendingDown className="w-4 h-4" />
        <span>Show Similar but Cheaper Options</span>
      </button>
    );
  }

  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 sm:p-6 mt-4">
      <div className="flex items-center gap-2 mb-4">
        <TrendingDown className="w-5 h-5 text-green-600" />
        <h3 className="font-semibold text-neutral-900">
          Save Money: Similar Fragrances
        </h3>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-neutral-600">
          <p className="text-sm">Finding similar options...</p>
        </div>
      ) : alternatives.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {alternatives.map((alt, i) => (
            <div key={i} className="relative">
              <FragranceCard fragrance={alt.fragrance} />
              <div className="mt-2 text-center">
                <span className="inline-block px-3 py-1 bg-green-600 text-white text-xs font-medium rounded-full">
                  {Math.round(alt.similarity * 100)}% similar
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-neutral-600">
          <p className="text-sm">No cheaper alternatives found with similar profiles.</p>
        </div>
      )}
    </div>
  );
}
