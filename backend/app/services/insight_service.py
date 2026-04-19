from sqlalchemy.orm import Session
from app.models.insight import InsightReport, TrendKeyword, MarketStatistics
from app.schemas.insight import (
    InsightReportCreate, InsightReportUpdate,
    TrendKeywordCreate, TrendKeywordUpdate,
    MarketStatisticsCreate, MarketStatisticsUpdate
)
from typing import List, Optional
import json

class InsightService:
    # --- 1. Insight Reports ---
    def create_report(self, db: Session, report_in: InsightReportCreate):
        db_report = InsightReport(**report_in.model_dump())
        db.add(db_report)
        db.commit()
        db.refresh(db_report)
        return db_report

    def get_reports(self, db: Session, skip: int = 0, limit: int = 100):
        return db.query(InsightReport).order_by(InsightReport.published_at.desc()).offset(skip).limit(limit).all()

    def update_report(self, db: Session, report_id: int, update_in: InsightReportUpdate):
        db_report = db.query(InsightReport).filter(InsightReport.report_id == report_id).first()
        if db_report:
            for key, value in update_in.model_dump(exclude_unset=True).items():
                setattr(db_report, key, value)
            db.commit()
            db.refresh(db_report)
        return db_report

    def delete_report(self, db: Session, report_id: int):
        db_report = db.query(InsightReport).filter(InsightReport.report_id == report_id).first()
        if db_report:
            db.delete(db_report)
            db.commit()
            return True
        return False

    # --- 2. Trend Keywords ---
    def create_trend_keyword(self, db: Session, trend_in: TrendKeywordCreate):
        db_trend = TrendKeyword(**trend_in.model_dump())
        db.add(db_trend)
        db.commit()
        db.refresh(db_trend)
        return db_trend

    def get_trends(self, db: Session, trend_type: Optional[str] = None):
        query = db.query(TrendKeyword)
        if trend_type:
            query = query.filter(TrendKeyword.trend_type_code == trend_type)
        return query.order_by(TrendKeyword.trend_score.desc()).all()

    def update_trend_keyword(self, db: Session, keyword_id: int, update_in: TrendKeywordUpdate):
        db_trend = db.query(TrendKeyword).filter(TrendKeyword.keyword_id == keyword_id).first()
        if db_trend:
            for key, value in update_in.model_dump(exclude_unset=True).items():
                setattr(db_trend, key, value)
            db.commit()
            db.refresh(db_trend)
        return db_trend

    def delete_trend_keyword(self, db: Session, keyword_id: int):
        db_trend = db.query(TrendKeyword).filter(TrendKeyword.keyword_id == keyword_id).first()
        if db_trend:
            db.delete(db_trend)
            db.commit()
            return True
        return False

    def search_similar_trends(self, db: Session, vector: List[float], limit: int = 5):
        return db.query(TrendKeyword).order_by(TrendKeyword.trend_vector.l2_distance(vector)).limit(limit).all()

    # --- 3. Market Statistics ---
    def create_statistics(self, db: Session, stat_in: MarketStatisticsCreate):
        data = stat_in.model_dump()
        if isinstance(data.get('data_json'), dict):
            data['data_json'] = json.dumps(data['data_json'])
        db_stat = MarketStatistics(**data)
        db.add(db_stat)
        db.commit()
        db.refresh(db_stat)
        return db_stat

    def get_statistics(self, db: Session, stat_type: Optional[str] = None, region: Optional[str] = None):
        query = db.query(MarketStatistics)
        if stat_type: query = query.filter(MarketStatistics.stat_type == stat_type)
        if region: query = query.filter(MarketStatistics.target_region == region)
        return query.order_by(MarketStatistics.period.desc()).all()

    def update_statistics(self, db: Session, stat_id: int, update_in: MarketStatisticsUpdate):
        db_stat = db.query(MarketStatistics).filter(MarketStatistics.stat_id == stat_id).first()
        if db_stat:
            data = update_in.model_dump(exclude_unset=True)
            if 'data_json' in data and isinstance(data['data_json'], dict):
                data['data_json'] = json.dumps(data['data_json'])
            for key, value in data.items():
                setattr(db_stat, key, value)
            db.commit()
            db.refresh(db_stat)
        return db_stat

    def delete_statistics(self, db: Session, stat_id: int):
        db_stat = db.query(MarketStatistics).filter(MarketStatistics.stat_id == stat_id).first()
        if db_stat:
            db.delete(db_stat)
            db.commit()
            return True
        return False

insight_service = InsightService()
