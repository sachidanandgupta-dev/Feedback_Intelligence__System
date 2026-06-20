# 💬 Feedback Intelligence System

> NLP-powered customer feedback analysis with sentiment analysis, topic classification, and automated summarization

## 🏗️ Tech Stack
- **Backend:** Python, FastAPI, Gemini API, MongoDB (optional, falls back to in-memory)
- **Frontend:** React.js, Vite, Tailwind CSS, Recharts (charts)
- **AI:** Sentiment analysis + topic classification + NPS estimation via Gemini

## 📐 How It Works
```
Single Feedback → Gemini API → Sentiment + Topics + Keywords + Actionable Insight
Bulk Feedbacks  → Gemini API → Aggregate Insights + NPS + Recommended Actions
                           → MongoDB (if running) or in-memory store
Dashboard       → /api/feedback/stats → Charts & Visualizations
```

## 🚀 How to Run

### 1. Backend
```bash
cd backend
cp .env .env.local          # Add your GEMINI_API_KEY
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8002
# OR: bash run.sh
```
> MongoDB is **optional** — the app works without it using in-memory storage.
> To use MongoDB: install it locally and set `MONGODB_URI=mongodb://localhost:27017`

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5175
```

## 🔑 Environment Variables
```
GEMINI_API_KEY=your_gemini_api_key_here              # Required
MONGODB_URI=mongodb://localhost:27017      # Optional
DB_NAME=feedback_intelligence              # Optional
```

## 📡 API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/feedback/submit` | Submit & analyze single feedback |
| POST | `/api/feedback/bulk-analyze` | Analyze up to 50 feedbacks |
| GET | `/api/feedback/list` | Get all feedbacks |
| GET | `/api/feedback/stats` | Aggregate stats for dashboard |
| DELETE | `/api/feedback/clear` | Clear all data (demo use) |

## 📊 Features
- **Single Analysis:** Sentiment score (-1 to +1), topics, keywords, urgency, category, actionable insight
- **Bulk Analysis:** Sentiment distribution, key themes, critical issues, NPS estimate, recommended actions
- **Dashboard:** Pie chart (sentiment), bar chart (top topics), progress bars
- **History:** Filter by sentiment, view all metadata per feedback

## 💡 Interview Talking Points
- **Sentiment Score:** Float -1.0 to +1.0 (not just labels) — explains nuance
- **Topic Classification:** Unsupervised — Gemini discovers topics from text, no predefined list
- **NPS Estimation:** Net Promoter Score derived from bulk sentiment
- **MongoDB Fallback:** Graceful degradation to in-memory when DB unavailable
- **Urgency Detection:** High/Medium/Low urgency for prioritizing support actions
