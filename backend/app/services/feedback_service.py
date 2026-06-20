import json
import re
from datetime import datetime
from typing import List, Optional
from google import genai
from app.core.config import settings


def _extract_json(raw_text: str) -> dict:
    """Robustly extract a JSON object from a Claude response, regardless of
    whether it's wrapped in ```json fences, plain ``` fences, or has
    leading/trailing prose."""
    text = raw_text.strip()

    fence_match = re.search(r'```(?:json)?\s*([\s\S]*?)\s*```', text)
    if fence_match:
        text = fence_match.group(1).strip()

    if not text.startswith('{'):
        brace_match = re.search(r'\{[\s\S]*\}', text)
        if brace_match:
            text = brace_match.group(0)

    return json.loads(text)


def analyze_single_feedback(text: str, category: Optional[str] = None) -> dict:
    """Analyze a single feedback entry with Gemini."""
    client = genai.Client(api_key=settings.GEMINI_API_KEY)

    prompt = f"""Analyze this customer feedback and return a JSON object (no markdown, no extra text):

Feedback: "{text}"
{f'Category hint: {category}' if category else ''}

Return ONLY this JSON:
{{
  "sentiment": "Positive" | "Negative" | "Neutral" | "Mixed",
  "sentiment_score": <float -1.0 to 1.0>,
  "topics": ["topic1", "topic2"],
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "summary": "one sentence summary",
  "actionable_insight": "specific business action to take",
  "urgency": "High" | "Medium" | "Low",
  "category": "Product" | "Service" | "Support" | "Pricing" | "UX" | "General"
}}"""

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt
    )
    raw = response.text.strip()
    return _extract_json(raw)


def bulk_analyze_feedback(feedbacks: List[str]) -> dict:
    """Analyze multiple feedbacks and generate aggregate insights."""
    client = genai.Client(api_key=settings.GEMINI_API_KEY)

    combined = "\n".join([f"{i+1}. {f}" for i, f in enumerate(feedbacks)])

    prompt = f"""You are a business intelligence analyst. Analyze these {len(feedbacks)} customer feedback entries and provide comprehensive aggregate insights.

FEEDBACK ENTRIES:
{combined}

Return ONLY a JSON object (no markdown):
{{
  "overall_sentiment": "Positive" | "Negative" | "Neutral" | "Mixed",
  "sentiment_distribution": {{
    "positive": <percentage int>,
    "negative": <percentage int>,
    "neutral": <percentage int>,
    "mixed": <percentage int>
  }},
  "top_topics": [
    {{"topic": "topic name", "count": <int>, "sentiment": "Positive|Negative|Neutral"}}
  ],
  "key_themes": ["theme1", "theme2", "theme3", "theme4", "theme5"],
  "executive_summary": "3-4 sentence business-level summary",
  "critical_issues": ["issue1", "issue2"],
  "positive_highlights": ["highlight1", "highlight2"],
  "recommended_actions": [
    {{"priority": "HIGH", "action": "specific action", "impact": "expected business impact"}},
    {{"priority": "MEDIUM", "action": "specific action", "impact": "expected business impact"}},
    {{"priority": "LOW", "action": "specific action", "impact": "expected business impact"}}
  ],
  "nps_estimate": <-100 to 100>,
  "trend": "Improving" | "Declining" | "Stable"
}}"""

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt
    )
    raw = response.text.strip()
    return _extract_json(raw)
