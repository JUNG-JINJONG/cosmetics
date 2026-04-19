
import os
import sys
from sqlalchemy import text

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from app.database import SessionLocal

db = SessionLocal()
try:
    print("Adding company_id column to orders table...")
    # 중복 추가 방지를 위해 컬럼 존재 여부 확인 후 추가
    db.execute(text("ALTER TABLE orders ADD COLUMN IF NOT EXISTS company_id INTEGER REFERENCES company(company_id);"))
    db.commit()
    print("Successfully added company_id column.")
except Exception as e:
    print(f"Error occurred: {e}")
    db.rollback()
finally:
    db.close()
