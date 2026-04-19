import os
import sys
import re
from sqlalchemy import text

# 프로젝트 루트 경로 추가
sys.path.append(os.path.join(os.getcwd(), "backend"))

from app.database import engine

def deploy_schema():
    print("📜 [Deploy Schema] Reading SQL file...")
    sql_file_path = os.path.join(os.getcwd(), "design", "db-schema.sql")
    
    with open(sql_file_path, "r", encoding="utf-8") as f:
        content = f.read()

    # 1. pgvector 확장 기능 활성화
    try:
        with engine.connect() as conn:
            print("  - Enabling pgvector extension...")
            conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector;"))
            conn.commit()
    except Exception as e:
        print(f"⚠️ [Warning] Could not enable pgvector: {e}")

    # 2. SQL 구문 분리 (세미콜론 기준, 하지만 함수/트리거 주의)
    # 여기서는 간단하게 각 구문을 따로 실행하여 의존성 문제를 최대한 피합니다.
    # 단, %%는 SQLAlchemy text()에서 %로 해석되므로 보정해줍니다.
    content = content.replace("%", "%%")
    
    # 주석 제거 (한 줄 주석)
    content = re.sub(r'--.*', '', content)
    
    # 세미콜론 기준으로 나누되, 텅 빈 구문은 제외
    statements = [s.strip() for s in content.split(';') if s.strip()]

    print(f"🚀 [Deploy Schema] Executing {len(statements)} SQL statements individually...")
    
    success_count = 0
    fail_count = 0
    
    # 의존성 문제 해결을 위해 여러 번 반복해서 실행 (무식하지만 확실한 방법)
    # 첫 번째 시도에서 실패한 테이블이 두 번째 시도에서 부모 테이블이 생기면 성공하게 됩니다.
    for attempt in range(1, 4):
        print(f"🔄 Attempt {attempt}/3...")
        remaining_statements = []
        for stmt in statements:
            try:
                with engine.connect() as conn:
                    conn.execute(text(stmt))
                    conn.commit()
                    success_count += 1
            except Exception:
                remaining_statements.append(stmt)
                fail_count += 1
        
        statements = remaining_statements
        if not statements:
            break
        print(f"   - {len(statements)} statements failed/pending, retrying...")

    if not statements:
        print("✅ [Success] All database schema deployed successfully.")
    else:
        print(f"⚠️ [Finished] Completed with {len(statements)} items remaining/failed.")
        with open("schema_errors_v2.log", "w") as f:
            for s in statements:
                f.write(f"FAILED STMT:\n{s}\n\n")

if __name__ == "__main__":
    deploy_schema()
