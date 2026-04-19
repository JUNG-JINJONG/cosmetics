from sqlalchemy import Column, Integer, String, DECIMAL, ForeignKey, TEXT
from sqlalchemy.orm import relationship
from pgvector.sqlalchemy import Vector
from app.database import Base

class Product(Base):
    __tablename__ = "product"

    product_id = Column(Integer, primary_key=True, index=True)
    brand_id = Column(Integer, ForeignKey("brands.brand_id"), nullable=True)
    category_id = Column(Integer, nullable=True) # Category 테이블과 연결은 나중에
    sku = Column(String(100), unique=True, index=True)
    product_name = Column(TEXT, nullable=False)
    description = Column(TEXT)
    retail_price = Column(DECIMAL(12, 2))
    wholesale_base_price = Column(DECIMAL(12, 2))
    moq = Column(Integer, default=1)
    stock_quantity = Column(Integer, default=0)
    status = Column(String(50))
    sensory_attribute_vector = Column(Vector(15)) # 15차원 감각 벡터

    # 관계 설정
    brand = relationship("Brand", back_populates="products")
    colors = relationship("ColorMaster", back_populates="product", cascade="all, delete-orphan")
