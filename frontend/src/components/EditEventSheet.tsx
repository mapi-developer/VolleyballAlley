"use client";

import React, { useState, useEffect } from 'react';
import {
  Pencil, Calendar, MapPin, Clock, Banknote, Shield,
  UserMinus, UserPlus, Trash2, AlertTriangle, Search, Save, Loader2
} from 'lucide-react';
import BottomSheet from '@/components/BottomSheet';
import { FormField } from '@/components/FormField';
import { fetchWithAuth } from "@/lib/api";

interface EditEventSheetProps {
  isOpen: boolean;
  onClose: () => void;
  event: any;
  onUpdate: () => void; // Parent's refresh function
  onDelete: (eventId: string) => void;
}

export default function EditEventSheet({ isOpen, onClose, event, onUpdate, onDelete }: EditEventSheetProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Local state for form fields to allow editing before saving
  const [editData, setEditData] = useState<any>(null);

  // Sync local state when a new event is selected
  useEffect(() => {
    if (event) {
      setEditData({ ...event });
    }
  }, [event]);

  const todayStr = new Date().toLocaleDateString('en-CA').split('T')[0];

  if (!event || !editData) return null;

  const isLocked = (dateString: string) => {
    if (!dateString) return false;
    return (new Date(dateString).getTime() - Date.now()) < (6 * 60 * 60 * 1000);
  };

  const handleTimeChange = (type: 'start' | 'end', val: string) => {
    const [start = "", end = ""] = editData.time.split(' - ');
    setEditData({
      ...editData,
      time: type === 'start' ? `${val} - ${end}` : `${start} - ${val}`
    });
  };

  // --- PERSISTENCE HANDLERS ---

  const handleSaveChanges = async () => {
    try {
      setIsSaving(true);
      // Map frontend fields back to backend model (snake_case)
      const payload = {
        title: editData.title,
        description: editData.description,
        location_name: editData.location,
        price: parseInt(editData.price),
        max_players: parseInt(editData.slots),
        // Construct ISO strings for the backend
        start_time: `${editData.rawDate.split('T')[0]}T${editData.time.split(' - ')[0]}:00`,
        end_time: `${editData.rawDate.split('T')[0]}T${editData.time.split(' - ')[1]}:00`,
      };

      await fetchWithAuth(`/events/${event.id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload)
      });

      alert("Changes saved successfully!");
      onUpdate(); // Trigger parent refresh
    } catch (err: any) {
      alert(err.message || "Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await fetchWithAuth(`/events/${event.id}`, { method: 'DELETE' });
      onDelete(event.id);
      onClose();
    } catch (err: any) {
      alert(err.message || "Delete failed");
    }
  };

  const handleRemoveAttendee = async (targetUserId: number) => {
    try {
      await fetchWithAuth(`/rsvps/${event.id}/attendees/${targetUserId}`, {
        method: 'DELETE'
      });
      onUpdate(); // Refresh parent to get updated roster
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handlePromoteWaitlist = async (targetUserId: number) => {
    try {
      // Backend logic in rsvps.py expects a POST to add/promote with force_confirm
      await fetchWithAuth(`/rsvps/${event.id}/attendees/${targetUserId}?force_confirm=true`, {
        method: 'POST'
      });
      onUpdate();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={() => { onClose(); setShowDeleteConfirm(false); }} title="Manage Event">
      <div className="space-y-8 pb-10">

        {/* 1. Editable Fields */}
        <div className="space-y-6">
          <FormField label="Title" icon={Pencil}>
            <input type="text" className="w-full bg-zinc-50 border-none rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500" value={editData.title} onChange={e => setEditData({ ...editData, title: e.target.value })} />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Date" icon={Calendar} disabled={isLocked(editData.rawDate)}>
              <input
                type="date"
                min={todayStr}
                disabled={isLocked(editData.rawDate)}
                className="w-full bg-zinc-50 border-none rounded-2xl p-4 text-sm font-bold disabled:text-gray-400 outline-none focus:ring-2 focus:ring-blue-500"
                value={editData.rawDate.split('T')[0]}
                onChange={e => setEditData({ ...editData, rawDate: `${e.target.value}T${editData.rawDate.split('T')[1]}` })}
              />
            </FormField>
            <FormField label="Location" icon={MapPin} disabled={isLocked(editData.rawDate)}>
              <input type="text" disabled={isLocked(editData.rawDate)} className="w-full bg-zinc-50 border-none rounded-2xl p-4 text-sm font-bold disabled:text-gray-400 outline-none focus:ring-2 focus:ring-blue-500" value={editData.location} onChange={e => setEditData({ ...editData, location: e.target.value })} />
            </FormField>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <FormField label="Time Slot" icon={Clock} disabled={isLocked(editData.rawDate)}>
              <div className="flex items-center gap-3">
                <input
                  type="time"
                  disabled={isLocked(editData.rawDate)}
                  className="flex-1 bg-zinc-50 border-none rounded-2xl p-4 text-sm font-bold disabled:text-gray-400 outline-none focus:ring-2 focus:ring-blue-500"
                  value={editData.time.split(' - ')[0] || ''}
                  onChange={e => handleTimeChange('start', e.target.value)}
                />
                <span className="font-black text-gray-300">to</span>
                <input
                  type="time"
                  disabled={isLocked(editData.rawDate)}
                  className="flex-1 bg-zinc-50 border-none rounded-2xl p-4 text-sm font-bold disabled:text-gray-400 outline-none focus:ring-2 focus:ring-blue-500"
                  value={editData.time.split(' - ')[1] || ''}
                  onChange={e => handleTimeChange('end', e.target.value)}
                />
              </div>
            </FormField>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <FormField label="Court Fee (HUF)" icon={Banknote}>
              <input type="number" placeholder='0 for free' className="w-full bg-zinc-50 border-none rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500" value={editData.price} onChange={e => setEditData({ ...editData, price: e.target.value })} />
            </FormField>
          </div>

          {/* Primary Save Action */}
          <button
            onClick={handleSaveChanges}
            disabled={isSaving}
            className="w-full py-4 bg-zinc-900 text-white rounded-2xl font-black flex items-center justify-center gap-2 active:scale-95 transition-all shadow-xl shadow-zinc-100"
          >
            {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={18} />}
            Save Changes
          </button>
        </div>

        {/* 2. Attendee Roster */}
        <div className="space-y-3">
          <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">
            Attendees ({(editData.attendees?.length || 0)} / {editData.slots || editData.maxPlayers})
          </h4>
          <div className="bg-zinc-50 rounded-3xl divide-y divide-white/50 overflow-hidden">
            {editData.attendees?.map((a: any) => (
              <div key={a.id} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-700">
                    {a.user?.first_name || a.name}
                  </span>
                  {/* Show the Shield icon if this attendee is the host */}
                  {a.user_id === editData.host_id && (
                    <Shield size={12} className="text-blue-500" />
                  )}
                </div>

                {/* HIDE the UserMinus (Kick) button if this is the host */}
                {a.user_id !== editData.host_id && (
                  <button
                    onClick={() => handleRemoveAttendee(a.id)}
                    className="p-2 text-rose-500 bg-white rounded-xl shadow-sm"
                  >
                    <UserMinus size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 3. Waitlist Management */}
        {editData.waitlist && editData.waitlist.length > 0 && (
          <div className="space-y-4">
            <h4 className="text-[11px] font-black text-amber-500 uppercase tracking-widest px-1 flex items-center gap-2"><Clock size={12} /> Waitlist ({editData.waitlist.length})</h4>
            <div className="bg-amber-50 rounded-3xl divide-y divide-white/50 overflow-hidden border border-amber-100">
              {editData.waitlist.map((w: any) => (
                <div key={w.id} className="flex items-center justify-between p-4">
                  <span className="text-sm font-bold text-amber-900">{w.user?.first_name || w.name}</span>
                  <button onClick={() => handlePromoteWaitlist(w.id)} className="p-2 text-emerald-600 bg-white rounded-xl shadow-sm active:scale-90"><UserPlus size={16} /></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. Danger Zone */}
        <div className="pt-6 border-t border-gray-100">
          {!showDeleteConfirm ? (
            <button onClick={() => setShowDeleteConfirm(true)} className="w-full flex items-center justify-center gap-2 text-rose-500 font-bold text-sm py-4 bg-rose-50 rounded-2xl active:scale-95">
              <Trash2 size={18} /> Cancel & Delete Event
            </button>
          ) : (
            <div className="bg-rose-500 rounded-3xl p-6 text-white space-y-4 animate-in zoom-in-95 duration-200">
              <div className="flex items-center gap-3 font-black uppercase text-[11px] tracking-widest"><AlertTriangle size={18} /> Confirm Deletion</div>
              <p className="text-sm font-medium">This action cannot be undone. All players will be notified.</p>
              <div className="flex gap-3 pt-2">
                <button onClick={handleDelete} className="flex-1 bg-white text-rose-600 py-3 rounded-xl font-black text-xs">YES, DELETE</button>
                <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 bg-rose-600 text-white py-3 rounded-xl font-black text-xs">NO, KEEP IT</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </BottomSheet>
  );
}