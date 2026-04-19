"""
개발 목록 페이지용 더미 데이터 시딩 스크립트
- buyer: 10명 (브랜드 담당자)
- inquiries: 60건 (의뢰)
- projects: 60건 (의뢰와 1:1 매핑)
- inquiry_questions: 의뢰당 3~5건 (약 200건)
"""
import psycopg2
from dotenv import load_dotenv
import os
import random
from datetime import datetime, timedelta

def seed():
    load_dotenv()
    # DATABASE_URL 우선 사용 (Railway용)
    db_url = os.getenv('DATABASE_URL')
    if db_url:
        print(f"🌐 Connecting to Database via URL...")
        conn = psycopg2.connect(db_url)
    else:
        print(f"🏠 Connecting to Local Database...")
        conn = psycopg2.connect(
            dbname=os.getenv('POSTGRES_DB'),
            user=os.getenv('POSTGRES_USER'),
            password=os.getenv('POSTGRES_PASSWORD'),
            host=os.getenv('POSTGRES_HOST', 'localhost'),
            port=os.getenv('POSTGRES_PORT', '5432')
        )
    
    conn.autocommit = True
    cur = conn.cursor()

    # ── 0. 기존 데이터 정리 ──
    # Clean start already done via truncate command earlier.
    # We skip deletion here to avoid FK issues if run partially.
    print("Skipping deletion (Fresh start assumed)...")

    # ── 1. Buyer (브랜드 담당자) 10명 생성 ──
    print("Buyer 데이터 생성 중...")
    buyers_data = [
        ("김서연", "seoyeon.kim@glowtheory.com", "Client"),
        ("이준혁", "junhyuk.lee@urbanmuse.com", "Client"),
        ("박지민", "jimin.park@skinrhythm.com", "Client"),
        ("최유나", "yuna.choi@purebloom.com", "Client"),
        ("정다은", "daeun.jung@velvetlab.com", "Client"),
        ("한소희", "sohee.han@aurabeauty.com", "Client"),
        ("윤재호", "jaeho.yoon@dermafix.com", "Client"),
        ("오민지", "minji.oh@bloomco.com", "Client"),
        ("송태영", "taeyoung.song@cosmax.com", "Manufacturer"),
        ("강예린", "yerin.kang@cosmax.com", "Manufacturer"),
    ]
    
    buyer_ids = []
    # admin 유저 ID 가져오기 (만약 존재하면)
    cur.execute("SELECT buyer_id FROM buyer WHERE email = 'admin@cosmetics.com'")
    admin = cur.fetchone()
    if admin:
        buyer_ids.append(admin[0])
    else:
        # admin이 없으면 생성
        cur.execute(
            "INSERT INTO buyer (name, email, password_hash, role) VALUES (%s, %s, %s, %s) RETURNING buyer_id",
            ("Admin", "admin@cosmetics.com", "hashed_pass", "Admin")
        )
        buyer_ids.append(cur.fetchone()[0])
    
    for name, email, role in buyers_data:
        # 중복 체크
        cur.execute("SELECT buyer_id FROM buyer WHERE email = %s", (email,))
        existing = cur.fetchone()
        if existing:
            buyer_ids.append(existing[0])
            continue
            
        cur.execute(
            "INSERT INTO buyer (name, email, password_hash, role) VALUES (%s, %s, %s, %s) RETURNING buyer_id",
            (name, email, "hashed_pass", role)
        )
        buyer_ids.append(cur.fetchone()[0])
    
    # Client만 필터 (의뢰는 Client가 함)
    client_ids = buyer_ids # Use all for randomization in this mock
    
    print(f"  → {len(buyer_ids)}명 준비 완료")

    # ── 2. Company ID 목록 가져오기 ──
    cur.execute("SELECT company_id FROM company LIMIT 20")
    company_ids = [r[0] for r in cur.fetchall()]

    # ── 3. Inquiries 60건 생성 ──
    print("Inquiry 데이터 생성 중...")
    
    brands = ["Glow Theory", "Urban Muse", "Skin Rhythm", "Pure Bloom", "Velvet Lab", "Aura Beauty", "DermaFix"]
    item_types = ["Serum", "Cream", "Toner", "Lipstick", "Foundation", "Sunscreen", "Cleanser"]
    scent_prefs = ["Fresh", "Floral", "Herb", "Citrus", "Unscented"]
    container_types = ["Pump Bottle", "Tube", "Jar", "Dropper"]
    capacities = ["30ml", "50ml", "100ml"]
    
    statuses = ["Pending", "Processing", "Completed", "Canceled"]
    
    inquiry_ids = []
    base_date = datetime(2026, 1, 1)
    
    for i in range(60):
        buyer_id = random.choice(client_ids)
        company_id = random.choice(company_ids) if company_ids else None
        brand = random.choice(brands)
        item = random.choice(item_types)
        price = random.choice([5000, 10000, 20000])
        scent = random.choice(scent_prefs)
        container = random.choice(container_types)
        cap = random.choice(capacities)
        qty = random.choice([1000, 5000, 10000])
        created = base_date + timedelta(days=random.randint(0, 100))
        
        cur.execute("""
            INSERT INTO inquiries (buyer_id, company_id, brand_name, item_type, target_price, 
                                   scent_pref, container_type, capacity, quantity, created_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING inquiry_id
        """, (buyer_id, company_id, brand, item, price, scent, container, cap, qty, created))
        
        inq_id = cur.fetchone()[0]
        inquiry_ids.append((inq_id, created))
    
    print(f"  → {len(inquiry_ids)}건 의뢰 생성 완료")

    # ── 4. Projects 60건 생성 (inquiry와 1:1) ──
    print("Project 데이터 생성 중...")
    for inq_id, created in inquiry_ids:
        status = random.choice(statuses)
        progress = 100 if status == "Completed" else random.randint(0, 90)
        start = created + timedelta(days=random.randint(1, 7))
        expected = start + timedelta(days=90)
        
        cur.execute("""
            INSERT INTO projects (inquiry_id, status_code, current_phase_percent, start_at, expected_completion_at)
            VALUES (%s, %s, %s, %s, %s)
        """, (inq_id, status, progress, start, expected))
    
    print(f"  → 60건 프로젝트 생성 완료")

    # ── 5. Inquiry Questions ──
    print("Inquiry Questions 데이터 생성 중...")
    cur.execute("SELECT category_id FROM category LIMIT 30")
    category_ids = [r[0] for r in cur.fetchall()]
    
    if category_ids:
        for inq_id, _ in inquiry_ids:
            num_questions = random.randint(2, 4)
            chosen_cats = random.sample(category_ids, min(num_questions, len(category_ids)))
            for cat_id in chosen_cats:
                cur.execute("INSERT INTO inquiry_questions (inquiry_id, category_id, score) VALUES (%s, %s, %s)", 
                           (inq_id, cat_id, random.randint(1, 10)))

    print("\n🎉 더미 데이터 시딩 완료!")
    cur.close()
    conn.close()

if __name__ == "__main__":
    seed()
