'use client';
import { useState } from 'react';
import { Star, X, MessageSquare, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiClient } from '@/lib/apiClient';
import { toast } from 'sonner';

interface ReviewModalProps {
  orderId: string;
  storeName: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ReviewModal({ orderId, storeName, isOpen, onClose, onSuccess }: ReviewModalProps) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [hoveredRating, setHoveredRating] = useState(0);

  const handleSubmit = async () => {
    if (rating < 1) return toast.error('Please select a rating');
    setLoading(true);
    try {
      const data = await apiClient('/reviews', {
        method: 'POST',
        body: JSON.stringify({ order_id: orderId, rating, comment })
      });
      if (data) {
        toast.success('Review submitted! Thank you.');
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white rounded-3xl p-8 max-w-md w-full relative z-10 shadow-2xl border border-gray-100"
          >
            <button onClick={onClose} className="absolute top-6 right-6 text-gray-400 hover:text-[#111111] transition-colors">
              <X size={20} />
            </button>

            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-[#fef3f2] rounded-2xl flex items-center justify-center text-[#d97757] mx-auto mb-4">
                <Star size={32} fill="currentColor" />
              </div>
              <h2 className="text-2xl font-black text-[#111111] tracking-tighter">Rate your experience</h2>
              <p className="text-xs font-bold text-[#888888] uppercase tracking-widest mt-1">Order from {storeName}</p>
            </div>

            <div className="space-y-8">
              {/* Star Rating */}
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    onClick={() => setRating(star)}
                    className="transition-transform active:scale-90 hover:scale-110"
                  >
                    <Star
                      size={40}
                      className={star <= (hoveredRating || rating) ? 'text-amber-400' : 'text-gray-100'}
                      fill={star <= (hoveredRating || rating) ? 'currentColor' : 'none'}
                      strokeWidth={2}
                    />
                  </button>
                ))}
              </div>

              {/* Comment */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-[#888888] uppercase tracking-widest ml-1 flex items-center gap-2">
                  <MessageSquare size={12} /> Share your thoughts (Optional)
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="How was the food and delivery?"
                  className="w-full h-32 p-5 bg-[#f9f9f9] border border-gray-100 rounded-2xl text-sm font-bold text-[#111111] outline-none focus:border-[#d97757] transition-all resize-none"
                />
              </div>

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full h-14 bg-[#111111] text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-[#333] transition-all shadow-lg active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Send size={16} />
                    <span>Submit Review</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
