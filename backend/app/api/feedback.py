from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services import feedback_service
from app.core.database import get_db

router = APIRouter()


class FeedbackItem(BaseModel):
    text: str
    source: Optional[str] = "manual"
    category: Optional[str] = None


class BulkFeedbackRequest(BaseModel):
    feedbacks: List[str]


# In-memory store (fallback if MongoDB not available)
_memory_store: List[dict] = []


def get_collection():
    try:
        db = get_db()
        db.command("ping")
        return db["feedbacks"]
    except Exception:
        return None


@router.post("/submit")
def submit_feedback(item: FeedbackItem):
    """Submit and analyze a single feedback."""
    if not item.text.strip():
        raise HTTPException(status_code=400, detail="Feedback text cannot be empty.")

    try:
        analysis = feedback_service.analyze_single_feedback(item.text, item.category)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

    doc = {
        "id": str(len(_memory_store) + 1),
        "text": item.text,
        "source": item.source,
        "submitted_at": datetime.utcnow().isoformat(),
        **analysis
    }

    # Try MongoDB first, fall back to memory
    col = get_collection()
    if col is not None:
        result = col.insert_one({**doc})
        doc["_id"] = str(result.inserted_id)
    else:
        _memory_store.append(doc)

    return {"success": True, "feedback_id": doc["id"], "analysis": analysis}


@router.post("/bulk-analyze")
def bulk_analyze(request: BulkFeedbackRequest):
    """Analyze multiple feedbacks at once and get aggregate insights."""
    if not request.feedbacks:
        raise HTTPException(status_code=400, detail="No feedbacks provided.")
    if len(request.feedbacks) > 50:
        raise HTTPException(status_code=400, detail="Max 50 feedbacks per request.")

    try:
        insights = feedback_service.bulk_analyze_feedback(request.feedbacks)

        # Also store individually in memory
        for text in request.feedbacks:
            _memory_store.append({"text": text, "submitted_at": datetime.utcnow().isoformat(), "source": "bulk"})

        return {"success": True, "count": len(request.feedbacks), "insights": insights}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Bulk analysis failed: {str(e)}")


@router.get("/list")
def list_feedbacks(limit: int = 50):
    """Get all submitted feedbacks."""
    col = get_collection()
    if col is not None:
        items = list(col.find({}, {"_id": 0}).sort("submitted_at", -1).limit(limit))
    else:
        items = _memory_store[-limit:][::-1]
    return {"feedbacks": items, "count": len(items)}


@router.get("/stats")
def get_stats():
    """Get aggregate statistics."""
    col = get_collection()
    if col is not None:
        items = list(col.find({}, {"_id": 0}))
    else:
        items = _memory_store

    if not items:
        return {"total": 0, "sentiment_distribution": {}, "top_topics": [], "avg_score": 0}

    sentiments = {}
    topics = {}
    scores = []

    for item in items:
        s = item.get("sentiment", "Unknown")
        sentiments[s] = sentiments.get(s, 0) + 1
        for t in item.get("topics", []):
            topics[t] = topics.get(t, 0) + 1
        if "sentiment_score" in item:
            scores.append(item["sentiment_score"])

    top_topics = sorted(topics.items(), key=lambda x: x[1], reverse=True)[:10]

    return {
        "total": len(items),
        "sentiment_distribution": sentiments,
        "top_topics": [{"topic": t, "count": c} for t, c in top_topics],
        "avg_sentiment_score": round(sum(scores) / len(scores), 2) if scores else 0
    }


@router.delete("/clear")
def clear_all():
    """Clear all feedbacks (for demo purposes)."""
    global _memory_store
    _memory_store = []
    col = get_collection()
    if col is not None:
        col.delete_many({})
    return {"success": True, "message": "All feedbacks cleared."}
