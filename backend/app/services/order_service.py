from sqlalchemy.orm import Session
from app.models.business import Order, OrderItem, Quotation, Settlement
from app.schemas.business import OrderCreate, OrderUpdate
from datetime import datetime
from decimal import Decimal

class OrderService:
    def create_order_from_quotation(self, db: Session, quotation_id: int):
        # 1. 견적서 조회
        quote = db.query(Quotation).filter(Quotation.quotation_id == quotation_id).first()
        if not quote:
            return None
        
        # 2. 이미 발주된 건인지 체크 (선택 사항, 여기서는 중복 생성 방지 로직)
        # 3. 주문 마스터 생성
        new_order = Order(
            buyer_id=quote.buyer_id,
            company_id=quote.company_id,
            total_amount=quote.total_estimated_amount,
            currency=quote.currency,
            order_status_code="1600000001" # [1600000001] 발주 대기
        )
        db.add(new_order)
        db.flush() # order_id 획득

        # 4. 주문 상세 항목 생성 (견적 항목 복사)
        for q_item in quote.items:
            order_item = OrderItem(
                order_id=new_order.order_id,
                product_id=q_item.product_id,
                quantity=q_item.quantity,
                unit_price_at_order=q_item.unit_price,
                subtotal=q_item.subtotal
            )
            db.add(order_item)

        # 5. 견적서 상태 업데이트 (Confirmed)
        quote.quotation_status_code = "Confirmed"

        # 6. 정산 데이터(인보이스) 자동 생성
        # B2B이므로 발주와 동시에 인보이스가 발행되는 시스템
        new_settlement = Settlement(
            order_id=new_order.order_id,
            buyer_id=quote.buyer_id,
            total_amount=quote.total_estimated_amount,
            currency=quote.currency,
            net_amount=quote.total_estimated_amount * Decimal("0.9"), # 예시: 10% 부가세/수수료 가정
            tax_amount=quote.total_estimated_amount * Decimal("0.07"),
            fee_amount=quote.total_estimated_amount * Decimal("0.03"),
            settlement_status_code="Pending"
        )
        db.add(new_settlement)

        db.commit()
        db.refresh(new_order)
        return new_order

    def get_orders(self, db: Session, buyer_id: int = None, company_id: int = None, skip: int = 0, limit: int = 100):
        query = db.query(Order)
        if buyer_id:
            query = query.filter(Order.buyer_id == buyer_id)
        if company_id:
            query = query.filter(Order.company_id == company_id)
        return query.order_by(Order.created_at.desc()).offset(skip).limit(limit).all()

    def get_order_detail(self, db: Session, order_id: int):
        return db.query(Order).filter(Order.order_id == order_id).first()

    def update_order_status(self, db: Session, order_id: int, order_update: OrderUpdate):
        db_order = self.get_order_detail(db, order_id)
        if not db_order:
            return None
        
        update_data = order_update.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_order, key, value)
            
            # [MVP 연동 로직] 상태가 '1600000004'(배송 완료)로 변경되는 경우 정산 상태도 함께 업데이트
            if key == "order_status_code" and value == "1600000004":
                db_settlement = db.query(Settlement).filter(Settlement.order_id == order_id).first()
                if db_settlement:
                    # 1500000003: 정산 확정 (배송이 완료되어 금액이 확정된 상태)
                    db_settlement.settlement_status_code = "1500000003"
        
        db.commit()
        db.refresh(db_order)
        return db_order

order_service = OrderService()
