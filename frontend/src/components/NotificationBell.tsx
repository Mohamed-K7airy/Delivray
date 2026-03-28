'use client';
import { useState, useEffect } from 'react';
import { Bell, Check, Clock, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiClient } from '@/lib/apiClient';
import { useAuthStore } from '@/store/authStore';

export default function NotificationBell() {
  const { token } = useAuthStore();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await apiClient('/notifications');
      if (data) setNotifications(data);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
        fetchNotifications();
        // Poll every 60 seconds - simple real-time alternative
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }
  }, [token]);

  const markAsRead = async (id: string) => {
    try {
      await apiClient(`/notifications/${id}/read`, { method: 'PATCH' });
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="text-slate-400 hover:text-slate-900 transition-all relative p-2 rounded-xl hover:bg-slate-50"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-slate-900 text-white text-[8px] font-bold flex items-center justify-center rounded-full border-2 border-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.95 }}
              className="absolute right-0 mt-4 w-80 bg-white border border-slate-100 rounded-2xl shadow-2xl z-50 overflow-hidden"
            >
              <div className="p-5 border-b border-slate-50 flex items-center justify-between bg-white sticky top-0">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-900">Notifications</h3>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{unreadCount} New</span>
              </div>

              <div className="max-h-96 overflow-y-auto custom-scrollbar">
                {notifications.length === 0 ? (
                  <div className="p-12 text-center">
                    <Bell size={32} className="mx-auto text-slate-100 mb-4" />
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-loose">No Alerts Found</p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div 
                      key={n.id}
                      onClick={() => !n.is_read && markAsRead(n.id)}
                      className={`p-5 border-b border-slate-50 transition-all cursor-pointer hover:bg-slate-50 relative group ${!n.is_read ? 'bg-slate-50/50' : ''}`}
                    >
                      {!n.is_read && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-slate-900" />
                      )}
                      <div className="flex gap-4">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${!n.is_read ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-400'}`}>
                          {n.type === 'order_update' ? <Clock size={14} /> : <Bell size={14} />}
                        </div>
                        <div className="space-y-1">
                          <p className={`text-[11px] font-bold uppercase tracking-tight ${!n.is_read ? 'text-slate-900' : 'text-slate-400'}`}>{n.title}</p>
                          <p className="text-[10px] font-medium text-slate-400 leading-relaxed">{n.body}</p>
                          <p className="text-[8px] font-bold text-slate-200 uppercase mt-2">{new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                      </div>
                      {!n.is_read && (
                        <div className="absolute top-5 right-5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Check size={12} className="text-slate-400" />
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              {notifications.length > 0 && (
                <div className="p-4 bg-slate-50 text-center">
                   <button className="text-[9px] font-bold uppercase tracking-widest text-slate-900 hover:underline">View All Activity</button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
