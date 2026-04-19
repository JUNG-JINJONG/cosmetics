from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.api.account_company.auth_utils import RoleChecker
from app.services.insight_service import insight_service
from app.schemas.insight import (
    InsightReportRead, InsightReportCreate, InsightReportUpdate,
    TrendKeywordRead, TrendKeywordCreate, TrendKeywordUpdate,
    MarketStatisticsRead, MarketStatisticsCreate, MarketStatisticsUpdate
)

router = APIRouter()

# --- Insight Reports ---
@router.post("/reports", response_model=InsightReportRead, dependencies=[Depends(RoleChecker(["Admin"]))])
def create_insight_report(report_in: InsightReportCreate, db: Session = Depends(get_db)):
    """ 새로운 인사이트 리포트를 발행합니다. (Admin 전용) """
    return insight_service.create_report(db, report_in)

@router.get("/reports", response_model=List[InsightReportRead])
def get_insight_reports(skip: int = 0, limit: int = 20, db: Session = Depends(get_db)):
    """ 최신 인사이트 리포트 목록을 조회합니다. """
    return insight_service.get_reports(db, skip, limit)

@router.patch("/reports/{report_id}", response_model=InsightReportRead, dependencies=[Depends(RoleChecker(["Admin"]))])
def update_insight_report(report_id: int, update_in: InsightReportUpdate, db: Session = Depends(get_db)):
    """ 리포트를 수정합니다. (Admin 전용) """
    report = insight_service.update_report(db, report_id, update_in)
    if not report: raise HTTPException(status_code=404, detail="리포트를 찾을 수 없습니다.")
    return report

@router.delete("/reports/{report_id}", dependencies=[Depends(RoleChecker(["Admin"]))])
def delete_insight_report(report_id: int, db: Session = Depends(get_db)):
    """ 리포트를 삭제합니다. (Admin 전용) """
    if not insight_service.delete_report(db, report_id):
        raise HTTPException(status_code=404, detail="리포트를 찾을 수 없습니다.")
    return {"message": "리포트가 성공적으로 삭제되었습니다."}

# --- Trend Keywords ---
@router.post("/trends", response_model=TrendKeywordRead, dependencies=[Depends(RoleChecker(["Admin"]))])
def create_trend_keyword(trend_in: TrendKeywordCreate, db: Session = Depends(get_db)):
    """ 새로운 인기 트렌드 키워드를 등록합니다. """
    return insight_service.create_trend_keyword(db, trend_in)

@router.get("/trends", response_model=List[TrendKeywordRead])
def get_trends(type_code: Optional[str] = None, db: Session = Depends(get_db)):
    """ 타입별 인기 트렌드 키워드 목록을 조회합니다. """
    return insight_service.get_trends(db, type_code)

@router.patch("/trends/{keyword_id}", response_model=TrendKeywordRead, dependencies=[Depends(RoleChecker(["Admin"]))])
def update_trend_keyword(keyword_id: int, update_in: TrendKeywordUpdate, db: Session = Depends(get_db)):
    """ 트렌드 키워드를 수정합니다. """
    trend = insight_service.update_trend_keyword(db, keyword_id, update_in)
    if not trend: raise HTTPException(status_code=404, detail="트렌드 키워드를 찾을 수 없습니다.")
    return trend

@router.delete("/trends/{keyword_id}", dependencies=[Depends(RoleChecker(["Admin"]))])
def delete_trend_keyword(keyword_id: int, db: Session = Depends(get_db)):
    """ 트렌드 키워드를 삭제합니다. """
    if not insight_service.delete_trend_keyword(db, keyword_id):
        raise HTTPException(status_code=404, detail="트렌드 키워드를 찾을 수 없습니다.")
    return {"message": "트렌드 키워드가 성공적으로 삭제되었습니다."}

@router.post("/trends/search", response_model=List[TrendKeywordRead])
def search_trends(vector: List[float], limit: int = 5, db: Session = Depends(get_db)):
    """ 벡터 검색을 통해 의미적으로 유사한 트렌드를 추천합니다. """
    return insight_service.search_similar_trends(db, vector, limit)

# --- Market Statistics ---
@router.post("/statistics", response_model=MarketStatisticsRead, dependencies=[Depends(RoleChecker(["Admin"]))])
def create_market_statistics(stat_in: MarketStatisticsCreate, db: Session = Depends(get_db)):
    """ 새로운 시장 통계 데이터를 등록합니다. """
    return insight_service.create_statistics(db, stat_in)

@router.get("/statistics", response_model=List[MarketStatisticsRead])
def get_market_statistics(stat_type: Optional[str] = None, region: Optional[str] = None, db: Session = Depends(get_db)):
    """ 시장 통계 목록을 조회합니다. """
    return insight_service.get_statistics(db, stat_type, region)

@router.patch("/statistics/{stat_id}", response_model=MarketStatisticsRead, dependencies=[Depends(RoleChecker(["Admin"]))])
def update_market_statistics(stat_id: int, update_in: MarketStatisticsUpdate, db: Session = Depends(get_db)):
    """ 통계 데이터를 수정합니다. """
    stat = insight_service.update_statistics(db, stat_id, update_in)
    if not stat: raise HTTPException(status_code=404, detail="통계 데이터를 찾을 수 없습니다.")
    return stat

@router.delete("/statistics/{stat_id}", dependencies=[Depends(RoleChecker(["Admin"]))])
def delete_market_statistics(stat_id: int, db: Session = Depends(get_db)):
    """ 통계 데이터를 삭제합니다. """
    if not insight_service.delete_statistics(db, stat_id):
        raise HTTPException(status_code=404, detail="통계 데이터를 찾을 수 없습니다.")
    return {"message": "통계 데이터가 성공적으로 삭제되었습니다."}
