from sqlalchemy import Column, Integer, String, Text, Numeric, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class PartnerRating(Base):
    __tablename__ = "partner_ratings"

    rating_id = Column(Integer, primary_key=True, index=True)
    target_company_id = Column(Integer, ForeignKey("company.company_id", ondelete="CASCADE"))
    reviewer_buyer_id = Column(Integer, ForeignKey("buyer.buyer_id", ondelete="SET NULL"))
    score = Column(Numeric(2, 1), nullable=False)
    review_text = Column(Text)
    evaluation_criteria = Column(JSON) # {"quality": 5, "communication": 4, "delivery": 5}
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # 관계 설정
    company = relationship("Company", backref="ratings")
    reviewer = relationship("User", backref="given_ratings")
