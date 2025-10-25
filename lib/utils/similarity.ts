import { Fragrance } from '../data/types';

export interface SimilarFragrance {
  fragrance: Fragrance;
  similarity: number;
}

/**
 * Find similar but cheaper fragrances based on accord and note matching
 */
export function findSimilarCheaper(
  targetFragrance: Fragrance,
  allFragrances: Fragrance[],
  numResults: number = 3
): SimilarFragrance[] {
  // Filter for cheaper fragrances only
  const cheaperFragrances = allFragrances.filter(f =>
    f.id !== targetFragrance.id &&
    getPriceTierValue(f.price_tier) < getPriceTierValue(targetFragrance.price_tier)
  );

  // Calculate similarity scores
  const scored = cheaperFragrances.map(f => ({
    fragrance: f,
    similarity: calculateSimilarity(targetFragrance, f)
  }));

  // Sort by similarity (highest first), then by rating
  return scored
    .filter(s => s.similarity > 0.2) // Minimum similarity threshold
    .sort((a, b) => {
      if (Math.abs(a.similarity - b.similarity) < 0.05) {
        // If similarities are close, prefer higher rated
        return b.fragrance.rating - a.fragrance.rating;
      }
      return b.similarity - a.similarity;
    })
    .slice(0, numResults);
}

/**
 * Calculate similarity between two fragrances
 * Returns a score between 0 and 1
 */
function calculateSimilarity(frag1: Fragrance, frag2: Fragrance): number {
  let score = 0;

  // Main accords overlap (50% weight)
  const accordOverlap = calculateOverlap(frag1.mainAccords, frag2.mainAccords);
  score += accordOverlap * 0.5;

  // Vibes overlap (25% weight)
  const vibeOverlap = calculateOverlap(frag1.vibes || [], frag2.vibes || []);
  score += vibeOverlap * 0.25;

  // Occasions overlap (25% weight)
  const occasionOverlap = calculateOverlap(frag1.occasions || [], frag2.occasions || []);
  score += occasionOverlap * 0.25;

  return score;
}

/**
 * Calculate Jaccard similarity between two arrays
 */
function calculateOverlap(arr1: string[], arr2: string[]): number {
  if (arr1.length === 0 || arr2.length === 0) return 0;

  const set1 = new Set(arr1.map(s => s.toLowerCase().trim()));
  const set2 = new Set(arr2.map(s => s.toLowerCase().trim()));

  const intersection = [...set1].filter(x => set2.has(x));
  const union = new Set([...set1, ...set2]);

  // Jaccard similarity: intersection / union
  return intersection.length / union.size;
}

/**
 * Get numeric value for price tiers for comparison
 */
function getPriceTierValue(tier?: 'budget' | 'mid' | 'premium' | 'luxury'): number {
  const values: Record<string, number> = {
    'budget': 1,
    'mid': 2,
    'premium': 3,
    'luxury': 4
  };
  return values[tier || 'mid'] || 2;
}

/**
 * Format price tier for display
 */
export function formatPriceTier(tier?: 'budget' | 'mid' | 'premium' | 'luxury'): string {
  const labels: Record<string, string> = {
    'budget': 'Budget (<$40)',
    'mid': 'Mid-Range ($40-100)',
    'premium': 'Premium ($100-200)',
    'luxury': 'Luxury ($200+)'
  };
  return labels[tier || 'mid'] || 'Mid-Range';
}
