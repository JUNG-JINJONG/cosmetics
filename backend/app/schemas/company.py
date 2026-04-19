from pydantic import BaseModel, EmailStr
from typing import Optional, Dict, Any, List
from datetime import datetime
from app.schemas.brand import Brand
from app.schemas.product import Product

class CompanyBase(BaseModel):
    company_name: str
    business_number: str
    ceo_name: Optional[str] = None
    address: Optional[str] = None
    factory_address: Optional[str] = None
    contact_phone: Optional[str] = None
    contact_email: Optional[EmailStr] = None
    company_type: Optional[str] = None
    specialty: Optional[str] = None
    certifications: Optional[Dict[str, Any]] = None

class CompanyCreate(CompanyBase):
    pass

class CompanyUpdate(BaseModel):
    company_name: Optional[str] = None
    ceo_name: Optional[str] = None
    address: Optional[str] = None
    contact_phone: Optional[str] = None
    contact_email: Optional[EmailStr] = None
    is_verified: Optional[bool] = None

class Company(CompanyBase):
    company_id: int
    is_verified: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
        # Pydantic v2에서는 orm_mode 대신 from_attributes를 사용합니다.

class CompanyShowroom(Company):
    brands: List[Brand] = []
