from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import date

from app.database import get_db
from app.models.user import User
from app.models.transaction import Transaction
from app.models.account import Account
from app.models.category import Category
from app.schemas.transaction import (
    TransactionCreate,
    TransactionUpdate,
    TransactionResponse,
    TransactionWithDetails,
)
from app.auth import get_current_user

router = APIRouter(prefix="/transactions", tags=["Transactions"])


@router.get("/", response_model=list[TransactionWithDetails])
async def get_transactions(
    start_date: date | None = None,
    end_date: date | None = None,
    transaction_type: str | None = None,
    category_id: int | None = None,
    account_id: int | None = None,
    limit: int = Query(default=50, le=100),
    offset: int = 0,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get all transactions with filters"""
    query = (
        select(
            Transaction,
            Account.name.label("account_name"),
            Category.name.label("category_name"),
            Category.icon.label("category_icon"),
        )
        .join(Account, Transaction.account_id == Account.id)
        .outerjoin(Category, Transaction.category_id == Category.id)
        .where(Transaction.user_id == current_user.id)
    )

    # Apply filters
    if start_date:
        query = query.where(Transaction.transaction_date >= start_date)
    if end_date:
        query = query.where(Transaction.transaction_date <= end_date)
    if transaction_type:
        query = query.where(Transaction.transaction_type == transaction_type)
    if category_id:
        query = query.where(Transaction.category_id == category_id)
    if account_id:
        query = query.where(Transaction.account_id == account_id)

    query = query.order_by(
        Transaction.transaction_date.desc(), Transaction.created_at.desc()
    )
    query = query.limit(limit).offset(offset)

    result = await db.execute(query)
    rows = result.all()

    transactions = []
    for row in rows:
        tx = row[0]
        transactions.append(
            TransactionWithDetails(
                id=tx.id,
                user_id=tx.user_id,
                account_id=tx.account_id,
                category_id=tx.category_id,
                amount=tx.amount,
                transaction_type=tx.transaction_type,
                description=tx.description,
                transaction_date=tx.transaction_date,
                notes=tx.notes,
                tags=tx.tags,
                created_at=tx.created_at,
                updated_at=tx.updated_at,
                account_name=row[1],
                category_name=row[2],
                category_icon=row[3],
            )
        )

    return transactions


@router.get("/{transaction_id}", response_model=TransactionResponse)
async def get_transaction(
    transaction_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get a specific transaction"""
    result = await db.execute(
        select(Transaction).where(
            Transaction.id == transaction_id, Transaction.user_id == current_user.id
        )
    )
    transaction = result.scalar_one_or_none()

    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found"
        )

    return transaction


@router.post(
    "/", response_model=TransactionResponse, status_code=status.HTTP_201_CREATED
)
async def create_transaction(
    transaction_data: TransactionCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new transaction and update account balance"""
    # Verify account belongs to user
    result = await db.execute(
        select(Account).where(
            Account.id == transaction_data.account_id,
            Account.user_id == current_user.id,
        )
    )
    account = result.scalar_one_or_none()

    if not account:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Account not found"
        )

    # Create transaction
    transaction = Transaction(user_id=current_user.id, **transaction_data.model_dump())
    db.add(transaction)

    # Update account balance
    if transaction_data.transaction_type == "income":
        account.balance += transaction_data.amount
    elif transaction_data.transaction_type == "expense":
        account.balance -= transaction_data.amount

    await db.commit()
    await db.refresh(transaction)
    return transaction


@router.put("/{transaction_id}", response_model=TransactionResponse)
async def update_transaction(
    transaction_id: int,
    transaction_data: TransactionUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update a transaction"""
    result = await db.execute(
        select(Transaction).where(
            Transaction.id == transaction_id, Transaction.user_id == current_user.id
        )
    )
    transaction = result.scalar_one_or_none()

    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found"
        )

    # Get account to update balance
    account_result = await db.execute(
        select(Account).where(Account.id == transaction.account_id)
    )
    account = account_result.scalar_one()

    # Reverse old transaction effect on balance
    if transaction.transaction_type == "income":
        account.balance -= transaction.amount
    elif transaction.transaction_type == "expense":
        account.balance += transaction.amount

    # Apply update
    update_data = transaction_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(transaction, field, value)

    # Apply new transaction effect on balance
    if transaction.transaction_type == "income":
        account.balance += transaction.amount
    elif transaction.transaction_type == "expense":
        account.balance -= transaction.amount

    await db.commit()
    await db.refresh(transaction)
    return transaction


@router.delete("/{transaction_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_transaction(
    transaction_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a transaction and update account balance"""
    result = await db.execute(
        select(Transaction).where(
            Transaction.id == transaction_id, Transaction.user_id == current_user.id
        )
    )
    transaction = result.scalar_one_or_none()

    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found"
        )

    # Get account to update balance
    account_result = await db.execute(
        select(Account).where(Account.id == transaction.account_id)
    )
    account = account_result.scalar_one()

    # Reverse transaction effect on balance
    if transaction.transaction_type == "income":
        account.balance -= transaction.amount
    elif transaction.transaction_type == "expense":
        account.balance += transaction.amount

    await db.delete(transaction)
    await db.commit()
