from sqlalchemy import Column, Integer, String, Numeric, ForeignKey, Text, DateTime, Date, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class CosmaxRAndDAsset(Base):
    __tablename__ = "cosmax_r_and_d_assets"

    cosmax_r_and_d_asset_id = Column(Integer, primary_key=True, index=True)
    asset_type = Column(String(50)) # Ingredient, Formula, Patent
    name = Column(Text, nullable=False)
    patent_number = Column(String(100))
    usage_count = Column(Integer, default=0)
    trend_tags = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    recipes = relationship("FormulaRecipe", back_populates="asset")
    exclusive_info = relationship("ExclusiveAsset", back_populates="asset", uselist=False)

class FormulaRecipe(Base):
    __tablename__ = "formula_recipes"

    recipe_id = Column(Integer, primary_key=True, index=True)
    asset_id = Column(Integer, ForeignKey("cosmax_r_and_d_assets.cosmax_r_and_d_asset_id", ondelete="CASCADE"))
    ingredient_id = Column(Integer, ForeignKey("ingredients.ingredient_id", ondelete="CASCADE"))
    percentage = Column(Numeric(5, 3), nullable=False)
    phase = Column(String(10))
    purpose = Column(String(100))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    asset = relationship("CosmaxRAndDAsset", back_populates="recipes")
    ingredient = relationship("Ingredient")

class IngredientEfficacy(Base):
    __tablename__ = "ingredient_efficacies"

    efficacy_id = Column(Integer, primary_key=True, index=True)
    ingredient_id = Column(Integer, ForeignKey("ingredients.ingredient_id", ondelete="CASCADE"))
    category_id = Column(Integer, nullable=False)
    strength = Column(Integer)
    evidence_level = Column(String(50))
    is_certified = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    ingredient = relationship("Ingredient", back_populates="efficacies")

class ExclusiveAsset(Base):
    __tablename__ = "exclusive_assets"

    exclusive_id = Column(Integer, primary_key=True, index=True)
    asset_id = Column(Integer, ForeignKey("cosmax_r_and_d_assets.cosmax_r_and_d_asset_id", ondelete="CASCADE"))
    company_id = Column(Integer, ForeignKey("company.company_id", ondelete="CASCADE"))
    exclusive_type = Column(String(50))
    start_date = Column(Date)
    end_date = Column(Date, nullable=True)
    region = Column(String(50), default="Global")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    asset = relationship("CosmaxRAndDAsset", back_populates="exclusive_info")
    company = relationship("Company")

class ConsultingReport(Base):
    __tablename__ = "consulting_reports"

    report_id = Column(Integer, primary_key=True, index=True)
    inquiry_id = Column(Integer, ForeignKey("inquiries.inquiry_id", ondelete="CASCADE"))
    recommended_asset_id = Column(Integer, ForeignKey("cosmax_r_and_d_assets.cosmax_r_and_d_asset_id", ondelete="SET NULL"), nullable=True)
    report_content = Column(Text, nullable=False)
    matching_scores = Column(Text) # JSON 문자열로 저장 (SQLite 호환성 고려 시 Text, PostgreSQL은 JSONB이나 SQLAlchemy에서는 가공 필요)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    inquiry = relationship("Inquiry")
    recommended_asset = relationship("CosmaxRAndDAsset")
