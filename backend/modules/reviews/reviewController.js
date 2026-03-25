import { supabase } from '../../config/supabase.js';

// @desc    Create a review for store and driver
// @route   POST /reviews
// @access  Private/Customer
export const createReview = async (req, res) => {
  try {
    const { order_id, rating, comment } = req.body;
    const userId = req.user.id;

    // Validate order belongs to user and is completed
    const { data: order } = await supabase.from('orders').select('id, store_id, driver_id, status').eq('id', order_id).single();
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.status !== 'completed') return res.status(400).json({ message: 'You can only review completed orders' });

    // Check if review already exists
    const { data: existing } = await supabase.from('reviews').select('id').eq('order_id', order_id).maybeSingle();
    if (existing) return res.status(400).json({ message: 'Review already submitted for this order' });

    // Insert review
    const { data: review, error } = await supabase
      .from('reviews')
      .insert([{
        user_id: userId,
        order_id,
        store_id: order.store_id,
        driver_id: order.driver_id,
        rating,
        comment
      }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

// @desc    Get store reviews
// @route   GET /reviews/store/:id
// @access  Public
export const getStoreReviews = async (req, res) => {
  try {
    const { id } = req.params;
    const { data: reviews, error } = await supabase
      .from('reviews')
      .select('rating, comment, created_at, users(name)')
      .eq('store_id', id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};
