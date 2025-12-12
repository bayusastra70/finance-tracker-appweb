from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, extract
from datetime import date


from app.database import get_db
from app.models.user import User
from app.models.transaction import Transaction
from app.models.account import Account
from app.models.category import Category
from app.auth import get_current_user

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/summary")
async def get_summary(
    start_date: date | None = None,
    end_date: date | None = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get financial summary (total income, expense, balance)"""
    # Get total balance from all accounts
    balance_result = await db.execute(
        select(func.coalesce(func.sum(Account.balance), 0)).where(
            Account.user_id == current_user.id, Account.is_active.is_(True)
        )
    )
    total_balance = balance_result.scalar_one()

    # Build transaction query
    base_query = select(Transaction).where(Transaction.user_id == current_user.id)
    if start_date:
        base_query = base_query.where(Transaction.transaction_date >= start_date)
    if end_date:
        base_query = base_query.where(Transaction.transaction_date <= end_date)

    # Get income sum
    income_result = await db.execute(
        select(func.coalesce(func.sum(Transaction.amount), 0))
        .where(
            Transaction.user_id == current_user.id,
            Transaction.transaction_type == "income",
        )
        .where(Transaction.transaction_date >= start_date if start_date else True)
        .where(Transaction.transaction_date <= end_date if end_date else True)
    )
    total_income = income_result.scalar_one()

    # Get expense sum
    expense_result = await db.execute(
        select(func.coalesce(func.sum(Transaction.amount), 0))
        .where(
            Transaction.user_id == current_user.id,
            Transaction.transaction_type == "expense",
        )
        .where(Transaction.transaction_date >= start_date if start_date else True)
        .where(Transaction.transaction_date <= end_date if end_date else True)
    )
    total_expense = expense_result.scalar_one()

    # Get transaction count
    count_result = await db.execute(
        select(func.count(Transaction.id))
        .where(Transaction.user_id == current_user.id)
        .where(Transaction.transaction_date >= start_date if start_date else True)
        .where(Transaction.transaction_date <= end_date if end_date else True)
    )
    transaction_count = count_result.scalar_one()

    return {
        "total_balance": float(total_balance),
        "total_income": float(total_income),
        "total_expense": float(total_expense),
        "net_flow": float(total_income - total_expense),
        "transaction_count": transaction_count,
    }


@router.get("/by-category")
async def get_by_category(
    start_date: date | None = None,
    end_date: date | None = None,
    transaction_type: str = "expense",
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get spending breakdown by category"""
    query = (
        select(
            Category.id,
            Category.name,
            Category.icon,
            Category.color,
            func.sum(Transaction.amount).label("total"),
            func.count(Transaction.id).label("count"),
        )
        .join(Transaction, Transaction.category_id == Category.id)
        .where(
            Transaction.user_id == current_user.id,
            Transaction.transaction_type == transaction_type,
        )
        .group_by(Category.id, Category.name, Category.icon, Category.color)
        .order_by(func.sum(Transaction.amount).desc())
    )

    if start_date:
        query = query.where(Transaction.transaction_date >= start_date)
    if end_date:
        query = query.where(Transaction.transaction_date <= end_date)

    result = await db.execute(query)
    rows = result.all()

    return [
        {
            "category_id": row[0],
            "category_name": row[1],
            "icon": row[2],
            "color": row[3],
            "total": float(row[4]),
            "count": row[5],
        }
        for row in rows
    ]


@router.get("/trends")
async def get_trends(
    year: int = Query(default=None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get monthly income/expense trends for a year"""
    if year is None:
        year = date.today().year

    query = (
        select(
            extract("month", Transaction.transaction_date).label("month"),
            Transaction.transaction_type,
            func.sum(Transaction.amount).label("total"),
        )
        .where(
            Transaction.user_id == current_user.id,
            extract("year", Transaction.transaction_date) == year,
        )
        .group_by(
            extract("month", Transaction.transaction_date), Transaction.transaction_type
        )
        .order_by(extract("month", Transaction.transaction_date))
    )

    result = await db.execute(query)
    rows = result.all()

    # Organize by month
    months_data = {i: {"month": i, "income": 0.0, "expense": 0.0} for i in range(1, 13)}

    for row in rows:
        month = int(row[0])
        tx_type = row[1]
        total = float(row[2])

        if tx_type == "income":
            months_data[month]["income"] = total
        elif tx_type == "expense":
            months_data[month]["expense"] = total

    return list(months_data.values())
