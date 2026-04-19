from sqlalchemy import Column, Integer, String, DateTime, Text, ARRAY
from sqlalchemy.sql import func
from pgvector.sqlalchemy import Vector
from app.database import Base

class InsightReport(Base):
    __tablename__ = "insight_reports"

    report_id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    insight_pillars_code = Column(String(20))
    summary = Column(Text)
    content_body = Column(Text)
    cover_image_url = Column(Text)
    view_count = Column(Integer, default=0)
    published_at = Column(DateTime(timezone=True), server_default=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class TrendKeyword(Base):
    __tablename__ = "trend_keywords"

    keyword_id = Column(Integer, primary_key=True, index=True)
    keyword = Column(String(100), nullable=False)
    trend_type_code = Column(String(10))
    trend_score = Column(Integer, default=0)
    trend_vector = Column(Vector(1536))
    summary = Column(Text)
    related_ingredient_ids = Column(ARRAY(Integer))
    related_product_ids = Column(ARRAY(Integer))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class MarketStatistics(Base):
    __tablename__ = "market_statistics"

    stat_id = Column(Integer, primary_key=True, index=True)
    stat_type = Column(String(50), nullable=False)
    target_region = Column(String(50))
    target_category = Column(String(50))
    period = Column(String(20), nullable=False)
    data_json = Column(Text) # JSONB가 편하지만 현재 Base 호환성을 위해 Text/JSON 처리 (PostgreSQL 사용 시 JSONB 추천)
    description = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
