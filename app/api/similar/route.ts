import { NextRequest, NextResponse } from 'next/server';
import { loadFragrances } from '@/lib/data/fragrances';
import { findSimilarCheaper } from '@/lib/utils/similarity';

interface SimilarRequest {
  fragranceId: string;
  numResults?: number;
}

export async function POST(request: NextRequest) {
  try {
    const { fragranceId, numResults = 3 }: SimilarRequest = await request.json();

    if (!fragranceId) {
      return NextResponse.json(
        { error: 'Fragrance ID is required' },
        { status: 400 }
      );
    }

    // Load all fragrances
    const allFragrances = await loadFragrances();

    // Find the target fragrance
    const targetFragrance = allFragrances.find(f => f.id === fragranceId);

    if (!targetFragrance) {
      return NextResponse.json(
        { error: 'Fragrance not found' },
        { status: 404 }
      );
    }

    // Find similar cheaper alternatives
    const alternatives = findSimilarCheaper(targetFragrance, allFragrances, numResults);

    return NextResponse.json({ alternatives });

  } catch (error) {
    console.error('Similar API error:', error);
    return NextResponse.json(
      { error: 'Failed to find similar fragrances' },
      { status: 500 }
    );
  }
}
