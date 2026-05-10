"use client";

import React, { useState, useEffect } from 'react';
import { Pencil, Calendar, MapPin, Clock, Banknote, Shield, UserMinus, UserPlus, Trash2, AlertTriangle, Search, Loader2 } from 'lucide-react';
import BottomSheet from '@/components/BottomSheet';
import { FormField } from '@/components/FormField';
import { api } from '@/lib/api';

interface EditEventSheetProps {
  isOpen: boolean;
  onClose: () => void;
  event: any;
  onUpdate: (updatedEvent: any) => void;
  onDelete: (eventId: string) => void;
}

export default function EditEventSheet({ isOpen, onClose, event, onUpdate, onDelete }: EditEventSheetProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Local state to prevent spamming the parent/API on every keystroke
  const [localEvent, setLocalEvent] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (isOpen && event) setLocalEvent(event);
  }, [isOpen, event]);

  const todayStr = new Date().toLocaleDateString('en-CA').split('T')[0];

  if (!localEvent) return null;

  const isLocked = (dateString: string) => {
    if (!dateString) return false;
    return (new Date(dateString).getTime() - Date.now()) < (6 * 60 * 60 * 1000);
  };

  const handleTimeChange = (type: 'start' | 'end', val: string) => {
    const [start = "", end = ""] = localEvent.time.split(' - ');
    setLocalEvent({
      ...localEvent,
      time: type === 'start' ? `${val} - ${end}` : `${start} - ${val}`
    });
  };

  // The new Save Function
  const handleSave = async () => {
    try {
      setIsSaving(true);

      const payload = {
        title: localEvent.title,
        location_name: localEvent.location,
        start_time: localEvent.rawDate, // Ensure this is merged with the updated time if necessary
        price: parseInt(localEvent.price),
        max_players: parseInt(localEvent.slots)
      };

      const updatedBackendEvent = await api.updateEvent(localEvent.id, payload);

      if (window.Telegram?.WebApp?.HapticFeedback) window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');

      onUpdate(updatedBackendEvent); // Send mapped backend data back to HostPage
      onClose();
    } catch (error) {
      console.error("Failed to update:", error);
      alert("Failed to save changes.");
    } finally {
      setIsSaving(false);
    }
  };

  // The new Delete Function
  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await api.deleteEvent(localEvent.id);

      if (window.Telegram?.WebApp?.HapticFeedback) window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');

      onDelete(localEvent.id);
      onClose();
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error("Failed to delete:", error);
      alert("Failed to delete event.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={() => { onClose(); setShowDeleteConfirm(false); }} title="Manage Event">
      <div className="space-y-8 pb-10">
        <div className="space-y-6">
          <FormField label="Title" icon={Pencil}>
            <input type="text" className="w-full bg-zinc-50 border-none rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500"
              value={localEvent.title} onChange={e => setLocalEvent({ ...localEvent, title: e.target.value })} />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Date" icon={Calendar} disabled={isLocked(localEvent.rawDate)}>
              <input type="date" min={todayStr} disabled={isLocked(localEvent.rawDate)}
                className="w-full bg-zinc-50 border-none rounded-2xl p-4 text-sm font-bold disabled:text-gray-400 outline-none focus:ring-2 focus:ring-blue-500"
                value={localEvent.rawDate.split('T')[0]}
                onChange={e => {
                  const selectedDate = e.target.value;
                  if (selectedDate < todayStr) {
                    alert("You cannot move an event to a past date.");
                    return;
                  }
                  const newRaw = `${selectedDate}T${localEvent.rawDate.split('T')[1]}`;
                  setLocalEvent({ ...localEvent, rawDate: newRaw });
                }}
              />
            </FormField>
            <FormField label="Location" icon={MapPin} disabled={isLocked(localEvent.rawDate)}>
              <input type="text" disabled={isLocked(localEvent.rawDate)} className="w-full bg-zinc-50 border-none rounded-2xl p-4 text-sm font-bold disabled:text-gray-400 outline-none" value={localEvent.location} onChange={e => setLocalEvent({ ...localEvent, location: e.target.value })} />
            </FormField>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <FormField label="Court Fee (HUF)" icon={Banknote}>
              <input type="number" className="w-full bg-zinc-50 border-none rounded-2xl p-4 text-sm font-bold outline-none" value={localEvent.price} onChange={e => setLocalEvent({ ...localEvent, price: e.target.value })} />
            </FormField>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">Attendees ({event.attendees.length} / {event.slots})</h4>
          <div className="bg-zinc-50 rounded-3xl divide-y divide-white/50 overflow-hidden">
            {localEvent.attendees.map((a: any) => {
              // Check if this attendee ID matches the host_id of the event
              const isHost = a.user_id === localEvent.host_id;

              return (
                <div key={a.id} className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-700">
                      {a.user?.first_name || a.name} {isHost ? "(Host)" : ""}
                    </span>
                    {isHost && <Shield size={12} className="text-blue-500" />}
                  </div>

                  {/* Only show the remove button if the user is NOT the host */}
                  {!isHost && (
                    <button
                      onClick={() => {/* remove logic */ }}
                      className="p-2 text-rose-500 bg-white rounded-xl shadow-sm active:scale-90"
                    >
                      <UserMinus size={16} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
          <form onSubmit={handleManualAddUser} className="flex gap-2 pt-2">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Add player by name or @tag..." className="w-full bg-zinc-50 border-none rounded-2xl py-3 pl-9 pr-3 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <button type="submit" className="bg-zinc-900 text-white px-5 rounded-2xl text-xs font-bold active:scale-95">Add</button>
          </form>
        </div>

        {event.waitlist.length > 0 && (
          <div className="space-y-4">
            <h4 className="text-[11px] font-black text-amber-500 uppercase tracking-widest px-1 flex items-center gap-2"><Clock size={12} /> Waitlist ({event.waitlist.length})</h4>
            <div className="bg-amber-50 rounded-3xl divide-y divide-white/50 overflow-hidden border border-amber-100">
              {event.waitlist.map((w: any) => (
                <div key={w.id} className="flex items-center justify-between p-4">
                  <span className="text-sm font-bold text-amber-900">{w.name}</span>
                  <button onClick={() => onUpdate({ ...event, waitlist: event.waitlist.filter((u: any) => u.id !== w.id), attendees: [...event.attendees, { ...w, role: 'Player' }] })} className="p-2 text-emerald-600 bg-white rounded-xl shadow-sm active:scale-90"><UserPlus size={16} /></button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="pt-6 border-t border-gray-100 space-y-3">

          {/* NEW: Save Button */}
          {!showDeleteConfirm && (
            <button onClick={handleSave} disabled={isSaving} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-base shadow-lg shadow-blue-100 active:scale-95 transition-all flex justify-center items-center gap-2">
              {isSaving ? <Loader2 className="animate-spin" size={20} /> : "Save Changes"}
            </button>
          )}

          {!showDeleteConfirm ? (
            <button onClick={() => setShowDeleteConfirm(true)} className="w-full flex items-center justify-center gap-2 text-rose-500 font-bold text-sm py-4 bg-rose-50 rounded-2xl active:scale-95">
              <Trash2 size={18} /> Cancel & Delete Event
            </button>
          ) : (
            <div className="bg-rose-500 rounded-3xl p-6 text-white space-y-4 animate-in zoom-in-95 duration-200">
              <div className="flex items-center gap-3 font-black uppercase text-[11px] tracking-widest"><AlertTriangle size={18} /> Confirm Deletion</div>
              <p className="text-sm font-medium leading-relaxed">This action cannot be undone. All players will be notified.</p>
              <div className="flex gap-3 pt-2">
                <button onClick={handleDelete} disabled={isDeleting} className="flex-1 bg-white text-rose-600 py-3 rounded-xl font-black text-xs active:scale-95 flex justify-center">
                  {isDeleting ? <Loader2 className="animate-spin" size={16} /> : "YES, DELETE"}
                </button>
                <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 bg-rose-600 text-white py-3 rounded-xl font-black text-xs active:scale-95">NO, KEEP IT</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </BottomSheet>
  );
}