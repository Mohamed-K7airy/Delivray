'use client';
import { motion } from 'framer-motion';
import { Wallet, TrendingUp, Calendar, Clock, History as HistoryIcon, Map as MapIcon, Settings as SettingsIcon, LifeBuoy } from 'lucide-react';

const PlaceholderPage = ({ title, icon: Icon, description }: { title: string, icon: any, description: string }) => (
  <div className="max-w-4xl mx-auto py-20 text-center space-y-12">
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-48 h-48 bg-white/5 rounded-[4rem] border border-white/5 flex items-center justify-center mx-auto group shadow-2xl"
    >
      <Icon size={80} className="text-gray-700 group-hover:text-[#ff8564] group-hover:scale-110 transition-all duration-700" />
    </motion.div>
    
    <div className="space-y-4">
      <h1 className="text-6xl font-black tracking-tighter uppercase">{title}</h1>
      <p className="text-gray-500 text-xl font-bold max-w-lg mx-auto leading-relaxed">{description}</p>
    </div>

    <div className="pt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
       {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-[#1a1a1a] rounded-[2rem] border border-white/5 animate-pulse" />
       ))}
    </div>
  </div>
);

export default function EarningsPage() {
  return <PlaceholderPage title="Earnings Hub" icon={Wallet} description="Track your daily payouts, bonuses, and financial milestones in real-time." />;
}
