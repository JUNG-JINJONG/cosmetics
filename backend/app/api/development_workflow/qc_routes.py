from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.api.account_company.auth_utils import get_current_user, RoleChecker
from app.models.user import User as UserModel
from app.services.qc_service import qc_service
from app.schemas.workflow import (
    QualityControlRead, QualityControlCreate, QualityControlUpdate,
    QCItemRead, QCItemCreate, ProductQCSpecRead, ProductQCSpecCreate,
    ReferenceSampleRead, ReferenceSampleCreate,
    CoALogRead, CoALogCreate,
    OutboundApprovalRead, OutboundApprovalCreate, OutboundApprovalUpdate
)

router = APIRouter()

# --- 1. Outbound Approvals (출하 승인) ---
@router.post("/outbound", response_model=OutboundApprovalRead, dependencies=[Depends(RoleChecker(["Admin", "Manufacturer"]))])
def create_outbound_approval(approval_in: OutboundApprovalCreate, db: Session = Depends(get_db)):
    """ 신규 출하 승인 요청을 생성합니다. """
    approval = qc_service.create_outbound_approval(db, approval_in)
    if not approval:
        raise HTTPException(status_code=400, detail="성적서(CoA)가 발행되지 않은 검사건은 출하 승인을 요청할 수 없습니다.")
    return approval

@router.get("/outbound", response_model=List[OutboundApprovalRead])
def get_outbound_approvals(project_id: Optional[int] = None, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """ 출하 승인 요청 목록을 조회합니다. """
    from app.models.workflow import OutboundApproval
    query = db.query(OutboundApproval)
    if project_id:
        query = query.filter(OutboundApproval.project_id == project_id)
    return query.offset(skip).limit(limit).all()

@router.patch("/outbound-update", response_model=OutboundApprovalRead)
def update_outbound_approval(
    approval_id: int, 
    update_in: OutboundApprovalUpdate, 
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(RoleChecker(["Admin", "Client"]))
):
    """ 출하 승인 상태 업데이트 (Query Param 방식) """
    if update_in.approval_status_code == "2400000002" :
        update_in.approver_id = current_user.buyer_id
        
    approval = qc_service.update_outbound_approval(db, approval_id, update_in)
    if not approval:
        raise HTTPException(status_code=404, detail="출하 승인 요청을 찾을 수 없습니다.")
    return approval


# --- 2. Quality Controls Master & Items ---
@router.get("/detail", response_model=QualityControlRead)
def get_qc_detail(qc_id: int, db: Session = Depends(get_db)):
    """ QC 상세 내역 조회 (Query Param 방식) """
    from app.models.workflow import QualityControl as QualityControlModel
    qc = db.query(QualityControlModel).filter(QualityControlModel.qc_id == qc_id).first()
    if not qc:
        raise HTTPException(status_code=404, detail="QC 기록을 찾을 수 없습니다.")
    return qc

@router.post("/items/initialize", response_model=List[QCItemRead], dependencies=[Depends(RoleChecker(["Admin", "Manufacturer"]))])
def initialize_qc_items(qc_id: int, product_id: int, db: Session = Depends(get_db)):
    """ 제품 Spec 기반 QC 항목 자동 생성 (Query Param 방식) """
    return qc_service.initialize_qc_items_from_specs(db, qc_id, product_id)

@router.patch("/items/batch-results", response_model=List[QCItemRead], dependencies=[Depends(RoleChecker(["Admin", "Manufacturer"]))])
def batch_update_qc_items_results(qc_id: int, results: List[dict], db: Session = Depends(get_db)):
    """ 여러 QC 항목 결과 일괄 입력 (Query Param 방식) """
    return qc_service.batch_update_item_results(db, qc_id, results)

@router.patch("/items/result", response_model=Optional[QCItemRead], dependencies=[Depends(RoleChecker(["Admin", "Manufacturer"]))])
def update_qc_item_result(qc_item_id: int, actual_value: str, db: Session = Depends(get_db)):
    """ 개별 QC 항목 결과 업데이트 (Query Param 방식) """
    return qc_service.update_qc_item_result(db, qc_item_id, actual_value)


# --- 3. CoA Management ---
@router.get("/coa/report", response_model=Optional[dict])
def get_coa_report(qc_id: int, db: Session = Depends(get_db)):
    """ 발행된 CoA 정보 조회 (Query Param 방식) """
    res = qc_service.get_coa_by_qc(db, qc_id)
    if not res: return None
    return {
        "coa_id": res.coa_id,
        "coa_no": res.coa_no,
        "issued_at": res.issued_at,
        "snapshot": res.coa_data_snapshot
    }

@router.post("/coa/issue-report", response_model=dict)
def issue_coa_report(
    qc_id: int, 
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(RoleChecker(["Admin", "Manufacturer"]))
):
    """ 공식 CoA 발행 (Query Param 방식) """
    issuer_id = getattr(current_user, "buyer_id", 1)
    res = qc_service.issue_coa(db, qc_id, issuer_id)
    if not res:
        raise HTTPException(status_code=400, detail="발행 요건이 충족되지 않았습니다.")
    return {"status": "issued", "coa_no": res.coa_no}


# --- 4. 기타 고정 경로들 ---
@router.post("/", response_model=QualityControlRead, dependencies=[Depends(RoleChecker(["Admin", "Manufacturer"]))])
def create_qc_master(qc_in: QualityControlCreate, db: Session = Depends(get_db)):
    return qc_service.create_qc_request_with_items(db, qc_in)

@router.get("/project-list", response_model=List[QualityControlRead])
def get_project_qc_list(project_id: int, db: Session = Depends(get_db)):
    return qc_service.get_qc_by_project(db, project_id)

@router.post("/specs", response_model=ProductQCSpecRead, dependencies=[Depends(RoleChecker(["Admin", "Manufacturer"]))])
def create_product_spec(spec_in: ProductQCSpecCreate, db: Session = Depends(get_db)):
    return qc_service.create_product_spec(db, spec_in)

@router.get("/specs/products", response_model=List[ProductQCSpecRead])
def get_product_specs(product_id: int, db: Session = Depends(get_db)):
    return qc_service.get_product_specs(db, product_id)

@router.post("/approve-standard", dependencies=[Depends(RoleChecker(["Admin", "Manufacturer"]))])
def approve_standard_approval(product_id: int, qc_id: int, db: Session = Depends(get_db)):
    from app.models.product import Product
    product = db.query(Product).filter(Product.product_id == product_id).first()
    if not product: raise HTTPException(status_code=404, detail="제품을 찾을 수 없습니다.")
    product.status = "StandardApproved"
    db.commit()
    return {"message": "표준품 확정 완료", "product_id": product_id}

@router.post("/samples", response_model=ReferenceSampleRead, dependencies=[Depends(RoleChecker(["Admin", "Manufacturer"]))])
def create_sample(sample_in: ReferenceSampleCreate, db: Session = Depends(get_db)):
    return qc_service.create_reference_sample(db, sample_in)

@router.get("/samples", response_model=List[ReferenceSampleRead])
def get_samples(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return qc_service.get_reference_samples(db, skip, limit)

@router.get("/coa/logs", response_model=List[CoALogRead])
def get_coa_logs_history(qc_id: Optional[int] = None, db: Session = Depends(get_db)):
    return qc_service.get_coa_logs(db, qc_id)
