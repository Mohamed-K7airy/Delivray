'use client';
import { useState } from 'react';
import { Power, PowerOff } from 'lucide-react';
import { apiClient } from '@/lib/apiClient';
import { toast } from 'sonner';

interface StoreToggleProps {
  storeId: string;
  initialStatus: boolean;
}

export default function StoreToggle({ storeId, initialStatus }: StoreToggleProps) {
  const [isOpen, setIsOpen] = useState(initialStatus);
  const [loading, setLoading] = useState(false);

  const toggleStatus = async () => {
    setLoading(true);
    try {
      const data = await apiClient(`/stores/${storeId}/toggle-status`, {
        method: 'PATCH',
        body: JSON.stringify({ is_open: !isOpen })
      });
      if (data) {
        setIsOpen(!isOpen);
        toast.success(isOpen ? 'Store is now CLOSED' : 'Store is now OPEN');
      }
    } catch (err) {
      toast.error('Failed to update store status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-between p-6 bg-[#f9f9f9] rounded-2xl border border-gray-100 mb-8">
      <div className="flex items-center space-x-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${isOpen ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
          {isOpen ? <Power size={24} /> : <PowerOff size={24} />}
        </div>
        <div>
          <h4 className="text-sm font-black uppercase tracking-tighter text-[#111111]">
            Store Status: <span className={isOpen ? 'text-green-600' : 'text-red-500'}>{isOpen ? 'OPEN' : 'CLOSED'}</span>
          </h4>
          <p className="text-[10px] font-medium text-[#888888] mt-0.5">
            {isOpen ? 'Customers can place orders.' : 'Store is hidden and orders are disabled.'}
          </p>
        </div>
      </div>
      
      <button
        onClick={toggleStatus}
        disabled={loading}
        className={`px-6 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all transform active:scale-95 shadow-sm ${
          isOpen 
            ? 'bg-red-500 text-white hover:bg-red-600' 
            : 'bg-green-500 text-white hover:bg-green-600'
        } disabled:opacity-50`}
      >
        {loading ? (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
        ) : (
          isOpen ? 'Close Store' : 'Open Store'
        )}
      </button>
    </div>
  );
}
