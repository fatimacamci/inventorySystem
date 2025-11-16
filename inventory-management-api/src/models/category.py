from sqlalchemy import Column, Integer, String
from src.models.base import Base

class Category(Base):
    __tablename__ = 'categories'

    id = Column(Integer, primary_key=True, index=True)
    val = Column(String(255), unique=True, index=True)

    def __repr__(self):
        return f"<Category(id={self.id}, val={self.val})>"