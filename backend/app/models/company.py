from sqlalchemy import Column, Integer, String, Boolean, JSON, DateTime, func, TEXT
from sqlalchemy.orm import relationship
from app.database import Base

class Company(Base):
    __tablename__ = "company"

    company_id = Column(Integer, primary_key=True, index=True)
    company_name = Column(String(255), nullable=False)
    business_number = Column(String(50), unique=True, nullable=False, index=True)
    ceo_name = Column(String(100))
    address = Column(String)
    factory_address = Column(String)
    contact_phone = Column(String(50))
    contact_email = Column(String(255))
    company_type = Column(String(50)) # '제조사(OEM/ODM)', '브랜드사', '원료사'
    specialty = Column(String(255))
    certifications = Column(JSON)
    logo_url = Column(String(500))
    banner_image_url = Column(String(500))
    introduction = Column(TEXT)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # 관계 설정
    brands = relationship("Brand", back_populates="company")
