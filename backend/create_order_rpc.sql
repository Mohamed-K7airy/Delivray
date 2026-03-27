-- Migration: Create Atomic Order Function
-- This function ensures an order, its items, and the cart clearance happen in one transaction.

CREATE OR REPLACE FUNCTION create_order_v2(
    p_user_id UUID,
    p_store_id UUID,
    p_subtotal NUMERIC,
    p_delivery_fee NUMERIC,
    p_delivery_lat NUMERIC,
    p_delivery_lng NUMERIC,
    p_delivery_address TEXT,
    p_cart_id UUID,
    p_items JSONB,
    p_payment_method TEXT DEFAULT 'cash'
) RETURNS JSONB AS $$
DECLARE
    v_order_id UUID;
    v_order_record JSONB;
BEGIN
    -- 1. Insert Order
    INSERT INTO orders (
        user_id, 
        store_id, 
        subtotal, 
        delivery_fee, 
        total_price, 
        delivery_lat, 
        delivery_lng, 
        delivery_address, 
        payment_method,
        status, 
        created_at, 
        updated_at
    )
    VALUES (
        p_user_id, 
        p_store_id, 
        p_subtotal, 
        p_delivery_fee, 
        p_subtotal + p_delivery_fee, 
        p_delivery_lat, 
        p_delivery_lng, 
        p_delivery_address, 
        p_payment_method,
        'pending', 
        NOW(), 
        NOW()
    )
    RETURNING id INTO v_order_id;

    -- 2. Insert Order Items
    INSERT INTO order_items (order_id, product_id, quantity, price_at_time, created_at)
    SELECT v_order_id, (item->>'product_id')::UUID, (item->>'quantity')::INT, (item->>'price')::NUMERIC, NOW()
    FROM jsonb_array_elements(p_items) AS item;

    -- 3. Clear Cart
    DELETE FROM cart_items WHERE cart_id = p_cart_id;

    -- 4. Get the full order back for the response
    SELECT row_to_json(o) INTO v_order_record FROM orders o WHERE id = v_order_id;

    RETURN v_order_record;
EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'Order creation failed: %', SQLERRM;
END;
$$ LANGUAGE plpgsql;
