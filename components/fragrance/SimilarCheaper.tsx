'use client';

import { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
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
        className="w-full py-2 px-4 bg-neutral-100 hover:bg-neutral-200 transition-colors flex items-center justify-between text-neutral-800 text-xs font-light uppercase tracking-wide"
      >
        <span>Similar but cheaper</span>
        <ChevronDown className="w-3.5 h-3.5" />
      </button>
    );
  }

  return (
    <div className="bg-neutral-50 border border-neutral-200 p-6 mt-2">
      <h3 className="text-xs font-normal text-neutral-500 uppercase tracking-wide mb-4">
        Similar but cheaper
      </h3>

      {isLoading ? (
        <div className="text-center py-8 text-neutral-500">
          <p className="text-xs font-light">Finding alternatives...</p>
        </div>
      ) : alternatives.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {alternatives.map((alt, i) => (
            <div key={i}>
              <FragranceCard fragrance={alt.fragrance} showSimilarCheaper={false} />
              <div className="mt-2 text-center">
                <span className="inline-block px-3 py-1 bg-neutral-900 text-white text-xs font-light">
                  {Math.round(alt.similarity * 100)}% match
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-neutral-500">
          <p className="text-xs font-light">No cheaper alternatives found.</p>
        </div>
      )}
    </div>
  );
}
