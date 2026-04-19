import psycopg2
import os
from dotenv import load_dotenv

def seed_colors():
    load_dotenv()
    db_url = os.getenv('DATABASE_URL')
    conn = psycopg2.connect(db_url) if db_url else psycopg2.connect(host='localhost', dbname=os.getenv('POSTGRES_DB'))
    conn.autocommit = True
    cur = conn.cursor()
    
    try:
        cur.execute("SELECT product_id FROM product LIMIT 10")
        products = cur.fetchall()
        if not products:
            print("No products found.")
            return

        colors = [
            ('Classic Rose Red', '#E91E63', 45.5, 60.2, 15.3),
            ('Midnight Velvet Purple', '#4A148C', 20.1, 15.5, -30.2),
            ('Autumn Peach Beige', '#FFCCBC', 85.2, 5.5, 10.1)
        ]
        
        for p in products:
            for name, hexcode, l, a, b in colors:
                cur.execute("INSERT INTO color_master (product_id, color_name, hex_code, lab_l, lab_a, lab_b) VALUES (%s, %s, %s, %s, %s, %s)",
                           (p[0], name, hexcode, l, a, b))
        print("✅ Color master data seeded successfully to Railway.")
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        cur.close()
        conn.close()

if __name__ == "__main__":
    seed_colors()
