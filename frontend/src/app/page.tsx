"use client";

import { useUser } from "@/context/UserContext";
import { 
  Star, 
  ShieldCheck, 
  Copy, 
  Check, 
  Bell, 
  Settings, 
  Info, 
  ChevronRight 
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";

export default function ProfilePage() {
  const { user, rating, level } = useUser();
  const [copied, setCopied] = useState(false);
  
  const initial = user?.first_name ? user.first_name.charAt(0).toUpperCase() : 'V';

  const handleCopyTag = () => {
    if (user?.username) {
      navigator.clipboard.writeText(`@${user.username}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Define the menu items based on your specs
  const menuItems = [
    { 
      label: 'Notification Settings', 
      icon: Bell, 
      href: '/profile/notifications',
      color: 'text-blue-500' 
    },
    { 
      label: 'App Preferences', 
      icon: Settings, 
      href: '/profile/preferences',
      color: 'text-gray-500' 
    },
    { 
      label: 'Credentials & About', 
      icon: Info, 
      href: '/profile/about',
      color: 'text-emerald-500' 
    },
  ];

  return (
    <div className="py-3 space-y-6">
      {/* Identity Card (Kept from previous step) */}
      <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex flex-col justify-center">
            <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight leading-tight">
              {user?.first_name || "Guest"} {user?.last_name || ""}
            </h2>
            {user?.username && (
              <button 
                onClick={handleCopyTag}
                className="flex items-center gap-1.5 text-blue-600 font-semibold text-sm mt-1 bg-blue-50/50 px-2.5 py-1 rounded-lg w-fit transition-all active:scale-95"
              >
                @{user.username}
                {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} className="opacity-60" />}
              </button>
            )}
          </div>

          <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center overflow-hidden border-4 border-zinc-50 shadow-inner shrink-0">
            {user?.photo_url ? (
              <img src={user.photo_url} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="text-blue-600 font-bold text-3xl">{initial}</span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-zinc-50 rounded-2xl p-4 border border-gray-100/50">
            <div className="flex items-center text-blue-600 mb-1">
              <ShieldCheck size={16} className="mr-1.5" />
              <span className="text-[10px] uppercase tracking-[0.1em] font-black opacity-50">Level</span>
            </div>
            <p className="text-gray-900 font-bold text-base">{level}</p>
          </div>

          <div className="bg-zinc-50 rounded-2xl p-4 border border-gray-100/50">
            <div className="flex items-center text-amber-500 mb-1">
              <Star size={16} className="mr-1.5 fill-amber-500" />
              <span className="text-[10px] uppercase tracking-[0.1em] font-black opacity-50">Behavior</span>
            </div>
            <p className="text-gray-900 font-bold text-base">{rating} / 5.0</p>
          </div>
        </div>

        <div className="mt-4 text-center">
          <p className="text-[11px] text-gray-400 font-medium leading-relaxed mx-auto">
            Rating is updated automatically based on attendance.
          </p>
        </div>
      </div>

      {/* NEW: Interactive Navigation List */}
      <div className="bg-white rounded-[32px] overflow-hidden border border-gray-100 shadow-sm">
        {/* Section Header */}
        <div className="px-6 py-4 border-b border-gray-50 bg-zinc-50/50">
          <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">
            Account Preferences
          </span>
        </div>

        {/* List Items */}
        <div className="divide-y divide-gray-50">
          {menuItems.map((item) => (
            <Link 
              key={item.label} 
              href={item.href}
              className="flex items-center gap-4 px-6 py-5 transition-all active:bg-zinc-50 hover:bg-zinc-50/50 group"
            >
              <div className={`p-2 rounded-xl bg-zinc-50 group-active:bg-white transition-colors`}>
                <item.icon size={20} className={item.color} />
              </div>
              
              <span className="flex-1 text-[15px] font-semibold text-gray-700">
                {item.label}
              </span>

              <ChevronRight size={18} className="text-gray-300 group-hover:text-gray-400 transition-colors" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}