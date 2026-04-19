from __future__ import annotations
from pydantic import BaseModel, HttpUrl
from typing import Optional, List
from datetime import datetime
from decimal import Decimal

# --- Inquiry Schemas ---
class InquiryBase(BaseModel):
    brand_name: str
    company_id: Optional[int] = None
    registration_num: Optional[str] = None
    website_url: Optional[str] = None
    item_type: Optional[str] = None
    target_price: Optional[Decimal] = None
    scent_pref: Optional[str] = None
    container_type: Optional[str] = None
    capacity: Optional[str] = None
    quantity: Optional[int] = None
    cosmax_pkg_item_id: Optional[int] = None
    export_countries: Optional[str] = None

class InquiryCreate(InquiryBase):
    pass

class Inquiry(InquiryBase):
    inquiry_id: int
    buyer_id: int
    created_at: datetime
    project: Optional[Project] = None
    # quotations는 business schema와 순환참조가 생길 수 있으므로 나중에 필요시 추가

    class Config:
        from_attributes = True

# --- Project Schemas ---
class ProjectBase(BaseModel):
    status_code: str = "Pending"
    current_phase_percent: int = 0
    start_at: Optional[datetime] = None
    expected_completion_at: Optional[datetime] = None

class ProjectCreate(ProjectBase):
    inquiry_id: int

class ProjectUpdate(BaseModel):
    status_code: Optional[str] = None
    current_phase_percent: Optional[int] = None
    start_at: Optional[datetime] = None
    expected_completion_at: Optional[datetime] = None

class Project(ProjectBase):
    project_id: int
    inquiry_id: int
    updated_at: datetime

    class Config:
        from_attributes = True

# --- Proposal Submission (Manufacturer) ---
class ProposalSubmission(BaseModel):
    project_id: int
    formulation_description: str
    main_ingredients: str
    unit_price: Decimal
    moq: int
    expected_completion_date: Optional[datetime] = None
    comments: Optional[str] = None

# --- Packaging/Assets Schemas ---
class PkgItemBase(BaseModel):
    type: str # Tube, Pump, Cap, etc.
    formulation_compatibility: Optional[str] = None
    material: Optional[str] = None
    capacity_options: Optional[str] = None
    design_type_mold: Optional[str] = None
    status: str = "Available"

class PkgItemCreate(PkgItemBase):
    pass

class PkgItemUpdate(BaseModel):
    type: Optional[str] = None
    formulation_compatibility: Optional[str] = None
    material: Optional[str] = None
    capacity_options: Optional[str] = None
    design_type_mold: Optional[str] = None
    status: Optional[str] = None

class PkgItem(PkgItemBase):
    cosmax_pkg_item_id: int
    created_at: datetime

    class Config:
        from_attributes = True

# --- Compatibility Test Schemas ---
class CompatibilityTestBase(BaseModel):
    inquiry_id: int
    cosmax_pkg_item_id: int
    test_result: Optional[str] = None
    status: str = "Testing"

class CompatibilityTestCreate(CompatibilityTestBase):
    pass

class CompatibilityTestUpdate(BaseModel):
    test_result: Optional[str] = None
    status: Optional[str] = None

class CompatibilityTest(CompatibilityTestBase):
    test_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# --- Compliance Rule Schemas ---
class ComplianceRuleBase(BaseModel):
    country_code: str
    ingredient_name: str
    restriction_type: str
    max_concentration: Optional[str] = None
    guideline_text: Optional[str] = None

class ComplianceRuleCreate(ComplianceRuleBase):
    pass

class ComplianceRuleUpdate(BaseModel):
    restriction_type: Optional[str] = None
    max_concentration: Optional[str] = None
    guideline_text: Optional[str] = None

class ComplianceRule(ComplianceRuleBase):
    rule_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# --- Inquiry Question (Questionnaire) Schemas ---
class InquiryQuestionBase(BaseModel):
    inquiry_id: int
    category_id: int
    score: Optional[int] = None
    comments: Optional[str] = None

class InquiryQuestionCreate(InquiryQuestionBase):
    pass

class InquiryQuestionUpdate(BaseModel):
    score: Optional[int] = None
    comments: Optional[str] = None

class InquiryQuestion(InquiryQuestionBase):
    questionnaire_id: int
    created_at: datetime

    class Config:
        from_attributes = True


# --- Project Status Log Schemas ---
class ProjectStatusLogBase(BaseModel):
    status_code: str
    description: Optional[str] = None

class ProjectStatusLogCreate(ProjectStatusLogBase):
    project_id: int

class ProjectStatusLog(ProjectStatusLogBase):
    log_id: int
    project_id: int
    created_at: datetime

    class Config:
        from_attributes = True


# --- Quality Control Schemas ---
class QualityControlBase(BaseModel):
    test_type: Optional[str] = None
    result_status_code: str = "1400000001" # 검사대기
    test_log: Optional[str] = None
    inspector_name: Optional[str] = None

class QualityControlCreate(QualityControlBase):
    production_schedule_id: Optional[int] = None
    project_id: int

class QualityControlUpdate(BaseModel):
    result_status_code: Optional[str] = None
    test_log: Optional[str] = None
    inspector_name: Optional[str] = None

# --- QC Item Schemas ---
class QCItemBase(BaseModel):
    test_parameter_code: str
    spec_range: Optional[str] = None
    actual_value: Optional[str] = None
    result_status_code: Optional[str] = None

class QCItemCreate(QCItemBase):
    qc_id: int

class QCItemRead(QCItemBase):
    qc_item_id: int
    qc_id: int
    created_at: datetime
    class Config:
        from_attributes = True

class QualityControlRead(QualityControlBase):
    qc_id: int
    production_schedule_id: Optional[int] = None
    project_id: int
    created_at: datetime
    items: List[QCItemRead] = []

    class Config:
        from_attributes = True

# --- Product QC Spec Schemas ---
class ProductQCSpecBase(BaseModel):
    product_id: int
    test_parameter_code: str
    min_value: Optional[Decimal] = None
    max_value: Optional[Decimal] = None
    target_value: Optional[str] = None
    unit: Optional[str] = None

class ProductQCSpecCreate(ProductQCSpecBase):
    pass

class ProductQCSpecRead(ProductQCSpecBase):
    spec_id: int
    created_at: datetime
    class Config:
        from_attributes = True

# --- Reference Sample Schemas ---
class ReferenceSampleBase(BaseModel):
    production_schedule_id: int
    storage_location: Optional[str] = None
    sample_quantity: Optional[str] = None
    storage_condition: Optional[str] = "Room Temperature"
    expiry_date: Optional[datetime] = None

class ReferenceSampleCreate(ReferenceSampleBase):
    pass

class ReferenceSampleRead(ReferenceSampleBase):
    sample_id: int
    collected_at: datetime
    created_at: datetime
    class Config:
        from_attributes = True

# --- CoA Log Schemas ---
class CoALogBase(BaseModel):
    qc_id: int
    coa_no: str
    recipient_name: Optional[str] = None
    coa_data_snapshot: Optional[dict] = None

class CoALogCreate(CoALogBase):
    issued_by_id: int

class CoALogRead(CoALogBase):
    coa_id: int
    issued_by_id: Optional[int]
    issued_at: datetime
    created_at: datetime
    class Config:
        from_attributes = True

# --- Outbound Approval Schemas ---
class OutboundApprovalBase(BaseModel):
    project_id: Optional[int] = None
    qc_id: Optional[int] = None
    order_id: Optional[int] = None
    qc_status_code: Optional[str] = None
    settlement_status_code: Optional[str] = None
    approval_status_code: Optional[str] = "2400000001"
    remarks: Optional[str] = None

class OutboundApprovalCreate(OutboundApprovalBase):
    pass

class OutboundApprovalUpdate(BaseModel):
    approval_status_code: Optional[str] = None
    approver_id: Optional[int] = None
    approved_at: Optional[datetime] = None
    remarks: Optional[str] = None

class OutboundApprovalRead(OutboundApprovalBase):
    approval_id: int
    approver_id: Optional[int]
    approved_at: Optional[datetime]
    created_at: datetime
    class Config:
        from_attributes = True

# --- Project Sample Schemas ---
class ProjectSampleBase(BaseModel):
    version_number: int
    sample_name: Optional[str] = None
    sample_status_code: str = "1900000001"
    tracking_number: Optional[str] = None
    manufacturer_comments: Optional[str] = None
    sent_at: Optional[datetime] = None
    received_at: Optional[datetime] = None

class ProjectSampleCreate(ProjectSampleBase):
    project_id: int

class ProjectSampleUpdate(BaseModel):
    sample_name: Optional[str] = None
    sample_status_code: Optional[str] = None
    tracking_number: Optional[str] = None
    manufacturer_comments: Optional[str] = None
    sent_at: Optional[datetime] = None
    received_at: Optional[datetime] = None

class ProjectSampleRead(ProjectSampleBase):
    project_sample_id: int
    project_id: int
    created_at: datetime
    updated_at: datetime
    reviews: List[SampleReviewRead] = []

    class Config:
        from_attributes = True

# --- Sample Review Schemas ---
class SampleReviewBase(BaseModel):
    overall_score: Optional[Decimal] = None
    scent_score: Optional[int] = None
    texture_score: Optional[int] = None
    absorption_score: Optional[int] = None
    moisture_score: Optional[int] = None
    detailed_feedback: Optional[str] = None
    improvement_requests: Optional[str] = None
    decision: Optional[str] = None # Approved, Modify, Rejected

class SampleReviewCreate(SampleReviewBase):
    project_sample_id: int

class SampleReviewUpdate(SampleReviewBase):
    pass

class SampleReviewRead(SampleReviewBase):
    sample_review_id: int
    project_sample_id: int
    buyer_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# --- Production Progress Schemas ---
class ProductionProgressBase(BaseModel):
    raw_material_status_code: str = "2000000001"
    packaging_status_code: str = "2100000001"
    production_status_code: str = "2200000001"
    planned_start_date: Optional[datetime] = None
    planned_end_date: Optional[datetime] = None
    actual_start_date: Optional[datetime] = None
    actual_end_date: Optional[datetime] = None
    remarks: Optional[str] = None

class ProductionProgressCreate(ProductionProgressBase):
    project_id: int

class ProductionProgressUpdate(BaseModel):
    raw_material_status_code: Optional[str] = None
    packaging_status_code: Optional[str] = None
    production_status_code: Optional[str] = None
    planned_start_date: Optional[datetime] = None
    planned_end_date: Optional[datetime] = None
    actual_start_date: Optional[datetime] = None
    actual_end_date: Optional[datetime] = None
    remarks: Optional[str] = None

class ProductionProgressRead(ProductionProgressBase):
    progress_id: int
    project_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
