from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import feedback

app = FastAPI(
    title="Feedback Intelligence System",
    description="NLP-powered customer feedback analysis platform",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://localhost:5175",
    ],
    allow_origin_regex=r"https://feedback-intelligence.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(feedback.router, prefix="/api/feedback", tags=["Feedback"])


@app.get("/")
def root():
    return {"message": "Feedback Intelligence System API", "status": "running"}
