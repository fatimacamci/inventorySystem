from sqlalchemy import Column, Integer, String, Date, ForeignKey, Text
from sqlalchemy.orm import relationship
from src.models.base import Base

class CheckedOutInventory(Base):
    __tablename__ = 'checked_out_inventory'

    id = Column(Integer, primary_key=True, index=True)
    dispenser_id = Column(Integer, ForeignKey('users.id'), nullable=True)
    receiver_id = Column(Integer, ForeignKey('users.id'), nullable=True)
    category_id = Column(Integer, ForeignKey('categories.id'), nullable=False)
    item_name = Column(String(255), index=True)
    pickup_date = Column(Date, nullable=True)
    return_date = Column(Date, nullable=True)
    quantity = Column(Integer, default=0)
    notes = Column(Text, nullable=True)

    dispenser = relationship("User", foreign_keys=[dispenser_id])
    receiver = relationship("User", foreign_keys=[receiver_id])
    category = relationship("Category")

    def __repr__(self):
        return f"<CheckedOutInventory(id={self.id}, item_name={self.item_name}, quantity={self.quantity})>"