from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.business import Order, Quotation, Settlement
from app.models.workflow import Project, Inquiry
from app.models.user import User
from typing import Dict, Any, List
import datetime

class DashboardService:
    def get_buyer_summary(self, db: Session, buyer_id: int) -> Dict[str, Any]:
        """
        바이어(Client)를 위한 대시보드 요약 지표 산출
        """
        # 1. 프로젝트 현황 (Phase별 개수)
        # 37번 라인 status_code 참고: Pending, Quoting, Contracted, Ordering, Producing, Releasing
        project_stats = db.query(Project.status_code, func.count(Project.project_id))\
            .join(Project.inquiry)\
            .filter(Inquiry.buyer_id == buyer_id)\
            .group_by(Project.status_code).all()
        
        # 2. 견적 대기 현황 (승인 대기 중인 견적)
        pending_quotations = db.query(Quotation)\
            .filter(Quotation.buyer_id == buyer_id, Quotation.quotation_status_code == "Draft")\
            .count()

        # 3. 누적 지출 및 정산 예정액
        spending_summary = db.query(
            func.sum(Settlement.total_amount).filter(Settlement.settlement_status_code == "1500000005").label("paid"),
            func.sum(Settlement.total_amount).filter(Settlement.settlement_status_code.in_(["1500000002", "1500000003"])).label("pending")
        ).filter(Settlement.buyer_id == buyer_id).first()

        # 4. 최근 활동 (Last 5 Logs)
        recent_activities = db.query(Project)\
            .join(Project.inquiry)\
            .filter(Inquiry.buyer_id == buyer_id)\
            .order_by(Project.updated_at.desc())\
            .limit(5).all()

        return {
            "projects": dict(project_stats),
            "pending_quotations": pending_quotations,
            "financials": {
                "paid": float(spending_summary.paid or 0),
                "pending": float(spending_summary.pending or 0),
                "currency": "USD"
            },
            "recent_projects": [
                {
                    "project_id": p.project_id,
                    "brand_name": p.inquiry.brand_name,
                    "status_code": p.status_code,
                    "progress": p.current_phase_percent,
                    "updated_at": p.updated_at.isoformat() if p.updated_at else None
                } for p in recent_activities
            ]
        }

    def get_manufacturer_summary(self, db: Session, company_id: int) -> Dict[str, Any]:
        """
        제조사(Manufacturer)를 위한 대시보드 요약 지표 산출
        """
        # 1. 수주 프로젝트 현황
        project_stats = db.query(Project.status_code, func.count(Project.project_id))\
            .filter(Project.status_code != "Pending")\
            .group_by(Project.status_code).all() # 실제로는 해당 제조사와 연결된 Inquiry 필터 필요

        # 2. 신규 의뢰 (Inquiry 중 아직 프로젝트화 되지 않은 것)
        new_leads = db.query(Inquiry).filter(Inquiry.company_id == company_id).count()

        # 3. 매출 및 입금 예정액
        revenue_summary = db.query(
            func.sum(Settlement.net_amount).filter(Settlement.settlement_status_code == "1500000005").label("received"),
            func.sum(Settlement.net_amount).filter(Settlement.settlement_status_code.in_(["1500000002", "1500000003"])).label("expected")
        ).join(Order).filter(Order.company_id == company_id).first()

        # 3. 최근 활동 (Last 5 Logs) - 해당 제조사가 수주한 프로젝트 리스트
        recent_activities = db.query(Project)\
            .join(Project.inquiry)\
            .filter(Inquiry.company_id == company_id)\
            .order_by(Project.updated_at.desc())\
            .limit(5).all()

        return {
            "projects": dict(project_stats),
            "new_leads": new_leads,
            "financials": {
                "received": float(revenue_summary.received or 0),
                "expected": float(revenue_summary.expected or 0),
                "currency": "USD"
            },
            "recent_projects": [
                {
                    "project_id": p.project_id,
                    "brand_name": p.inquiry.brand_name,
                    "status_code": p.status_code,
                    "progress": p.current_phase_percent,
                    "updated_at": p.updated_at.isoformat() if p.updated_at else None
                } for p in recent_activities
            ]
        }

dashboard_service = DashboardService()
