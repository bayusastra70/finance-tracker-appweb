from pydantic import BaseModel
from datetime import datetime
from decimal import Decimal


class AccountBase(BaseModel):
    name: str
    account_type: str  # cash, bank, e-wallet, credit_card
    balance: Decimal = Decimal("0.00")
    currency: str = "IDR"
    icon: str | None = None
    color: str | None = None


class AccountCreate(AccountBase):
    pass


class AccountUpdate(BaseModel):
    name: str | None = None
    account_type: str | None = None
    balance: Decimal | None = None
    currency: str | None = None
    icon: str | None = None
    color: str | None = None
    is_active: bool | None = None


class AccountResponse(AccountBase):
    id: int
    user_id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
