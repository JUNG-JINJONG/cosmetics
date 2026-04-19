from pydantic import BaseModel
from typing import Optional, List
from app.schemas.product import Product

class BrandBase(BaseModel):
    brand_name: str
    logo_url: Optional[str] = None
    brand_desc: Optional[str] = None
    partnership_type: Optional[str] = None
    official_status: bool = False

class Brand(BrandBase):
    brand_id: int
    company_id: Optional[int]
    products: List[Product] = []

    class Config:
        from_attributes = True
