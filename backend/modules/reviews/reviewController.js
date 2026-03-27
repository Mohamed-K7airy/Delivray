import { supabase } from '../../config/supabase.js';

export const createReview = async (req, res) => {
  try {
    const { order_id, driver_id, store_id, rating, comment } = req.body;
    const user_id = req.user.id;

    // Verify order is delivered and belongs to user
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('status, user_id')
      .eq('id', order_id)
      .single();

    if (orderError || !order) return res.status(404).json({ message: 'Order not found' });
    if (order.status !== 'delivered') return res.status(400).json({ message: 'Can only rate delivered orders' });
    if (order.user_id !== user_id) return res.status(403).json({ message: 'Not authorized' });

    const { data: review, error } = await supabase
      .from('reviews')
      .insert([{ user_id, order_id, driver_id, store_id, rating, comment }])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') return res.status(400).json({ message: 'Review already exists for this order' });
      throw error;
    }

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getTargetReviews = async (req, res) => {
  try {
    const { type, id } = req.params; // type = 'driver' or 'store'
    
    let query = supabase.from('reviews').select(`
      *,
      users (name, avatar_url)
    `);

    if (type === 'driver') query = query.eq('driver_id', id);
    else query = query.eq('store_id', id);

    const { data: reviews, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
