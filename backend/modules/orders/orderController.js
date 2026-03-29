import { supabase } from '../../config/supabase.js';
import { createNotification } from '../notifications/notificationController.js';
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
    const { data: storeInfo } = await supabase.from('stores').select('id, is_open').eq('id', cartItems[0].products.store_id).single();
    if (!storeInfo?.is_open) {
      return res.status(400).json({ message: 'Store is currently closed' });
    }

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

    // 4. ATOMIC ORDER CREATION (RPC v2)
    const { delivery_address, payment_method = 'cash' } = req.body;
    const DELIVERY_FEE = 45.00; // Consistent with schema default and EGP localization
    
    const { data: order, error: rpcError } = await supabase.rpc('create_order_v2', {
      p_user_id: userId,
      p_store_id: storeId,
      p_subtotal: totalPrice,
      p_delivery_fee: DELIVERY_FEE,
      p_delivery_lat: delivery_lat,
      p_delivery_lng: delivery_lng,
      p_delivery_address: delivery_address || 'Customer Address',
      p_cart_id: cart.id,
      p_items: itemsPayload,
      p_payment_method: payment_method
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
      .select('*, customer:users(name), order_items(*, products(name))')
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
    
    // Allowed statuses for merchant (both forward and backward)
    const allowedStatuses = ['pending', 'accepted', 'preparing', 'ready_for_pickup', 'cancelled'];
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
      
      const { data: fullOrder } = await supabase
        .from('orders')
        .select(`
          *,
          stores(name, owner_id, location_lat, location_lng),
          order_items(*, products(name)),
          drivers(id, user_id, current_location_lat, current_location_lng, users(name))
        `)
        .eq('id', id)
        .single();

      if (fullOrder) {
        io.to(`order_${id}`).emit('order_status_updated', fullOrder);
        io.to(`merchant_${fullOrder.stores.owner_id}`).emit('order_status_updated', fullOrder);
        
        if (status === 'ready_for_pickup') {
          console.log(`[updateOrderStatus] Broadcasting ready_for_pickup for Order ${id}`);
          io.to('drivers').emit('order_ready_for_pickup', fullOrder);
        }

        // Create persistence notifications
        if (status === 'preparing') {
            createNotification(fullOrder.user_id, 'Order Preparing', `Your order from ${fullOrder.stores.name} is now being prepared!`, 'order_update');
        } else if (status === 'ready_for_pickup') {
            createNotification(fullOrder.user_id, 'Ready for Delivery', `Your order is ready and a courier is being assigned.`, 'order_update');
        } else if (status === 'cancelled') {
            createNotification(fullOrder.user_id, 'Order Cancelled', `Your order from ${fullOrder.stores.name} was cancelled.`, 'order_update');
        }
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
    const isCustomer = order.user_id === req.user.id;
    const isMerchant = order.stores?.owner_id === req.user.id;
    const isDriver = order.drivers?.user_id === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isCustomer && !isMerchant && !isDriver && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

// @desc    Cancel an order
// @route   POST /orders/:id/cancel
// @access  Private/Customer
export const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // 1. Fetch order
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('id, user_id, status, created_at')
      .eq('id', id)
      .single();

    if (fetchError || !order) return res.status(404).json({ message: 'Order not found' });

    // 2. Policy Check: Only creator can cancel
    if (order.user_id !== userId) return res.status(403).json({ message: 'Not authorized' });

    // 3. Status and Time Rules
    const createdAt = new Date(order.created_at);
    const now = new Date();
    const diffSeconds = (now.getTime() - createdAt.getTime()) / 1000;

    const isPending = order.status === 'pending';
    const isWithin60s = diffSeconds <= 60;

    // RULE: Only allowed if 'pending' OR within 60s
    // BUT: If merchant has ALREADY accepted (e.g. status='preparing'), 
    // we strictly block it unless within 60s AND user is fast.
    // However, the prompt says: "Only if status = 'pending' OR within 60 seconds"
    // "Prevent cancellation after merchant accepts" (which usually means status moves to 'preparing')
    
    if (order.status !== 'pending' && !isWithin60s) {
      return res.status(400).json({ message: 'Order cannot be cancelled at this stage' });
    }

    // 4. Update status
    const { data: updatedOrder, error } = await supabase
      .from('orders')
      .update({ status: 'cancelled', updated_at: now.toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

// @desc    Get merchant statistics
// @route   GET /orders/merchant/stats
// @access  Private/Merchant
export const getMerchantStats = async (req, res) => {
  try {
    const { data: stores } = await supabase.from('stores').select('id').eq('owner_id', req.user.id);
    const storeIds = stores.map(s => s.id);

    if (storeIds.length === 0) {
      return res.json({
        totalOrdersToday: 0,
        pendingOrders: 0,
        completedOrders: 0,
        todayRevenue: 0
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Total Orders Today
    const { count: totalToday } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .in('store_id', storeIds)
      .gte('created_at', today.toISOString());

    // 2. Pending Orders (Total)
    const { count: pending } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .in('store_id', storeIds)
      .eq('status', 'pending');

    // 3. Completed Orders (Total)
    const { count: completed } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .in('store_id', storeIds)
      .eq('status', 'completed');

    // 4. Today's Revenue (Subtotal only, excludes delivery fees)
    const { data: revenueData } = await supabase
      .from('orders')
      .select('subtotal')
      .in('store_id', storeIds)
      .eq('status', 'completed')
      .gte('created_at', today.toISOString());

    const revenue = revenueData ? revenueData.reduce((acc, o) => acc + Number(o.subtotal || 0), 0) : 0;

    res.json({
      totalOrdersToday: totalToday || 0,
      pendingOrders: pending || 0,
      completedOrders: completed || 0,
      todayRevenue: revenue
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};
