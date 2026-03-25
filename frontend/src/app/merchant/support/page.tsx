'use client';
import { motion } from 'framer-motion';
import { Headset, MessageSquare, BookOpen, LifeBuoy, Zap, ChevronRight, Activity } from 'lucide-react';

export default function MerchantSupport() {
  return (
    <div className="max-w-7xl mx-auto space-y-12">
       {/* Header */}
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
             <h1 className="text-5xl font-black uppercase tracking-tighter text-white">Support Center</h1>
             <p className="text-gray-500 font-medium mt-2">24/7 technical assistance and operational guidance.</p>
          </div>
          <div className="bg-primary/10 px-6 py-3 rounded-2xl border border-primary/20 flex items-center space-x-4">
             <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,1)]"></span>
                <span className="text-[10px] font-black uppercase tracking-widest text-primary">Priority Response Active</span>
             </div>
          </div>
       </div>

       {/* Support Channels */}
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { label: 'Live Chat', desc: 'Average wait: 2 mins', icon: <MessageSquare />, color: 'text-primary' },
            { label: 'Documentation', desc: 'API & Portal guides', icon: <BookOpen />, color: 'text-white' },
            { label: 'System Health', desc: 'All systems operational', icon: <Activity />, color: 'text-white' },
          ].map((item, idx) => (
             <div key={idx} className="bg-[#262624] p-10 rounded-[3rem] border border-white/5 shadow-2xl group hover:border-primary/20 transition-all cursor-pointer">
                <div className={`w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center ${item.color} mb-8 transition-transform group-hover:scale-110`}>
                   {item.icon}
                </div>
                <h3 className="text-2xl font-black uppercase tracking-tighter mb-2">{item.label}</h3>
                <p className="text-gray-500 font-medium text-xs uppercase tracking-widest">{item.desc}</p>
             </div>
          ))}
       </div>

       {/* FAQ Placeholder */}
       <div className="bg-[#262624] p-12 rounded-[3.5rem] border border-white/5 shadow-2xl relative overflow-hidden group">
          <div className="flex items-center space-x-4 mb-12">
             <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-primary">
                <LifeBuoy size={20} />
             </div>
             <h2 className="text-2xl font-black uppercase tracking-tighter">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-6">
             {[
               'How do I sync my inventory with the global catalog?',
               'What are the payout settlement intervals?',
               'How to integrate the neural dispatch API?',
               'Managing multi-role operator permissions'
             ].map((q, idx) => (
                <div key={idx} className="bg-white/[0.02] p-8 rounded-2xl border border-white/5 flex items-center justify-between hover:bg-white/[0.05] transition-all cursor-pointer group/q">
                   <div className="flex items-center space-x-6">
                      <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-gray-700 group-hover/q:text-primary transition-colors">
                         <Zap size={18} />
                      </div>
                      <span className="text-sm font-black uppercase tracking-widest text-gray-300 group-hover/q:text-white transition-colors">{q}</span>
                   </div>
                   <ChevronRight size={20} className="text-gray-700 group-hover/q:text-primary transition-all group-hover/q:translate-x-1" />
                </div>
             ))}
          </div>
          
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none -mr-40 -mt-80 opacity-40 group-hover:bg-primary/10 transition-colors duration-1000"></div>
       </div>

       {/* Contact CTA */}
       <div className="bg-primary p-12 rounded-[3.5rem] flex flex-col md:flex-row items-center justify-between gap-8 shadow-[0_20px_60px_-10px_rgba(217,119,87,0.3)]">
          <div className="text-center md:text-left">
             <h2 className="text-4xl font-black text-black uppercase tracking-tighter leading-tight">Need immediate technical assistance?</h2>
             <p className="text-black/60 font-black uppercase tracking-widest text-xs mt-3">Our elite support unit is standing by to resolve any operational blockages.</p>
          </div>
          <button className="bg-black text-white px-12 py-6 rounded-3xl font-black uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all flex items-center space-x-4 shadow-2xl">
             <Headset size={24} />
             <span>Open Support Ticket</span>
          </button>
       </div>
    </div>
  );
}
