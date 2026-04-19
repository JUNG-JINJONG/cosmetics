from sqlalchemy.orm import Session
from app.models.workflow import QualityControl, QCItem, ProductQCSpec, ReferenceSample, CoALog, OutboundApproval, Project, Inquiry
from app.schemas.workflow import (
    QualityControlCreate, QCItemBase, ProductQCSpecCreate,
    ReferenceSampleCreate, CoALogCreate, OutboundApprovalCreate, OutboundApprovalUpdate
)
from decimal import Decimal
from typing import List, Optional
import datetime

class QCService:
    # --- 1. QC Master & Items (Standard Logic) ---
    def create_qc_request_with_items(self, db: Session, qc_in: QualityControlCreate):
        """ QC 마스터 요청을 생성하고 초기화합니다. (기본 항목 자동 생성 포함) """
        db_qc = QualityControl(**qc_in.model_dump())
        db.add(db_qc)
        db.commit()
        db.refresh(db_qc)
        
        # 신규 생성 시 제품 규격(Spec)을 기반으로 항목들을 즉시 생성하여 프론트엔드에 전달
        # 현재는 테스트를 위해 기본 product_id=1로 초기화 (추후 동적 매핑 가능)
        self.initialize_qc_items_from_specs(db, db_qc.qc_id, 1)
        
        # 프로젝트 상태를 '품질 검사(1300000008)' 단계로 전환
        project = db.query(Project).filter(Project.project_id == db_qc.project_id).first()
        if project:
            project.status_code = "1300000008"
            project.current_phase_percent = 80
            db.commit()

        db.refresh(db_qc)
        return db_qc

    def initialize_qc_items_from_specs(self, db: Session, qc_id: int, product_id: int):
        """ 제품 Spec을 기반으로 QC 상세 항목들을 자동 생성합니다. (기존 항목은 삭제 후 재생성) """
        # 기존 항목 삭제 (중복 방지)
        db.query(QCItem).filter(QCItem.qc_id == qc_id).delete()
        
        specs = db.query(ProductQCSpec).filter(ProductQCSpec.product_id == product_id).all()
        created_items = []
        
        if not specs:
            # 규격이 없을 경우 기본 테스트 항목 3종 강제 생성
            default_params = [
                ("2300000001", "5.0 ~ 7.0"), # pH
                ("2300000002", "3000 ~ 5000 cps"), # 점도
                ("2300000004", "표준품과 동일할 것") # 성상
            ]
            for param_code, spec_range in default_params:
                db_item = QCItem(
                    qc_id=qc_id,
                    test_parameter_code=param_code,
                    spec_range=spec_range,
                    result_status_code="1400000001"
                )
                db.add(db_item)
                created_items.append(db_item)
        else:
            for spec in specs:
                full_spec = ""
                if spec.min_value is not None and spec.max_value is not None:
                    full_spec = f"{spec.min_value} ~ {spec.max_value} {spec.unit or ''}"
                elif spec.target_value:
                    full_spec = spec.target_value

                db_item = QCItem(
                    qc_id=qc_id,
                    test_parameter_code=spec.test_parameter_code,
                    spec_range=full_spec,
                    result_status_code="1400000001"
                )
                db.add(db_item)
                created_items.append(db_item)
        
        db.commit()
        return created_items

    def update_qc_item_result(self, db: Session, qc_item_id: int, actual_value: str):
        """ 상세 시험 결과 입력 및 자동 판정 """
        db_item = db.query(QCItem).filter(QCItem.qc_item_id == qc_item_id).first()
        if not db_item: return None
        
        db_item.actual_value = actual_value
        is_pass = self._evaluate_result(db_item.spec_range, actual_value)

        db_item.result_status_code = "1400000004" if is_pass else "1400000005"
        db.commit()
        db.refresh(db_item)
        self._check_and_update_master_status(db, db_item.qc_id)
        return db_item

    def batch_update_item_results(self, db: Session, qc_id: int, results: List[dict]):
        """ 여러 항목의 결과를 한 번에 업데이트 """
        updated_items = []
        for res in results:
            item_id = res.get("qc_item_id")
            val = res.get("actual_value")
            db_item = db.query(QCItem).filter(QCItem.qc_item_id == item_id).first()
            if db_item:
                db_item.actual_value = val
                is_pass = self._evaluate_result(db_item.spec_range, val)
                db_item.result_status_code = "1400000004" if is_pass else "1400000005"
                updated_items.append(db_item)
        
        db.commit()
        self._check_and_update_master_status(db, qc_id)
        return updated_items

    def _evaluate_result(self, spec_range: str, actual_value: str) -> bool:
        """ 규격과 결과값을 비교하여 합불 여부 판정 """
        if not actual_value: return False
        if actual_value in ["동일", "적합", "음성 (Negative)"]: return True
        
        is_pass = True
        try:
            val = float(actual_value)
            if "~" in spec_range:
                parts = spec_range.split("~")
                low = float(parts[0].strip().split()[0])
                high = float(parts[1].strip().split()[0])
                if not (low <= val <= high): is_pass = False
        except:
             if spec_range and actual_value not in spec_range:
                 is_pass = False
        return is_pass

    def _check_and_update_master_status(self, db: Session, qc_id: int):
        items = db.query(QCItem).filter(QCItem.qc_id == qc_id).all()
        if not items: return
        all_passed = all(item.result_status_code == "1400000004" for item in items)
        any_failed = any(item.result_status_code == "1400000005" for item in items)
        master = db.query(QualityControl).filter(QualityControl.qc_id == qc_id).first()
        if master:
            if any_failed: master.result_status_code = "1400000005"
            elif all_passed: master.result_status_code = "1400000004"
            else: master.result_status_code = "1400000003" # 진행중
            db.commit()

    # --- 2. Product Spec Management ---
    def create_product_spec(self, db: Session, spec_in: ProductQCSpecCreate):
        db_spec = ProductQCSpec(**spec_in.model_dump())
        db.add(db_spec)
        db.commit()
        db.refresh(db_spec)
        return db_spec

    def get_product_specs(self, db: Session, product_id: int):
        return db.query(ProductQCSpec).filter(ProductQCSpec.product_id == product_id).all()

    # --- 3. OQC: Reference Samples ---
    def create_reference_sample(self, db: Session, sample_in: ReferenceSampleCreate):
        db_sample = ReferenceSample(**sample_in.model_dump())
        db.add(db_sample)
        db.commit()
        db.refresh(db_sample)
        return db_sample

    def get_reference_samples(self, db: Session, skip: int = 0, limit: int = 100):
        return db.query(ReferenceSample).offset(skip).limit(limit).all()

    def issue_coa(self, db: Session, qc_id: int, issuer_id: int):
        """ CoA(시험성적서)를 공식 발행하고 기록을 남깁니다. """
        db_qc = db.query(QualityControl).filter(QualityControl.qc_id == qc_id).first()
        if not db_qc or not db_qc.items:
            return None
        
        # 발행 번호 생성 (COA-YYYYMMDD-SEQUENCE)
        today_str = datetime.date.today().strftime("%Y%m%d")
        count = db.query(CoALog).filter(CoALog.coa_no.like(f"COA-{today_str}-%")).count()
        new_coa_no = f"COA-{today_str}-{(count + 1):03d}"

        # 데이터 스냅샷 준비 (JSON 형태로 저장)
        items_data = []
        for item in db_qc.items:
            items_data.append({
                "parameter": item.test_parameter_code,
                "spec": item.spec_range,
                "result": item.actual_value,
                "status": item.result_status_code
            })
        
        snapshot = {
            "qc_id": qc_id,
            "project_id": db_qc.project_id,
            "test_type": db_qc.test_type,
            "inspector": db_qc.inspector_name,
            "items": items_data,
            "issued_at": datetime.datetime.now().isoformat()
        }

        db_coa = CoALog(
            qc_id=qc_id,
            coa_no=new_coa_no,
            issued_by_id=issuer_id, 
            coa_data_snapshot=snapshot
        )
        db.add(db_coa)

        # CoA가 성공적으로 발행되면 프로젝트 상태를 '출고 및 배송(1300000009)' 단계로 전환
        project = db.query(Project).filter(Project.project_id == db_qc.project_id).first()
        if project:
            project.status_code = "1300000009"
            project.current_phase_percent = 95
            db.commit()

        db.refresh(db_coa)
        return db_coa

    def get_coa_by_qc(self, db: Session, qc_id: int):
        return db.query(CoALog).filter(CoALog.qc_id == qc_id).first()

    # --- 5. OQC: Outbound Approval ---
    def create_outbound_approval(self, db: Session, approval_in: OutboundApprovalCreate):
        """ 출하 승인 요청을 생성합니다. (CoA 발행 확인 및 기본 상태값 자동 설정) """
        # 해당 QC에 대해 발행된 CoA가 있는지 확인
        coa = db.query(CoALog).filter(CoALog.qc_id == approval_in.qc_id).first()
        if not coa:
            return None # CoA 없이 출하 요청 불가
            
        data = approval_in.model_dump()
        
        # 기본 비즈니스 코드 자동 할당 (Category 테이블 기반)
        if not data.get("qc_status_code"):
            data["qc_status_code"] = "1400000004" # 합격 (Fixed)
        if not data.get("settlement_status_code"):
            data["settlement_status_code"] = "2500000001" # 정산 대기 (Pending)
        if not data.get("approval_status_code"):
            data["approval_status_code"] = "2400000001" # 출하 승인 요청 (Requested)

        db_approval = OutboundApproval(**data)
        db.add(db_approval)

        # 프로젝트 메인 상태 업데이트 (출고 및 배송)
        project = db.query(Project).filter(Project.project_id == db_approval.project_id).first()
        if project:
            project.status_code = "1300000009"
            project.current_phase_percent = 95

        db.commit()
        db.refresh(db_approval)
        return db_approval

    def update_outbound_approval(self, db: Session, approval_id: int, update_in: OutboundApprovalUpdate):
        """ 출하 승인 상태 업데이트 (Approved 시 시간 기록 및 프로젝트 완료 처리) """
        db_approval = db.query(OutboundApproval).filter(OutboundApproval.approval_id == approval_id).first()
        if db_approval:
            for key, value in update_in.model_dump(exclude_unset=True).items():
                setattr(db_approval, key, value)
            
            # 승인 완료(2400000002) 처리 시
            if update_in.approval_status_code == "2400000002":
                if not db_approval.approved_at:
                    db_approval.approved_at = datetime.datetime.now()
                
                # 프로젝트 메인 상태 업데이트 (완료)
                project = db.query(Project).filter(Project.project_id == db_approval.project_id).first()
                if project:
                    project.status_code = "1300000010" # 완료
                    project.current_phase_percent = 100
            
            db.commit()
            db.refresh(db_approval)
        return db_approval

    def get_outbound_approvals_by_project(self, db: Session, project_id: int):
        """ 특정 프로젝트의 모든 출하 승인 요청 조회 """
        return db.query(OutboundApproval).filter(OutboundApproval.project_id == project_id).all()

    def get_qc_by_project(self, db: Session, project_id: int):
        """ 특정 프로젝트의 모든 QC 기록 조회 """
        return db.query(QualityControl).filter(QualityControl.project_id == project_id).all()

qc_service = QCService()
