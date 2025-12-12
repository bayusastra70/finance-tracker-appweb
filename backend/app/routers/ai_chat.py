"""
AI Chat Router - API endpoints for AI assistant
"""

from typing import Optional
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException

from app.auth import get_current_user
from app.models.user import User
from app.ai.agent import get_financial_agent


router = APIRouter(prefix="/ai", tags=["AI Assistant"])


class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None


class ChatResponse(BaseModel):
    response: str
    session_id: str


class CategorySuggestionRequest(BaseModel):
    description: str


class CategorySuggestionResponse(BaseModel):
    suggested_category: str
    confidence: float
    matched_keyword: Optional[str] = None


@router.post("/chat", response_model=ChatResponse)
async def chat_with_assistant(
    request: ChatRequest, current_user: User = Depends(get_current_user)
):
    """
    Chat with the financial AI assistant.

    The assistant can:
    - Provide financial summaries
    - Analyze spending by category
    - Show recent transactions
    - Suggest categories for transactions
    - Show account balances
    """
    try:
        agent = get_financial_agent()

        # Generate session ID if not provided
        session_id = (
            request.session_id
            or f"user_{current_user.id}_{hash(request.message) % 10000}"
        )

        # Run the agent (async)
        response = await agent.arun(request.message)

        # Extract response content
        response_text = (
            response.content if hasattr(response, "content") else str(response)
        )

        return ChatResponse(response=response_text, session_id=session_id)
    except Exception as e:
        import traceback

        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"AI assistant error: {str(e)}")


@router.post("/suggest-category", response_model=CategorySuggestionResponse)
async def suggest_transaction_category(
    request: CategorySuggestionRequest, current_user: User = Depends(get_current_user)
):
    """
    Suggest a category for a transaction based on its description.
    Uses keyword matching for fast categorization.
    """
    description_lower = request.description.lower()

    category_keywords = {
        "Food & Drinks": [
            "makan",
            "food",
            "restaurant",
            "cafe",
            "kopi",
            "coffee",
            "lunch",
            "dinner",
            "breakfast",
            "gofood",
            "grabfood",
        ],
        "Transportation": [
            "grab",
            "gojek",
            "taxi",
            "bensin",
            "fuel",
            "parkir",
            "tol",
            "transport",
        ],
        "Shopping": [
            "belanja",
            "shop",
            "beli",
            "tokopedia",
            "shopee",
            "lazada",
            "amazon",
        ],
        "Bills & Utilities": [
            "listrik",
            "air",
            "internet",
            "pulsa",
            "bills",
            "pln",
            "pdam",
        ],
        "Entertainment": ["netflix", "spotify", "game", "movie", "bioskop", "hiburan"],
        "Healthcare": ["obat", "dokter", "rumah sakit", "apotek", "health", "medical"],
        "Salary": ["gaji", "salary", "income", "bonus", "pendapatan"],
        "Investment": ["investasi", "saham", "reksadana", "crypto", "investment"],
    }

    for category, keywords in category_keywords.items():
        for keyword in keywords:
            if keyword in description_lower:
                return CategorySuggestionResponse(
                    suggested_category=category, confidence=0.8, matched_keyword=keyword
                )

    return CategorySuggestionResponse(
        suggested_category="Other", confidence=0.3, matched_keyword=None
    )


@router.get("/insights")
async def get_financial_insights(current_user: User = Depends(get_current_user)):
    """
    Get AI-generated financial insights.
    """
    try:
        agent = get_financial_agent()

        prompt = """
        Berdasarkan data keuangan user, berikan 3 insight penting:
        1. Ringkasan kondisi keuangan saat ini
        2. Kategori dengan pengeluaran tertinggi
        3. Satu rekomendasi untuk meningkatkan kesehatan keuangan
        
        Format dalam Bahasa Indonesia yang mudah dipahami.
        """

        response = await agent.arun(prompt)
        response_text = (
            response.content if hasattr(response, "content") else str(response)
        )

        return {"insights": response_text}
    except Exception as e:
        import traceback

        traceback.print_exc()
        raise HTTPException(
            status_code=500, detail=f"Failed to generate insights: {str(e)}"
        )
