import { supabase } from '../../config/supabase.js';
import { getIo } from '../../config/socket.js';

// @desc    Create new order from Cart
// @route   POST /orders
// @access  Private/Customer
export const createOrder = async (req, res) => {
  try {
    const { delivery_lat, delivery_lng } = req.body;
    const userId = req.user.id;

    // 1. Fetch Cart mapping
    const { data: cart } = await supabase.from('cart').select('id').eq('user_id', userId).maybeSingle();
    if (!cart) return res.status(400).json({ message: 'Cart is empty' });

    // 2. Fetch Cart Items with products for validation and pricing
    const { data: cartItems } = await supabase
      .from('cart_items')
      .select('id, quantity, product_id, products(id, store_id, price, availability)')
      .eq('cart_id', cart.id);

    if (!cartItems || cartItems.length === 0) return res.status(400).json({ message: 'Cart is empty' });

    // 3. Validation
    const storeId = cartItems[0].products.store_id;
    let totalPrice = 0;
    const itemsPayload = [];

    for (let item of cartItems) {
      if (item.products.store_id !== storeId) {
        return res.status(400).json({ message: 'All products must belong to the same store' });
      }
      if (!item.products.availability) {
        return res.status(400).json({ message: `Product ${item.products.id} is unavailable` });
      }
      totalPrice += item.quantity * item.products.price;
      itemsPayload.push({
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.products.price
      });
    }

    // 4. ATOMIC ORDER CREATION (RPC)
    const { data: order, error: rpcError } = await supabase.rpc('create_order_v1', {
      p_user_id: userId,
      p_store_id: storeId,
      p_total_price: totalPrice,
      p_delivery_lat: delivery_lat,
      p_delivery_lng: delivery_lng,
      p_cart_id: cart.id,
      p_items: itemsPayload
    });

    if (rpcError) throw rpcError;

    // 5. Emit WebSocket event to merchant
    const { data: storeOwner } = await supabase.from('stores').select('owner_id').eq('id', storeId).single();
    const io = getIo();
    if (io && storeOwner) {
      // Fetch full order with items for the real-time notification
      const { data: fullOrder } = await supabase
        .from('orders')
        .select('*, order_items(*, products(name))')
        .eq('id', order.id)
        .single();
      
      io.to(`merchant_${storeOwner.owner_id}`).emit('new_order', fullOrder);
    }

    res.status(201).json(order);
  } catch (error) {
    console.error(`[createOrder Error] ${error.message}`);
    res.status(500).json({ message: error.message || 'Server Error during order creation' });
  }
};

// @desc    Get merchant orders
// @route   GET /merchant/orders
// @access  Private/Merchant
export const getMerchantOrders = async (req, res) => {
  try {
    // A merchant can own multiple stores, so first get their stores
    const { data: stores } = await supabase.from('stores').select('id, name').eq('owner_id', req.user.id);
    const storeIds = stores.map(s => s.id);

    console.log(`[getMerchantOrders] User: ${req.user.id}, Stores: ${stores.map(s => `${s.name} (${s.id})`).join(', ')}`);

    if (storeIds.length === 0) {
       console.log(`[getMerchantOrders] No stores found for user ${req.user.id}`);
       return res.json([]);
    }

    const { data: orders, error } = await supabase
      .from('orders')
      .select('*, order_items(*, products(name))')
      .in('store_id', storeIds)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

// @desc    Update order status
// @route   PATCH /orders/:id/status
// @access  Private/Merchant
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // Allowed transitions for merchant
    const allowedStatuses = ['accepted', 'preparing', 'ready_for_pickup', 'cancelled'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status update for merchant' });
    }

    // Verify ownership
    console.log(`[updateOrderStatus] Attempting update for Order: ${id} to ${status} by User: ${req.user.id}`);
    
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('*, stores!inner(owner_id)')
      .eq('id', id)
      .maybeSingle();

    if (fetchError) {
      console.error(`[updateOrderStatus] Fetch Error: ${fetchError.message}`);
      throw fetchError;
    }

    if (!order) {
      console.error(`[updateOrderStatus] Order ${id} not found or RLS blocked join for user ${req.user.id}`);
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.stores.owner_id !== req.user.id) {
       console.warn(`[updateOrderStatus] Unauthorized attempt: Order Store Owner ${order.stores.owner_id} vs User ${req.user.id}`);
       return res.status(403).json({ message: 'Not authorized' });
    }

    // Transition validation
    if (status === 'accepted' && order.status !== 'pending') {
       return res.status(400).json({ message: `Invalid transition from ${order.status} to ${status}` });
    }

    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error(`[updateOrderStatus] Update Error: ${updateError.message}`);
      throw updateError;
    }

    // Emit event
    const io = getIo();
    if (io) {
      console.log(`[updateOrderStatus] Emitting socket events for Order ${id}`);
      io.to(`order_${id}`).emit('order_status_updated', updatedOrder);
      io.to(`merchant_${order.stores.owner_id}`).emit('order_status_updated', updatedOrder);
      
      if (status === 'ready_for_pickup') {
        console.log(`[updateOrderStatus] Broadcasting ready_for_pickup for Order ${id}`);
        io.to('drivers').emit('order_ready_for_pickup', {
           ...updatedOrder,
           stores: order.stores // Include store info for driver overlay
        });
      }
    }

    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

// @desc    Get customer orders
// @route   GET /orders/me
// @access  Private/Customer
export const getCustomerOrders = async (req, res) => {
  try {
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*, order_items(*, products(name))')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

// @desc    Get driver orders
// @route   GET /orders/driver
// @access  Private/Driver
export const getDriverOrders = async (req, res) => {
  console.log(`[getDriverOrders] Request from user: ${req.user.id} (${req.user.role})`);
  try {
    // 1. Get driver profile ID
    const { data: driver, error: driverError } = await supabase
      .from('drivers')
      .select('id')
      .eq('user_id', req.user.id)
      .maybeSingle();

    if (driverError) throw driverError;
    if (!driver) return res.json([]); // Return empty array if profile missing

    // 2. Fetch orders assigned to this driver
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*, stores(name, location_lat, location_lng), order_items(*, products(name))')
      .eq('driver_id', driver.id)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};
// @desc    Get order by ID
// @route   GET /orders/:id
// @access  Private
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        *,
        stores(name, location_lat, location_lng),
        order_items(*, products(name)),
        drivers(id, current_location_lat, current_location_lng, users(name))
      `)
      .eq('id', id)
      .single();

    if (error || !order) return res.status(404).json({ message: 'Order not found' });
    
    // Auth check: Customer who owns it, OR Merchant who owns the store, OR Assigned Driver
    // (Simplified for now, but usually role-based)
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};
