from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from sqlalchemy.orm import Session

from src.database import get_db
from src.schemas import CategoryCreate, CategoryRead
from src.models.category import Category

router = APIRouter()

@router.get("/", response_model=List[CategoryRead])
def read_categories(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(Category).offset(skip).limit(limit).all()

@router.post("/", response_model=CategoryRead, status_code=status.HTTP_201_CREATED)
def create_category(category: CategoryCreate, db: Session = Depends(get_db)):
    db_category = Category(val=category.val)
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category