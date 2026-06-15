"use client";

import { useUser } from "@/context/UserContext";
import { Star, ShieldCheck, Copy, Check, Bell, Settings, Info, ChevronRight, Loader2, CreditCard, MessageSquarePlus, Send, CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";
import BottomSheet from "@/components/BottomSheet";
import { api } from "@/lib/api";

export default function ProfilePage() {
  const { user, rating, level, role, setRole, isLoading, setFooterVisible, refreshUser } = useUser();
  const [copied, setCopied] = useState(false);
  const [activeView, setActiveView] = useState<string | null>(null);
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);

  const [revolutTag, setRevolutTag] = useState("");
  const [notifications, setNotifications] = useState({
    newEvents: true,
    waitlist: true,
    reminders: true,
    marketing: false
  });

  useEffect(() => {
    if (user) {
      setRevolutTag(user.revolut_tag || "");
      setNotifications({
        newEvents: user.notif_new_events ?? true,
        waitlist: user.notif_waitlist ?? true,
        reminders: user.notif_reminders ?? true,
        marketing: user.notif_admin ?? false,
      });
    }
  }, [user]);

  const toggleSetting = async (key: keyof typeof notifications, backendKey: string) => {
    const newValue = !notifications[key];
    setNotifications(prev => ({ ...prev, [key]: newValue }));
    try {
      await api.updatePreferences({ [backendKey]: newValue });
      await refreshUser();
      if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
      }
    } catch (error) {
      setNotifications(prev => ({ ...prev, [key]: !newValue }));
    }
  };

  useEffect(() => {
    if (!user || revolutTag === user.revolut_tag) return;
    const timer = setTimeout(async () => {
      try {
        await api.updatePreferences({ revolut_tag: revolutTag });
        await refreshUser();
      } catch (error) {
        console.error("Failed to save Revolut tag:", error);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [revolutTag, user]);

  const [supportType, setSupportType] = useState<'request' | 'review'>('request');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleRoleChange = async (r: 'member' | 'organizer' | 'admin') => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg?.HapticFeedback) tg.HapticFeedback.impactOccurred('medium');
    try {
      setIsUpdatingRole(true);
      await setRole(r);
      if (tg?.HapticFeedback) tg.HapticFeedback.notificationOccurred('success');
    } catch (error) {
      if (tg?.HapticFeedback) tg.HapticFeedback.notificationOccurred('error');
      console.error("Role update failed:", error);
    } finally {
      setIsUpdatingRole(false);
    }
  };

  const handleSendSupport = () => {
    if (!message.trim()) return;
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setIsSuccess(true);
      setTimeout(() => {
        setActiveView(null);
        setIsSuccess(false);
        setMessage('');
      }, 1500);
    }, 2000);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-app-text-secondary">
        <Loader2 className="animate-spin mb-4 text-app-accent" size={32} />
        <p>Loading Profile...</p>
      </div>
    );
  }

  const initial = user?.first_name ? user.first_name.charAt(0).toUpperCase() : '';

  const menuItems = [
    { id: 'notifications', label: 'Notification Settings', icon: Bell, color: 'text-app-accent' },
    { id: 'preferences', label: 'App Preferences', icon: Settings, color: 'text-app-text-secondary' },
    { id: 'support', label: 'Support & Review', icon: MessageSquarePlus, color: 'text-app-warning' },
    { id: 'about', label: 'Credentials & About', icon: Info, color: 'text-app-success' },
  ];

  const ToggleRow = ({ label, description, active, onClick }: any) => (
    <div className="flex items-center justify-between py-4 group cursor-pointer" onClick={onClick}>
      <div className="flex-1 pr-4">
        <p className="text-[15px] font-bold text-app-text-primary leading-tight">{label}</p>
        <p className="text-xs text-app-text-secondary mt-1">{description}</p>
      </div>
      <div className={`w-11 h-6 rounded-full transition-colors duration-200 relative ${active ? 'bg-app-accent' : 'bg-app-active'}`}>
        <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 shadow-sm ${active ? 'translate-x-5' : 'translate-x-0'}`} />
      </div>
    </div>
  );

  return (
    <div className="py-3 space-y-6 animate-in fade-in duration-500 pb-24">
      {/* Identity Card */}
      <div className="bg-app-bg rounded-[32px] p-6 shadow-sm border border-app-active transition-colors">
        <div className="flex items-center justify-between mb-4">
          <div className="flex flex-col justify-center">
            <h2 className="text-2xl font-extrabold text-app-text-primary tracking-tight leading-tight">
              {user?.first_name || "Guest"} {user?.last_name || ""}
            </h2>
            {user?.username && (
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`@${user.username}`);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="flex items-center gap-1.5 text-app-accent font-semibold text-sm mt-1 bg-app-inset px-2.5 py-1 rounded-lg w-fit active:scale-95 transition-all"
              >
                @{user.username}
                {copied ? <Check size={14} /> : <Copy size={14} className="opacity-60" />}
              </button>
            )}
          </div>
          <div className="w-20 h-20 rounded-full bg-app-inset flex items-center justify-center border-4 border-app-bg shrink-0 overflow-hidden transition-colors">
            {user?.photo_url ? <img src={user.photo_url} className="w-full h-full object-cover" alt="Avatar" /> : <span className="text-app-accent font-bold text-3xl">{initial}</span>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-app-inset rounded-2xl p-4 border border-app-active text-center transition-colors">
            <div className="flex items-center justify-center text-app-accent mb-1">
              <ShieldCheck size={16} className="mr-1.5" />
              <span className="text-[10px] uppercase font-black opacity-50">Level</span>
            </div>
            <p className="font-bold text-app-text-primary">{level}</p>
          </div>
          <div className="bg-app-inset rounded-2xl p-4 border border-app-active text-center transition-colors">
            <div className="flex items-center justify-center text-app-warning mb-1">
              <Star size={16} className="mr-1.5 fill-current" />
              <span className="text-[10px] uppercase font-black opacity-50">Behavior</span>
            </div>
            <p className="font-bold text-app-text-primary">{rating} / 5.0</p>
          </div>
        </div>
      </div>

      {/* Main Menu List */}
      <div className="bg-app-bg rounded-[32px] overflow-hidden border border-app-active shadow-sm transition-colors">
        <div className="px-6 py-4 border-b border-app-active bg-app-inset text-[11px] font-black text-app-text-secondary uppercase tracking-widest transition-colors">
          Account Settings
        </div>
        <div className="divide-y divide-app-active">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className="w-full flex items-center gap-4 px-6 py-5 transition-all active:bg-app-inset group text-left"
            >
              <div className="p-2 rounded-xl bg-app-inset transition-colors">
                <item.icon size={20} className={item.color} />
              </div>
              <span className="flex-1 text-[15px] font-semibold text-app-text-primary">{item.label}</span>
              <ChevronRight size={18} className="text-app-text-secondary" />
            </button>
          ))}
        </div>
      </div>

      <BottomSheet
        isOpen={activeView !== null}
        onClose={() => !isSending && setActiveView(null)}
        title={menuItems.find(i => i.id === activeView)?.label || ""}
      >
        {activeView === 'notifications' && (
          <div className="space-y-1 divide-y divide-app-active pb-6">
            <ToggleRow label="New Games Alerts" description="Be the first to know when a new court is booked." active={notifications.newEvents} onClick={() => toggleSetting('newEvents', 'notif_new_events')} />
            <ToggleRow label="Waitlist Updates" description="Get a DM when you are promoted from the waitlist." active={notifications.waitlist} onClick={() => toggleSetting('waitlist', 'notif_waitlist')} />
            <ToggleRow label="Game Reminders" description="We will send a reminder 2 hours before the whistle." active={notifications.reminders} onClick={() => toggleSetting('reminders', 'notif_reminders')} />
            <ToggleRow label="Administrative" description="System updates and community announcements." active={notifications.marketing} onClick={() => toggleSetting('marketing', 'notif_admin')} />
          </div>
        )}

        {activeView === 'preferences' && (
          <div className="space-y-6 pb-6">
            {/*
            <div>
              <p className="text-[11px] font-black text-app-text-secondary uppercase tracking-widest mb-3 px-1">
                Role Management (Live Sync)
              </p>
              <div className={`flex p-1 bg-app-inset rounded-2xl transition-all duration-200 ${isUpdatingRole ? 'opacity-60' : 'opacity-100'}`}>
                {(['member', 'organizer', 'admin'] as const).map((r) => {
                  const isActive = role === r;
                  return (
                    <button
                      key={r}
                      disabled={isUpdatingRole || isActive}
                      onClick={() => handleRoleChange(r)}
                      className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 ${isActive
                          ? 'bg-app-bg text-app-accent shadow-sm'
                          : 'text-app-text-secondary hover:text-app-text-primary active:bg-app-active'
                        }`}
                    >
                      {isUpdatingRole && !isActive && <Loader2 size={12} className="animate-spin" />}
                      {r.charAt(0).toUpperCase() + r.slice(1)}
                    </button>
                  );
                })}
              </div>
            </div>
            */}

            <div className="pt-6 border-t border-app-active">
              <p className="text-[11px] font-black text-app-text-secondary uppercase tracking-widest mb-3 px-1">
                Payment Preferences
              </p>
              <div className="bg-app-inset p-4 rounded-2xl border border-app-active transition-colors">
                <label className="flex items-center text-sm font-bold text-app-text-primary mb-2">
                  <CreditCard size={16} className="mr-2 text-app-accent" /> Revolut Tag (Autofill)
                </label>
                <input
                  type="text"
                  placeholder="@yourtag"
                  value={revolutTag}
                  onChange={(e) => setRevolutTag(e.target.value)}
                  className="w-full bg-app-bg border border-app-active rounded-xl px-4 py-3 outline-none text-app-text-primary placeholder:text-app-text-secondary focus:border-app-accent focus:ring-2 focus:ring-app-accent/20 transition-all text-sm font-medium"
                />
              </div>
            </div>
          </div>
        )}

        {activeView === 'support' && (
          <div className="space-y-6 pb-10">
            <div className="flex p-1 bg-app-inset rounded-2xl transition-colors">
              {(['request', 'review'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setSupportType(t)}
                  className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all duration-200 ${
                    supportType === t 
                      ? 'bg-app-bg text-app-accent shadow-sm' 
                      : 'text-app-text-secondary'
                  }`}
                >
                  {t === 'request' ? 'Bug / Request' : 'App Review'}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              <label className="text-[11px] font-black text-app-text-secondary uppercase tracking-widest px-1">
                Your Message
              </label>
              <textarea 
                rows={4}
                placeholder={supportType === 'request' ? "What's on your mind?" : "Tell us what you think..."}
                className="w-full bg-app-inset text-app-text-primary placeholder:text-app-text-secondary border-none rounded-3xl p-5 text-sm font-medium focus:ring-2 focus:ring-app-accent outline-none transition-all resize-none"
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
                  ? 'bg-app-success text-white' 
                  : 'bg-app-accent text-white disabled:opacity-50'
              }`}
            >
              {isSending ? (
                <><Loader2 size={20} className="animate-spin" /> Sending...</>
              ) : isSuccess ? (
                <><CheckCircle2 size={20} /> Sent Successfully!</>
              ) : (
                <><Send size={18} /> Submit {supportType === 'request' ? 'Ticket' : 'Review'}</>
              )}
            </button>
          </div>
        )}

        {activeView === 'about' && (
          <div className="space-y-4 text-center pb-6">
            <div className="text-5xl mb-4 drop-shadow-sm">🏐</div>
            <h4 className="font-black text-2xl text-app-text-primary">VolleyballAlley</h4>
            <p className="text-sm text-app-text-secondary px-4 leading-relaxed font-medium">
              Crafted for players by players. Our goal is to simplify match organization so you can focus on the game.
            </p>
            <div className="text-[10px] text-app-text-secondary uppercase font-black tracking-widest pt-4">
              Version 1.0.0-beta
            </div>
          </div>
        )}
      </BottomSheet>
    </div>
  );
}