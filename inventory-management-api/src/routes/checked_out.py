from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from sqlalchemy.orm import Session

from src.database import get_db
from src.schemas import CheckedOutCreate, CheckedOutRead
from src.models.checked_out_inventory import CheckedOutInventory
from src.models.item import Item

router = APIRouter()

@router.get("/", response_model=List[CheckedOutRead])
def read_checked_out(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(CheckedOutInventory).offset(skip).limit(limit).all()

@router.post("/", response_model=CheckedOutRead, status_code=status.HTTP_201_CREATED)
def create_checked_out(payload: CheckedOutCreate, db: Session = Depends(get_db)):
    db_item = CheckedOutInventory(
        item_name=payload.item_name,
        category_id=payload.category_id,
        quantity=payload.quantity,
        pickup_date=payload.pickup_date,
        return_date=payload.return_date,
        dispenser_id=payload.dispenser_id,
        receiver_id=payload.receiver_id,
        notes=payload.notes,
    )
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.delete("/{checked_out_id}", response_model=CheckedOutRead)
def delete_item(checked_out_id: int, db: Session = Depends(get_db)):
    db_item = db.query(CheckedOutInventory).filter(CheckedOutInventory.id == checked_out_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")

    # Find matching item (by item_name and category_id)
    item = db.query(Item).filter(
        Item.item_name == db_item.item_name,
        Item.category_id == db_item.category_id
    ).first()
    if item:
        item.quantity += db_item.quantity
        db.commit()
    else:
        # Recreate the item if it was deleted (all quantity checked out)
        new_item = Item(
            item_name=db_item.item_name,
            category_id=db_item.category_id,
            quantity=db_item.quantity,
            notes=db_item.notes,
            pickup_date=None,
            return_date=None,
            dispenser_id=None,
            receiver_id=None,
        )
        db.add(new_item)
        db.commit()

    db.delete(db_item)
    db.commit()
    return db_item