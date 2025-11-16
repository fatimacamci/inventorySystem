from __future__ import annotations
from typing import Optional
from datetime import date
from pydantic import BaseModel

# Pydantic v2 compatible model config
base_model_config = {"from_attributes": True}

class UserCreate(BaseModel):
    first_name: str
    last_name: str

class UserRead(BaseModel):
    id: int
    first_name: str
    last_name: str

    model_config = base_model_config

class CategoryCreate(BaseModel):
    val: str

class CategoryRead(BaseModel):
    id: int
    val: str

    model_config = base_model_config

class ItemBase(BaseModel):
    item_name: str
    category_id: int
    quantity: int
    pickup_date: Optional[date] = None
    return_date: Optional[date] = None
    dispenser_id: Optional[int] = None
    receiver_id: Optional[int] = None
    notes: Optional[str] = None

class ItemCreate(ItemBase):
    pass

class ItemRead(ItemBase):
    id: int

    model_config = base_model_config

# Reuse for inventory / checked out
InventoryCreate = ItemCreate
InventoryRead = ItemRead
CheckedOutCreate = ItemCreate
CheckedOutRead = ItemRead