from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime
from sqlalchemy.sql import func
from app.database import Base

class CompanyUser(Base):
    __tablename__ = "company_user"

    company_user_id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("company.company_id", ondelete="SET NULL"), nullable=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    name = Column(String(100), nullable=False)
    dept_code = Column(String(20))
    position = Column(String(100))
    specialty_area = Column(String(255))
    phone = Column(String(50))
    permission_role = Column(String(50), default="Staff")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
