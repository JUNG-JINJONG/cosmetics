from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, TEXT
from sqlalchemy.orm import relationship
from app.database import Base

class Brand(Base):
    __tablename__ = "brands"

    brand_id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("company.company_id"), nullable=True)
    brand_name = Column(String(255), nullable=False)
    logo_url = Column(TEXT)
    brand_desc = Column(TEXT)
    partnership_type = Column(String(100))
    official_status = Column(Boolean, default=False)
    
    # 관계 설정
    company = relationship("Company", back_populates="brands")
    products = relationship("Product", back_populates="brand")
