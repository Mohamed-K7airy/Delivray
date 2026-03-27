'use client';
import { useAuthStore } from '@/store/authStore';
import { motion } from 'framer-motion';
import { User, Car, Bell, Lock, Save } from 'lucide-react';

export default function DriverSettings() {
  const { user } = useAuthStore();

  return (
    <div className="space-y-6 pb-24 max-w-2xl">
      <div>
        <h1 className="text-3xl font-black text-[#111111] tracking-tighter">Settings</h1>
        <p className="text-[10px] font-bold text-[#888888] uppercase tracking-widest mt-0.5">Manage your driver profile</p>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-[#fef3f2] text-[#d97757] flex items-center justify-center text-xl font-black border border-[#fee2e2]">
            {user?.name?.charAt(0).toUpperCase() || 'D'}
          </div>
          <div>
            <p className="text-sm font-black text-[#111111]">{user?.name || 'Driver'}</p>
            <p className="text-[10px] text-[#888888] font-medium">{user?.email || 'driver@delivray.com'}</p>
            <span className="inline-block mt-1 px-2 py-0.5 bg-[#fef3f2] text-[#d97757] border border-[#fee2e2] rounded-full text-[8px] font-black uppercase tracking-widest">
              Elite Courier
            </span>
          </div>
        </div>

        <div className="space-y-4">
          {[
            { label: 'Full Name', value: user?.name || '', icon: <User size={14} /> },
            { label: 'Email', value: user?.email || '', icon: <User size={14} /> },
          ].map((field, i) => (
            <div key={i}>
              <label className="block text-[9px] font-black text-[#888888] uppercase tracking-widest mb-2 ml-1">{field.label}</label>
              <input defaultValue={field.value} readOnly
                className="w-full h-12 px-4 bg-[#f9f9f9] border border-gray-100 rounded-xl text-sm font-bold text-[#111111] outline-none focus:border-[#d97757] transition-all"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Vehicle Info */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl bg-[#eff6ff] text-blue-600 flex items-center justify-center">
            <Car size={16} />
          </div>
          <p className="text-sm font-black text-[#111111]">Vehicle Information</p>
        </div>
        <div className="space-y-4">
          {[
            { label: 'Vehicle Type', placeholder: 'e.g. Motorcycle, Car, Bicycle' },
            { label: 'Plate Number', placeholder: 'e.g. ABC-1234' },
          ].map((field, i) => (
            <div key={i}>
              <label className="block text-[9px] font-black text-[#888888] uppercase tracking-widest mb-2 ml-1">{field.label}</label>
              <input placeholder={field.placeholder}
                className="w-full h-12 px-4 bg-[#f9f9f9] border border-gray-100 rounded-xl text-sm font-bold text-[#111111] placeholder:text-gray-300 outline-none focus:border-[#d97757] transition-all"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl bg-[#f0fdf4] text-green-600 flex items-center justify-center">
            <Bell size={16} />
          </div>
          <p className="text-sm font-black text-[#111111]">Notifications</p>
        </div>
        <div className="space-y-4">
          {[
            { label: 'New order notifications', enabled: true },
            { label: 'Earnings updates', enabled: true },
            { label: 'System announcements', enabled: false },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#555555]">{item.label}</span>
              <div className={`w-10 h-5 rounded-full transition-all cursor-pointer ${item.enabled ? 'bg-[#d97757]' : 'bg-gray-200'}`}>
                <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-all m-0.5 ${item.enabled ? 'ml-5' : 'ml-0.5'}`} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <button className="w-full h-12 bg-[#d97757] text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-md hover:bg-[#c2654a] transition-all flex items-center justify-center gap-3">
        <Save size={16} /> Save Changes
      </button>
    </div>
  );
}
