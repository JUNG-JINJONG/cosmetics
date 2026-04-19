import sys
import os

# 백엔드 경로 추가
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../backend')))

from app.database import engine, Base
from app.models.manufacturer_user import ManufacturerUser

def create_tables():
    print("Creating manufacturer_user table...")
    ManufacturerUser.__table__.create(bind=engine, checkfirst=True)
    print("Done.")

if __name__ == "__main__":
    create_tables()
