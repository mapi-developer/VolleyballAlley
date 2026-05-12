"use client";

import React, { useState, useEffect } from 'react';
import { 
  Pencil, Calendar, MapPin, Clock, Banknote, Shield, 
  UserMinus, Trash2, AlertTriangle, Search, Loader2, 
  ArrowUpCircle, ArrowDownCircle, AlignLeft, Link as LinkIcon, Users
} from 'lucide-react';
import BottomSheet from '@/components/BottomSheet';
import { api } from '@/lib/api';

interface EditEventSheetProps {
  isOpen: boolean;
  onClose: () => void;
  event: any;
  onUpdate: (updatedEvent: any) => void;
  onDelete: (eventId: string) => void;
}

// Helper micro-component for standardizing the spec labels
const FieldLabel = ({ icon: Icon, text }: { icon: any, text: string }) => (
  <div className="flex items-center gap-1.5 text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1.5 px-1">
    <Icon size={14} /> {text}
  </div>
);

export default function EditEventSheet({ isOpen, onClose, event, onUpdate, onDelete }: EditEventSheetProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [localEvent, setLocalEvent] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (isOpen && event) {
      // Map existing event data. Fallbacks applied if some fields aren't in your DB yet.
      setLocalEvent({ 
        ...event, 
        waitlist: event.waitlist || [],
        description: event.description || "",
        level: event.level || "All",
        endTime: event.endTime || event.time, // Fallback to start time if no end time
        revolutTag: event.revolutTag || ""
      });
    }
  }, [isOpen, event]);

  const todayStr = new Date().toLocaleDateString('en-CA');

  if (!localEvent) return null;

  const isLocked = (dateString: string) => {
    if (!dateString) return false;
    return (new Date(dateString).getTime() - Date.now()) < (6 * 60 * 60 * 1000);
  };

  const handleManualAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLocalEvent({
      ...localEvent,
      attendees: [
        ...localEvent.attendees,
        { 
          user_id: `manual-${Date.now()}`,
          name: searchQuery, 
          user: { first_name: searchQuery }, 
          role: 'member' 
        }
      ]
    });
    setSearchQuery("");
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
    }
  };

  const handlePromote = (id: string) => {
    const player = localEvent.waitlist.find((p: any) => p.user_id === id);
    if (player) {
      setLocalEvent({
        ...localEvent,
        waitlist: localEvent.waitlist.filter((p: any) => p.user_id !== id),
        attendees: [...localEvent.attendees, player]
      });
      if (window.Telegram?.WebApp?.HapticFeedback) window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
    }
  };

  const handleDemote = (id: string) => {
    const player = localEvent.attendees.find((p: any) => p.user_id === id);
    if (player) {
      setLocalEvent({
        ...localEvent,
        attendees: localEvent.attendees.filter((p: any) => p.user_id !== id),
        waitlist: [...localEvent.waitlist, player]
      });
      if (window.Telegram?.WebApp?.HapticFeedback) window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
    }
  };

  const handleRemove = (id: string, listType: 'main' | 'waitlist') => {
    if (listType === 'main') {
      setLocalEvent({ ...localEvent, attendees: localEvent.attendees.filter((u: any) => u.user_id !== id) });
    } else {
      setLocalEvent({ ...localEvent, waitlist: localEvent.waitlist.filter((u: any) => u.user_id !== id) });
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const payload = {
        title: localEvent.title,
        description: localEvent.description,
        location_name: localEvent.location,
        start_time: localEvent.rawDate, // Combine date and time on backend if needed
        price: parseInt(localEvent.price) || 0,
        max_players: parseInt(localEvent.slots),
        level_required: localEvent.level,
        revolut_tag: localEvent.revolutTag,
      };
      const updatedBackendEvent = await api.updateEvent(localEvent.id, payload);
      if (window.Telegram?.WebApp?.HapticFeedback) window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
      
      onUpdate(updatedBackendEvent);
      onClose();
    } catch (error) {
      console.error("Failed to update:", error);
      alert("Failed to save changes.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await api.deleteEvent(localEvent.id);
      if (window.Telegram?.WebApp?.HapticFeedback) window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
      
      onDelete(localEvent.id);
      onClose();
    } catch (error) {
      console.error("Failed to delete:", error);
      alert("Failed to delete event.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={() => { onClose(); setShowDeleteConfirm(false); }} title="Manage Event">
      <div className="space-y-6 pb-10 mt-2">
        
        {/* EVENT TITLE & LEVEL */}
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2">
            <FieldLabel icon={Pencil} text="Event Title" />
            <input type="text" className="w-full bg-zinc-50 border border-gray-100 rounded-2xl p-3.5 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/20"
              value={localEvent.title} onChange={e => setLocalEvent({ ...localEvent, title: e.target.value })} />
          </div>
          <div className="col-span-1">
            <FieldLabel icon={Shield} text="Level" />
            <select 
              className="w-full bg-zinc-50 border border-gray-100 rounded-2xl p-3.5 text-sm font-bold outline-none appearance-none focus:ring-2 focus:ring-blue-500/20"
              value={localEvent.level} onChange={e => setLocalEvent({ ...localEvent, level: e.target.value })}
            >
              <option value="All">All</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
        </div>

        {/* DESCRIPTION */}
        <div>
          <FieldLabel icon={AlignLeft} text="Description" />
          <textarea 
            rows={3}
            placeholder="Add any extra details (optional)..."
            className="w-full bg-zinc-50 border border-gray-100 rounded-2xl p-3.5 text-sm font-medium outline-none resize-none focus:ring-2 focus:ring-blue-500/20"
            value={localEvent.description} onChange={e => setLocalEvent({ ...localEvent, description: e.target.value })} 
          />
        </div>

        {/* DATE & MAX PLAYERS */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <FieldLabel icon={Calendar} text="Date" />
            <input type="date" min={todayStr} disabled={isLocked(localEvent.rawDate)}
              className="w-full bg-zinc-50 border border-gray-100 rounded-2xl p-3.5 text-sm font-bold disabled:opacity-60 outline-none"
              value={localEvent.rawDate.split('T')[0]}
              onChange={e => {
                const selectedDate = e.target.value;
                if (selectedDate < todayStr) return;
                const newRaw = `${selectedDate}T${localEvent.rawDate.split('T')[1] || "18:00:00"}`;
                setLocalEvent({ ...localEvent, rawDate: newRaw });
              }}
            />
          </div>
          <div>
            <FieldLabel icon={Users} text="Max Players" />
            <input type="number" min="2" max="50"
              className="w-full bg-zinc-50 border border-gray-100 rounded-2xl p-3.5 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/20"
              value={localEvent.slots} onChange={e => setLocalEvent({ ...localEvent, slots: e.target.value })} 
            />
          </div>
        </div>

        {/* TIME SLOT */}
        <div>
          <FieldLabel icon={Clock} text="Time Slot" />
          <div className="flex items-center gap-3">
             <input type="time" className="flex-1 bg-zinc-50 border border-gray-100 rounded-2xl p-3.5 text-sm font-bold outline-none"
                value={localEvent.time} onChange={e => setLocalEvent({ ...localEvent, time: e.target.value })} />
             <span className="text-sm font-bold text-gray-400">to</span>
             <input type="time" className="flex-1 bg-zinc-50 border border-gray-100 rounded-2xl p-3.5 text-sm font-bold outline-none"
                value={localEvent.endTime} onChange={e => setLocalEvent({ ...localEvent, endTime: e.target.value })} />
          </div>
        </div>

        {/* LOCATION */}
        <div>
          <FieldLabel icon={MapPin} text="Location & Map Link" />
          <input type="text" disabled={isLocked(localEvent.rawDate)} className="w-full bg-zinc-50 border border-gray-100 rounded-2xl p-3.5 text-sm font-bold outline-none disabled:opacity-60" 
            value={localEvent.location} onChange={e => setLocalEvent({ ...localEvent, location: e.target.value })} />
        </div>

        {/* FEE & REVOLUT */}
        <div className="grid grid-cols-2 gap-3">
          <div>
             <FieldLabel icon={Banknote} text="Event Fee" />
             <input type="number" min="0" placeholder="0 (Free)" className="w-full bg-zinc-50 border border-gray-100 rounded-2xl p-3.5 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/20"
                value={localEvent.price} onChange={e => setLocalEvent({ ...localEvent, price: e.target.value })} />
          </div>
          <div>
             <FieldLabel icon={LinkIcon} text="Revolut Tag" />
             <input type="text" placeholder="@tag" className="w-full bg-zinc-50 border border-gray-100 rounded-2xl p-3.5 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/20"
                value={localEvent.revolutTag} onChange={e => setLocalEvent({ ...localEvent, revolutTag: e.target.value })} />
          </div>
        </div>

        <hr className="border-gray-100" />

        {/* ATTENDEES MANAGER */}
        <div className="space-y-4">
          <div>
            <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1 mb-2">
              Attendees ({localEvent.attendees.length} / {localEvent.slots})
            </h4>
            <div className="bg-zinc-50 border border-gray-100 rounded-3xl divide-y divide-gray-100 overflow-hidden">
              {localEvent.attendees.map((a: any) => {
                const isHost = a.user_id === localEvent.host_id;
                return (
                  <div key={a.user_id} className="flex items-center justify-between p-3.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-gray-800">
                        {a.user?.first_name || a.name} {isHost ? "(Host)" : ""}
                      </span>
                      {isHost && <Shield size={14} className="text-blue-500" />}
                    </div>
                    {!isHost && (
                      <div className="flex gap-2">
                        {/* Demote to Waitlist button */}
                        <button onClick={() => handleDemote(a.user_id)} className="p-2 text-amber-500 bg-white border border-gray-100 rounded-xl shadow-sm active:scale-90 transition-transform">
                          <ArrowDownCircle size={16} />
                        </button>
                        <button onClick={() => handleRemove(a.user_id, 'main')} className="p-2 text-rose-500 bg-white border border-gray-100 rounded-xl shadow-sm active:scale-90 transition-transform">
                          <UserMinus size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* WAITLIST */}
          {localEvent.waitlist && localEvent.waitlist.length > 0 && (
            <div>
              <h4 className="text-[11px] font-black text-amber-500 uppercase tracking-widest px-1 mb-2 flex justify-between">
                Waitlist <span>{localEvent.waitlist.length} waiting</span>
              </h4>
              <div className="bg-amber-50 border border-amber-100/50 rounded-3xl divide-y divide-amber-100/50 overflow-hidden">
                {localEvent.waitlist.map((a: any) => (
                  <div key={a.user_id} className="flex items-center justify-between p-3.5">
                    <span className="text-sm font-bold text-amber-900">
                      {a.user?.first_name || a.name}
                    </span>
                    <div className="flex gap-2">
                      <button onClick={() => handlePromote(a.user_id)} className="p-2 text-emerald-600 bg-white rounded-xl shadow-sm active:scale-90 transition-transform">
                        <ArrowUpCircle size={16} />
                      </button>
                      <button onClick={() => handleRemove(a.user_id, 'waitlist')} className="p-2 text-rose-500 bg-white rounded-xl shadow-sm active:scale-90 transition-transform">
                        <UserMinus size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleManualAddUser} className="flex gap-2 pt-2">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Add player manually..." className="w-full bg-zinc-50 border border-gray-100 rounded-2xl py-3.5 pl-10 pr-4 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/20" 
                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <button type="submit" className="bg-zinc-900 text-white px-5 rounded-2xl text-xs font-bold active:scale-95 transition-transform">Add</button>
          </form>
        </div>

        {/* ACTIONS */}
        <div className="pt-4 space-y-3">
          {!showDeleteConfirm && (
            <button onClick={handleSave} disabled={isSaving} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black shadow-lg shadow-blue-200 active:scale-95 transition-all flex justify-center items-center gap-2">
              {isSaving ? <Loader2 className="animate-spin" size={20} /> : "Save Changes"}
            </button>
          )}

          {!showDeleteConfirm ? (
            <button onClick={() => setShowDeleteConfirm(true)} className="w-full flex items-center justify-center gap-2 text-rose-500 font-bold text-sm py-4 bg-rose-50 rounded-2xl active:scale-95 transition-transform">
              <Trash2 size={18} /> Cancel & Delete Event
            </button>
          ) : (
            <div className="bg-rose-500 rounded-3xl p-6 text-white space-y-4 animate-in zoom-in-95 duration-200 shadow-xl shadow-rose-200">
              <div className="flex items-center gap-3 font-black uppercase text-[11px] tracking-widest"><AlertTriangle size={18} /> Confirm Deletion</div>
              <p className="text-sm font-medium">This action cannot be undone. All players will be removed and notified.</p>
              <div className="flex gap-3 pt-2">
                <button onClick={handleDelete} disabled={isDeleting} className="flex-1 bg-white text-rose-600 py-3.5 rounded-xl font-black text-xs active:scale-95 flex justify-center transition-transform">
                  {isDeleting ? <Loader2 className="animate-spin" size={16} /> : "YES, DELETE"}
                </button>
                <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 bg-rose-700 text-white py-3.5 rounded-xl font-black text-xs active:scale-95 transition-transform">
                  NO, KEEP IT
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </BottomSheet>
  );
}