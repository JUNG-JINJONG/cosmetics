from sqlalchemy.orm import Session
from app.models.business import Order, Settlement, ExchangeRate
from decimal import Decimal
from typing import Optional

class SettlementService:
    def create_settlement_from_order(self, db: Session, order_id: int) -> Settlement:
        """
        주문 데이터를 기반으로 기본적인 정산 데이터를 생성합니다.
        세금(10%) 및 플랫폼 수수료(5%) 로직이 적용됩니다.
        """
        order = db.query(Order).filter(Order.order_id == order_id).first()
        if not order:
            return None
        
        # 정책상 세금 10%, 수수료 5% 가정 (프로젝트 요구사항에 따라 가변 가능)
        TAX_RATE = Decimal("0.10")
        FEE_RATE = Decimal("0.05")
        
        total_amount = order.total_amount
        tax_amount = total_amount * TAX_RATE
        fee_amount = total_amount * FEE_RATE
        net_amount = total_amount - tax_amount - fee_amount
        
        db_settlement = Settlement(
            order_id=order.order_id,
            buyer_id=order.buyer_id,
            total_amount=total_amount,
            currency=order.currency,
            tax_amount=tax_amount,
            fee_amount=fee_amount,
            net_amount=net_amount,
            settlement_status_code="1500000002" # 정산대기 (PENDING)
        )
        
        db.add(db_settlement)
        db.commit()
        db.refresh(db_settlement)
        return db_settlement

    def process_global_settlement(self, db: Session, order_id: int, target_currency: str) -> Settlement:
        """
        글로벌 주문 완료 시, 지정된 타겟 통화(예: KRW)로 환율을 적용하여 정산 데이터를 생성합니다.
        """
        order = db.query(Order).filter(Order.order_id == order_id).first()
        if not order:
             return None

        total_amount = order.total_amount
        base_currency = order.currency
        
        # 환율 변환 로직
        final_total = total_amount
        current_used_currency = base_currency
        
        if target_currency != base_currency:
            rate = db.query(ExchangeRate).filter(
                ExchangeRate.from_currency == base_currency,
                ExchangeRate.to_currency == target_currency
            ).first()
            if rate:
                final_total = total_amount * rate.base_rate
                current_used_currency = target_currency
            else:
                # 환율 정보가 없는 경우 기본 주문 통화 유지
                pass
        
        # 정산 로직 적용 (환전된 수량 기준)
        TAX_RATE = Decimal("0.10")
        FEE_RATE = Decimal("0.05")
        
        tax_amount = final_total * TAX_RATE
        fee_amount = final_total * FEE_RATE
        net_amount = final_total - tax_amount - fee_amount
        
        db_settlement = Settlement(
            order_id=order.order_id,
            buyer_id=order.buyer_id,
            total_amount=final_total,
            currency=current_used_currency,
            tax_amount=tax_amount,
            fee_amount=fee_amount,
            net_amount=net_amount,
            settlement_status_code="1500000002" # 정산대기 (PENDING)
        )
        
        db.add(db_settlement)
        db.commit()
        db.refresh(db_settlement)
        return db_settlement

    def get_settlements(self, db: Session, buyer_id: Optional[int] = None, company_id: Optional[int] = None, skip: int = 0, limit: int = 100):
        query = db.query(Settlement).join(Order)
        if buyer_id:
            query = query.filter(Settlement.buyer_id == buyer_id)
        if company_id:
            query = query.filter(Order.company_id == company_id)
        return query.order_by(Settlement.created_at.desc()).offset(skip).limit(limit).all()

    def update_settlement_status(self, db: Session, settlement_id: int, status_code: str):
        db_settlement = db.query(Settlement).filter(Settlement.settlement_id == settlement_id).first()
        if db_settlement:
            db_settlement.settlement_status_code = status_code
            if status_code == "1500000005": # 정산완료 (COMPLETED -> 가이드에서는 05번이었나 확인 필요)
                import datetime
                db_settlement.paid_at = datetime.datetime.now()
            db.commit()
            db.refresh(db_settlement)
            return db_settlement
        return None

settlement_service = SettlementService()
