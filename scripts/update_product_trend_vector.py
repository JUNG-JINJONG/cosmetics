import psycopg2
from dotenv import load_dotenv
import os
import time

def update_trend_vectors():
    load_dotenv()
    
    conn = psycopg2.connect(
        dbname=os.getenv('POSTGRES_DB'),
        user=os.getenv('POSTGRES_USER'),
        password=os.getenv('POSTGRES_PASSWORD'),
        host='localhost',
        port=os.getenv('POSTGRES_PORT')
    )
    conn.autocommit = True
    cur = conn.cursor()
    
    print("Updating trend_vector in product table based on product_sensory_attribute...")
    start_time = time.time()
    
    sql = """
    WITH product_vectors AS (
        SELECT 
            product_id,
            ARRAY[
                COALESCE(MAX(CASE WHEN sensory_attribute_code = '1010000001' THEN point END), 0),
                COALESCE(MAX(CASE WHEN sensory_attribute_code = '1010000002' THEN point END), 0),
                COALESCE(MAX(CASE WHEN sensory_attribute_code = '1010000003' THEN point END), 0),
                COALESCE(MAX(CASE WHEN sensory_attribute_code = '1010000004' THEN point END), 0),
                COALESCE(MAX(CASE WHEN sensory_attribute_code = '1011000001' THEN point END), 0),
                COALESCE(MAX(CASE WHEN sensory_attribute_code = '1011000002' THEN point END), 0),
                COALESCE(MAX(CASE WHEN sensory_attribute_code = '1011000003' THEN point END), 0),
                COALESCE(MAX(CASE WHEN sensory_attribute_code = '1011000004' THEN point END), 0),
                COALESCE(MAX(CASE WHEN sensory_attribute_code = '1012000001' THEN point END), 0),
                COALESCE(MAX(CASE WHEN sensory_attribute_code = '1012000002' THEN point END), 0),
                COALESCE(MAX(CASE WHEN sensory_attribute_code = '1012000003' THEN point END), 0),
                COALESCE(MAX(CASE WHEN sensory_attribute_code = '1012000004' THEN point END), 0),
                COALESCE(MAX(CASE WHEN sensory_attribute_code = '1013000001' THEN point END), 0),
                COALESCE(MAX(CASE WHEN sensory_attribute_code = '1013000002' THEN point END), 0),
                COALESCE(MAX(CASE WHEN sensory_attribute_code = '1013000003' THEN point END), 0)
            ]::vector(15) as v
        FROM product_sensory_attribute
        GROUP BY product_id
    )
    UPDATE product p
    SET sensory_attribute_vector = pv.v
    FROM product_vectors pv
    WHERE p.product_id = pv.product_id;
    """
    
    try:
        cur.execute(sql)
        rowcount = cur.rowcount
        print(f"Successfully updated {rowcount} products.")
    except Exception as e:
        print(f"Error during update: {e}")
    finally:
        cur.close()
        conn.close()
        
    end_time = time.time()
    print(f"Task completed in {end_time - start_time:.2f} seconds.")

if __name__ == "__main__":
    update_trend_vectors()
