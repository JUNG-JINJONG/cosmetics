from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# --- Insight Report Schemas ---
class InsightReportBase(BaseModel):
    title: str
    insight_pillars_code: Optional[str] = None
    summary: Optional[str] = None
    content_body: Optional[str] = None
    cover_image_url: Optional[str] = None

class InsightReportCreate(InsightReportBase):
    pass

class InsightReportUpdate(BaseModel):
    title: Optional[str] = None
    insight_pillars_code: Optional[str] = None
    summary: Optional[str] = None
    content_body: Optional[str] = None
    cover_image_url: Optional[str] = None

class InsightReportRead(InsightReportBase):
    report_id: int
    view_count: int
    published_at: datetime
    created_at: datetime
    class Config:
        from_attributes = True

# --- Trend Keyword Schemas ---
class TrendKeywordBase(BaseModel):
    keyword: str
    trend_type_code: Optional[str] = None
    trend_score: Optional[int] = 0
    summary: Optional[str] = None
    related_ingredient_ids: Optional[List[int]] = []
    related_product_ids: Optional[List[int]] = []

class TrendKeywordCreate(TrendKeywordBase):
    trend_vector: Optional[List[float]] = None

class TrendKeywordUpdate(BaseModel):
    keyword: Optional[str] = None
    trend_type_code: Optional[str] = None
    trend_score: Optional[int] = None
    summary: Optional[str] = None
    related_ingredient_ids: Optional[List[int]] = None
    related_product_ids: Optional[List[int]] = None
    trend_vector: Optional[List[float]] = None

class TrendKeywordRead(TrendKeywordBase):
    keyword_id: int
    created_at: datetime
    class Config:
        from_attributes = True

# --- Market Statistics Schemas ---
class MarketStatisticsBase(BaseModel):
    stat_type: str
    target_region: Optional[str] = None
    target_category: Optional[str] = None
    period: str
    data_json: dict 
    description: Optional[str] = None

class MarketStatisticsCreate(MarketStatisticsBase):
    pass

class MarketStatisticsUpdate(BaseModel):
    stat_type: Optional[str] = None
    target_region: Optional[str] = None
    target_category: Optional[str] = None
    period: Optional[str] = None
    data_json: Optional[dict] = None
    description: Optional[str] = None

class MarketStatisticsRead(MarketStatisticsBase):
    stat_id: int
    created_at: datetime
    class Config:
        from_attributes = True
