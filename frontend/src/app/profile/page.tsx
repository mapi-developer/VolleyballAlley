"use client";

import { useUser } from "@/context/UserContext";
import { 
  Star, ShieldCheck, Copy, Check, Bell, 
  Settings, Info, ChevronRight 
} from "lucide-react";
import { useState } from "react";
import BottomSheet from "@/components/BottomSheet";

export default function ProfilePage() {
  const { user, rating, level } = useUser();
  const [copied, setCopied] = useState(false);
  const [activeView, setActiveView] = useState<string | null>(null);

  // 1. Notification State - Hardcoded for now
  const [notifications, setNotifications] = useState({
    newEvents: true,
    waitlist: true,
    reminders: true,
    marketing: false
  });

  const toggleSetting = (key: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const initial = user?.first_name ? user.first_name.charAt(0).toUpperCase() : 'V';

  const menuItems = [
    { id: 'notifications', label: 'Notification Settings', icon: Bell, color: 'text-blue-500' },
    { id: 'preferences', label: 'App Preferences', icon: Settings, color: 'text-gray-500' },
    { id: 'about', label: 'Credentials & About', icon: Info, color: 'text-emerald-500' },
  ];

  // Helper Toggle Component for the list
  const ToggleRow = ({ label, description, active, onClick }: any) => (
    <div className="flex items-center justify-between py-4 group cursor-pointer" onClick={onClick}>
      <div className="flex-1 pr-4">
        <p className="text-[15px] font-bold text-gray-800 leading-tight">{label}</p>
        <p className="text-xs text-gray-400 mt-1">{description}</p>
      </div>
      <div className={`w-11 h-6 rounded-full transition-colors duration-200 relative ${active ? 'bg-blue-600' : 'bg-gray-200'}`}>
        <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 shadow-sm ${active ? 'translate-x-5' : 'translate-x-0'}`} />
      </div>
    </div>
  );

  return (
    <div className="py-3 space-y-6">
      {/* Identity Card */}
      <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex flex-col justify-center">
            <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight leading-tight">
              {user?.first_name || "Guest"} {user?.last_name || ""}
            </h2>
            {user?.username && (
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(`@${user.username}`);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="flex items-center gap-1.5 text-blue-600 font-semibold text-sm mt-1 bg-blue-50/50 px-2.5 py-1 rounded-lg w-fit active:scale-95"
              >
                @{user.username}
                {copied ? <Check size={14} /> : <Copy size={14} className="opacity-60" />}
              </button>
            )}
          </div>
          <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center border-4 border-zinc-50 shrink-0 overflow-hidden">
            {user?.photo_url ? <img src={user.photo_url} className="w-full h-full object-cover" /> : <span className="text-blue-600 font-bold text-3xl">{initial}</span>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-zinc-50 rounded-2xl p-4 border border-gray-100/50 text-center">
            <div className="flex items-center justify-center text-blue-600 mb-1">
              <ShieldCheck size={16} className="mr-1.5" />
              <span className="text-[10px] uppercase font-black opacity-50">Level</span>
            </div>
            <p className="font-bold">{level}</p>
          </div>
          <div className="bg-zinc-50 rounded-2xl p-4 border border-gray-100/50 text-center">
            <div className="flex items-center justify-center text-amber-500 mb-1">
              <Star size={16} className="mr-1.5 fill-amber-500" />
              <span className="text-[10px] uppercase font-black opacity-50">Behavior</span>
            </div>
            <p className="font-bold">{rating} / 5.0</p>
          </div>
        </div>
      </div>

      {/* Main Menu List */}
      <div className="bg-white rounded-[32px] overflow-hidden border border-gray-100 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-50 bg-zinc-50/50 text-[11px] font-black text-gray-400 uppercase tracking-widest">
          Account Preferences
        </div>
        <div className="divide-y divide-gray-50">
          {menuItems.map((item) => (
            <button 
              key={item.id} 
              onClick={() => setActiveView(item.id)}
              className="w-full flex items-center gap-4 px-6 py-5 transition-all active:bg-zinc-50 group text-left"
            >
              <div className="p-2 rounded-xl bg-zinc-50 group-active:bg-white transition-colors"><item.icon size={20} className={item.color} /></div>
              <span className="flex-1 text-[15px] font-semibold text-gray-700">{item.label}</span>
              <ChevronRight size={18} className="text-gray-300" />
            </button>
          ))}
        </div>
      </div>

      {/* Popups Content */}
      <BottomSheet 
        isOpen={activeView !== null} 
        onClose={() => setActiveView(null)}
        title={menuItems.find(i => i.id === activeView)?.label || ""}
      >
        {activeView === 'notifications' && (
          <div className="space-y-1 divide-y divide-gray-50">
            <ToggleRow 
              label="New Games Alerts" 
              description="Be the first to know when a new court is booked." 
              active={notifications.newEvents}
              onClick={() => toggleSetting('newEvents')}
            />
            <ToggleRow 
              label="Waitlist Updates" 
              description="Get a DM when you are promoted from the waitlist." 
              active={notifications.waitlist}
              onClick={() => toggleSetting('waitlist')}
            />
            <ToggleRow 
              label="Game Reminders" 
              description="We will send a reminder 2 hours before the whistle." 
              active={notifications.reminders}
              onClick={() => toggleSetting('reminders')}
            />
            <ToggleRow 
              label="Administrative" 
              description="System updates and community announcements." 
              active={notifications.marketing}
              onClick={() => toggleSetting('marketing')}
            />
          </div>
        )}
        
        {/* Placeholder for other views */}
        {activeView === 'preferences' && <div className="text-center py-10 text-gray-400 italic">Theme and UI settings coming soon</div>}
        {activeView === 'about' && (
          <div className="space-y-4 text-center">
            <div className="text-5xl mb-4">🏐</div>
            <h4 className="font-bold text-xl">VolleyballAlley</h4>
            <p className="text-sm text-gray-500 px-4 leading-relaxed">
              Crafted for players by players. Our goal is to simplify match organization so you can focus on the game.
            </p>
            <div className="text-[10px] text-gray-300 uppercase tracking-widest pt-4">Version 1.0.0-beta</div>
          </div>
        )}
      </BottomSheet>
    </div>
  );
}