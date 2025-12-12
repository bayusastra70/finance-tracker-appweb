from pydantic import BaseModel
from datetime import datetime


class CategoryBase(BaseModel):
    name: str
    category_type: str  # income, expense
    icon: str | None = None
    color: str | None = None


class CategoryCreate(CategoryBase):
    pass


class CategoryUpdate(BaseModel):
    name: str | None = None
    category_type: str | None = None
    icon: str | None = None
    color: str | None = None


class CategoryResponse(CategoryBase):
    id: int
    user_id: int | None
    is_default: bool
    created_at: datetime

    class Config:
        from_attributes = True
