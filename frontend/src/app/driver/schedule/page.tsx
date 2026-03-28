'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, CheckCircle2, Sun, Moon, CloudSun, Plus, X, Trash2, Activity } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { apiClient } from '@/lib/apiClient';
import { toast } from 'sonner';

export default function DriverSchedule() {
  const { token } = useAuthStore();
  const [shifts, setShifts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newShift, setNewShift] = useState({ date: '', start_time: '', end_time: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchShifts = async () => {
    try {
      const data = await apiClient('/scheduling/shifts');
      if (data) setShifts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchShifts();
  }, [token]);

  const handleCreateShift = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const data = await apiClient('/scheduling/shifts', {
        method: 'POST',
        data: newShift
      });
      if (data) {
        toast.success('Shift scheduled successfully');
        setShifts([...shifts, data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
        setNewShift({ date: '', start_time: '', end_time: '' });
        setShowAddModal(false);
      }
    } catch (err) {
      // apiClient handles toast
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteShift = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this shift?')) return;
    try {
      await apiClient(`/scheduling/shifts/${id}`, { method: 'DELETE' });
      setShifts(shifts.filter(s => s.id !== id));
      toast.success('Shift cancelled');
    } catch (err) {
      // toast handled by apiClient
    }
  };

  const totalHours = shifts.reduce((acc, s) => {
      const start = new Date(`2000-01-01T${s.start_time}`);
      const end = new Date(`2000-01-01T${s.end_time}`);
      return acc + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
  }, 0);

  return (
    <div className="space-y-8 pb-24 max-w-2xl px-4 sm:px-0">
      <div className="flex justify-between items-end">
        <div>
            <h1 className="text-4xl font-bold text-[#111111] tracking-tighter">Schedule.</h1>
            <p className="text-[10px] font-bold text-[#888888] uppercase tracking-[0.3em] mt-2">Manage your availability</p>
        </div>
        <button 
            onClick={() => setShowAddModal(true)}
            className="w-12 h-12 bg-[#0f172a] text-white rounded-2xl flex items-center justify-center shadow-lg shadow-[#0f172a]/20 hover:scale-105 active:scale-95 transition-all"
        >
            <Plus size={24} />
        </button>
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: 'Active Shifts', value: shifts.length, icon: <Calendar size={16} />, accent: '#0f172a', bg: '#fef3f2' },
          { label: 'Estimated Hours', value: `${totalHours.toFixed(1)}h`, icon: <Clock size={16} />, accent: '#212121', bg: '#f8fafc' },
        ].map((s, i) => (
          <div key={s.label} className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ backgroundColor: s.bg, color: s.accent }}>
              {s.icon}
            </div>
            <div>
              <p className="text-2xl font-bold text-[#111111] tracking-tighter leading-none">{s.value}</p>
              <p className="text-[9px] font-bold text-[#888888] uppercase tracking-widest mt-1">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Shifts List */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden p-2">
        <div className="px-8 py-6 border-b border-gray-50 flex justify-between items-center">
          <p className="text-xs font-bold uppercase tracking-widest text-[#111111]">Upcoming Shifts</p>
          <div className="flex items-center gap-2">
             <div className="w-1.5 h-1.5 bg-[#0f172a] rounded-full animate-pulse" />
             <span className="text-[9px] font-bold text-[#888888] uppercase tracking-widest">Real-time sync</span>
          </div>
        </div>
        
        <div className="divide-y divide-gray-50">
           {loading ? (
              <div className="py-20 flex flex-col items-center gap-4">
                  <Activity size={32} className="text-[#0f172a] animate-spin" />
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#888888]">Syncing Cloud...</p>
              </div>
           ) : shifts.length === 0 ? (
              <div className="py-20 text-center space-y-4">
                  <Calendar size={48} className="mx-auto text-gray-100" />
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#888888]">No Shifts Logged</p>
                  <button onClick={() => setShowAddModal(true)} className="text-[10px] font-bold text-[#0f172a] uppercase tracking-widest hover:underline">Pick a shift now</button>
              </div>
           ) : shifts.map((shift, i) => (
            <motion.div key={shift.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
              className="px-8 py-6 flex items-center justify-between group hover:bg-[#f8fafc] transition-all"
            >
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-2xl bg-[#fef3f2] text-[#0f172a] flex items-center justify-center border border-[#fee2e2]">
                   <Sun size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#111111]">{new Date(shift.date).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Clock size={10} className="text-[#888888]" />
                    <p className="text-[10px] text-[#888888] font-bold tracking-tight uppercase">
                        {shift.start_time.slice(0, 5)} – {shift.end_time.slice(0, 5)}
                    </p>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => handleDeleteShift(shift.id)}
                className="opacity-0 group-hover:opacity-100 w-10 h-10 rounded-xl bg-white text-red-400 hover:text-red-500 hover:bg-red-50 transition-all border border-gray-100 flex items-center justify-center"
              >
                 <Trash2 size={16} />
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Add Shift Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[2.5rem] p-10 shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#0f172a]/5 rounded-full blur-3xl -mr-16 -mt-16" />
              
              <div className="relative z-10">
                <div className="flex justify-between items-center mb-10">
                    <h3 className="text-2xl font-bold text-[#111111] tracking-tighter uppercase">Pick <span className="text-[#0f172a]">Shift.</span></h3>
                    <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
                </div>

                <form onSubmit={handleCreateShift} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#888888] ml-1">Select Date</label>
                        <input 
                            required type="date"
                            value={newShift.date}
                            onChange={e => setNewShift({...newShift, date: e.target.value})}
                            className="w-full h-16 px-6 bg-[#f8fafc] border border-gray-100 rounded-2xl text-sm font-bold outline-none focus:border-[#0f172a] transition-all"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                             <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#888888] ml-1">Starts</label>
                             <input 
                                required type="time"
                                value={newShift.start_time}
                                onChange={e => setNewShift({...newShift, start_time: e.target.value})}
                                className="w-full h-16 px-6 bg-[#f8fafc] border border-gray-100 rounded-2xl text-sm font-bold outline-none focus:border-[#0f172a] transition-all"
                             />
                        </div>
                        <div className="space-y-2">
                             <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#888888] ml-1">Ends</label>
                             <input 
                                required type="time"
                                value={newShift.end_time}
                                onChange={e => setNewShift({...newShift, end_time: e.target.value})}
                                className="w-full h-16 px-6 bg-[#f8fafc] border border-gray-100 rounded-2xl text-sm font-bold outline-none focus:border-[#0f172a] transition-all"
                             />
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="w-full h-16 bg-[#0f172a] text-white rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-[#c2654a] transition-all disabled:opacity-50 shadow-lg shadow-[#0f172a]/20 flex items-center justify-center gap-3"
                    >
                        {isSubmitting ? <Activity size={20} className="animate-spin" /> : <Calendar size={20} />}
                        Log Shift
                    </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
