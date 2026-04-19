from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.user import User as UserModel
from app.api.account_company.auth_utils import get_current_user, RoleChecker
from app.models.workflow import (
    Inquiry as InquiryModel, Project as ProjectModel, 
    CosmaxPkgItem as PkgItemModel, CompatibilityTest as CompatibilityTestModel, 
    ComplianceRule as ComplianceRuleModel, InquiryQuestion as InquiryQuestionModel,
    ProjectStatusLog as ProjectStatusLogModel, QualityControl as QualityControlModel
)
from app.models.business import Quotation as QuotationModel, QuotationItem as QuotationItemModel
from app.schemas.workflow import (
    Inquiry, InquiryCreate, Project, ProjectCreate, ProjectUpdate, 
    PkgItem, PkgItemCreate, PkgItemUpdate, CompatibilityTest, 
    CompatibilityTestCreate, CompatibilityTestUpdate, ComplianceRule, 
    ComplianceRuleCreate, ComplianceRuleUpdate, InquiryQuestion, 
    InquiryQuestionCreate, InquiryQuestionUpdate,
    ProjectStatusLog, ProjectStatusLogCreate,
    QualityControlRead as QualityControl, QualityControlCreate, QualityControlUpdate,
    ProposalSubmission
)

router = APIRouter()

# ---------------------------------------------------------
# 1. 원스톱 개발 의뢰 (Inquiry)
# ---------------------------------------------------------
@router.post("/inquiries", response_model=Inquiry, status_code=status.HTTP_201_CREATED)
def create_inquiry(
    inquiry: InquiryCreate, 
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    """정밀 제형 의뢰 등 브랜드 컨셉 기획 단계 문진 정보 저장 + 자동 프로젝트 생성"""
    new_inquiry = InquiryModel(**inquiry.model_dump(), buyer_id=current_user.buyer_id)
    db.add(new_inquiry)
    db.flush() # inquiry_id를 얻기 위해 flush
    
    # 자동으로 프로젝트 레코드 생성 (상태: 기획 및 의뢰)
    new_project = ProjectModel(
        inquiry_id=new_inquiry.inquiry_id,
        status_code="1300000001",
        current_phase_percent=0
    )
    db.add(new_project)
    
    # 상태 로그 기록
    status_log = ProjectStatusLogModel(
        status_code="1300000001",
        description="신규 의뢰가 접수되었습니다. (기획 및 의뢰 단계)"
    )
    # 관계를 통한 설정
    new_project.status_logs.append(status_log)
    
    db.commit()
    db.refresh(new_inquiry)
    return new_inquiry

@router.get("/inquiries", response_model=List[Inquiry])
def get_user_inquiries(
    skip: int = 0, limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    """자신이 의뢰한 내역 조회 (권한별 필터링 적용)"""
    # 1. 관리자(Admin)는 전체 조회
    if current_user.role == "Admin":
        return db.query(InquiryModel).offset(skip).limit(limit).all()
    
    # 2. 제조사(Manufacturer)는 전체 조회 또는 담당 업체 데이터 조회
    if current_user.role == "Manufacturer":
        company_id = getattr(current_user, "company_id", None)
        if company_id:
            return db.query(InquiryModel).filter(
                (InquiryModel.company_id == company_id) | 
                (InquiryModel.company_id == None) 
            ).offset(skip).limit(limit).all()
        return db.query(InquiryModel).offset(skip).limit(limit).all()
        
    # 3. 일반 바이어(Client)는 본인이 작성한 의뢰만 조회
    return db.query(InquiryModel).filter(InquiryModel.buyer_id == current_user.buyer_id).offset(skip).limit(limit).all()

@router.get("/inquiries/detail", response_model=Inquiry)
def get_inquiry_detail(
    inquiry_id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    """특정 의뢰의 모든 상세 문항을 펼쳐서 조회"""
    db_inquiry = db.query(InquiryModel).filter(InquiryModel.inquiry_id == inquiry_id).first()
    if not db_inquiry:
        raise HTTPException(status_code=404, detail="의뢰 정보를 찾을 수 없습니다.")
        
    # 권한 체크:
    # 1. 관리자(Admin)는 패스
    if current_user.role == "Admin":
        pass
    # 2. 제조사(Manufacturer)는 본인 업체에 배정된 의뢰만 가능
    elif current_user.role == "Manufacturer":
        user_company_id = getattr(current_user, "company_id", None)
        print(f"DEBUG: inquiry {inquiry_id} company_id={db_inquiry.company_id}, user_company_id={user_company_id}")
        if db_inquiry.company_id != user_company_id:
            raise HTTPException(status_code=403, detail="귀하의 업체에 배정된 의뢰가 아닙니다.")
    # 3. 바이어(Client)는 본인이 작성한 것만 가능
    elif current_user.role == "Client" and db_inquiry.buyer_id != current_user.buyer_id:
        raise HTTPException(status_code=403, detail="자신이 작성한 의뢰서만 열람할 수 있습니다.")
        
    return db_inquiry

@router.post("/inquiries/accept", response_model=Inquiry)
def accept_inquiry(
    inquiry_id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    """제조사가 신규 의뢰를 수락하여 개발 진행 확정 (상태: 제조사 수락 1300000011)"""
    # 1. 권한 체크
    if current_user.role != "Manufacturer" and current_user.role != "Admin":
        raise HTTPException(status_code=403, detail="제조사 권한이 필요합니다.")
    
    # 2. 제조사 ID 확인
    company_id = getattr(current_user, "company_id", None)
    if not company_id and current_user.role != "Admin":
        raise HTTPException(status_code=400, detail="소속된 업체 정보가 없는 사용자입니다.")

    # 3. 의뢰 존재 여부 및 중복 수락 체크
    db_inquiry = db.query(InquiryModel).filter(InquiryModel.inquiry_id == inquiry_id).first()
    if not db_inquiry:
        raise HTTPException(status_code=404, detail="의뢰 정보를 찾을 수 없습니다.")
    
    if db_inquiry.company_id:
        raise HTTPException(status_code=400, detail="이미 제조사가 배정된 의뢰입니다.")

    # 4. 의뢰에 제조사 배정
    db_inquiry.company_id = company_id

    # 5. 연관 프로젝트 상태 업데이트 (-> 제조사 수락: 1300000011)
    db_project = db.query(ProjectModel).filter(ProjectModel.inquiry_id == inquiry_id).first()
    if db_project:
        db_project.status_code = "1300000011"
        
        # 상태 로그 추가
        status_log = ProjectStatusLogModel(
            project_id=db_project.project_id,
            status_code="1300000011",
            description=f"제조사({current_user.name}) 측에서 의뢰를 수락했습니다. 제안서 작성을 대기 중입니다."
        )
        db.add(status_log)

    db.commit()
    db.refresh(db_inquiry)
    return db_inquiry

# ---------------------------------------------------------
# 1.5 상세 문진 매핑 (Inquiry Questions)
# ---------------------------------------------------------
@router.post("/inquiry-questions", response_model=InquiryQuestion, status_code=status.HTTP_201_CREATED)
def create_inquiry_question(
    question: InquiryQuestionCreate,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    """특정 의뢰에 카테고리(효능/성분 등) 매핑 항목 추가"""
    db_inquiry = db.query(InquiryModel).filter(InquiryModel.inquiry_id == question.inquiry_id).first()
    if not db_inquiry:
        raise HTTPException(status_code=404, detail="의뢰 정보를 찾을 수 없습니다.")
        
    if current_user.role == "Client" and db_inquiry.buyer_id != current_user.buyer_id:
        raise HTTPException(status_code=403, detail="자신이 작성한 의뢰서에만 문항을 추가할 수 있습니다.")
        
    new_q = InquiryQuestionModel(**question.model_dump())
    db.add(new_q)
    db.commit()
    db.refresh(new_q)
    return new_q

@router.get("/inquiries/questions", response_model=List[InquiryQuestion])
def get_inquiry_questions(
    inquiry_id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    """특정 의뢰에 매핑된 모든 문항(효능, 성분 등) 조회"""
    db_inquiry = db.query(InquiryModel).filter(InquiryModel.inquiry_id == inquiry_id).first()
    if not db_inquiry:
        raise HTTPException(status_code=404, detail="의뢰 정보를 찾을 수 없습니다.")
        
    if current_user.role == "Client" and db_inquiry.buyer_id != current_user.buyer_id:
        raise HTTPException(status_code=403, detail="자신이 작성한 의뢰서만 열람할 수 있습니다.")
        
    questions = db.query(InquiryQuestionModel).filter(InquiryQuestionModel.inquiry_id == inquiry_id).all()
    return questions

@router.patch("/inquiry-questions/update", response_model=InquiryQuestion)
def update_inquiry_question(
    questionnaire_id: int,
    q_update: InquiryQuestionUpdate,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    """매핑된 문항의 점수(중요도)나 의견 업데이트"""
    db_q = db.query(InquiryQuestionModel).filter(InquiryQuestionModel.questionnaire_id == questionnaire_id).first()
    if not db_q:
        raise HTTPException(status_code=404, detail="문항 정보를 찾을 수 없습니다.")
        
    db_inquiry = db.query(InquiryModel).filter(InquiryModel.inquiry_id == db_q.inquiry_id).first()
    if current_user.role == "Client" and db_inquiry.buyer_id != current_user.buyer_id:
        raise HTTPException(status_code=403, detail="자신의 의뢰서 문항만 수정할 수 있습니다.")
        
    update_data = q_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_q, key, value)
        
    db.commit()
    db.refresh(db_q)
    return db_q

@router.delete("/inquiry-questions/delete", status_code=status.HTTP_204_NO_CONTENT)
def delete_inquiry_question(
    questionnaire_id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    """선택한 문항(효능/성분 등)을 의뢰서에서 삭제(매핑 해제)"""
    db_q = db.query(InquiryQuestionModel).filter(InquiryQuestionModel.questionnaire_id == questionnaire_id).first()
    if not db_q:
        raise HTTPException(status_code=404, detail="문항 정보를 찾을 수 없습니다.")
        
    db_inquiry = db.query(InquiryModel).filter(InquiryModel.inquiry_id == db_q.inquiry_id).first()
    if current_user.role == "Client" and db_inquiry.buyer_id != current_user.buyer_id:
        raise HTTPException(status_code=403, detail="자신의 의뢰서 문항만 삭제할 수 있습니다.")
        
    db.delete(db_q)
    db.commit()
    return None

# ---------------------------------------------------------
# 2. 패키징 솔루션 (Packaging Assets)
# ---------------------------------------------------------
@router.get("/packages", response_model=List[PkgItem])
def get_packaging_options(
    type: str = None,
    material: str = None,
    skip: int = 0, limit: int = 100,
    db: Session = Depends(get_db)
):
    """제형 적합성 및 용량별 부자재 라이브러리 검색"""
    query = db.query(PkgItemModel).filter(PkgItemModel.status == "Available")
    if type:
        query = query.filter(PkgItemModel.type.ilike(f"%{type}%"))
    if material:
        query = query.filter(PkgItemModel.material.ilike(f"%{material}%"))
        
    items = query.offset(skip).limit(limit).all()
    return items

@router.post("/packages", response_model=PkgItem, dependencies=[Depends(RoleChecker(["Admin", "Manufacturer"]))], status_code=status.HTTP_201_CREATED)
def create_packaging_option(
    pkg: PkgItemCreate,
    db: Session = Depends(get_db)
):
    """신규 패키징 부자재 라이브러리 항목 추가 (관리자/제조사 전용)"""
    new_pkg = PkgItemModel(**pkg.model_dump())
    db.add(new_pkg)
    db.commit()
    db.refresh(new_pkg)
    return new_pkg

@router.patch("/packages/update", response_model=PkgItem, dependencies=[Depends(RoleChecker(["Admin", "Manufacturer"]))])
def update_packaging_option(
    pkg_id: int,
    pkg_update: PkgItemUpdate,
    db: Session = Depends(get_db)
):
    """라이브러리에 등록된 패키징 부자재 정보 업데이트"""
    db_pkg = db.query(PkgItemModel).filter(PkgItemModel.cosmax_pkg_item_id == pkg_id).first()
    if not db_pkg:
        raise HTTPException(status_code=404, detail="패키징 자재를 찾을 수 없습니다.")
        
    update_data = pkg_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_pkg, key, value)
        
    db.commit()
    db.refresh(db_pkg)
    return db_pkg

@router.delete("/packages/delete", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(RoleChecker(["Admin", "Manufacturer"]))])
def delete_packaging_option(
    pkg_id: int,
    db: Session = Depends(get_db)
):
    """패키징 부자재 목록에서 영구 삭제 (관리자/제조사 전용)"""
    db_pkg = db.query(PkgItemModel).filter(PkgItemModel.cosmax_pkg_item_id == pkg_id).first()
    if not db_pkg:
        raise HTTPException(status_code=404, detail="패키징 자재를 찾을 수 없습니다.")
        
    db.delete(db_pkg)
    db.commit()
    return None

# ---------------------------------------------------------
# 3. 개발 프로젝트 현황/실시간 대시보드 (Projects)
# ---------------------------------------------------------
@router.post("/projects", response_model=Project, dependencies=[Depends(RoleChecker(["Admin", "Manufacturer"]))])
def initialize_project(
    project: ProjectCreate,
    db: Session = Depends(get_db)
):
    """의뢰(Inquiry) 내용을 바탕으로 실제 개발 프로젝트(Project) 생성 (권한: 제조사, 관리자만)"""
    # 원문 의뢰가 있는지 확인
    db_inq = db.query(InquiryModel).filter(InquiryModel.inquiry_id == project.inquiry_id).first()
    if not db_inq:
        raise HTTPException(status_code=404, detail="관련 의뢰(Inquiry)를 찾을 수 없습니다.")
        
    new_project = ProjectModel(**project.model_dump())
    db.add(new_project)
    db.commit()
    db.refresh(new_project)
    return new_project

@router.get("/projects", response_model=List[Project])
def get_user_projects(
    skip: int = 0, limit: int = 100,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    """내 프로젝트의 실시간 진행 상태 조회 대시보드 API"""
    if current_user.role == "Admin":
        projects = db.query(ProjectModel).offset(skip).limit(limit).all()
    elif current_user.role == "Manufacturer":
        company_id = getattr(current_user, "company_id", None)
        if company_id:
            projects = db.query(ProjectModel).join(InquiryModel).filter(InquiryModel.company_id == company_id).offset(skip).limit(limit).all()
        else:
            projects = db.query(ProjectModel).offset(skip).limit(limit).all()
    else:
        # Client는 자기가 요청한 의뢰에 연결된 프로젝트만 볼 수 있음
        projects = db.query(ProjectModel).join(InquiryModel).filter(InquiryModel.buyer_id == current_user.buyer_id).offset(skip).limit(limit).all()
    return projects

@router.patch("/projects/update", response_model=Project, dependencies=[Depends(RoleChecker(["Admin", "Manufacturer"]))])
def update_project_status(
    project_id: int,
    project_update: ProjectUpdate,
    db: Session = Depends(get_db)
):
    """프로젝트 상태 및 진행률 업데이트 (상태 변경 시 자동으로 로그 기록)"""
    db_proj = db.query(ProjectModel).filter(ProjectModel.project_id == project_id).first()
    if not db_proj:
        raise HTTPException(status_code=404, detail="프로젝트를 찾을 수 없습니다.")
        
    old_status = db_proj.status_code
    update_data = project_update.model_dump(exclude_unset=True)
    
    for key, value in update_data.items():
        setattr(db_proj, key, value)
        
    # 상태가 변경된 경우 로그 기록
    if "status_code" in update_data and update_data["status_code"] != old_status:
        new_log = ProjectStatusLogModel(
            project_id=project_id,
            status_code=update_data["status_code"],
            description=f"상태가 '{old_status}'에서 '{update_data['status_code']}'(으)로 변경되었습니다."
        )
        db.add(new_log)
        
    db.commit()
    db.refresh(db_proj)
    return db_proj

@router.post("/projects/proposal", response_model=Project)
def submit_proposal(
    project_id: int,
    sub: ProposalSubmission,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    """제조사의 상세 제안(처방 및 견적)을 제출하고 상태를 업데이트함"""
    print(f"DEBUG: submit_proposal called for project {project_id}")
    db_proj = db.query(ProjectModel).filter(ProjectModel.project_id == project_id).first()
    if not db_proj:
        print(f"DEBUG: project {project_id} not found")
        raise HTTPException(status_code=404, detail="프로젝트를 찾을 수 없습니다.")
        
    # 권한 체크: 제조사 본인의 프로젝트인지 확인
    db_inquiry = db_proj.inquiry
    user_company_id = getattr(current_user, "company_id", None)
    
    if not db_inquiry:
        raise HTTPException(status_code=400, detail="프로젝트에 연결된 의뢰 정보가 없습니다.")
        
    if db_inquiry.company_id != user_company_id:
        if current_user.role != "Admin":
            raise HTTPException(
                status_code=403, 
                detail=f"해당 프로젝트에 제안서를 제출할 권한이 없습니다. (Inquiry Company: {db_inquiry.company_id}, Your Company: {user_company_id})"
            )

    # 1. 견적(Quotation) 마스터 생성
    new_quote = QuotationModel(
        inquiry_id=db_inquiry.inquiry_id,
        buyer_id=db_inquiry.buyer_id,
        company_id=db_inquiry.company_id,
        quotation_status_code="Sent",
        total_estimated_amount=sub.unit_price * sub.moq,
        currency="KRW",
        comments=f"제형 제안: {sub.formulation_description}\n주요 성분: {sub.main_ingredients}\n기타: {sub.comments}"
    )
    db.add(new_quote)
    db.flush()

    # 2. 견적 상세 항목 생성
    quote_item = QuotationItemModel(
        quotation_id=new_quote.quotation_id,
        quantity=sub.moq,
        unit_price=sub.unit_price,
        subtotal=sub.unit_price * sub.moq
    )
    db.add(quote_item)

    # 3. 프로젝트 상태 업데이트 (1300000012: 제안서 제출)
    old_status = db_proj.status_code
    db_proj.status_code = "1300000012"
    db_proj.current_phase_percent = 20
    if sub.expected_completion_date:
        db_proj.expected_completion_at = sub.expected_completion_date

    # 4. 상태 변경 로그 기록
    log = ProjectStatusLogModel(
        project_id=project_id,
        status_code="1300000012",
        description=f"제조사({current_user.name})가 상세 제안서 및 견적을 제출했습니다. 바이어 검토 대기 중입니다."
    )
    db.add(log)

    db.commit()
    db.refresh(db_proj)
    return db_proj

@router.post("/projects/confirm", response_model=Project)
def confirm_proposal(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    """바이어가 제조사의 제안을 승인하고 계약/확정 단계로 이동함"""
    db_proj = db.query(ProjectModel).filter(ProjectModel.project_id == project_id).first()
    if not db_proj:
        raise HTTPException(status_code=404, detail="프로젝트를 찾을 수 없습니다.")
        
    db_inquiry = db_proj.inquiry
    if not db_inquiry or db_inquiry.buyer_id != current_user.buyer_id:
        if current_user.role != "Admin":
            raise HTTPException(status_code=403, detail="자신이 의뢰한 프로젝트만 승인할 수 있습니다.")

    # 1. 상태 업데이트 (1300000005: 견적 및 계약 확정)
    old_status = db_proj.status_code
    db_proj.status_code = "1300000005"
    db_proj.current_phase_percent = 30 # 계약 단계 진입

    # 2. 상태 변경 로그 기록
    log = ProjectStatusLogModel(
        project_id=project_id,
        status_code="1300000005",
        description=f"바이어({current_user.name})가 제조사의 제안을 최종 승인했습니다. 계약 및 제형 개발 단계로 진입합니다."
    )
    db.add(log)

    db.commit()
    db.refresh(db_proj)
    return db_proj

@router.get("/projects/timeline", response_model=List[ProjectStatusLog])
def get_project_timeline(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    """특정 프로젝트의 상태 변경 이력(타임라인) 전체 조회"""
    # 권한 체크: 프로젝트 접근 권한 확인 필요
    logs = db.query(ProjectStatusLogModel).filter(ProjectStatusLogModel.project_id == project_id).order_by(ProjectStatusLogModel.created_at.desc()).all()
    return logs

# --- 4. 품질 관리 및 기타 (기존 로직 qc_routes.py로 이관됨) ---

# ---------------------------------------------------------
# 4. 제형-용기 적합성 및 안정성 테스트 (C/T Tests)
# ---------------------------------------------------------
@router.post("/compatibility-tests", response_model=CompatibilityTest, dependencies=[Depends(RoleChecker(["Admin", "Manufacturer"]))])
def create_compatibility_test(
    test: CompatibilityTestCreate,
    db: Session = Depends(get_db)
):
    """제형-용기 적합성(C/T) 의뢰 접수 및 테스트 시작 (관리자/제조사 전용)"""
    new_test = CompatibilityTestModel(**test.model_dump())
    db.add(new_test)
    db.commit()
    db.refresh(new_test)
    return new_test

@router.get("/compatibility-tests/list", response_model=List[CompatibilityTest])
def get_inquiry_compatibility_tests(
    inquiry_id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    """특정 의뢰(Inquiry)에 연결된 C/T 테스트 결과 조회"""
    # 권한 체크: 모델 단에서 inquiry 주인을 검증하거나 Admin 접근 허용
    tests = db.query(CompatibilityTestModel).filter(CompatibilityTestModel.inquiry_id == inquiry_id).all()
    return tests

@router.patch("/compatibility-tests/update", response_model=CompatibilityTest, dependencies=[Depends(RoleChecker(["Admin", "Manufacturer"]))])
def update_compatibility_test(
    test_id: int,
    test_update: CompatibilityTestUpdate,
    db: Session = Depends(get_db)
):
    """C/T 테스트 결과 및 상태 (합격/불합격 등) 업데이트"""
    db_test = db.query(CompatibilityTestModel).filter(CompatibilityTestModel.test_id == test_id).first()
    if not db_test:
        raise HTTPException(status_code=404, detail="테스트 정보를 찾을 수 없습니다.")
        
    update_data = test_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_test, key, value)
        
    db.commit()
    db.refresh(db_test)
    return db_test

@router.delete("/compatibility-tests/delete", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(RoleChecker(["Admin", "Manufacturer"]))])
def delete_compatibility_test(
    test_id: int,
    db: Session = Depends(get_db)
):
    """C/T 테스트 내역 삭제 (관리자/제조사 전용)"""
    db_test = db.query(CompatibilityTestModel).filter(CompatibilityTestModel.test_id == test_id).first()
    if not db_test:
        raise HTTPException(status_code=404, detail="테스트 정보를 찾을 수 없습니다.")
        
    db.delete(db_test)
    db.commit()
    return None

# ---------------------------------------------------------
# 5. 글로벌 컴플라이언스 가이드 (Global Compliance Rules)
# ---------------------------------------------------------
@router.post("/compliance-rules", response_model=ComplianceRule, dependencies=[Depends(RoleChecker(["Admin"]))])
def create_compliance_rule(
    rule: ComplianceRuleCreate,
    db: Session = Depends(get_db)
):
    """국가별 성분 규제 및 컴플라이언스 가이드라인 생성 (관리자 전용)"""
    new_rule = ComplianceRuleModel(**rule.model_dump())
    db.add(new_rule)
    db.commit()
    db.refresh(new_rule)
    return new_rule

@router.get("/compliance-rules", response_model=List[ComplianceRule])
def get_compliance_rules(
    country_code: str = None,
    ingredient_name: str = None,
    skip: int = 0, limit: int = 100,
    db: Session = Depends(get_db)
):
    """글로벌 성분 규제 목록 조회 (국가 및 성분명 필터링 지원)"""
    query = db.query(ComplianceRuleModel)
    if country_code:
        query = query.filter(ComplianceRuleModel.country_code.ilike(f"%{country_code}%"))
    if ingredient_name:
        query = query.filter(ComplianceRuleModel.ingredient_name.ilike(f"%{ingredient_name}%"))
    return query.offset(skip).limit(limit).all()

@router.patch("/compliance-rules/update", response_model=ComplianceRule, dependencies=[Depends(RoleChecker(["Admin"]))])
def update_compliance_rule(
    rule_id: int,
    rule_update: ComplianceRuleUpdate,
    db: Session = Depends(get_db)
):
    """기존 성분 규제 정보 및 상세 가이드 업데이트"""
    db_rule = db.query(ComplianceRuleModel).filter(ComplianceRuleModel.rule_id == rule_id).first()
    if not db_rule:
        raise HTTPException(status_code=404, detail="규제 정보를 찾을 수 없습니다.")
        
    update_data = rule_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_rule, key, value)
        
    db.commit()
    db.refresh(db_rule)
    return db_rule

@router.delete("/compliance-rules/delete", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(RoleChecker(["Admin"]))])
def delete_compliance_rule(
    rule_id: int,
    db: Session = Depends(get_db)
):
    """오래되거나 잘못된 규제 삭제 (관리자 전용)"""
    db_rule = db.query(ComplianceRuleModel).filter(ComplianceRuleModel.rule_id == rule_id).first()
    if not db_rule:
        raise HTTPException(status_code=404, detail="규제 정보를 찾을 수 없습니다.")
        
    db.delete(db_rule)
    db.commit()
    return None
