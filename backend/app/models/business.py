from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Numeric, Text, DECIMAL
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class Quotation(Base):
    __tablename__ = "quotations"

    quotation_id = Column(Integer, primary_key=True, index=True)
    inquiry_id = Column(Integer, ForeignKey("inquiries.inquiry_id", ondelete="SET NULL"), nullable=True)
    buyer_id = Column(Integer, ForeignKey("buyer.buyer_id", ondelete="CASCADE"))
    company_id = Column(Integer, ForeignKey("company.company_id", ondelete="CASCADE"))
    quotation_status_code = Column(String(50), default="Draft")
    total_estimated_amount = Column(DECIMAL(15, 2), default=0)
    currency = Column(String(10), default="USD")
    valid_until = Column(DateTime(timezone=True))
    comments = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    items = relationship("QuotationItem", back_populates="quotation", cascade="all, delete-orphan")
    buyer = relationship("User")
    company = relationship("Company")
    inquiry = relationship("Inquiry")

class QuotationItem(Base):
    __tablename__ = "quotation_items"

    quotation_item_id = Column(Integer, primary_key=True, index=True)
    quotation_id = Column(Integer, ForeignKey("quotations.quotation_id", ondelete="CASCADE"))
    product_id = Column(Integer, ForeignKey("product.product_id", ondelete="SET NULL"), nullable=True)
    cosmax_r_and_d_asset_id = Column(Integer, ForeignKey("cosmax_r_and_d_assets.cosmax_r_and_d_asset_id", ondelete="SET NULL"), nullable=True)
    quantity = Column(Integer, nullable=False)
    unit_price = Column(DECIMAL(12, 2), nullable=False)
    discount_rate = Column(DECIMAL(5, 2), default=0)
    discount_amount = Column(DECIMAL(15, 2), default=0)
    subtotal = Column(DECIMAL(15, 2), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    quotation = relationship("Quotation", back_populates="items")
    product = relationship("Product")
    asset = relationship("CosmaxRAndDAsset")

class Order(Base):
    __tablename__ = "orders"

    order_id = Column(Integer, primary_key=True, index=True)
    buyer_id = Column(Integer, ForeignKey("buyer.buyer_id"))
    company_id = Column(Integer, ForeignKey("company.company_id"), nullable=True)
    order_status_code = Column(String(50)) # Processing, Shipped, Delivered, Canceled
    total_amount = Column(DECIMAL(15, 2))
    currency = Column(String(10), default="USD")
    shipping_method = Column(String(100))
    tracking_num = Column(String(100))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    buyer = relationship("User")
    company = relationship("Company")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
    schedules = relationship("ProductionSchedule", back_populates="order")
    shipments = relationship("Shipment", back_populates="order")

class OrderItem(Base):
    __tablename__ = "order_items"

    order_item_id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.order_id", ondelete="CASCADE"))
    product_id = Column(Integer, ForeignKey("product.product_id"))
    quantity = Column(Integer, nullable=False)
    unit_price_at_order = Column(DECIMAL(12, 2), nullable=False)
    subtotal = Column(DECIMAL(15, 2))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    order = relationship("Order", back_populates="items")
    product = relationship("Product")

class PriceTier(Base):
    __tablename__ = "price_tiers"

    price_tier_id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("product.product_id", ondelete="CASCADE"))
    min_quantity = Column(Integer, nullable=False)
    unit_price = Column(DECIMAL(12, 2), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class ProductionSchedule(Base):
    __tablename__ = "production_schedules"

    schedule_id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.order_id", ondelete="CASCADE"))
    product_id = Column(Integer, ForeignKey("product.product_id", ondelete="SET NULL"), nullable=True)
    batch_no = Column(String(100))
    line_no = Column(String(50))
    planned_start_date = Column(DateTime)
    planned_end_date = Column(DateTime)
    actual_start_date = Column(DateTime)
    actual_end_date = Column(DateTime)
    status = Column(String(50), default="Scheduled")
    produced_quantity = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    order = relationship("Order", back_populates="schedules")
    product = relationship("Product")

class Shipment(Base):
    __tablename__ = "shipments"

    shipment_id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.order_id", ondelete="CASCADE"))
    shipping_company = Column(String(100))
    tracking_number = Column(String(100))
    shipped_at = Column(DateTime(timezone=True))
    estimated_delivery = Column(DateTime)
    status = Column(String(50), default="Preparing")
    recipient_name = Column(String(100))
    shipping_address = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    # Relationships
    order = relationship("Order", back_populates="shipments")

class ExchangeRate(Base):
    __tablename__ = "exchange_rates"

    rate_id = Column(Integer, primary_key=True, index=True)
    from_currency = Column(String(10), nullable=False)
    to_currency = Column(String(10), nullable=False)
    base_rate = Column(DECIMAL(15, 6), nullable=False)
    provider = Column(String(50))
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class Settlement(Base):
    __tablename__ = "settlements"

    settlement_id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.order_id", ondelete="CASCADE"))
    buyer_id = Column(Integer, ForeignKey("buyer.buyer_id", ondelete="SET NULL"), nullable=True)
    total_amount = Column(DECIMAL(15, 2), nullable=False)
    currency = Column(String(10), default="USD")
    tax_amount = Column(DECIMAL(15, 2), default=0)
    fee_amount = Column(DECIMAL(15, 2), default=0)
    net_amount = Column(DECIMAL(15, 2), nullable=False)
    settlement_status_code = Column(String(10), default="Pending")
    paid_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    order = relationship("Order")
    buyer = relationship("User")
