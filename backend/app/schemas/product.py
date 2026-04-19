from pydantic import BaseModel
from typing import Optional, List
from decimal import Decimal

class ProductBase(BaseModel):
    product_name: str
    sku: Optional[str] = None
    description: Optional[str] = None
    retail_price: Optional[Decimal] = None
    wholesale_base_price: Optional[Decimal] = None
    moq: Optional[int] = 1
    stock_quantity: Optional[int] = 0
    status: Optional[str] = "Development"

class ProductCreate(ProductBase):
    brand_id: Optional[int] = None
    category_id: Optional[int] = None

class ProductUpdate(BaseModel):
    product_name: Optional[str] = None
    sku: Optional[str] = None
    description: Optional[str] = None
    retail_price: Optional[Decimal] = None
    wholesale_base_price: Optional[Decimal] = None
    moq: Optional[int] = None
    stock_quantity: Optional[int] = None
    status: Optional[str] = None

class Product(ProductBase):
    product_id: int
    brand_id: Optional[int] = None
    category_id: Optional[int] = None

    class Config:
        from_attributes = True
