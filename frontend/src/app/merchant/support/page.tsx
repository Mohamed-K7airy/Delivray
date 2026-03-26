'use client';
import { motion } from 'framer-motion';
import { Headset, MessageSquare, BookOpen, LifeBuoy, Zap, ChevronRight, Activity } from 'lucide-react';

export default function MerchantSupport() {
  return (
    <div className="max-w-7xl mx-auto space-y-8 sm:space-y-12 px-4 sm:px-0">
       {/* Header */}
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
             <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tighter text-[#111111]">Support Center</h1>
             <p className="text-[#888888] font-medium mt-2">24/7 technical assistance and operational guidance.</p>
          </div>
          <div className="bg-[#fef3f2] px-6 py-3 rounded-xl border border-[#fee2e2] flex items-center space-x-4">
             <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]"></span>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#d97757]">Priority Response Active</span>
             </div>
          </div>
       </div>

       {/* Support Channels */}
       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {[
            { label: 'Live Chat', desc: 'Average wait: 2 mins', icon: <MessageSquare />, color: 'text-[#d97757]' },
            { label: 'Documentation', desc: 'API & Portal guides', icon: <BookOpen />, color: 'text-[#111111]' },
            { label: 'System Health', desc: 'All systems operational', icon: <Activity />, color: 'text-[#111111]' },
          ].map((item, idx) => (
             <div key={idx} className="bg-white p-6 sm:p-10 rounded-2xl border border-gray-100 shadow-md group hover:shadow-xl transition-all cursor-pointer">
                <div className={`w-12 h-12 sm:w-14 sm:h-14 bg-[#f9f9f9] rounded-xl flex items-center justify-center ${item.color} mb-8 transition-transform group-hover:scale-110 border border-gray-100 shadow-inner`}>
                   {item.icon}
                </div>
                <h3 className="text-2xl font-black uppercase tracking-tighter mb-2 text-[#111111]">{item.label}</h3>
                <p className="text-[#888888] font-medium text-xs uppercase tracking-widest">{item.desc}</p>
             </div>
          ))}
       </div>

       {/* FAQ Section */}
       <div className="bg-white p-12 rounded-2xl border border-gray-100 shadow-xl relative overflow-hidden group">
          <div className="flex items-center space-x-4 mb-12">
             <div className="w-10 h-10 bg-[#f9f9f9] rounded-xl flex items-center justify-center text-[#d97757] border border-gray-100 shadow-inner">
                <LifeBuoy size={20} />
             </div>
             <h2 className="text-2xl font-black uppercase tracking-tighter text-[#111111]">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-6">
             {[
               'How do I sync my inventory with the global catalog?',
               'What are the payout settlement intervals?',
               'How to integrate the neural dispatch API?',
               'Managing multi-role operator permissions'
             ].map((q, idx) => (
                <div key={idx} className="bg-[#f9f9f9] p-8 rounded-xl border border-gray-100 flex items-center justify-between hover:bg-white hover:shadow-lg transition-all cursor-pointer group/q">
                   <div className="flex items-center space-x-6">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#888888] group-hover/q:text-[#d97757] transition-colors border border-gray-100 shadow-sm">
                         <Zap size={18} />
                      </div>
                      <span className="text-sm font-black uppercase tracking-widest text-[#888888] group-hover/q:text-[#111111] transition-colors">{q}</span>
                   </div>
                   <ChevronRight size={20} className="text-[#888888] group-hover/q:text-[#d97757] transition-all group-hover/q:translate-x-1" />
                </div>
             ))}
          </div>
          
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#d97757]/5 rounded-full blur-[120px] pointer-events-none -mr-40 -mt-80 opacity-40 group-hover:bg-[#d97757]/10 transition-colors duration-1000"></div>
       </div>

       {/* Contact CTA */}
       <div className="bg-[#d97757] p-12 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
          <div className="text-center md:text-left">
             <h2 className="text-4xl font-black text-white uppercase tracking-tighter leading-tight">Need immediate technical assistance?</h2>
             <p className="text-white/80 font-black uppercase tracking-widest text-xs mt-3">Our elite support unit is standing by to resolve any operational blockages.</p>
          </div>
          <button className="bg-white text-[#d97757] px-12 py-6 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-gray-50 transition-all flex items-center space-x-4 shadow-lg">
             <Headset size={24} />
             <span>Open Support Ticket</span>
          </button>
       </div>
    </div>
  );
}
