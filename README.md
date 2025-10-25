# The Scent - AI Fragrance Discovery Platform

An AI-powered fragrance recommendation platform for men new to fragrances.

![ScentMatch](https://img.shields.io/badge/Status-In_Development-yellow)
![Next.js](https://img.shields.io/badge/Next.js-16.0-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8)

## The Problem

75% of men have never bought a fragrance for themselves. The terminology is confusing, there are 50,000+ fragrances on the market, and it's hard to know where to start.

## Our Solution

The Scent uses conversational AI to help users discover their perfect scent through natural dialogue, occasion-based recommendations, and budget-aware suggestions.

## Key Features

- **Conversational AI** - Natural chat interface powered by OpenAI GPT-4o-mini
- **Occasion-Based Filters** - Quick filters for office, date night, casual, gym, and formal occasions
- **Budget Awareness** - Filter by price tier (budget, mid-range, premium, luxury)
- **"Similar but Cheaper"** - Find affordable alternatives to expensive fragrances
- **Compliment Magnets** - Highlighted fragrances known to get compliments
- **Smart Recommendations** - Context-aware suggestions based on user preferences

## Tech Stack

**Frontend:**
- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- Lucide React (icons)

**AI & Backend:**
- OpenAI API (GPT-4o-mini)
- Next.js API Routes
- PapaCSV (data processing)

**Data:**
- 70,000+ fragrances from Fragrantica
- Filtered and enriched dataset for men's fragrances
- Pre-computed fragrance attributes (occasions, vibes, price tiers)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- OpenAI API key

### Installation

1. Clone the repository:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Edit .env.local and add your API key
OPENAI_API_KEY=your_actual_openai_api_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
frontend/
├── app/
│   ├── api/
│   │   ├── chat/          # Chat endpoint with Claude
│   │   └── similar/       # Similar fragrances endpoint
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── components/
│   ├── chat/
│   │   └── ChatInterface.tsx  # Main chat UI
│   ├── fragrance/
│   │   ├── FragranceCard.tsx  # Fragrance display card
│   │   └── SimilarCheaper.tsx # Similar alternatives
│   └── filters/
│       └── QuickFilters.tsx   # Occasion/budget filters
├── lib/
│   ├── data/
│   │   ├── types.ts           # TypeScript types
│   │   ├── fragrances.ts      # Data loading utilities
│   │   └── fra_perfumes.csv   # Fragrance dataset
│   └── utils/
│       └── similarity.ts      # Similarity algorithm
└── public/                    # Static assets
```

## Features Explained

### Conversational AI
Claude understands natural language and asks clarifying questions to understand user preferences without overwhelming them with jargon.

### Smart Filtering
- **Occasions**: Office, Date Night, Everyday, Gym/Sports, Formal
- **Budget**: Budget (<$40), Mid-Range ($40-100), Premium ($100+)
- Filters are applied in real-time and integrated with AI recommendations

### Similar but Cheaper Algorithm
Uses Jaccard similarity to compare fragrances based on:
- Main accords (50% weight)
- Vibes (25% weight)
- Occasions (25% weight)

Minimum similarity threshold of 20% ensures relevant recommendations.

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

### Adding New Features

1. Add new components in `components/`
2. Add new API routes in `app/api/`
3. Update types in `lib/data/types.ts`

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

```bash
# Or use Vercel CLI
npm install -g vercel
vercel
```

## Future Roadmap

- [ ] Voice interface with Fish Audio
- [ ] Real-time price tracking with Bright Data
- [ ] Mobile app (React Native)
- [ ] Fragrance wardrobe builder
- [ ] User accounts and saved preferences
- [ ] Community reviews and ratings

## Contributing

This is a hackathon project built in 24 hours. Contributions are welcome!

## License

MIT

## Acknowledgments

- Fragrantica for fragrance data
- OpenAI for GPT API

## Contact

Built for CalHacks 2024

---

**Note:** Remember to add your OpenAI API key to `.env.local` before running the app!
