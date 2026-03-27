import { supabase } from '../../config/supabase.js';
import { getIo } from '../../config/socket.js';

// Fixed delivery fee paid to the driver per completed delivery
const DELIVERY_FEE = parseFloat(process.env.DELIVERY_FEE || '3.00');

// @desc    Get available orders for driver
// @route   GET /delivery/available-orders
// @access  Private/Driver
export const getAvailableOrders = async (req, res) => {
  try {
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*, stores(name, location_lat, location_lng)')
      .eq('status', 'ready_for_pickup')
      .is('driver_id', null)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

// @desc    Accept order
// @route   POST /delivery/accept-order/:id
// @access  Private/Driver
export const acceptOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Get driver profile
    const { data: driver } = await supabase.from('drivers').select('id, is_available').eq('user_id', userId).single();
    if (!driver) return res.status(404).json({ message: 'Driver profile not found' });

    // Check if order is ready and not taken
    const { data: order } = await supabase.from('orders').select('status, driver_id').eq('id', id).single();
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.status !== 'ready_for_pickup' || order.driver_id !== null) {
      return res.status(400).json({ message: 'Order is no longer available' });
    }

    // Assign driver and update status to delivering
    const { data: updatedOrder, error } = await supabase
      .from('orders')
      .update({ driver_id: driver.id, status: 'delivering' })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Emit event
    const io = getIo();
    if (io) {
      // Refetch full order with drivers and users for the tracking page
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
      }
    }

    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

// @desc    Complete order
// @route   PATCH /delivery/complete-order/:id
// @access  Private/Driver
export const completeOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verify driver
    const { data: driver } = await supabase.from('drivers').select('id').eq('user_id', userId).single();
    if (!driver) return res.status(404).json({ message: 'Driver not found' });

    // Verify order ownership
    const { data: order } = await supabase.from('orders').select('status, driver_id').eq('id', id).single();
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.driver_id !== driver.id) return res.status(403).json({ message: 'Not authorized for this order' });
    if (order.status !== 'delivering') return res.status(400).json({ message: 'Cannot complete an order that is not delivering' });

    // Mark order as completed
    const { data: completedOrder, error } = await supabase
      .from('orders')
      .update({ status: 'completed' })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Emit event
    const io = getIo();
    if (io) {
      const { data: fullOrder } = await supabase
        .from('orders')
        .select(`
          *,
          stores(name, owner_id),
          order_items(*, products(name)),
          drivers(id, user_id, users(name))
        `)
        .eq('id', id)
        .single();

      if (fullOrder) {
        io.to(`order_${id}`).emit('order_status_updated', fullOrder);
        io.to(`merchant_${fullOrder.stores.owner_id}`).emit('order_status_updated', fullOrder);
      }
    }

    res.json(completedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

// @desc    Update driver location (Live tracking)
// @route   PATCH /delivery/location
// @access  Private/Driver
export const updateLocation = async (req, res) => {
  try {
    const { lat, lng } = req.body;
    const userId = req.user.id;

    const { data: driver, error } = await supabase
      .from('drivers')
      .update({ current_location_lat: lat, current_location_lng: lng })
      .eq('user_id', userId)
      .select('id')
      .single();

    if (error) throw error;

    // Find all active orders for this driver to broadcast location
    const { data: activeOrders } = await supabase
      .from('orders')
      .select('id')
      .eq('driver_id', driver.id)
      .eq('status', 'delivering');

    const io = getIo();
    if (activeOrders && io) {
      activeOrders.forEach(order => {
        io.to(`order_${order.id}`).emit('driver_location_updated', { lat, lng });
      });
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};
// @desc    Get driver statistics
// @route   GET /delivery/stats
// @access  Private/Driver
export const getDriverStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Get driver profile
    const { data: driver, error: driverError } = await supabase.from('drivers').select('id').eq('user_id', userId).maybeSingle();
    
    if (driverError) throw driverError;
    
    if (!driver) {
      return res.json({
        earnings: 0,
        deliveries: 0
      });
    }

    // 2. Aggregate Earnings: driver earns DELIVERY_FEE per delivery (not total_price)
    const { data: orders, error } = await supabase
      .from('orders')
      .select('id')
      .eq('driver_id', driver.id)
      .eq('status', 'completed');

    if (error) throw error;

    const deliveriesCount = orders.length;
    // Earnings = fixed delivery fee × number of completed trips
    const totalEarnings = deliveriesCount * DELIVERY_FEE;

    res.json({
      earnings: totalEarnings,
      deliveries: deliveriesCount,
      delivery_fee: DELIVERY_FEE
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

// @desc    Get driver delivery history with pagination
// @route   GET /delivery/history
// @access  Private/Driver
export const getDriverHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    // 1. Get driver profile
    const { data: driver } = await supabase.from('drivers').select('id').eq('user_id', userId).single();
    if (!driver) return res.status(404).json({ message: 'Driver not found' });

    // 2. Fetch completed orders with range
    const { data: orders, error, count } = await supabase
      .from('orders')
      .select('*, stores(name, location_lat, location_lng)', { count: 'exact' })
      .eq('driver_id', driver.id)
      .eq('status', 'completed')
      .order('updated_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    res.json({
      orders,
      pagination: {
        total: count,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};
