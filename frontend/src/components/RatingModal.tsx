'use client';
import React, { useState } from 'react';
import { Star, MessageSquare, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from './Button';
import { apiClient } from '@/lib/apiClient';
import { toast } from 'sonner';

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  driverId?: string;
  storeId?: string;
  driverName?: string;
  storeName?: string;
}

export default function RatingModal({ 
  isOpen, 
  onClose, 
  orderId, 
  driverId, 
  storeId,
  driverName = 'the driver',
  storeName = 'the store'
}: RatingModalProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hover, setHover] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    setIsSubmitting(true);
    try {
      await apiClient('/reviews', {
        method: 'POST',
        body: JSON.stringify({
          order_id: orderId,
          driver_id: driverId,
          store_id: storeId,
          rating,
          comment
        })
      });
      toast.success('Thank you for your feedback!');
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#111111]/80 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl overflow-hidden"
          >
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#d97757]/5 rounded-full blur-3xl -mr-16 -mt-16" />
            
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-[#111111] transition-colors"
            >
              <X size={20} />
            </button>

            <div className="text-center mb-8">
              <h3 className="text-2xl font-black text-[#111111] tracking-tighter mb-2">How was your delivery?</h3>
              <p className="text-sm font-bold text-[#888888]">Rate your experience with {storeName} and {driverName}</p>
            </div>

            <div className="flex justify-center gap-2 mb-8">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onMouseEnter={() => setHover(star)}
                  onMouseLeave={() => setHover(0)}
                  onClick={() => setRating(star)}
                  className="p-1 transition-transform active:scale-90"
                >
                  <Star 
                    size={36} 
                    className={`${
                      (hover || rating) >= star 
                        ? 'fill-[#d97757] text-[#d97757]' 
                        : 'text-gray-200'
                    } transition-colors duration-200`}
                  />
                </button>
              ))}
            </div>

            <div className="relative mb-8">
              <div className="absolute top-4 left-4 text-gray-400">
                <MessageSquare size={18} />
              </div>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience... (optional)"
                className="w-full h-32 pl-12 pr-4 py-4 bg-gray-50 border border-transparent focus:border-[#d97757]/30 focus:bg-white rounded-2xl text-sm font-bold text-[#111111] outline-none transition-all resize-none"
              />
            </div>

            <Button 
              variant="primary" 
              className="w-full h-14 uppercase tracking-widest text-[10px] font-black"
              onClick={handleSubmit}
              loading={isSubmitting}
            >
              Submit Review
            </Button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
