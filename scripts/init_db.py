import os
import sys

# 프로젝트 루트 경로 추가
sys.path.append(os.path.join(os.getcwd(), "backend"))

from app.database import engine, Base
# 모델들을 임포트해야 Base.metadata에 등록됩니다.
from app import models

def init_db():
    print("🚀 [Init DB] Creating tables in the database...")
    try:
        # 모든 모델 기반으로 테이블 생성
        Base.metadata.create_all(bind=engine)
        print("✅ [Success] All tables created successfully.")
    except Exception as e:
        print(f"❌ [Error] Failed to create tables: {e}")

if __name__ == "__main__":
    init_db()
