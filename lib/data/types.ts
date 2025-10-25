export interface Fragrance {
  id: string;
  name: string;
  fullName: string;
  gender: string;
  rating: number;
  ratingCount: number;
  mainAccords: string[];
  perfumers: string[];
  description: string;
  url: string;

  // Enriched fields
  price_tier?: 'budget' | 'mid' | 'premium' | 'luxury';
  occasions?: string[];
  vibes?: string[];
  beginner_friendly?: boolean;
  compliment_getter?: boolean;
  performance?: string;
}

export interface RawFragranceData {
  Name: string;
  Gender: string;
  'Rating Value': string;
  'Rating Count': string;
  'Main Accords': string;
  Perfumers: string;
  Description: string;
  url: string;
}

export interface FilterOptions {
  occasion?: string;
  price_tier?: string;
  vibe?: string;
  beginner_friendly?: boolean;
  gender?: string;
}
