import psycopg2
from psycopg2.extras import execute_values
from dotenv import load_dotenv
import os
import random

def seed_ingredients_sensory():
    load_dotenv()
    db_url = os.getenv('DATABASE_URL')
    if db_url:
        print(f"🌐 Connecting via DATABASE_URL...")
        conn = psycopg2.connect(db_url)
    else:
        conn = psycopg2.connect(
            dbname=os.getenv('POSTGRES_DB'),
            user=os.getenv('POSTGRES_USER'),
            password=os.getenv('POSTGRES_PASSWORD'),
            host=os.getenv('POSTGRES_HOST', 'localhost'),
            port=os.getenv('POSTGRES_PORT', '5432')
        )
    conn.autocommit = False
    cur = conn.cursor()
    
    try:
        cur.execute("SELECT code FROM category WHERE group_code1 = '10'")
        sensory_codes = [row[0] for row in cur.fetchall()]
        cur.execute("SELECT ingredient_id FROM ingredients")
        ingredient_ids = [row[0] for row in cur.fetchall()]
        
        if not sensory_codes or not ingredient_ids:
            print("No sensory codes or ingredients found. Check master data!")
            return

        cur.execute("TRUNCATE TABLE ingredients_sensory_attribute CASCADE")
        possible_points = [x / 10.0 for x in range(10, 51, 5)]
        data_to_insert = [(ing_id, code, random.choice(possible_points)) for ing_id in ingredient_ids for code in sensory_codes]
        
        execute_values(cur, "INSERT INTO ingredients_sensory_attribute (ingredient_id, sensory_attribute_code, point) VALUES %s", data_to_insert)
        conn.commit()
        print(f"✅ Successfully seeded {len(data_to_insert)} sensory rankings to Railway.")
    except Exception as e:
        conn.rollback()
        print(f"❌ Error: {e}")
    finally:
        cur.close()
        conn.close()

if __name__ == "__main__":
    seed_ingredients_sensory()
