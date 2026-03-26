'use client';
import { LifeBuoy } from 'lucide-react';

const Card = ({ icon: Icon, title, description }: { icon: any, title: string, description: string }) => (
  <div className="max-w-4xl mx-auto py-20 lg:py-32 text-center space-y-12">
    <div className="w-32 h-32 lg:w-48 lg:h-48 bg-white rounded-3xl border border-gray-100 flex items-center justify-center mx-auto group shadow-sm transition-all hover:bg-[#f9f9f9] duration-700">
       <Icon size={80} className="text-gray-200 group-hover:text-[#d97757] group-hover:scale-110 transition-all duration-700" />
    </div>
    <div className="space-y-6">
       <h1 className="text-4xl lg:text-7xl font-black tracking-tighter uppercase italic text-[#111111]">{title}</h1>
       <p className="text-[#888888] text-base lg:text-xl font-bold max-w-lg mx-auto leading-relaxed border-t border-gray-50 pt-8 uppercase tracking-widest leading-loose">{description}</p>
    </div>
  </div>
);

export default function SupportPage() {
  return <Card icon={LifeBuoy} title="Support Center" description="Need help? Driver Hub support is available 24/7 to resolve disputes, vehicle issues, or account questions." />;
}
