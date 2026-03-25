import { supabase } from '../config/supabase.js';

// @desc    Get all pending users ( merchants, drivers )
// @route   GET /admin/pending-users
// @access  Private/Admin
export const getPendingUsers = async (req, res) => {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('id, name, email, phone, role, status, created_at')
      .eq('status', 'pending');

    if (error) throw error;

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

// @desc    Approve a pending user
// @route   PATCH /admin/approve-user/:id
// @access  Private/Admin
export const approveUser = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: user, error } = await supabase
      .from('users')
      .update({ status: 'active' })
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error || !user) {
      return res.status(404).json({ message: 'User not found or update failed' });
    }

    res.json({ message: `User ${user.name} approved successfully`, user });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

// @desc    Get all orders
// @route   GET /admin/orders
// @access  Private/Admin
export const getAllOrders = async (req, res) => {
  try {
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*, users(name), stores(name)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

// @desc    Get System Stats
// @route   GET /admin/stats
// @access  Private/Admin
export const getStats = async (req, res) => {
  try {
    const { count: totalOrders } = await supabase.from('orders').select('*', { count: 'exact', head: true });
    const { count: totalUsers } = await supabase.from('users').select('*', { count: 'exact', head: true });
    const { count: totalStores } = await supabase.from('stores').select('*', { count: 'exact', head: true });
    
    const { data } = await supabase.from('orders').select('total_price').eq('status', 'completed').eq('payment_status', 'paid');
    const revenue = data ? data.reduce((acc, order) => acc + Number(order.total_price), 0) : 0;

    res.json({
      totalOrders: totalOrders || 0,
      totalUsers: totalUsers || 0,
      totalStores: totalStores || 0,
      totalRevenue: revenue
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};
