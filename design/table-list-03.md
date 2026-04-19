# UMMA 데이터 테이블 목록 (Table List - 03)

글로벌 B2B 도매 유통 및 물류 관리에 초점을 맞춘 데이터 모델입니다.

## 1. 글로벌 도매 상품 및 브랜드
*   **umma_brands**: ID, brand_name, logo_url, brand_desc, partnership_type, official_status
*   **umma_products**: ID, brand_id, category_id, sku, product_name, description, retail_price, wholesale_base_price, moq (최소주문수량), stock_quantity, status (In_Stock, Out_of_Stock, U_Quick_Ready)
*   **umma_sensory_attribute**: ID, product_id, attribute_code, attribute_name, point, desc

## 2. 도매 가격 정책 (Wholesale Pricing)
*   **umma_price_tiers**: ID, product_id, min_quantity (수량 구간), unit_price (구간별 단가)

## 3. 글로벌 주문 및 물류 (Orders & Logistics)
*   **umma_orders**: ID, buyer_id, order_status (Processing, Shipped, Delivered, Canceled), total_amount, currency, shipping_method, tracking_num
*   **umma_order_items**: ID, order_id, product_id, quantity, unit_price_at_order, subtotal

## 4. 특수 거래 관리
*   **umma_outlet_deals**: ID, product_id, discount_rate, start_at, end_at, flash_sale_status (U-Outlet 특별 관리용)
