from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class CompanyUserBase(BaseModel):
    company_id: Optional[int] = None
    email: EmailStr
    name: str
    dept_code: Optional[str] = None
    position: Optional[str] = None
    specialty_area: Optional[str] = None
    phone: Optional[str] = None
    permission_role: Optional[str] = "Staff"
    is_active: Optional[bool] = True

class CompanyUserCreate(CompanyUserBase):
    password: str

class CompanyUserUpdate(BaseModel):
    name: Optional[str] = None
    dept_code: Optional[str] = None
    position: Optional[str] = None
    specialty_area: Optional[str] = None
    phone: Optional[str] = None
    permission_role: Optional[str] = None
    is_active: Optional[bool] = None
    password: Optional[str] = None

class CompanyUser(CompanyUserBase):
    company_user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
