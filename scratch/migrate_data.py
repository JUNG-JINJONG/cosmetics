import csv
import psycopg2
from psycopg2.extras import execute_values
import os
from dotenv import load_dotenv

# .env 로드
load_dotenv()

# DB 연결 정보
DB_CONFIG = {
    "host": "localhost",
    "database": os.getenv("POSTGRES_DB"),
    "user": os.getenv("POSTGRES_USER"),
    "password": os.getenv("POSTGRES_PASSWORD"),
    "port": os.getenv("POSTGRES_PORT")
}

CSV_PATH = "/Users/jeongjinjong/Developer/cosmetics/data/Chemicals in Cosmetics/chemicals-in-cosmetics.csv"

def migrate():
    conn = None
    cur = None
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cur = conn.cursor()
        print("🚀 Connected to cosmetics_db.")

        # Truncate tables again just to be safe (already done but good for the script's isolation)
        # cur.execute("TRUNCATE TABLE product, ingredients, brands, company CASCADE;")
        # conn.commit()

        # CSV 로드
        with open(CSV_PATH, mode='r', encoding='utf-8-sig') as f:
            reader = csv.DictReader(f)
            rows = []
            for row in reader:
                rows.append(row)
        
        print(f"📊 Loaded {len(rows)} rows from CSV.")

        # 1. Companies
        print("🏢 Processing Companies...")
        unique_companies = sorted(list(set(row['CompanyName'].strip() for row in rows if row['CompanyName'].strip())))
        company_map = {}
        for i, name in enumerate(unique_companies):
            biz_num = f"B-{i+1:05d}"
            cur.execute(
                "INSERT INTO company (company_name, business_number, company_type) VALUES (%s, %s, %s) RETURNING company_id",
                (name, biz_num, '브랜드사')
            )
            company_map[name] = cur.fetchone()[0]
        print(f"✅ Inserted {len(unique_companies)} companies.")

        # 2. Brands
        print("🏷️ Processing Brands...")
        unique_brands = {} # (BrandName, CompanyName) -> company_id
        for row in rows:
            b_name = row['BrandName'].strip()
            c_name = row['CompanyName'].strip()
            if b_name and c_name:
                unique_brands[(b_name, c_name)] = company_map[c_name]
        
        brand_map = {} # (BrandName, company_id) -> brand_id
        for (b_name, c_name), c_id in unique_brands.items():
            cur.execute(
                "INSERT INTO brands (brand_name, company_id) VALUES (%s, %s) RETURNING brand_id",
                (b_name, c_id)
            )
            brand_map[(b_name, c_id)] = cur.fetchone()[0]
        print(f"✅ Inserted {len(unique_brands)} brands.")

        # 3. Products
        print("📦 Processing Products...")
        unique_products = {} # CDPHId -> (ProductName, brand_id)
        for row in rows:
            prod_id = row['CDPHId'].strip()
            p_name = row['ProductName'].strip()
            b_name = row['BrandName'].strip()
            c_name = row['CompanyName'].strip()
            if prod_id and p_name and b_name and c_name:
                b_id = brand_map.get((b_name, company_map[c_name]))
                if b_id:
                    unique_products[prod_id] = (p_name, b_id)
        
        product_data = [(v[1], k, v[0][:1024], 'In_Stock') for k, v in unique_products.items()]
        execute_values(cur, 
            "INSERT INTO product (brand_id, sku, product_name, status) VALUES %s",
            product_data
        )
        print(f"✅ Inserted {len(unique_products)} products.")

        # 4. Ingredients
        print("🧪 Processing Ingredients...")
        unique_ingredients = {} # ChemicalName -> CasNumber
        for row in rows:
            chem_name = row['ChemicalName'].strip()
            cas_num = row['CasNumber'].strip()
            if chem_name:
                unique_ingredients[chem_name] = cas_num
        
        ingredient_data = [(name[:255], cas[:50]) for name, cas in unique_ingredients.items()]
        # Using execute_values for speed and handling duplicates with ON CONFLICT if necessary
        # But here we already unique'd in python
        execute_values(cur,
            "INSERT INTO ingredients (name, cas_no) VALUES %s",
            ingredient_data
        )
        print(f"✅ Inserted {len(unique_ingredients)} ingredients.")

        conn.commit()
        print("🎉 Migration completed successfully!")

    except Exception as e:
        print(f"❌ Error during migration: {e}")
        if conn:
            conn.rollback()
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()

if __name__ == "__main__":
    migrate()
