import { supabase } from '../../config/supabase.js';
import { getIo } from '../../config/socket.js';

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
      io.to(`order_${id}`).emit('order_status_updated', updatedOrder);
      
      // Get store owner to notify merchant room
      const { data: store } = await supabase.from('stores').select('owner_id').eq('id', updatedOrder.store_id).single();
      if (store) {
        io.to(`merchant_${store.owner_id}`).emit('order_status_updated', updatedOrder);
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
      io.to(`order_${id}`).emit('order_status_updated', completedOrder);
      
      // Get store owner to notify merchant room
      const { data: store } = await supabase.from('stores').select('owner_id').eq('id', completedOrder.store_id).single();
      if (store) {
        io.to(`merchant_${store.owner_id}`).emit('order_status_updated', completedOrder);
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

    // 2. Aggregate Earnings and Deliveries
    const { data: orders, error } = await supabase
      .from('orders')
      .select('total_price')
      .eq('driver_id', driver.id)
      .eq('status', 'completed');

    if (error) throw error;

    const totalEarnings = orders.reduce((sum, o) => sum + Number(o.total_price), 0);
    const deliveriesCount = orders.length;

    res.json({
      earnings: totalEarnings,
      deliveries: deliveriesCount
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};
