from sqlalchemy import Column, Integer, String, Text, DateTime
from pgvector.sqlalchemy import Vector
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class Ingredient(Base):
    __tablename__ = "ingredients"

    ingredient_id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    inci_name = Column(String(255))
    cas_no = Column(String(50))
    function = Column(Text)
    ewg_grade = Column(String(10))
    sensory_attribute_vector = Column(Vector(15))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    efficacies = relationship("IngredientEfficacy", back_populates="ingredient")
