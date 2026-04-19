from sqlalchemy.orm import Session
from app.models.business import PriceTier, Quotation, QuotationItem, ExchangeRate
from app.schemas.business import (
    QuotationCreate, QuotationUpdate, PriceSimulationRequest, 
    QuotationItemUpdate, QuotationItemCreate, PriceSimulationResponse, PriceTierInfo
)
from decimal import Decimal
from typing import List

class PricingService:
    def get_unit_price(self, db: Session, product_id: int, quantity: int) -> Decimal:
        tier = db.query(PriceTier)\
                 .filter(PriceTier.product_id == product_id, PriceTier.min_quantity <= quantity)\
                 .order_by(PriceTier.min_quantity.desc())\
                 .first()
        if not tier:
            tier = db.query(PriceTier)\
                     .filter(PriceTier.product_id == product_id)\
                     .order_by(PriceTier.min_quantity.asc())\
                     .first()
        return tier.unit_price if tier else Decimal("0.00")

    def calculate_simulation(self, db: Session, request: PriceSimulationRequest) -> PriceSimulationResponse:
        """
        수량과 통화에 따른 실시간 단가 시뮬레이션 및 상단 티어 제안 로직
        """
        tiers = self.get_product_price_tiers(db, request.product_id)
        
        current_tier = None
        next_tier = None
        
        # 현재 수량에 해당하는 티어 찾기
        for tier in reversed(tiers):
            if tier.min_quantity <= request.quantity:
                current_tier = tier
                break
        
        # 티어가 없으면 가장 첫 번째 티어를 기본으로 설정
        if not current_tier and tiers:
            current_tier = tiers[0]
            
        # 다음 단계 티어 찾기 (업스트리밍 제안용)
        if current_tier:
             for tier in tiers:
                 if tier.min_quantity > request.quantity:
                     next_tier = tier
                     break

        # 기본 단가 (티어에 저장된 기본 통화 기준, 예: USD)
        base_unit_price = current_tier.unit_price if current_tier else Decimal("0.00")
        base_currency = "USD"
        
        # 통화 변환 로직 (환율 테이블 참조)
        final_unit_price = base_unit_price
        target_currency = request.target_currency or base_currency
        
        if target_currency != base_currency:
             rate = db.query(ExchangeRate).filter(
                 ExchangeRate.from_currency == base_currency,
                 ExchangeRate.to_currency == target_currency
             ).first()
             if rate:
                 final_unit_price = base_unit_price * rate.base_rate
        
        # 상단 티어 이동 시 절감 가능액 계산
        potential_savings = None
        if current_tier and next_tier:
             potential_savings = current_tier.unit_price - next_tier.unit_price
        
        return PriceSimulationResponse(
            product_id=request.product_id,
            requested_quantity=request.quantity,
            currency=target_currency,
            unit_price=final_unit_price,
            total_amount=final_unit_price * request.quantity,
            current_tier=PriceTierInfo(min_quantity=current_tier.min_quantity, unit_price=current_tier.unit_price) if current_tier else None,
            next_tier=PriceTierInfo(min_quantity=next_tier.min_quantity, unit_price=next_tier.unit_price) if next_tier else None,
            potential_savings=potential_savings
        )

    # --- Quotation CRUD ---
    def create_automated_quotation(self, db: Session, quote_in: QuotationCreate):
        total_amount = Decimal(0)
        db_quote = Quotation(
            inquiry_id=quote_in.inquiry_id,
            buyer_id=quote_in.buyer_id,
            company_id=quote_in.company_id,
            quotation_status_code=quote_in.quotation_status_code,
            currency=quote_in.currency,
            valid_until=quote_in.valid_until,
            comments=quote_in.comments
        )
        db.add(db_quote)
        db.flush()

        for item in quote_in.items:
            if item.product_id:
                final_unit_price = self.get_unit_price(db, item.product_id, item.quantity)
            else:
                final_unit_price = item.unit_price
            
            base_subtotal = final_unit_price * item.quantity
            calc_discount_amount = item.discount_amount
            if item.discount_rate and item.discount_rate > 0:
                calc_discount_amount = base_subtotal * (item.discount_rate / Decimal(100))
            
            final_subtotal = base_subtotal - calc_discount_amount
            total_amount += final_subtotal
            
            db_item = QuotationItem(
                quotation_id=db_quote.quotation_id,
                product_id=item.product_id,
                cosmax_r_and_d_asset_id=item.cosmax_r_and_d_asset_id,
                quantity=item.quantity,
                unit_price=final_unit_price,
                discount_rate=item.discount_rate,
                discount_amount=calc_discount_amount,
                subtotal=final_subtotal
            )
            db.add(db_item)

        db_quote.total_estimated_amount = total_amount
        db.commit()
        db.refresh(db_quote)
        return db_quote

    def get_quotations(self, db: Session, skip: int = 0, limit: int = 100):
        return db.query(Quotation).offset(skip).limit(limit).all()

    def get_quotation(self, db: Session, quotation_id: int):
        return db.query(Quotation).filter(Quotation.quotation_id == quotation_id).first()

    def update_quotation(self, db: Session, quotation_id: int, quote_in: QuotationUpdate):
        db_quote = self.get_quotation(db, quotation_id)
        if not db_quote:
            return None
        
        update_data = quote_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_quote, field, value)
        
        db.commit()
        db.refresh(db_quote)
        return db_quote

    def delete_quotation(self, db: Session, quotation_id: int):
        db_quote = self.get_quotation(db, quotation_id)
        if db_quote:
            db.delete(db_quote)
            db.commit()
            return True
        return False

    # --- Quotation Item CRUD ---
    def create_quotation_item(self, db: Session, quotation_id: int, item_in: QuotationItemCreate):
        # 단가 계산 로직 포함
        unit_price = item_in.unit_price
        if item_in.product_id:
            unit_price = self.get_unit_price(db, item_in.product_id, item_in.quantity)
        
        base_subtotal = unit_price * item_in.quantity
        disc_amt = item_in.discount_amount
        if item_in.discount_rate and item_in.discount_rate > 0:
            disc_amt = base_subtotal * (item_in.discount_rate / Decimal(100))
        
        subtotal = base_subtotal - disc_amt
        
        db_item = QuotationItem(
            quotation_id=quotation_id,
            **item_in.model_dump(exclude={"unit_price", "subtotal", "discount_amount"}),
            unit_price=unit_price,
            discount_amount=disc_amt,
            subtotal=subtotal
        )
        db.add(db_item)
        db.commit()
        db.refresh(db_item)
        
        # 합계 견적액 업데이트
        self._update_quote_total(db, quotation_id)
        return db_item

    def update_quotation_item(self, db: Session, item_id: int, item_in: QuotationItemUpdate):
        db_item = db.query(QuotationItem).filter(QuotationItem.quotation_item_id == item_id).first()
        if not db_item:
            return None
        
        update_data = item_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_item, field, value)
        
        # 수정된 정보를 바탕으로 소계 재계산 (간단화: 명시적 계산 로직 생략하고 저장된 값 사용하거나 트리거 가능)
        # 여기서는 수량이나 할인율 변경 시 재계산 로직 추가 가능
        
        db.commit()
        db.refresh(db_item)
        self._update_quote_total(db, db_item.quotation_id)
        return db_item

    def delete_quotation_item(self, db: Session, item_id: int):
        db_item = db.query(QuotationItem).filter(QuotationItem.quotation_item_id == item_id).first()
        if db_item:
            quotation_id = db_item.quotation_id
            db.delete(db_item)
            db.commit()
            self._update_quote_total(db, quotation_id)
            return True
        return False

    def _update_quote_total(self, db: Session, quotation_id: int):
        quote = self.get_quotation(db, quotation_id)
        if quote:
            total = sum(item.subtotal for item in quote.items)
            quote.total_estimated_amount = total
            db.commit()

    # --- Price Tier CRUD ---
    def create_price_tier(self, db: Session, tier_in: any): # schemas import issue avoid by using any or specific type
        from app.schemas.business import PriceTierCreate
        db_tier = PriceTier(**tier_in.model_dump())
        db.add(db_tier)
        db.commit()
        db.refresh(db_tier)
        return db_tier

    def get_product_price_tiers(self, db: Session, product_id: int):
        return db.query(PriceTier).filter(PriceTier.product_id == product_id).order_by(PriceTier.min_quantity.asc()).all()

    def update_price_tier(self, db: Session, tier_id: int, tier_in: any):
        db_tier = db.query(PriceTier).filter(PriceTier.price_tier_id == tier_id).first()
        if not db_tier:
            return None
        update_data = tier_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_tier, field, value)
        db.commit()
        db.refresh(db_tier)
        return db_tier

    def delete_price_tier(self, db: Session, tier_id: int):
        db_tier = db.query(PriceTier).filter(PriceTier.price_tier_id == tier_id).first()
        if db_tier:
            db.delete(db_tier)
            db.commit()
            return True
        return False

pricing_service = PricingService()
