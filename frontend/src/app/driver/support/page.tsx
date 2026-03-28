'use client';
import { motion } from 'framer-motion';
import { Headphones, Mail, Phone, MessageSquare, Zap, ShieldCheck } from 'lucide-react';

export default function DriverSupport() {
  return (
    <div className="space-y-6 pb-24 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold text-[#111111] tracking-tighter">Support</h1>
        <p className="text-[10px] font-bold text-[#888888] uppercase tracking-widest mt-0.5">We're here to help, 24/7</p>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-4">
        {[
          { icon: <MessageSquare size={20} />, label: 'Live Chat', desc: 'Chat with a dispatch agent now', color: '#0f172a', bg: '#fef3f2' },
          { icon: <Phone size={20} />, label: 'Call Support', desc: '+1 (800) DELIVRAY', color: '#2563eb', bg: '#eff6ff' },
          { icon: <Mail size={20} />, label: 'Email Us', desc: 'drivers@delivray.com', color: '#16a34a', bg: '#f0fdf4' },
          { icon: <Zap size={20} />, label: 'Emergency', desc: 'Report an incident fast', color: '#dc2626', bg: '#fef2f2' },
        ].map((item, i) => (
          <motion.button key={item.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm text-left hover:shadow-md transition-all group"
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: item.bg, color: item.color }}>
              {item.icon}
            </div>
            <p className="text-xs font-bold text-[#111111] mb-1">{item.label}</p>
            <p className="text-[10px] text-[#888888] font-medium">{item.desc}</p>
          </motion.button>
        ))}
      </div>

      {/* FAQ */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50">
          <p className="text-sm font-bold text-[#111111]">Common Questions</p>
        </div>
        <div className="divide-y divide-gray-50">
          {[
            { q: 'How are my earnings calculated?', a: 'You earn a fixed delivery fee ($3.00) per completed delivery. Product prices go to the merchant.' },
            { q: 'When do I get paid?', a: 'Payouts are processed every Friday. Check the Earnings page for your balance.' },
            { q: 'What if I have an issue with a delivery?', a: 'Use the Emergency contact option above or email us. We respond within 5 minutes.' },
            { q: 'How do I update my vehicle info?', a: 'Go to Settings to update your vehicle type, plate number, and profile details.' },
          ].map((faq, i) => (
            <div key={i} className="px-6 py-4">
              <p className="text-xs font-bold text-[#111111] mb-1">{faq.q}</p>
              <p className="text-[10px] text-[#888888] font-medium leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3 px-4 py-3 bg-[#f0fdf4] rounded-xl border border-green-100 text-green-600">
        <ShieldCheck size={16} />
        <span className="text-[10px] font-bold uppercase tracking-wider">Driver support is available 24/7</span>
      </div>
    </div>
  );
}
