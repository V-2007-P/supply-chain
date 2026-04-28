# 🚚 SwiftRoute — Resilient Logistics & Dynamic Supply Chain Optimization

> Built for Indian courier companies (Delhivery / Ekart Express style)

## Architecture

```
swiftroute/
├── frontend/      # Next.js 14 · TypeScript · Tailwind · shadcn/ui · Framer Motion
├── backend/       # Node.js · Express · Socket.io · TypeScript
├── ai-service/    # Python · FastAPI · Risk scoring & delay prediction
└── supabase/      # PostgreSQL schema (paste into Supabase SQL editor)
```

## Quick Start

### Prerequisites
- Node.js 18+, npm 9+
- Python 3.9+
- A free [Supabase](https://supabase.com) project

### 1. Supabase Setup
1. Create a new Supabase project
2. Go to **SQL Editor** → paste contents of `supabase/schema.sql` → Run
3. Copy your **Project URL** and **Service Role Key** from Project Settings → API

### 2. Frontend
```bash
cd frontend
cp .env.local.example .env.local
# Fill in NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
npm install
npm run dev       # http://localhost:3000
```

### 3. Backend
```bash
cd backend
cp .env.example .env
# Fill in SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
npm install
npm run dev       # http://localhost:4000
npm run seed      # Seed 50 Indian shipment records
```

### 4. AI Service
```bash
cd ai-service
python -m venv .venv
.venv\Scripts\activate    # Windows
pip install -r requirements.txt
uvicorn main:app --reload --port 8000   # http://localhost:8000
```

## Features
- 📦 **Live shipment tracking** — real-time status updates via Socket.io
- 🗺️ **Interactive map** — Leaflet.js with OSM tiles, truck markers, route overlays
- ⚠️ **Alert management** — traffic, weather, hub overload, vehicle breakdown
- 🤖 **AI risk scoring** — FastAPI microservice predicts delay risk (LOW/MEDIUM/HIGH)
- 📊 **KPI dashboard** — animated metrics, recommendation engine
- 🔄 **Supabase real-time** — live DB subscriptions for instant UI updates

## Environment Variables

| Service | Variable | Description |
|---|---|---|
| frontend | `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| frontend | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| frontend | `NEXT_PUBLIC_BACKEND_URL` | Express API base URL |
| frontend | `NEXT_PUBLIC_GEMINI_API_KEY` | Google Gemini API Key |
| frontend | `GROQ_API_KEY` | Groq AI API Key |
| frontend | `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Google Maps API Key |
| backend | `SUPABASE_URL` | Supabase project URL |
| backend | `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (bypasses RLS) |
| backend | `AI_SERVICE_URL` | FastAPI service URL |

## AI Integration
SwiftRoute uses a dual-AI approach for maximum reliability:
1. **Primary Analysis**: Uses **Groq (Llama 3.1)** via `/api/groq` for ultra-fast real-time risk assessments.
2. **Fallback/Enhanced Analysis**: Uses **Google Gemini 1.5 Flash** via `/api/gemini` for deep historical pattern recognition.
3. **Microservice**: A dedicated **FastAPI** service (`ai-service`) handles core logic for Indian highway congestion and delay calculations.

## Ports
| Service | Port |
|---|---|
| Next.js frontend | 3000 |
| Express backend | 4000 |
| FastAPI AI service | 8000 |
