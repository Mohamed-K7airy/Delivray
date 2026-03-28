'use client';
import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  PaymentElement,
  Elements,
  useStripe,
  useElements,
  CardElement
} from '@stripe/react-stripe-js';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, Lock, Activity } from 'lucide-react';
import { toast } from 'sonner';

// Replace with your actual Stripe publishable key
const stripePromise = loadStripe('pk_test_51P...dummy_key'); 

const CheckoutForm = ({ clientSecret, onCancel, onSuccess }: { clientSecret: string, onCancel: () => void, onSuccess: () => void }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setIsProcessing(true);

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) return;

    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
      },
    });

    if (error) {
      toast.error(error.message || 'Payment failed');
      setIsProcessing(false);
    } else if (paymentIntent.status === 'succeeded') {
      toast.success('Payment authorized!');
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="p-6 bg-gray-50 rounded-[2rem] border border-gray-100">
        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#888888] ml-2 mb-4 block">Secure Card Entry</label>
        <div className="px-4 py-3 bg-white rounded-xl border border-gray-100 shadow-sm">
          <CardElement options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#111111',
                '::placeholder': { color: '#aab7c4' },
                fontSmoothing: 'antialiased',
              },
              invalid: { color: '#ef4444' },
            },
          }} />
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <button
          type="submit"
          disabled={isProcessing || !stripe}
          className="w-full h-16 bg-[#0f172a] text-white font-bold uppercase tracking-widest text-xs rounded-2xl shadow-xl shadow-[#0f172a]/20 hover:bg-[#c2654a] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
        >
          {isProcessing ? <Activity className="animate-spin" size={20} /> : <Lock size={18} />}
          {isProcessing ? 'Authorizing...' : 'Confirm Payment'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="text-[10px] font-bold uppercase tracking-widest text-[#888888] hover:text-[#111111] transition-colors"
        >
          Cancel Transaction
        </button>
      </div>

      <div className="flex items-center justify-center gap-2 opacity-50">
        <ShieldCheck size={14} className="text-gray-400" />
        <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">PCI-DSS Compliant Infrastructure</span>
      </div>
    </form>
  );
};

export default function StripeCheckoutModal({ 
  isOpen, 
  onClose, 
  clientSecret, 
  onSuccess 
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  clientSecret: string,
  onSuccess: () => void
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-lg bg-white rounded-[3rem] p-12 shadow-2xl overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-[#0f172a]/5 rounded-full blur-3xl -mr-24 -mt-24" />
            
            <div className="relative z-10">
              <div className="flex justify-between items-center mb-10">
                <div>
                  <h3 className="text-3xl font-bold text-[#111111] tracking-tighter uppercase">Secure <span className="text-[#0f172a]">Payment.</span></h3>
                  <p className="text-[9px] font-bold text-[#888888] uppercase tracking-[0.3em] mt-1">Transaction Node #48291</p>
                </div>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                  <X size={28} />
                </button>
              </div>

              <Elements stripe={stripePromise}>
                <CheckoutForm 
                  clientSecret={clientSecret} 
                  onCancel={onClose} 
                  onSuccess={onSuccess} 
                />
              </Elements>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
