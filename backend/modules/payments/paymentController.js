import { supabase } from '../../config/supabase.js';
import Stripe from 'stripe';
import dotenv from 'dotenv';
import { getIo } from '../../config/socket.js';
import { createNotification } from '../notifications/notificationController.js';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// @desc    Initiate Payment (Create PaymentIntent)
// @route   POST /payments/create-intent
// @access  Private/Customer
export const createPaymentIntent = async (req, res) => {
  try {
    const { order_id } = req.body;
    
    // 1. Validate order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, total_price, user_id, payment_status')
      .eq('id', order_id)
      .single();

    if (orderError || !order) return res.status(404).json({ message: 'Order not found' });
    if (order.user_id !== req.user.id) return res.status(403).json({ message: 'Not authorized' });
    if (order.payment_status === 'paid') return res.status(400).json({ message: 'Order already paid' });

    // 2. Create Stripe PaymentIntent
    const amount = Math.round(Number(order.total_price) * 100); // Stripe expects cents
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      metadata: { order_id, user_id: req.user.id }
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

// @desc    Webhook for Stripe Events
// @route   POST /payments/webhook
// @access  Public
export const paymentWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    const { order_id } = paymentIntent.metadata;

    console.log(`[Webhook] Payment succeeded for Order: ${order_id}`);

    // Update order status to 'preparing' and payment_status to 'paid'
    const { data: updatedOrder, error } = await supabase
      .from('orders')
      .update({ 
        payment_status: 'paid',
        status: 'accepted', // Acceptance is automatic on payment for now
        updated_at: new Date().toISOString()
      })
      .eq('id', order_id)
      .select('*, stores(owner_id, name), order_items(*, products(name))')
      .single();
    
    if (updatedOrder) {
        const io = getIo();
        if (io) {
            io.to(`order_${order_id}`).emit('order_status_updated', updatedOrder);
            io.to(`merchant_${updatedOrder.stores.owner_id}`).emit('new_order', updatedOrder);
        }
        createNotification(updatedOrder.user_id, 'Payment Successful', `Your order from ${updatedOrder.stores.name} is confirmed and paid!`, 'order_update');
    }
  }

  res.json({ received: true });
};
