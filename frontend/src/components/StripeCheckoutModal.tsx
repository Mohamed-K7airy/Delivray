'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, Lock, Activity, CreditCard } from 'lucide-react';
import { toast } from 'sonner';

export default function StripeCheckoutModal({ 
  isOpen, 
  onClose, 
  clientSecret, // Kept for backwards compatibility 
  onSuccess 
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  clientSecret: string,
  onSuccess: () => void
}) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }
    return v;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (cardNumber.replace(/\s+/g, '').length < 16) {
      return toast.error('Please enter a valid 16-digit card number.');
    }
    if (expiry.length < 5) return toast.error('Please enter a valid expiration date (MM/YY).');
    if (cvc.length < 3) return toast.error('Please enter a valid CVC.');

    setIsProcessing(true);

    // Simulate Payment Gateway Delay
    setTimeout(() => {
      toast.success('Payment authorized successfully!');
      setIsProcessing(false);
      onSuccess();
    }, 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={!isProcessing ? onClose : undefined}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative w-full max-w-md bg-white rounded-3xl p-8 lg:p-10 shadow-2xl overflow-hidden border border-slate-100"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-slate-100 rounded-full blur-[80px] -mr-32 -mt-32 opacity-50" />
            
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <div className="w-10 h-10 bg-slate-50 text-slate-900 flex items-center justify-center rounded-xl mb-4 border border-slate-100 shadow-sm">
                    <CreditCard size={20} />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Enter Card Details</h3>
                  <p className="text-xs text-slate-500 font-medium mt-1">Pay securely using Visa or Mastercard.</p>
                </div>
                {!isProcessing && (
                  <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors p-2 bg-slate-50 rounded-full">
                    <X size={20} />
                  </button>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-2">Card Number</label>
                    <input 
                      type="text" 
                      placeholder="0000 0000 0000 0000"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                      maxLength={19}
                      disabled={isProcessing}
                      className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-slate-900 outline-none text-sm font-bold text-slate-900 tracking-wider transition-all"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-2">Expiration</label>
                      <input 
                        type="text" 
                        placeholder="MM/YY"
                        value={expiry}
                        onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                        maxLength={5}
                        disabled={isProcessing}
                        className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-slate-900 outline-none text-sm font-bold text-slate-900 tracking-wider transition-all text-center"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-2">CVC</label>
                      <input 
                        type="password" 
                        placeholder="•••"
                        value={cvc}
                        onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').substring(0, 4))}
                        maxLength={4}
                        disabled={isProcessing}
                        className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-slate-900 outline-none text-sm font-bold text-slate-900 tracking-widest transition-all text-center"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full h-14 bg-slate-900 text-white font-bold text-sm rounded-xl shadow-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? <Activity className="animate-spin" size={18} /> : <Lock size={16} />}
                    {isProcessing ? 'Processing Payment...' : 'Pay Now'}
                  </button>
                </div>

                <div className="flex items-center justify-center gap-2 mt-4 text-slate-400">
                  <ShieldCheck size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Dummy Payment System</span>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
