import os
import sys
from sqlalchemy import text

# 프로젝트 루트 경로 추가
sys.path.append(os.path.join(os.getcwd(), "backend"))

from app.database import engine

def check_counts():
    tables = [
        "countries", "company", "buyer", "category",
        "ingredients", "ingredients_sensory_attribute",
        "color_master", "inquiries", "projects"
    ]
    
    print("📊 [DB Status Report] Current Record Counts:")
    print("-" * 40)
    
    try:
        with engine.connect() as conn:
            for table in tables:
                try:
                    result = conn.execute(text(f"SELECT COUNT(*) FROM {table}"))
                    count = result.scalar()
                    print(f"| {table.ljust(30)} | {str(count).rjust(5)} 건 |")
                except Exception:
                    print(f"| {table.ljust(30)} | (에러/누락) |")
        print("-" * 40)
    except Exception as e:
        print(f"❌ [Error] Failed to connect or query: {e}")

if __name__ == "__main__":
    check_counts()
