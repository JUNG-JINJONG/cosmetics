import os
import sys
from sqlalchemy import text

# 프로젝트 루트 경로 추가
sys.path.append(os.path.join(os.getcwd(), "backend"))

from app.database import engine

def deploy_schema():
    print("📜 [Deploy Schema] Reading SQL file...")
    sql_file_path = os.path.join(os.getcwd(), "design", "db-schema.sql")
    
    if not os.path.exists(sql_file_path):
        print(f"❌ [Error] SQL file not found at {sql_file_path}")
        return

    with open(sql_file_path, "r", encoding="utf-8") as f:
        sql_content = f.read()

    print("🚀 [Deploy Schema] Connecting to database and executing SQL...")
    try:
        with engine.connect() as connection:
            # 1. pgvector 확장 기능 활성화 (있으면 좋음)
            print("  - Enabling pgvector extension...")
            connection.execute(text("CREATE EXTENSION IF NOT EXISTS vector;"))
            connection.commit()
            
            # 2. SQL 파일 실행
            # PostgreSQL은 여러 명령어를 한 번에 실행할 수 있습니다.
            print("  - Executing main schema SQL...")
            connection.execute(text(sql_content))
            connection.commit()
            
        print("✅ [Success] Database schema deployed successfully.")
    except Exception as e:
        print(f"❌ [Error] Schema deployment failed. Check schema_error.log for details.")
        with open("schema_error.log", "w") as error_file:
            error_file.write(str(e))

if __name__ == "__main__":
    deploy_schema()
