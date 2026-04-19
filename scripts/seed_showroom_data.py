import sys
import os

# 프로젝트 루트 경로 추가
sys.path.append(os.path.join(os.getcwd(), "backend"))

from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.company import Company
import json

def seed_showroom_data():
    """
    제조사 쇼룸용 고품질 더미 데이터를 삽입합니다.
    """
    db = SessionLocal() # DB_URL is already handled in database.py
    print("🌱 [Seeding] Populating showroom dummy data...")

    try:
        # 1. 뷰티코어 (스킨케어 전문)
        beauty_core = db.query(Company).filter(Company.company_name == "뷰티코어").first()
        if not beauty_core:
            beauty_core = Company(
                company_name="뷰티코어",
                business_number="123-45-67890",
                company_type="제조사(OEM/ODM)",
                specialty="고기능성 스킨케어, 앰플, 마스크팩",
                address="서울특별시 강남구 신사동 123-4",
                is_verified=True
            )
            db.add(beauty_core)
            db.flush()

        beauty_core.logo_url = "https://images.unsplash.com/photo-1554469384-e58fac16e23a?w=200&h=200&fit=crop&q=80"
        beauty_core.banner_image_url = "https://images.unsplash.com/photo-1563201515-ad69aaae56f4?w=1200&h=400&fit=crop&q=80"
        beauty_core.introduction = """뷰티코어는 20년 전통의 고기능성 스킨케어 전문 OEM/ODM 기업입니다. 
우리는 단순한 제조를 넘어, 피부 과학 연구소의 정밀한 R&D를 통해 프리미엄 앰플과 에센스 시장을 선도합니다. 
ISO 22716, CGMP 인증은 물론 글로벌 스탠다드에 맞춘 품질 관리 시스템으로 고객사의 성공적인 브랜드 런칭을 돕습니다."""
        beauty_core.certifications = ["ISO 22716", "CGMP", "EVE VEGAN"]

        # 2. 컬러마스터 (색조 전문)
        color_master = db.query(Company).filter(Company.company_name == "컬러마스터").first()
        if not color_master:
            color_master = Company(
                company_name="컬러마스터",
                business_number="555-55-12121",
                company_type="제조사(OEM/ODM)",
                specialty="립스틱, 파운데이션, 아이섀도우",
                address="경기도 안양시 동안구 77-8",
                is_verified=True
            )
            db.add(color_master)
            db.flush()

        color_master.logo_url = "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=200&h=200&fit=crop&q=80"
        color_master.banner_image_url = "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=1200&h=400&fit=crop&q=80"
        color_master.introduction = """글로벌 K-뷰티 색조의 중심, 컬러마스터입니다. 
우리는 매년 500개 이상의 유니크한 제형을 개발하며, 전 세계 트렌드 세터들이 주목하는 색감과 텍스처를 구현합니다. 
미국 FDA 규정을 준수하는 제조 전문성을 바탕으로 해외 수출 중심의 브랜드사분들에게 최고의 파트너가 되어 드립니다."""
        color_master.certifications = ["ISO 9001", "FDA Compliance", "HALAL"]

        # 3. 그린포뮬러 (비건/친환경 전문)
        green_formula = db.query(Company).filter(Company.company_name == "그린포뮬러").first()
        if not green_formula:
            green_formula = Company(
                company_name="그린포뮬러",
                business_number="999-00-55555",
                company_type="제조사(OEM/ODM)",
                specialty="비건 화장품, 유기농 스킨케어, 클린뷰티",
                address="제주특별자치도 제주시 첨단로 102",
                is_verified=True
            )
            db.add(green_formula)
            db.flush()

        green_formula.logo_url = "https://images.unsplash.com/photo-1521503862198-2ae9a990184b?w=200&h=200&fit=crop&q=80"
        green_formula.banner_image_url = "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1200&h=400&fit=crop&q=80"
        green_formula.introduction = """자연의 생명력을 병에 담는 클린뷰티 전문가, 그린포뮬러입니다. 
우리는 인위적인 성분을 배제하고 95% 이상의 천연 유래 성분을 사용한 처방에 특화되어 있습니다. 
제주 청정 지역의 원료를 직접 가공하고 추출하는 친환경 공정을 통해 진정한 에코 브랜딩의 가치를 현실로 만들어 드립니다."""
        green_formula.certifications = ["COSMOS ORGANIC", "EVE VEGAN", "Environment Friendly Factory"]

        db.commit()
        print("✅ [Success] Showroom dummy data seeded successfully.")
    except Exception as e:
        db.rollback()
        print(f"❌ [Error] Seeding failed: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_showroom_data()
