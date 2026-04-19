from sqlalchemy import Column, Integer, String, DECIMAL, ForeignKey, Text, DateTime, JSON
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class Inquiry(Base):
    __tablename__ = "inquiries"

    inquiry_id = Column(Integer, primary_key=True, index=True)
    buyer_id = Column(Integer, ForeignKey("buyer.buyer_id"))
    company_id = Column(Integer, ForeignKey("company.company_id", ondelete="SET NULL"), nullable=True)
    brand_name = Column(String(255), nullable=False)
    registration_num = Column(String(100))
    website_url = Column(Text)
    item_type = Column(String(100))
    target_price = Column(DECIMAL(10, 2))
    scent_pref = Column(Text)
    container_type = Column(String(100))
    capacity = Column(String(50))
    quantity = Column(Integer)
    cosmax_pkg_item_id = Column(Integer)
    export_countries = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # 관계 설정
    buyer = relationship("User", backref="inquiries")
    company = relationship("Company", backref="inquiries")
    project = relationship("Project", back_populates="inquiry", uselist=False)


class Project(Base):
    __tablename__ = "projects"

    project_id = Column(Integer, primary_key=True, index=True)
    inquiry_id = Column(Integer, ForeignKey("inquiries.inquiry_id", ondelete="CASCADE"))
    status_code = Column(String(50), default="Pending") # Pending, Quoting, Contracted, Ordering, Producing, Releasing
    current_phase_percent = Column(Integer, default=0)
    start_at = Column(DateTime(timezone=True))
    expected_completion_at = Column(DateTime(timezone=True))
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # 관계 설정
    inquiry = relationship("Inquiry", back_populates="project")
    status_logs = relationship("ProjectStatusLog", back_populates="project")
    color_measurements = relationship("ColorMeasurementLog", back_populates="project")
    samples = relationship("ProjectSample", back_populates="project", cascade="all, delete-orphan")
    production_progress = relationship("ProjectProductionProgress", back_populates="project", uselist=False, cascade="all, delete-orphan")


class CosmaxPkgItem(Base):
    __tablename__ = "cosmax_pkg_items"

    cosmax_pkg_item_id = Column(Integer, primary_key=True, index=True)
    type = Column(String(100)) # Tube, Pump, Cap, etc.
    formulation_compatibility = Column(Text)
    material = Column(String(100))
    capacity_options = Column(Text)
    design_type_mold = Column(String(50)) # fixed/exclusive
    status = Column(String(50), default="Available")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class CompatibilityTest(Base):
    __tablename__ = "compatibility_tests"

    test_id = Column(Integer, primary_key=True, index=True)
    inquiry_id = Column(Integer, ForeignKey("inquiries.inquiry_id", ondelete="CASCADE"))
    cosmax_pkg_item_id = Column(Integer, ForeignKey("cosmax_pkg_items.cosmax_pkg_item_id", ondelete="CASCADE"))
    test_result = Column(Text)
    status = Column(String(50), default="Testing") # Testing, Pass, Fail
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # 관계 설정
    inquiry = relationship("Inquiry", backref="compatibility_tests")
    pkg_item = relationship("CosmaxPkgItem", backref="compatibility_tests")


class ComplianceRule(Base):
    __tablename__ = "compliance_rules"

    rule_id = Column(Integer, primary_key=True, index=True)
    country_code = Column(String(10), nullable=False)
    ingredient_name = Column(String(255), nullable=False)
    restriction_type = Column(String(50), nullable=False) # Banned, Restricted, Allowed
    max_concentration = Column(String(50))
    guideline_text = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class InquiryQuestion(Base):
    __tablename__ = "inquiry_questions"

    questionnaire_id = Column(Integer, primary_key=True, index=True)
    inquiry_id = Column(Integer, ForeignKey("inquiries.inquiry_id", ondelete="CASCADE"))
    category_id = Column(Integer, ForeignKey("category.category_id", ondelete="CASCADE"))
    score = Column(Integer)
    comments = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # 관계 설정 - inquiries 모델의 backref 명칭 지정 주의
    inquiry = relationship("Inquiry", backref="questionnaires")


class ProjectStatusLog(Base) :
    __tablename__ = "project_status_logs"

    log_id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.project_id", ondelete="CASCADE"))
    status_code = Column(String(50), nullable=False)
    description = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # 관계 설정
    project = relationship("Project", back_populates="status_logs")


class QualityControl(Base):
    __tablename__ = "quality_controls"

    qc_id = Column(Integer, primary_key=True, index=True)
    production_schedule_id = Column(Integer, ForeignKey("production_schedules.schedule_id", ondelete="CASCADE"), nullable=True)
    project_id = Column(Integer, ForeignKey("projects.project_id", ondelete="CASCADE"))
    test_type = Column(String(100)) # 예: 정기검사, 출하검사 등
    result_status_code = Column(String(20), default="1400000001") # 검사대기 (Group 14)
    test_log = Column(Text)
    inspector_name = Column(String(100))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # 관계 설정
    production_schedule = relationship("ProductionSchedule", backref="qc_records")
    project = relationship("Project", backref="qc_records")
    items = relationship("QCItem", back_populates="qc_master", cascade="all, delete-orphan")

class ProductQCSpec(Base):
    __tablename__ = "product_qc_specs"

    spec_id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("product.product_id", ondelete="CASCADE"))
    test_parameter_code = Column(String(100), nullable=False) # 예: pH, 비중, 점도, 성상
    min_value = Column(DECIMAL(15, 4))
    max_value = Column(DECIMAL(15, 4))
    target_value = Column(String(100))
    unit = Column(String(20))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class QCItem(Base):
    __tablename__ = "qc_items"

    qc_item_id = Column(Integer, primary_key=True, index=True)
    qc_id = Column(Integer, ForeignKey("quality_controls.qc_id", ondelete="CASCADE"))
    test_parameter_code = Column(String(100), nullable=False)
    spec_range = Column(String(255))
    actual_value = Column(String(255))
    result_status_code = Column(String(10)) # 1400000003(합격), 1400000004(불합격)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # 관계 설정
    qc_master = relationship("QualityControl", back_populates="items")

class ReferenceSample(Base):
    __tablename__ = "reference_samples"

    sample_id = Column(Integer, primary_key=True, index=True)
    production_schedule_id = Column(Integer, ForeignKey("production_schedules.schedule_id", ondelete="CASCADE"))
    storage_location = Column(String(255))
    sample_quantity = Column(String(50))
    storage_condition = Column(String(100), default="Room Temperature")
    collected_at = Column(DateTime(timezone=True), server_default=func.now())
    expiry_date = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class CoALog(Base):
    __tablename__ = "coa_logs"

    coa_id = Column(Integer, primary_key=True, index=True)
    qc_id = Column(Integer, ForeignKey("quality_controls.qc_id", ondelete="CASCADE"))
    coa_no = Column(String(100), unique=True)
    issued_by_id = Column(Integer, ForeignKey("buyer.buyer_id", ondelete="SET NULL"))
    issued_at = Column(DateTime(timezone=True), server_default=func.now())
    recipient_name = Column(String(255))
    coa_data_snapshot = Column(JSONB) # JSONB 유형 사용 (PostgreSQL 전용)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class OutboundApproval(Base):
    __tablename__ = "outbound_approvals"

    approval_id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.order_id", ondelete="CASCADE"), nullable=True) # 선택적 (확정 시 연결)
    project_id = Column(Integer, ForeignKey("projects.project_id", ondelete="CASCADE")) # 프로젝트 직접 연결
    qc_id = Column(Integer, ForeignKey("quality_controls.qc_id", ondelete="CASCADE")) # 근거가 되는 QC 기록
    
    qc_status_code = Column(String(20))
    settlement_status_code = Column(String(20))
    approval_status_code = Column(String(20), default="2400000001") # 대기(Requested), 2400000002(Approved) 등
    
    approver_id = Column(Integer, ForeignKey("buyer.buyer_id", ondelete="SET NULL"))
    approved_at = Column(DateTime(timezone=True))
    remarks = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class ProjectSample(Base):
    __tablename__ = "project_sample"

    project_sample_id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.project_id", ondelete="CASCADE"))
    version_number = Column(Integer, nullable=False)
    sample_name = Column(String(255))
    sample_status_code = Column(String(20), default="1900000001") # 준비 중
    tracking_number = Column(String(100))
    manufacturer_comments = Column(Text)
    sent_at = Column(DateTime(timezone=True))
    received_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # 관계 설정
    project = relationship("Project", back_populates="samples")
    reviews = relationship("SampleReview", back_populates="project_sample", cascade="all, delete-orphan")

class SampleReview(Base):
    __tablename__ = "sample_review"

    sample_review_id = Column(Integer, primary_key=True, index=True)
    project_sample_id = Column(Integer, ForeignKey("project_sample.project_sample_id", ondelete="CASCADE"))
    buyer_id = Column(Integer, ForeignKey("buyer.buyer_id", ondelete="SET NULL"), nullable=True)
    overall_score = Column(DECIMAL(3, 1))
    scent_score = Column(Integer)
    texture_score = Column(Integer)
    absorption_score = Column(Integer)
    moisture_score = Column(Integer)
    detailed_feedback = Column(Text)
    improvement_requests = Column(Text)
    decision = Column(String(50)) # Approved, Modify, Rejected
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # 관계 설정
    project_sample = relationship("ProjectSample", back_populates="reviews")
    buyer = relationship("User", backref="sample_reviews")

class ProjectProductionProgress(Base):
    __tablename__ = "project_production_progress"

    progress_id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.project_id", ondelete="CASCADE"))
    raw_material_status_code = Column(String(20), default="2000000001")
    packaging_status_code = Column(String(20), default="2100000001")
    production_status_code = Column(String(20), default="2200000001")
    planned_start_date = Column(DateTime(timezone=True))
    planned_end_date = Column(DateTime(timezone=True))
    actual_start_date = Column(DateTime(timezone=True))
    actual_end_date = Column(DateTime(timezone=True))
    remarks = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # 관계 설정
    project = relationship("Project", back_populates="production_progress")
