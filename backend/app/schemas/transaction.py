from pydantic import BaseModel
from datetime import datetime, date
from decimal import Decimal


class TransactionBase(BaseModel):
    account_id: int
    category_id: int | None = None
    amount: Decimal
    transaction_type: str  # income, expense, transfer
    description: str | None = None
    transaction_date: date
    notes: str | None = None
    tags: str | None = None


class TransactionCreate(TransactionBase):
    pass


class TransactionUpdate(BaseModel):
    account_id: int | None = None
    category_id: int | None = None
    amount: Decimal | None = None
    transaction_type: str | None = None
    description: str | None = None
    transaction_date: date | None = None
    notes: str | None = None
    tags: str | None = None


class TransactionResponse(TransactionBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class TransactionWithDetails(TransactionResponse):
    """Transaction with related account and category info"""

    account_name: str | None = None
    category_name: str | None = None
    category_icon: str | None = None


# Filter/Query schemas
class TransactionFilter(BaseModel):
    start_date: date | None = None
    end_date: date | None = None
    transaction_type: str | None = None
    category_id: int | None = None
    account_id: int | None = None
    min_amount: Decimal | None = None
    max_amount: Decimal | None = None
