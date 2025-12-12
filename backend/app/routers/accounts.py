from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.models.user import User
from app.models.account import Account
from app.schemas.account import AccountCreate, AccountUpdate, AccountResponse
from app.auth import get_current_user

router = APIRouter(prefix="/accounts", tags=["Accounts"])


@router.get("/", response_model=list[AccountResponse])
async def get_accounts(
    current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)
):
    """Get all accounts for current user"""
    result = await db.execute(
        select(Account)
        .where(Account.user_id == current_user.id)
        .order_by(Account.created_at.desc())
    )
    return result.scalars().all()


@router.get("/{account_id}", response_model=AccountResponse)
async def get_account(
    account_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get a specific account"""
    result = await db.execute(
        select(Account).where(
            Account.id == account_id, Account.user_id == current_user.id
        )
    )
    account = result.scalar_one_or_none()

    if not account:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Account not found"
        )

    return account


@router.post("/", response_model=AccountResponse, status_code=status.HTTP_201_CREATED)
async def create_account(
    account_data: AccountCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new account"""
    account = Account(user_id=current_user.id, **account_data.model_dump())
    db.add(account)
    await db.commit()
    await db.refresh(account)
    return account


@router.put("/{account_id}", response_model=AccountResponse)
async def update_account(
    account_id: int,
    account_data: AccountUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update an account"""
    result = await db.execute(
        select(Account).where(
            Account.id == account_id, Account.user_id == current_user.id
        )
    )
    account = result.scalar_one_or_none()

    if not account:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Account not found"
        )

    update_data = account_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(account, field, value)

    await db.commit()
    await db.refresh(account)
    return account


@router.delete("/{account_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_account(
    account_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete an account"""
    result = await db.execute(
        select(Account).where(
            Account.id == account_id, Account.user_id == current_user.id
        )
    )
    account = result.scalar_one_or_none()

    if not account:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Account not found"
        )

    await db.delete(account)
    await db.commit()
