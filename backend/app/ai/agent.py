"""
Financial AI Agent using Agno Framework
"""

from typing import Optional
from datetime import datetime, date, timedelta
from decimal import Decimal

from agno.agent import Agent
from agno.models.nvidia import Nvidia
from agno.tools.duckduckgo import DuckDuckGoTools
from agno.tools.yfinance import YFinanceTools
from agno.tools import tool

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.transaction import Transaction
from app.models.account import Account
from app.models.category import Category
from app.database import async_session_maker
import os
from dotenv import load_dotenv

load_dotenv()


# Define tools for the financial agent
@tool
async def get_financial_summary(
    start_date: Optional[str] = None, end_date: Optional[str] = None
) -> dict:
    """
    Get financial summary including total balance, income, expense, and net flow.

    Args:
        start_date: Start date in YYYY-MM-DD format (optional)
        end_date: End date in YYYY-MM-DD format (optional)

    Returns:
        Dictionary with financial summary
    """
    async with async_session_maker() as db:
        # Get total balance from all accounts
        balance_result = await db.execute(select(func.sum(Account.balance)))
        total_balance = balance_result.scalar() or Decimal("0")

        # Build transaction query
        query = select(Transaction)

        if start_date:
            query = query.where(
                Transaction.transaction_date >= date.fromisoformat(start_date)
            )
        if end_date:
            query = query.where(
                Transaction.transaction_date <= date.fromisoformat(end_date)
            )

        result = await db.execute(query)
        transactions = result.scalars().all()

        total_income = sum(
            t.amount for t in transactions if t.transaction_type == "income"
        )
        total_expense = sum(
            t.amount for t in transactions if t.transaction_type == "expense"
        )

        return {
            "total_balance": float(total_balance),
            "total_income": float(total_income),
            "total_expense": float(total_expense),
            "net_flow": float(total_income - total_expense),
            "transaction_count": len(transactions),
        }


@tool
async def get_spending_by_category(
    transaction_type: str = "expense",
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
) -> list:
    """
    Get spending breakdown by category.

    Args:
        transaction_type: Type of transaction ('income' or 'expense')
        start_date: Start date in YYYY-MM-DD format (optional)
        end_date: End date in YYYY-MM-DD format (optional)

    Returns:
        List of categories with total amounts
    """
    async with async_session_maker() as db:
        query = (
            select(
                Category.name,
                func.sum(Transaction.amount).label("total"),
                func.count(Transaction.id).label("count"),
            )
            .join(Transaction.category)
            .where(Transaction.transaction_type == transaction_type)
            .group_by(Category.id, Category.name)
            .order_by(func.sum(Transaction.amount).desc())
        )

        if start_date:
            query = query.where(
                Transaction.transaction_date >= date.fromisoformat(start_date)
            )
        if end_date:
            query = query.where(
                Transaction.transaction_date <= date.fromisoformat(end_date)
            )

        result = await db.execute(query)
        rows = result.all()

        return [
            {"category": row.name, "total": float(row.total), "count": row.count}
            for row in rows
        ]


@tool
async def get_recent_transactions(limit: int = 10) -> list:
    """
    Get recent transactions.

    Args:
        limit: Maximum number of transactions to return (default 10)

    Returns:
        List of recent transactions
    """
    async with async_session_maker() as db:
        query = (
            select(Transaction)
            .order_by(
                Transaction.transaction_date.desc(), Transaction.created_at.desc()
            )
            .limit(limit)
        )

        result = await db.execute(query)
        transactions = result.scalars().all()

        return [
            {
                "id": t.id,
                "amount": float(t.amount),
                "type": t.transaction_type,
                "description": t.description,
                "date": t.transaction_date.isoformat(),
            }
            for t in transactions
        ]


@tool
async def suggest_category(description: str) -> dict:
    """
    Suggest a category for a transaction based on its description.

    Args:
        description: Transaction description

    Returns:
        Suggested category with confidence
    """
    # Simple keyword-based categorization
    description_lower = description.lower()

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
                return {
                    "suggested_category": category,
                    "confidence": 0.8,
                    "matched_keyword": keyword,
                }

    return {"suggested_category": "Other", "confidence": 0.3, "matched_keyword": None}


@tool
async def get_accounts_balance() -> list:
    """
    Get all accounts with their current balances.

    Returns:
        List of accounts with balances
    """
    async with async_session_maker() as db:
        result = await db.execute(select(Account).where(Account.is_active.is_(True)))
        accounts = result.scalars().all()

        return [
            {
                "id": a.id,
                "name": a.name,
                "type": a.account_type,
                "balance": float(a.balance),
                "currency": a.currency,
            }
            for a in accounts
        ]


def create_financial_agent(user_id: int = None) -> Agent:
    """
    Create a financial assistant agent.

    Args:
        user_id: Optional user ID for personalized responses

    Returns:
        Configured Agno Agent
    """
    instructions = """
    Kamu adalah Financial Assistant AI yang membantu user mengelola keuangan mereka.
    
    Kemampuanmu:
    1. Melihat ringkasan keuangan (total balance, income, expense)
    2. Menganalisis pengeluaran berdasarkan kategori
    3. Menyarankan kategori untuk transaksi baru
    4. Melihat transaksi terbaru
    5. Melihat saldo semua akun
    
    Panduan:
    - Selalu gunakan Bahasa Indonesia dalam menjawab
    - Format angka dalam Rupiah (contoh: Rp 1.500.000)
    - Berikan insights yang actionable
    - Jika diminta analisis, berikan rekomendasi
    
    Contoh format mata uang: Rp 1.500.000 (bukan Rp1500000)
    """

    agent = Agent(
        name="Financial Assistant",
        model=Nvidia(id=os.getenv("MODEL_ID"), api_key=os.getenv("NVIDIA_API_KEY")),
        instructions=instructions,
        tools=[
            get_financial_summary,
            get_spending_by_category,
            get_recent_transactions,
            suggest_category,
            get_accounts_balance,
            DuckDuckGoTools(),
            YFinanceTools(),
        ],
        markdown=True,
    )

    return agent


# Singleton agent instance
_financial_agent: Optional[Agent] = None


def get_financial_agent() -> Agent:
    """Get or create the financial agent singleton."""
    global _financial_agent
    if _financial_agent is None:
        _financial_agent = create_financial_agent()
    return _financial_agent
