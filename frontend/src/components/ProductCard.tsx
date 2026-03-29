'use client';
import { ShoppingBasket, Plus, Minus, Star, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ProductCardProps {
  product: any;
  quantity: number;
  onAdd: () => void;
  onRemove: () => void;
  accentColor?: string;
}

export default function ProductCard({ product, quantity, onAdd, onRemove }: ProductCardProps) {
  const foodImages = [
    'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&auto=format&fit=crop',
  ];
  
  const fallbackImg = foodImages[Math.abs(product.id?.length || 0) % foodImages.length];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="group relative bg-white rounded-3xl p-4 lg:p-5 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.06)] hover:border-slate-200 transition-all duration-300 flex flex-col h-full overflow-hidden"
    >
      {/* 1. Image Section (1:1 Aspect Ratio) */}
      <div className="relative aspect-square w-full rounded-2xl overflow-hidden mb-4 bg-slate-50">
        <img
          src={product.image || fallbackImg}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
          alt={product.name}
        />
        
        {/* Subtle Bottom-Left Overlay for Readability */}
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
            <span className="bg-white/95 backdrop-blur-sm text-[#1f1f1f] px-3 py-1.5 rounded-full text-[10px] font-black shadow-sm ring-1 ring-black/5 animate-pulse uppercase tracking-widest">
                🔥 Popular
            </span>
            {Number(product.price) > 15 && (
                <span className="bg-[#d97757] text-white px-3 py-1.5 rounded-full text-[10px] font-black shadow-lg ring-1 ring-[#d97757]/20 uppercase tracking-widest">
                    ⭐ Best Seller
                </span>
            )}
        </div>

        {!product.availability && (
            <div className="absolute inset-0 bg-white/90 backdrop-blur-md flex items-center justify-center">
                <span className="bg-[#1f1f1f] text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em]">HUB OFFLINE</span>
            </div>
        )}
      </div>

      {/* 2. Product Info Section - Added more breathing room */}
      <div className="flex flex-col flex-1 mt-6 space-y-4 px-1">
        <div className="text-right space-y-2">
          <h3 className="text-[#1f1f1f] font-black text-xl lg:text-2xl leading-tight transition-colors group-hover:text-[#d97757]">
            {product.name}
          </h3>
          <p className="text-[#6b7280] text-[13px] font-bold leading-relaxed line-clamp-2 opacity-70">
            {product.description || 'Premium selection from certified logistics partners.'}
          </p>
        </div>

        {/* Dynamic Meta Info Row */}
        <div className="flex items-center justify-end gap-4 text-[#6b7280] text-[10px] font-black uppercase tracking-widest">
            <div className="flex items-center gap-1.5">
                <Clock size={12} className="text-[#d97757]" />
                <span>25-35 min</span>
            </div>
            <div className="flex items-center gap-1.5">
                <Star size={12} className="fill-yellow-400 text-yellow-400" />
                <span>4.8 (120+)</span>
            </div>
        </div>

        {/* 3. Action Footer */}
        <div className="mt-auto pt-4 flex items-center justify-between gap-4 border-t border-slate-50">
          <div className="flex flex-col items-start">
            <span className="text-[9px] font-black text-[#6b7280] uppercase tracking-[0.2em] mb-0.5">Price</span>
            <span className="text-[#d97757] font-black text-2xl tracking-tighter leading-none">
              {Number(product.price).toFixed(2)} ج.م
            </span>
          </div>

          <div className="relative">
            <AnimatePresence mode="wait">
              {quantity > 0 ? (
                <motion.div 
                    key="active-ctrl"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    style={{ backgroundColor: '#18181b' }} // Force Zinc-900 (Black)
                    className="flex justify-between items-center text-white p-1.5 rounded-full shadow-xl gap-4 border border-white/10"
                >
                    <button 
                        onClick={(e) => { e.preventDefault(); onRemove(); }}
                        style={{ backgroundColor: '#27272a' }} // Force Zinc-800
                        className="w-10 h-10 flex items-center justify-center rounded-full text-zinc-400 hover:text-white transition-colors active:scale-90"
                    >
                        <Minus size={16} />
                    </button>
                    <span className="text-sm font-black tabular-nums min-w-[20px] text-center text-white">{quantity}</span>
                    <button 
                        onClick={(e) => { e.preventDefault(); onAdd(); }}
                        style={{ backgroundColor: '#27272a' }} // Force Zinc-800
                        className="w-10 h-10 flex items-center justify-center rounded-full text-white shadow-lg hover:scale-105 transition-all active:scale-90"
                    >
                        <ShoppingBasket size={18} color="white" />
                    </button>
                </motion.div>
              ) : (
                <motion.button
                  key="idle-btn"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                  onClick={(e) => { e.preventDefault(); onAdd(); }}
                  disabled={!product.availability}
                  style={{ backgroundColor: '#18181b' }} // Force Zinc-900 (Black)
                  className="text-white px-6 py-3.5 rounded-full flex items-center gap-3 font-black text-[11px] uppercase tracking-widest shadow-xl hover:bg-[#d97757] transition-all duration-300 active:scale-95 disabled:opacity-20"
                >
                  <ShoppingBasket size={18} color="white" />
                  <span className="text-white">Add To Cart</span>
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
