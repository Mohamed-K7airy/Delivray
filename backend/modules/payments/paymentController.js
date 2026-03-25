import { supabase } from '../../config/supabase.js';

// @desc    Initiate Payment
// @route   POST /payments/initiate
// @access  Private/Customer
export const initiatePayment = async (req, res) => {
  try {
    const { order_id, payment_method } = req.body;
    
    // Validate order
    const { data: order } = await supabase.from('orders').select('id, user_id, total_price, status').eq('id', order_id).single();
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.user_id !== req.user.id) return res.status(403).json({ message: 'Not authorized' });

    if (payment_method === 'cash') {
       const { data, error } = await supabase.from('orders').update({ payment_method: 'cash', payment_status: 'pending' }).eq('id', order_id).select().single();
       if (error) throw error;
       return res.json({ message: 'Payment set to Cash on Delivery', order: data });
    } else if (payment_method === 'online') {
       // Mock integration with Stripe/Paymob
       const mockCheckoutUrl = `https://mock-payment-gateway.com/checkout/${order_id}`;
       const { data, error } = await supabase.from('orders').update({ payment_method: 'online', payment_status: 'pending' }).eq('id', order_id).select().single();
       if (error) throw error;
       return res.json({ message: 'Redirecting to payment gateway', url: mockCheckoutUrl, order: data });
    }

    res.status(400).json({ message: 'Invalid payment method' });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

// @desc    Webhook for Online Payment Confirmation
// @route   POST /payments/webhook
// @access  Public
export const paymentWebhook = async (req, res) => {
  try {
    // In production, verify Stripe/Paymob signature here
    const { order_id, status } = req.body; 

    if (status === 'succeeded') {
      await supabase.from('orders').update({ payment_status: 'paid' }).eq('id', order_id);
    } else {
      await supabase.from('orders').update({ payment_status: 'failed' }).eq('id', order_id);
    }

    res.send('Webhook received');
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};
