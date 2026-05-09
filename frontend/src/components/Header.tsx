"use client";

import React, { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useUser } from "@/context/UserContext";
import { User, LifeBuoy, ChevronRight, Send, CheckCircle2, Loader2 } from 'lucide-react';
import Link from 'next/link';
import BottomSheet from './BottomSheet';

const Header = () => {
  const pathname = usePathname();
  const { user, setFooterVisible } = useUser();
  const [imageError, setImageError] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  
  // Mock Form States
  const [supportType, setSupportType] = useState<'request' | 'review'>('request');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSendSupport = () => {
    if (!message.trim()) return;
    
    setIsSending(true);
    // Imitate network delay
    setTimeout(() => {
      setIsSending(false);
      setIsSuccess(true);
      // Reset and close after success animation
      setTimeout(() => {
        setIsSupportOpen(false);
        setIsSuccess(false);
        setMessage('');
      }, 1500);
    }, 2000);
  };

  const getPageTitle = (path: string) => {
    switch (path) {
      case '/': return 'Home';
      case '/browse': return 'Browse';
      case '/my-games': return 'My Games';
      case '/host': return 'Host';
      case '/profile': return 'Profile';
      default: return 'VolleyballAlley';
    }
  };

  const initial = user?.first_name ? user.first_name.charAt(0).toUpperCase() : '';

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 z-50 shadow-sm">
      <h1 className="text-xl font-bold text-gray-900">{getPageTitle(pathname)}</h1>

      <div className="relative" ref={menuRef}>
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden border-2 border-white shadow-inner shrink-0 active:scale-90 transition-transform"
        >
          {user?.photo_url && !imageError ? (
            <img src={user.photo_url} alt="User" className="w-full h-full object-cover" onError={() => setImageError(true)} />
          ) : (
            <span className="text-blue-700 font-bold text-lg">{initial}</span>
          )}
        </button>

        {isMenuOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 animate-in fade-in zoom-in-95 duration-200">
            <div className="px-4 py-1 border-b border-gray-50 mb-1">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Account</p>
            </div>
            <Link href="/profile" className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-700 active:bg-blue-50 transition-colors" onClick={() => setIsMenuOpen(false)}>
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600"><User size={18} /></div>
              <span className="flex-1">Profile</span>
              <ChevronRight size={14} className="text-gray-300" />
            </Link>
            {/* Updated Support Trigger */}
            <button 
              onClick={() => { setIsSupportOpen(true); setIsMenuOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-700 active:bg-blue-50 transition-colors text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600"><LifeBuoy size={18} /></div>
              <span className="flex-1">Support</span>
              <ChevronRight size={14} className="text-gray-300" />
            </button>
          </div>
        )}
      </div>

      {/* Support Popup Form */}
      <BottomSheet 
        isOpen={isSupportOpen} 
        onClose={() => !isSending && setIsSupportOpen(false)} 
        title="Help & Feedback"
      >
        <div className="space-y-6 pb-10">
          {/* Type Selector */}
          <div className="flex p-1 bg-zinc-100 rounded-2xl">
            {(['request', 'review'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setSupportType(t)}
                className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all duration-200 ${
                  supportType === t ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400'
                }`}
              >
                {t === 'request' ? 'Bug / Request' : 'App Review'}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">
              Your Message
            </label>
            <textarea 
              rows={4}
              placeholder={supportType === 'request' ? "What's on your mind?" : "Tell us what you think..."}
              className="w-full bg-zinc-50 border-none rounded-3xl p-5 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onFocus={() => setFooterVisible?.(false)}
              onBlur={() => setFooterVisible?.(true)}
            />
          </div>

          <button 
            disabled={isSending || isSuccess || !message.trim()}
            onClick={handleSendSupport}
            className={`w-full py-4 rounded-2xl font-black text-base shadow-xl transition-all flex items-center justify-center gap-3 active:scale-95 ${
              isSuccess 
                ? 'bg-emerald-500 text-white shadow-emerald-100' 
                : 'bg-blue-600 text-white shadow-blue-100 disabled:opacity-50 disabled:shadow-none'
            }`}
          >
            {isSending ? (
              <>
                <Loader2 size={20} className="animate-spin" /> Sending...
              </>
            ) : isSuccess ? (
              <>
                <CheckCircle2 size={20} /> Sent Successfully!
              </>
            ) : (
              <>
                <Send size={18} /> Submit {supportType === 'request' ? 'Ticket' : 'Review'}
              </>
            )}
          </button>
          
          <p className="text-center text-[10px] text-gray-400 font-medium px-6 leading-relaxed">
            Our team will review your message and get back to you via Telegram DM if needed.
          </p>
        </div>
      </BottomSheet>
    </header>
  );
};

export default Header;