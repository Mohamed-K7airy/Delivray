'use client';
import { motion } from 'framer-motion';
import { Calendar, Clock, CheckCircle2, Sun, Moon, CloudSun } from 'lucide-react';

const SHIFTS = [
  { day: 'Monday',    shift: 'Morning', time: '8:00 AM – 2:00 PM',   icon: <Sun size={16} />,      color: '#f59e0b', bg: '#fffbeb', status: 'confirmed' },
  { day: 'Tuesday',   shift: 'Evening', time: '4:00 PM – 10:00 PM',  icon: <Moon size={16} />,     color: '#6366f1', bg: '#eef2ff', status: 'confirmed' },
  { day: 'Wednesday', shift: 'Open',    time: 'Not scheduled',        icon: <CloudSun size={16} />, color: '#888888', bg: '#f9f9f9', status: 'open' },
  { day: 'Thursday',  shift: 'Morning', time: '8:00 AM – 2:00 PM',   icon: <Sun size={16} />,      color: '#f59e0b', bg: '#fffbeb', status: 'confirmed' },
  { day: 'Friday',    shift: 'Evening', time: '4:00 PM – 10:00 PM',  icon: <Moon size={16} />,     color: '#6366f1', bg: '#eef2ff', status: 'confirmed' },
  { day: 'Saturday',  shift: 'All Day', time: '9:00 AM – 9:00 PM',   icon: <CloudSun size={16} />, color: '#d97757', bg: '#fef3f2', status: 'confirmed' },
  { day: 'Sunday',    shift: 'Off',     time: 'Rest Day',             icon: <Moon size={16} />,     color: '#888888', bg: '#f9f9f9', status: 'off' },
];

export default function DriverSchedule() {
  return (
    <div className="space-y-6 pb-24 max-w-2xl">
      <div>
        <h1 className="text-3xl font-black text-[#111111] tracking-tighter">Schedule</h1>
        <p className="text-[10px] font-bold text-[#888888] uppercase tracking-widest mt-0.5">Your weekly shift calendar</p>
      </div>

      {/* Week summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Shifts This Week', value: '5', icon: <Calendar size={16} />, accent: '#d97757', bg: '#fef3f2' },
          { label: 'Total Hours', value: '38h', icon: <Clock size={16} />, accent: '#2563eb', bg: '#eff6ff' },
          { label: 'Confirmed', value: '5/5', icon: <CheckCircle2 size={16} />, accent: '#16a34a', bg: '#f0fdf4' },
        ].map((s, i) => (
          <div key={s.label} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: s.bg, color: s.accent }}>
              {s.icon}
            </div>
            <div>
              <p className="text-base font-black text-[#111111] tracking-tighter">{s.value}</p>
              <p className="text-[9px] font-black text-[#888888] uppercase tracking-wider leading-tight">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Shifts */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50">
          <p className="text-sm font-black text-[#111111]">This Week</p>
        </div>
        <div className="divide-y divide-gray-50">
          {SHIFTS.map((shift, i) => (
            <motion.div key={shift.day} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
              className="px-6 py-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: shift.bg, color: shift.color }}>
                  {shift.icon}
                </div>
                <div>
                  <p className="text-xs font-black text-[#111111]">{shift.day}</p>
                  <p className="text-[10px] text-[#888888] font-medium">{shift.time}</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                shift.status === 'confirmed' ? 'bg-green-50 text-green-600 border-green-200' :
                shift.status === 'off' ? 'bg-gray-50 text-gray-400 border-gray-200' :
                'bg-[#fef3f2] text-[#d97757] border-[#fee2e2]'
              }`}>
                {shift.status === 'confirmed' ? 'Confirmed' : shift.status === 'off' ? 'Day Off' : 'Open'}
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      <p className="text-[10px] text-[#888888] font-medium text-center">Contact dispatch to request schedule changes</p>
    </div>
  );
}
