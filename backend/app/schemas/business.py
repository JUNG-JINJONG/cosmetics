from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from decimal import Decimal

# --- Price Tier Schemas ---
class PriceTierBase(BaseModel):
    product_id: int
    min_quantity: int
    unit_price: Decimal

class PriceTierRead(PriceTierBase):
    price_tier_id: int
    created_at: datetime
    class Config:
        from_attributes = True

class PriceTierCreate(PriceTierBase):
    pass

class PriceTierUpdate(BaseModel):
    min_quantity: Optional[int] = None
    unit_price: Optional[Decimal] = None

# --- Quotation Item Schemas ---
class QuotationItemBase(BaseModel):
    product_id: Optional[int] = None
    cosmax_r_and_d_asset_id: Optional[int] = None
    quantity: int
    unit_price: Decimal
    discount_rate: Optional[Decimal] = Decimal(0)
    discount_amount: Optional[Decimal] = Decimal(0)
    subtotal: Decimal

class QuotationItemCreate(QuotationItemBase):
    pass

class QuotationItemUpdate(BaseModel):
    product_id: Optional[int] = None
    cosmax_r_and_d_asset_id: Optional[int] = None
    quantity: Optional[int] = None
    unit_price: Optional[Decimal] = None
    discount_rate: Optional[Decimal] = None
    discount_amount: Optional[Decimal] = None
    subtotal: Optional[Decimal] = None

class QuotationItemRead(QuotationItemBase):
    quotation_item_id: int
    quotation_id: int
    created_at: datetime
    class Config:
        from_attributes = True

# --- Quotation Schemas ---
class QuotationBase(BaseModel):
    inquiry_id: Optional[int] = None
    buyer_id: int
    company_id: int
    quotation_status_code: Optional[str] = "Draft"
    total_estimated_amount: Decimal = Decimal(0)
    currency: Optional[str] = "USD"
    valid_until: Optional[datetime] = None
    comments: Optional[str] = None

class QuotationCreate(QuotationBase):
    items: List[QuotationItemCreate]

class QuotationUpdate(BaseModel):
    inquiry_id: Optional[int] = None
    buyer_id: Optional[int] = None
    company_id: Optional[int] = None
    quotation_status_code: Optional[str] = None
    total_estimated_amount: Optional[Decimal] = None
    currency: Optional[str] = None
    valid_until: Optional[datetime] = None
    comments: Optional[str] = None

class QuotationRead(QuotationBase):
    quotation_id: int
    created_at: datetime
    updated_at: datetime
    items: List[QuotationItemRead]
    class Config:
        from_attributes = True

# --- Order Schemas ---
class OrderItemBase(BaseModel):
    product_id: int
    quantity: int
    unit_price_at_order: Decimal
    subtotal: Decimal

class OrderItemCreate(OrderItemBase):
    pass

class OrderItemRead(OrderItemBase):
    order_item_id: int
    order_id: int
    class Config:
        from_attributes = True

class OrderBase(BaseModel):
    buyer_id: int
    company_id: Optional[int] = None
    order_status_code: Optional[str] = "Pending"
    total_amount: Decimal
    currency: Optional[str] = "USD"
    shipping_method: Optional[str] = None
    tracking_num: Optional[str] = None

class OrderCreate(OrderBase):
    quotation_id: Optional[int] = None # Linking back if needed
    items: List[OrderItemCreate]

class OrderRead(OrderBase):
    order_id: int
    created_at: datetime
    items: List[OrderItemRead] = []
    class Config:
        from_attributes = True

class OrderUpdate(BaseModel):
    order_status_code: Optional[str] = None
    shipping_method: Optional[str] = None
    tracking_num: Optional[str] = None

# --- Price Simulation ---
class PriceSimulationRequest(BaseModel):
    product_id: int
    quantity: int
    target_currency: Optional[str] = "USD"

class PriceTierInfo(BaseModel):
    min_quantity: int
    unit_price: Decimal

class PriceSimulationResponse(BaseModel):
    product_id: int
    requested_quantity: int
    currency: str
    unit_price: Decimal
    total_amount: Decimal
    current_tier: Optional[PriceTierInfo] = None
    next_tier: Optional[PriceTierInfo] = None
    potential_savings: Optional[Decimal] = None

# --- Exchange Rate Schemas ---
class ExchangeRateBase(BaseModel):
    from_currency: str
    to_currency: str
    base_rate: Decimal
    provider: Optional[str] = None

class ExchangeRateRead(ExchangeRateBase):
    rate_id: int
    updated_at: datetime
    class Config:
        from_attributes = True

class ExchangeRateCreate(ExchangeRateBase):
    pass

# --- Settlement Schemas ---
class SettlementBase(BaseModel):
    order_id: int
    buyer_id: Optional[int] = None
    total_amount: Decimal
    currency: Optional[str] = "USD"
    tax_amount: Optional[Decimal] = Decimal(0)
    fee_amount: Optional[Decimal] = Decimal(0)
    net_amount: Decimal
    settlement_status_code: Optional[str] = "Pending"
    paid_at: Optional[datetime] = None

class SettlementRead(SettlementBase):
    settlement_id: int
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True

class SettlementUpdate(BaseModel):
    settlement_status_code: Optional[str] = None
    paid_at: Optional[datetime] = None

# --- Production Schedule Schemas ---
class ProductionScheduleBase(BaseModel):
    order_id: int
    product_id: Optional[int] = None
    batch_no: Optional[str] = None
    line_no: Optional[str] = None
    planned_start_date: Optional[datetime] = None
    planned_end_date: Optional[datetime] = None
    actual_start_date: Optional[datetime] = None
    actual_end_date: Optional[datetime] = None
    status: Optional[str] = "Scheduled"
    produced_quantity: Optional[int] = 0

class ProductionScheduleCreate(ProductionScheduleBase):
    pass

class ProductionScheduleUpdate(BaseModel):
    batch_no: Optional[str] = None
    line_no: Optional[str] = None
    planned_start_date: Optional[datetime] = None
    planned_end_date: Optional[datetime] = None
    actual_start_date: Optional[datetime] = None
    actual_end_date: Optional[datetime] = None
    status: Optional[str] = None
    produced_quantity: Optional[int] = None

class ProductionScheduleRead(ProductionScheduleBase):
    schedule_id: int
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True

# --- Shipment Schemas ---
class ShipmentBase(BaseModel):
    order_id: int
    shipping_company: Optional[str] = None
    tracking_number: Optional[str] = None
    shipped_at: Optional[datetime] = None
    estimated_delivery: Optional[datetime] = None
    status: Optional[str] = "Preparing"
    recipient_name: Optional[str] = None
    shipping_address: Optional[str] = None

class ShipmentCreate(ShipmentBase):
    pass

class ShipmentUpdate(BaseModel):
    shipping_company: Optional[str] = None
    tracking_number: Optional[str] = None
    shipped_at: Optional[datetime] = None
    estimated_delivery: Optional[datetime] = None
    status: Optional[str] = None
    recipient_name: Optional[str] = None
    shipping_address: Optional[str] = None

class ShipmentRead(ShipmentBase):
    shipment_id: int
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True
