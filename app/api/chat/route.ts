import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { loadFragrances, filterFragrances, getTopRated } from '@/lib/data/fragrances';
import { Fragrance, FilterOptions } from '@/lib/data/types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

// In-memory conversation store (in production, use Redis/DB)
const conversationMemory = new Map<string, ConversationHistory>();

interface ConversationHistory {
  messages: Array<{ role: 'user' | 'assistant' | 'system', content: string }>;
  context: {
    lastFilters?: FilterOptions;
    lastRecommendations?: Fragrance[];
  };
}

interface ChatRequest {
  message: string;
  conversationId: string;
  filters?: FilterOptions;
}

export async function POST(request: NextRequest) {
  try {
    const { message, conversationId, filters }: ChatRequest = await request.json();

    // Get or create conversation history
    let history = conversationMemory.get(conversationId);
    if (!history) {
      history = {
        messages: [],
        context: {}
      };
      conversationMemory.set(conversationId, history);
    }

    // Load fragrances
    const allFragrances = await loadFragrances();

    // Apply filters if provided
    let filteredFragrances = filters
      ? filterFragrances(allFragrances, filters)
      : allFragrances;

    // Store filters in context
    if (filters) {
      history.context.lastFilters = filters;
    }

    // Build system prompt
    const systemPrompt = buildSystemPrompt(filteredFragrances);

    // Build messages array for OpenAI
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      ...history.messages.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      })),
      { role: 'user', content: message }
    ];

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: messages,
      max_tokens: 1024,
      temperature: 0.7,
    });

    const assistantMessage = response.choices[0]?.message?.content ||
      'Sorry, I could not generate a response.';

    // Determine if we should provide recommendations
    const shouldRecommend = shouldProvideRecommendations(message, assistantMessage);

    let recommendations: Fragrance[] = [];
    if (shouldRecommend) {
      // Get recommendations based on the conversation
      recommendations = getRecommendations(
        filteredFragrances,
        message,
        assistantMessage,
        history.context.lastFilters
      );
      history.context.lastRecommendations = recommendations;
    }

    // Update conversation history
    history.messages.push(
      { role: 'user', content: message },
      { role: 'assistant', content: assistantMessage }
    );

    // Limit history to last 10 messages to avoid token limits
    if (history.messages.length > 10) {
      history.messages = history.messages.slice(-10);
    }

    return NextResponse.json({
      response: assistantMessage,
      recommendations: recommendations.slice(0, 3), // Return top 3
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    );
  }
}

// Build system prompt with fragrance context
function buildSystemPrompt(fragrances: Fragrance[]): string {
  const topFragrances = getTopRated(fragrances, 20);

  return `You are a friendly and knowledgeable fragrance advisor helping men discover their perfect scent.

Your expertise:
- You help beginners who are new to fragrances
- You make fragrance discovery fun and approachable (no overwhelming jargon)
- You ask clarifying questions about occasion, preferences, and budget
- You recommend 2-3 specific fragrances when you have enough information

Guidelines:
- Be casual, encouraging, and enthusiastic
- Keep responses concise (2-3 sentences unless providing recommendations)
- Ask ONE question at a time
- When users mention an occasion (office, date, casual, gym, formal), that's a great signal
- When users mention budget or price, factor that in
- When users mention preferences (fresh, bold, subtle, sweet, etc.), remember those

Available fragrance database:
- You have access to ${fragrances.length} men's fragrances
- Fragrances are rated and reviewed
- Common categories: fresh/citrus, woody, spicy/warm, sweet, aromatic

When to recommend:
- After you understand: occasion OR vibe preference
- If user directly asks "what should I get?" or "recommend something"
- If user provides budget information

Top-rated options include fragrances like:
${topFragrances.slice(0, 5).map(f => `- ${f.name} (${f.rating}/5, ${f.mainAccords.slice(0, 3).join(', ')})`).join('\n')}

Important: When you recommend fragrances, mention them by name and briefly explain why they're a good fit based on what the user told you.`;
}

// Determine if recommendations should be provided
function shouldProvideRecommendations(userMessage: string, assistantMessage: string): boolean {
  const userLower = userMessage.toLowerCase();
  const assistantLower = assistantMessage.toLowerCase();

  // User explicitly asks for recommendations
  if (userLower.includes('recommend') ||
      userLower.includes('suggest') ||
      userLower.includes('what should i') ||
      userLower.includes('show me')) {
    return true;
  }

  // Assistant mentions specific fragrances or recommendations
  if (assistantLower.includes('recommend') ||
      assistantLower.includes('suggest') ||
      assistantLower.includes('try') ||
      assistantLower.includes('check out') ||
      assistantLower.includes('perfect for you')) {
    return true;
  }

  return false;
}

// Get fragrance recommendations based on conversation
function getRecommendations(
  fragrances: Fragrance[],
  userMessage: string,
  assistantMessage: string,
  lastFilters?: FilterOptions
): Fragrance[] {
  const messageLower = userMessage.toLowerCase() + ' ' + assistantMessage.toLowerCase();

  // Build filter options from conversation
  const filters: FilterOptions = { ...lastFilters };

  // Extract occasion
  if (messageLower.includes('office') || messageLower.includes('work')) {
    filters.occasion = 'office';
  } else if (messageLower.includes('date')) {
    filters.occasion = 'date';
  } else if (messageLower.includes('casual') || messageLower.includes('everyday')) {
    filters.occasion = 'casual';
  } else if (messageLower.includes('gym') || messageLower.includes('sport')) {
    filters.occasion = 'gym';
  } else if (messageLower.includes('formal') || messageLower.includes('event')) {
    filters.occasion = 'formal';
  }

  // Extract price tier
  if (messageLower.includes('budget') || messageLower.includes('cheap') || messageLower.includes('affordable')) {
    filters.price_tier = 'budget';
  } else if (messageLower.includes('expensive') || messageLower.includes('luxury') || messageLower.includes('high end')) {
    filters.price_tier = 'luxury';
  } else if (messageLower.includes('premium')) {
    filters.price_tier = 'premium';
  }

  // Filter and get top-rated options
  let filtered = filterFragrances(fragrances, filters);

  // If filters result in too few, relax them
  if (filtered.length < 5) {
    filtered = fragrances;
  }

  // Return top-rated
  return getTopRated(filtered, 5);
}
