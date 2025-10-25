import Papa from 'papaparse';
import { Fragrance, RawFragranceData, FilterOptions } from './types';
import fs from 'fs';
import path from 'path';

// Load and parse CSV data
export async function loadFragrances(): Promise<Fragrance[]> {
  const filePath = path.join(process.cwd(), 'lib/data/fra_perfumes.csv');
  const fileContent = fs.readFileSync(filePath, 'utf-8');

  return new Promise((resolve, reject) => {
    Papa.parse<RawFragranceData>(fileContent, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const fragrances = results.data
          .filter(row => {
            // Filter for men's fragrances
            const gender = row.Gender?.toLowerCase() || '';
            return gender.includes('for men') || gender.includes('for women and men');
          })
          .map((row, index) => parseFragrance(row, index))
          .filter(f => f !== null) as Fragrance[];

        resolve(fragrances);
      },
      error: (error) => {
        reject(error);
      }
    });
  });
}

// Parse a single fragrance row
function parseFragrance(row: RawFragranceData, index: number): Fragrance | null {
  try {
    const ratingValue = parseFloat(row['Rating Value']) || 0;
    const ratingCount = parseInt(row['Rating Count']) || 0;

    // Skip fragrances with no data
    if (!row.Name || row.Name.trim() === '') return null;

    // Parse arrays from string representation
    const mainAccords = parseArrayField(row['Main Accords']);
    const perfumers = parseArrayField(row.Perfumers);

    // Extract fragrance name without designer
    const fullName = row.Name;
    const nameParts = fullName.split(/(?:for women and men|for men|for women)/i);
    const name = nameParts[0].trim();

    return {
      id: `frag_${index}`,
      name,
      fullName,
      gender: row.Gender || '',
      rating: ratingValue,
      ratingCount: ratingCount,
      mainAccords,
      perfumers,
      description: row.Description || '',
      url: row.url || '',

      // Default enriched fields (can be customized later)
      price_tier: inferPriceTier(mainAccords, name),
      occasions: inferOccasions(mainAccords, row.Description),
      vibes: inferVibes(mainAccords),
      beginner_friendly: ratingValue >= 3.5 && ratingCount >= 50,
      compliment_getter: isComplimentGetter(mainAccords),
      performance: 'Moderate longevity, good projection'
    };
  } catch (error) {
    console.error('Error parsing fragrance:', error);
    return null;
  }
}

// Parse array-like string fields
function parseArrayField(field: string): string[] {
  if (!field || field === '[]') return [];

  try {
    // Remove brackets and quotes, split by comma
    const cleaned = field.replace(/[\[\]'\"]/g, '');
    return cleaned.split(',').map(s => s.trim()).filter(s => s.length > 0);
  } catch {
    return [];
  }
}

// Infer price tier from brand/accords (simplified logic)
function inferPriceTier(accords: string[], name: string): 'budget' | 'mid' | 'premium' | 'luxury' {
  const nameLower = name.toLowerCase();

  // Budget brands
  if (nameLower.includes('afnan') || nameLower.includes('al haramain')) {
    return 'budget';
  }

  // Luxury brands
  if (nameLower.includes('creed') || nameLower.includes('tom ford') ||
      nameLower.includes('parfums de marly') || nameLower.includes('amouage')) {
    return 'luxury';
  }

  // Premium brands
  if (nameLower.includes('dior') || nameLower.includes('chanel') ||
      nameLower.includes('ysl') || nameLower.includes('armani')) {
    return 'premium';
  }

  return 'mid';
}

// Infer occasions from accords and description
function inferOccasions(accords: string[], description: string): string[] {
  const occasions: string[] = [];
  const accordStr = accords.join(' ').toLowerCase();
  const descLower = description.toLowerCase();

  if (accordStr.includes('fresh') || accordStr.includes('citrus') ||
      accordStr.includes('aromatic')) {
    occasions.push('office');
    occasions.push('casual');
  }

  if (accordStr.includes('sweet') || accordStr.includes('spicy') ||
      accordStr.includes('warm')) {
    occasions.push('date');
  }

  if (accordStr.includes('woody') || accordStr.includes('leather')) {
    occasions.push('formal');
  }

  if (accordStr.includes('aquatic') || accordStr.includes('fresh')) {
    occasions.push('gym');
  }

  return occasions.length > 0 ? occasions : ['casual'];
}

// Infer vibes from accords
function inferVibes(accords: string[]): string[] {
  const vibes: string[] = [];
  const accordStr = accords.join(' ').toLowerCase();

  if (accordStr.includes('fresh') || accordStr.includes('citrus')) {
    vibes.push('fresh');
  }

  if (accordStr.includes('warm') || accordStr.includes('spicy')) {
    vibes.push('warm');
  }

  if (accordStr.includes('woody') || accordStr.includes('leather')) {
    vibes.push('confident');
  }

  if (accordStr.includes('sweet') || accordStr.includes('vanilla')) {
    vibes.push('bold');
  }

  if (accordStr.includes('aromatic') || accordStr.includes('green')) {
    vibes.push('subtle');
  }

  return vibes.length > 0 ? vibes : ['confident'];
}

// Determine if fragrance is a compliment getter
function isComplimentGetter(accords: string[]): boolean {
  const accordStr = accords.join(' ').toLowerCase();

  // Sweet, vanilla, or fresh scents tend to get compliments
  return accordStr.includes('sweet') ||
         accordStr.includes('vanilla') ||
         accordStr.includes('fresh');
}

// Filter fragrances by criteria
export function filterFragrances(
  fragrances: Fragrance[],
  filters: FilterOptions
): Fragrance[] {
  return fragrances.filter(f => {
    if (filters.occasion && !f.occasions?.includes(filters.occasion)) {
      return false;
    }

    if (filters.price_tier && f.price_tier !== filters.price_tier) {
      return false;
    }

    if (filters.vibe && !f.vibes?.includes(filters.vibe)) {
      return false;
    }

    if (filters.beginner_friendly !== undefined &&
        f.beginner_friendly !== filters.beginner_friendly) {
      return false;
    }

    return true;
  });
}

// Get top-rated fragrances
export function getTopRated(fragrances: Fragrance[], limit: number = 10): Fragrance[] {
  return fragrances
    .filter(f => f.ratingCount >= 50)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, limit);
}
