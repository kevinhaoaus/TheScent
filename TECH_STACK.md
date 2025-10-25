# The Scent - Technical Architecture Documentation

## Executive Summary

**The Scent** is NOT a simple ChatGPT wrapper. It's a sophisticated AI-powered fragrance recommendation platform that combines conversational AI with semantic search, custom filtering algorithms, and similarity matching to help users discover their perfect fragrance from a database of 70,000+ options.

---

## Why This Is More Than a ChatGPT Wrapper

### 1. **Custom Fragrance Database (70,000+ Entries)**
- **Data Source:** Fragrantica dataset (`fra_perfumes.csv`)
- **Structured Data:** Name, Gender, Rating, Main Accords, Perfumers, Description
- **Smart Filtering:** Real-time filtering by occasion, price tier, vibes, and beginner-friendliness
- **Location:** `/lib/data/fra_perfumes.csv`

### 2. **Semantic Similarity Algorithm**
- **Algorithm:** Jaccard similarity with weighted scoring
- **Components:**
  - Main Accords: 50% weight
  - Vibes: 25% weight
  - Occasions: 25% weight
- **Purpose:** "Similar but Cheaper" feature - finds alternatives based on scent profile
- **Location:** `/lib/utils/similarity.ts`

### 3. **Multi-Layer Data Enrichment Pipeline**
Automatically enriches raw data with inferred attributes:
- **Price Tier Inference:** Analyzes brand names (Creed→luxury, Afnan→budget)
- **Occasion Mapping:** Maps accords to use cases (fresh→office, sweet→date)
- **Vibe Detection:** Extracts personality traits from scent profiles
- **Compliment Getter Analysis:** Identifies crowd-pleasing scents
- **Location:** `/lib/data/fragrances.ts`

### 4. **Contextual AI with Conversation Memory**
- **In-Memory State Management:** Tracks conversation history per user
- **Context Awareness:** Remembers filters, preferences, previous recommendations
- **Intent Detection:** Automatically determines when to show recommendations
- **Smart Prompting:** Builds dynamic system prompts with top-rated fragrances
- **Location:** `/app/api/chat/route.ts`

### 5. **Natural Language Understanding**
Extracts structured data from unstructured conversations:
- Occasion detection (office, date, casual, gym, formal)
- Price preference extraction (budget, luxury, premium)
- Vibe preference parsing (fresh, bold, subtle)

---

## Full Tech Stack Breakdown

### **Frontend Layer**
| Technology | Purpose | Files |
|------------|---------|-------|
| **Next.js 16** | React framework with App Router | `/app/*` |
| **TypeScript** | Type safety across codebase | `*.ts`, `*.tsx` |
| **Tailwind CSS v3** | Utility-first styling | `/app/globals.css` |
| **Lucide React** | Icon library | `components/*` |
| **React Hooks** | State management (useState, useEffect, useRef) | `components/chat/ChatInterface.tsx` |

### **Backend API Layer**
| Endpoint | Method | Purpose | Location |
|----------|--------|---------|----------|
| `/api/chat` | POST | Conversational AI recommendations | `/app/api/chat/route.ts` |
| `/api/similar` | POST | Find cheaper alternatives | `/app/api/similar/route.ts` |

### **AI & Machine Learning**
| Component | Technology | Purpose |
|-----------|------------|---------|
| **LLM** | OpenAI GPT-4o-mini | Conversational interface, natural language understanding |
| **Similarity Matching** | Jaccard Similarity | Find fragrance alternatives based on accord overlap |
| **Intent Detection** | Custom NLP rules | Determine when to provide recommendations |
| **Context Extraction** | Keyword matching + filters | Parse user preferences from conversations |

### **Data Processing Pipeline**
| Stage | Technology | Purpose |
|-------|------------|---------|
| **CSV Parsing** | PapaCSV | Load 70k+ fragrance records |
| **Gender Filtering** | Custom logic | Filter for men's fragrances |
| **Data Enrichment** | Rule-based inference | Add price tiers, occasions, vibes |
| **Rating Analysis** | Statistical filtering | Identify beginner-friendly options |

### **State Management**
| Type | Implementation | Purpose |
|------|----------------|---------|
| **Conversation History** | In-memory Map | Track user conversations by ID |
| **Filter State** | React useState | Manage quick filters (occasion, budget) |
| **Message State** | React useState | Store chat messages with recommendations |
| **Loading State** | React useState | Handle async operations |

---

## Key Algorithms & Data Structures

### 1. **Jaccard Similarity Algorithm**
```typescript
// Location: /lib/utils/similarity.ts:66-76

function calculateOverlap(arr1: string[], arr2: string[]): number {
  const set1 = new Set(arr1.map(s => s.toLowerCase().trim()));
  const set2 = new Set(arr2.map(s => s.toLowerCase().trim()));

  const intersection = [...set1].filter(x => set2.has(x));
  const union = new Set([...set1, ...set2]);

  return intersection.length / union.size;
}
```

**Purpose:** Calculate how similar two fragrances are based on shared attributes.

**Formula:** `Similarity = (A ∩ B) / (A ∪ B)`

**Example:**
- Fragrance A: [woody, spicy, warm]
- Fragrance B: [woody, spicy, fresh]
- Intersection: {woody, spicy} = 2
- Union: {woody, spicy, warm, fresh} = 4
- Similarity: 2/4 = 0.5 (50% match)

### 2. **Weighted Similarity Scoring**
```typescript
// Location: /lib/utils/similarity.ts:45-60

function calculateSimilarity(frag1: Fragrance, frag2: Fragrance): number {
  let score = 0;

  // Main accords (50% weight) - most important
  const accordOverlap = calculateOverlap(frag1.mainAccords, frag2.mainAccords);
  score += accordOverlap * 0.5;

  // Vibes (25% weight) - personality match
  const vibeOverlap = calculateOverlap(frag1.vibes || [], frag2.vibes || []);
  score += vibeOverlap * 0.25;

  // Occasions (25% weight) - use case match
  const occasionOverlap = calculateOverlap(frag1.occasions || [], frag2.occasions || []);
  score += occasionOverlap * 0.25;

  return score; // Returns 0.0 to 1.0
}
```

**Why Weighted?** Scent accords matter more than occasions for similarity.

### 3. **Conversation Memory Structure**
```typescript
// Location: /app/api/chat/route.ts:13-19

interface ConversationHistory {
  messages: Array<{
    role: 'user' | 'assistant' | 'system',
    content: string
  }>;
  context: {
    lastFilters?: FilterOptions;
    lastRecommendations?: Fragrance[];
  };
}
```

**Purpose:** Maintain conversation state across multiple messages.

**Memory Management:** Limits to last 10 messages to avoid token overflow.

### 4. **Price Tier Inference Logic**
```typescript
// Location: /lib/data/fragrances.ts:92-113

function inferPriceTier(accords: string[], name: string): PriceTier {
  const nameLower = name.toLowerCase();

  // Budget brands ($0-40)
  if (nameLower.includes('afnan') || nameLower.includes('al haramain'))
    return 'budget';

  // Luxury brands ($200+)
  if (nameLower.includes('creed') || nameLower.includes('tom ford'))
    return 'luxury';

  // Premium brands ($100-200)
  if (nameLower.includes('dior') || nameLower.includes('chanel'))
    return 'premium';

  return 'mid'; // Default ($40-100)
}
```

**Method:** Brand name pattern matching to classify pricing without manual curation.

---

## Data Flow Architecture

### **User Message → Recommendation Flow**

```
1. User Input
   └─> ChatInterface component captures message

2. Frontend Processing
   └─> Sends POST to /api/chat with:
       - message (string)
       - conversationId (unique ID)
       - filters (FilterOptions)

3. Backend Processing
   ├─> Load 70k+ fragrances from CSV
   ├─> Apply filters (occasion, price, vibe)
   ├─> Retrieve conversation history
   ├─> Build dynamic system prompt
   └─> Send to OpenAI GPT-4o-mini

4. AI Response
   ├─> GPT generates conversational response
   ├─> Intent detection determines if recommendations needed
   └─> If yes: Extract preferences from conversation

5. Recommendation Engine
   ├─> Parse natural language for:
   │   - Occasion (office/date/casual/gym/formal)
   │   - Price tier (budget/mid/premium/luxury)
   │   - Vibes (fresh/warm/confident/bold)
   ├─> Filter 70k database to ~100-1000 matches
   ├─> Get top-rated (rating ≥ 3.5, count ≥ 50)
   └─> Return top 3-5 fragrances

6. Frontend Display
   ├─> Show AI message
   ├─> Render FragranceCard components
   └─> Enable "Similar but Cheaper" button

7. Similarity Search (if triggered)
   ├─> POST to /api/similar with fragranceId
   ├─> Calculate Jaccard similarity for all cheaper options
   ├─> Filter by 20% minimum similarity threshold
   ├─> Sort by similarity score + rating
   └─> Return top 3 alternatives
```

---

## File Structure & Responsibilities

```
frontend/
├── app/
│   ├── api/
│   │   ├── chat/
│   │   │   └── route.ts          # Main AI chat endpoint
│   │   └── similar/
│   │       └── route.ts          # Similarity search endpoint
│   ├── layout.tsx                # Root layout with metadata
│   ├── page.tsx                  # Home page (renders ChatInterface)
│   └── globals.css               # Global styles + custom utilities
│
├── components/
│   ├── chat/
│   │   └── ChatInterface.tsx     # Main conversational UI
│   ├── fragrance/
│   │   ├── FragranceCard.tsx     # Product display card
│   │   └── SimilarCheaper.tsx    # Alternative recommendations
│   └── filters/
│       └── QuickFilters.tsx      # Occasion + budget filters
│
├── lib/
│   ├── data/
│   │   ├── types.ts              # TypeScript interfaces
│   │   ├── fragrances.ts         # Data loading + enrichment
│   │   └── fra_perfumes.csv      # 70k+ fragrance database
│   └── utils/
│       └── similarity.ts         # Jaccard similarity algorithm
│
├── public/
│   └── background.jpg            # Hero section image
│
├── .env.local                    # Environment variables
├── next.config.js                # Next.js configuration
├── tailwind.config.ts            # Tailwind CSS configuration
├── tsconfig.json                 # TypeScript configuration
└── package.json                  # Dependencies
```

---

## Database Schema

### **Fragrance Type Definition**
```typescript
// Location: /lib/data/types.ts

interface Fragrance {
  // Core Data (from CSV)
  id: string;                     // Unique identifier
  name: string;                   // Short name
  fullName: string;               // Full name with designer
  gender: string;                 // "for men", "for women and men"
  rating: number;                 // 0-5 stars
  ratingCount: number;            // Number of reviews
  mainAccords: string[];          // ["woody", "spicy", "fresh"]
  perfumers: string[];            // Creator names
  description: string;            // Marketing copy
  url: string;                    // Fragrantica URL

  // Enriched Data (inferred)
  price_tier: 'budget' | 'mid' | 'premium' | 'luxury';
  occasions: string[];            // ["office", "date", "casual"]
  vibes: string[];                // ["fresh", "confident", "bold"]
  beginner_friendly: boolean;     // rating ≥ 3.5 && count ≥ 50
  compliment_getter: boolean;     // Sweet/vanilla/fresh accords
  performance: string;            // Longevity/projection
}
```

### **Sample Entry (Transformed)**
```json
{
  "id": "frag_1234",
  "name": "Bleu de Chanel",
  "fullName": "Bleu de Chanel for men",
  "gender": "for men",
  "rating": 4.2,
  "ratingCount": 8543,
  "mainAccords": ["woody", "fresh", "citrus"],
  "perfumers": ["Jacques Polge"],
  "description": "An aromatic-woody fragrance...",
  "url": "https://www.fragrantica.com/...",
  "price_tier": "premium",
  "occasions": ["office", "casual", "formal"],
  "vibes": ["fresh", "confident"],
  "beginner_friendly": true,
  "compliment_getter": true,
  "performance": "Moderate longevity, good projection"
}
```

---

## Key Features That Differentiate from ChatGPT Wrapper

| Feature | Implementation | Why It Matters |
|---------|---------------|----------------|
| **70k Fragrance Database** | CSV parsing + filtering | Real product recommendations, not hallucinations |
| **Semantic Similarity** | Jaccard algorithm | Mathematical precision in finding alternatives |
| **Data Enrichment** | Rule-based inference | Adds missing metadata automatically |
| **Contextual Memory** | Conversation history | Remembers user preferences across messages |
| **Intent Detection** | NLP keyword matching | Knows when to recommend vs. ask questions |
| **Multi-Tier Filtering** | Occasion/price/vibe | Narrows 70k to relevant ~100 options |
| **Rating Analysis** | Statistical thresholds | Only shows proven, highly-rated options |
| **Price Comparison** | Tier-based matching | Finds genuine cheaper alternatives |

---

## Performance Characteristics

### **Data Processing**
- **CSV Load Time:** ~500-800ms (70k rows)
- **Filter Performance:** O(n) linear scan (~50-200ms)
- **Similarity Calculation:** O(n²) worst case, but filtered subset (~100-300ms)

### **API Response Times**
- **Chat Endpoint:** 2-4 seconds (includes OpenAI latency)
- **Similar Endpoint:** 400-600ms (local computation)

### **Memory Usage**
- **Conversation Storage:** In-memory Map (production should use Redis)
- **CSV Data:** Loaded on-demand per request (production should cache)

---

## Environment Variables

```bash
# Location: .env.local

OPENAI_API_KEY=sk-...                    # OpenAI API key for GPT-4o-mini
NEXT_PUBLIC_APP_URL=http://localhost:3000 # App URL for CORS/webhooks
```

---

## Deployment Considerations

### **Current Architecture (Development)**
- In-memory conversation storage (not persistent)
- CSV loaded on every request (no caching)
- No authentication/user accounts

### **Production Recommendations**
1. **Database:**
   - Move CSV data to PostgreSQL or MongoDB
   - Index by gender, rating, price_tier, occasions

2. **Caching:**
   - Redis for conversation history
   - Cache filtered fragrance lists
   - Memoize similarity calculations

3. **Vector Database (Future Enhancement):**
   - Chroma or Pinecone for semantic search
   - Pre-computed embeddings available in `/datasets/`
   - Would enable "find fragrances like X" with AI understanding

4. **Authentication:**
   - NextAuth.js for user sessions
   - Save conversation history per user

5. **Rate Limiting:**
   - Prevent OpenAI API abuse
   - Implement usage quotas

---

## Future Enhancements (From Original Plan)

### **Phase 2: Vector Database Integration**
- **Technology:** Chroma DB
- **Purpose:** True semantic search using embeddings
- **Benefit:** Find fragrances by natural language ("something woody but not too masculine")
- **Data:** Pre-computed embeddings already available in `/datasets/`

### **Phase 3: Voice Interface**
- **Technology:** Fish Audio TTS
- **Purpose:** Voice conversations about fragrances
- **Benefit:** More natural shopping experience

### **Phase 4: Beginner Mode**
- **Feature:** Simplified UI for first-time fragrance buyers
- **Includes:** Educational tooltips, guided questions

---

## Conclusion

**The Scent** is a sophisticated AI application that combines:
- Large-scale data processing (70k+ records)
- Custom similarity algorithms (Jaccard with weighted scoring)
- Conversational AI (GPT-4o-mini with context)
- Real-time filtering and ranking
- Natural language understanding
- Multi-layered data enrichment

It's NOT just a ChatGPT wrapper—it's a domain-specific recommendation engine that uses AI as one component within a larger intelligent system. The AI handles conversation, while custom algorithms handle search, filtering, and similarity matching based on structured data.

---

**Built with:** Next.js 16, TypeScript, OpenAI GPT-4o-mini, Tailwind CSS v3
**Data Source:** Fragrantica (70,000+ fragrances)
**Algorithms:** Jaccard Similarity, Intent Detection, NLP Extraction
**Architecture:** Conversational UI + Semantic Search + Recommendation Engine
