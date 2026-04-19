import sys
import os

# 프로젝트 루트 경로 추가 (app 모듈을 찾기 위함)
sys.path.append(os.path.join(os.getcwd(), "backend"))

from sqlalchemy import text
from app.database import engine

def migrate_company_showroom_fields():
    """
    company 테이블에 쇼룸 관련 필드(logo, banner, introduction)를 추가합니다.
    """
    print("🚀 [Migration] Adding showroom fields to company table...")
    
    with engine.connect() as conn:
        try:
            # PostgreSQL 컬럼 추가 (IF NOT EXISTS는 지원하지 않으므로 에러 핸들링 필요)
            conn.execute(text("ALTER TABLE company ADD COLUMN IF NOT EXISTS logo_url VARCHAR(500);"))
            conn.execute(text("ALTER TABLE company ADD COLUMN IF NOT EXISTS banner_image_url VARCHAR(500);"))
            conn.execute(text("ALTER TABLE company ADD COLUMN IF NOT EXISTS introduction TEXT;"))
            conn.commit()
            print("✅ [Success] Showroom fields added successfully.")
        except Exception as e:
            print(f"❌ [Error] Migration failed: {e}")

if __name__ == "__main__":
    migrate_company_showroom_fields()
