"use client";

import React, { useState } from 'react';
import { Pencil, Calendar, MapPin, Clock, Banknote, Shield, UserMinus, UserPlus, Trash2, AlertTriangle, Search } from 'lucide-react';
import BottomSheet from '@/components/BottomSheet';
import { FormField } from '@/components/FormField';

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
  
  // Get today's date in YYYY-MM-DD format based on local time
  const todayStr = new Date().toLocaleDateString('en-CA').split('T')[0];

  if (!event) return null;

  const isLocked = (dateString: string) => {
    if (!dateString) return false;
    return (new Date(dateString).getTime() - Date.now()) < (6 * 60 * 60 * 1000);
  };

  const handleTimeChange = (type: 'start' | 'end', val: string) => {
    // Safely split the time string (e.g. "18:00 - 20:00")
    const [start = "", end = ""] = event.time.split(' - ');
    onUpdate({ 
        ...event, 
        time: type === 'start' ? `${val} - ${end}` : `${start} - ${val}` 
    });
  };

  const handleManualAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    onUpdate({ ...event, attendees: [...event.attendees, { id: `manual-${Date.now()}`, name: searchQuery, role: 'Player' }] });
    setSearchQuery("");
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={() => { onClose(); setShowDeleteConfirm(false); }} title="Manage Event">
      <div className="space-y-8 pb-10">
        <div className="space-y-6">
          <FormField label="Title" icon={Pencil}>
            <input type="text" className="w-full bg-zinc-50 border-none rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500" value={event.title} onChange={e => onUpdate({ ...event, title: e.target.value })} />
          </FormField>
          
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Date" icon={Calendar} disabled={isLocked(event.rawDate)}>
              <input 
                type="date" 
                min={todayStr} 
                disabled={isLocked(event.rawDate)} 
                className="w-full bg-zinc-50 border-none rounded-2xl p-4 text-sm font-bold disabled:text-gray-400 outline-none focus:ring-2 focus:ring-blue-500" 
                value={event.rawDate.split('T')[0]} 
                onChange={e => {
                  const selectedDate = e.target.value;
                  
                  // Validation: Reject if the chosen date is before today
                  if (selectedDate < todayStr) {
                    alert("You cannot move an event to a past date.");
                    return; // Exit early, keeping the date exactly as it was
                  }

                  const newRaw = `${selectedDate}T${event.rawDate.split('T')[1]}`;
                  onUpdate({ 
                    ...event, 
                    rawDate: newRaw, 
                    date: new Date(newRaw).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) 
                  });
                }} 
              />
            </FormField>
            <FormField label="Location" icon={MapPin} disabled={isLocked(event.rawDate)}>
              <input type="text" disabled={isLocked(event.rawDate)} className="w-full bg-zinc-50 border-none rounded-2xl p-4 text-sm font-bold disabled:text-gray-400 outline-none focus:ring-2 focus:ring-blue-500" value={event.location} onChange={e => onUpdate({ ...event, location: e.target.value })} />
            </FormField>
          </div>

          <div className="grid grid-cols-1 gap-4">
             <FormField label="Time Slot" icon={Clock} disabled={isLocked(event.rawDate)}>
              <div className="flex items-center gap-3">
                <input 
                  type="time" 
                  disabled={isLocked(event.rawDate)} 
                  className="flex-1 bg-zinc-50 border-none rounded-2xl p-4 text-sm font-bold disabled:text-gray-400 outline-none focus:ring-2 focus:ring-blue-500" 
                  value={event.time.split(' - ')[0] || ''} 
                  onChange={e => handleTimeChange('start', e.target.value)} 
                />
                <span className="font-black text-gray-300">to</span>
                <input 
                  type="time" 
                  disabled={isLocked(event.rawDate)} 
                  className="flex-1 bg-zinc-50 border-none rounded-2xl p-4 text-sm font-bold disabled:text-gray-400 outline-none focus:ring-2 focus:ring-blue-500" 
                  value={event.time.split(' - ')[1] || ''} 
                  onChange={e => handleTimeChange('end', e.target.value)} 
                />
              </div>
            </FormField>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            <FormField label="Court Fee (HUF)" icon={Banknote}>
              <input type="number" className="w-full bg-zinc-50 border-none rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500" value={event.price} onChange={e => onUpdate({ ...event, price: e.target.value })} />
            </FormField>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">Attendees ({event.attendees.length} / {event.slots})</h4>
          <div className="bg-zinc-50 rounded-3xl divide-y divide-white/50 overflow-hidden">
            {event.attendees.map((a: any) => (
              <div key={a.id} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-700">{a.name}</span>
                  {a.role === 'Organizer' && <Shield size={12} className="text-blue-500" />}
                </div>
                {a.role !== 'Organizer' && (
                  <button onClick={() => onUpdate({ ...event, attendees: event.attendees.filter((u: any) => u.id !== a.id)})} className="p-2 text-rose-500 bg-white rounded-xl shadow-sm active:scale-90"><UserMinus size={16} /></button>
                )}
              </div>
            ))}
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
                  <button onClick={() => onUpdate({ ...event, waitlist: event.waitlist.filter((u: any) => u.id !== w.id), attendees: [...event.attendees, { ...w, role: 'Player' }]})} className="p-2 text-emerald-600 bg-white rounded-xl shadow-sm active:scale-90"><UserPlus size={16} /></button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="pt-6 border-t border-gray-100">
          {!showDeleteConfirm ? (
            <button onClick={() => setShowDeleteConfirm(true)} className="w-full flex items-center justify-center gap-2 text-rose-500 font-bold text-sm py-4 bg-rose-50 rounded-2xl active:scale-95">
              <Trash2 size={18} /> Cancel & Delete Event
            </button>
          ) : (
            <div className="bg-rose-500 rounded-3xl p-6 text-white space-y-4 animate-in zoom-in-95 duration-200">
              <div className="flex items-center gap-3 font-black uppercase text-[11px] tracking-widest"><AlertTriangle size={18} /> Confirm Deletion</div>
              <p className="text-sm font-medium leading-relaxed">This action cannot be undone. All players will be notified.</p>
              <div className="flex gap-3 pt-2">
                <button onClick={() => { onDelete(event.id); onClose(); setShowDeleteConfirm(false); }} className="flex-1 bg-white text-rose-600 py-3 rounded-xl font-black text-xs active:scale-95">YES, DELETE</button>
                <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 bg-rose-600 text-white py-3 rounded-xl font-black text-xs active:scale-95">NO, KEEP IT</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </BottomSheet>
  );
}