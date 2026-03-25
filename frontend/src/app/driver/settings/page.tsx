'use client';
import { Settings as SettingsIcon, LifeBuoy } from 'lucide-react';

const Card = ({ icon: Icon, title, description }: { icon: any, title: string, description: string }) => (
  <div className="max-w-4xl mx-auto py-20 text-center space-y-12">
    <div className="w-48 h-48 bg-white/5 rounded-[4rem] border border-white/5 flex items-center justify-center mx-auto group shadow-2xl transition-all hover:border-[#ff8564]/30 duration-700">
       <Icon size={80} className="text-gray-700 group-hover:text-[#ff8564] group-hover:scale-110 transition-all duration-700" />
    </div>
    <div className="space-y-4">
       <h1 className="text-6xl font-black tracking-tighter uppercase italic">{title}</h1>
       <p className="text-gray-500 text-xl font-bold max-w-lg mx-auto leading-relaxed">{description}</p>
    </div>
  </div>
);

export default function SettingsPage() {
  return <Card icon={SettingsIcon} title="Driver Settings" description="Customize your vehicle profile, payment methods, and notification preferences for a tailored logistics experience." />;
}
