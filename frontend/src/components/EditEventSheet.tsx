"use client";

import React, { useState, useEffect } from 'react';
import { Pencil, Calendar, MapPin, Clock, Banknote, Shield, UserMinus, Trash2, AlertTriangle, Search, Loader2, ArrowUpCircle, ArrowDownCircle, AlignLeft, Link as LinkIcon, Users, Map as MapIcon } from 'lucide-react';
import BottomSheet from '@/components/BottomSheet';
import { api } from '@/lib/api';
import { useUser } from '@/context/UserContext';

const FieldLabel = ({ icon: Icon, text }: { icon: any, text: string }) => (
  <div className="flex items-center gap-1.5 text-[11px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest mb-1.5 px-1">
    <Icon size={14} /> {text}
  </div>
);

export default function EditEventSheet({ isOpen, onClose, event, onUpdate, onDelete }: { isOpen: boolean; onClose: () => void; event: any; onUpdate: (u: any) => void; onDelete: (id: string) => void; }) {
  const { user } = useUser();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [localEvent, setLocalEvent] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (isOpen && event) {
      let parsedStart = "18:00", parsedEnd = "20:00";
      if (event.time?.includes(' - ')) [parsedStart, parsedEnd] = event.time.split(' - ');
      setLocalEvent({ ...event, waitlist: event.waitlist || [], description: event.description || "", slots: event.maxPlayers || 12, startTime: parsedStart, endTime: parsedEnd, price: String(event.price).replace(/\D/g, '') || "0", revolutTag: event.revolutTag || "" });
    }
  }, [isOpen, event]);

  if (!localEvent) return null;
  const inputClass = "w-full bg-zinc-50 dark:bg-zinc-800 text-gray-900 dark:text-white rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors";

  const handleManualAddUser = (e: React.FormEvent) => { e.preventDefault(); if(!searchQuery.trim()) return; setLocalEvent({...localEvent, attendees: [...localEvent.attendees, { user_id: `manual-${Date.now()}`, user: { first_name: searchQuery } }]}); setSearchQuery(""); };
  const handlePromote = (id: string) => { const p = localEvent.waitlist.find((p: any) => p.user_id === id); if (p) setLocalEvent({ ...localEvent, waitlist: localEvent.waitlist.filter((p: any) => p.user_id !== id), attendees: [...localEvent.attendees, p]}); };
  const handleDemote = (id: string) => { const p = localEvent.attendees.find((p: any) => p.user_id === id); if (p) setLocalEvent({ ...localEvent, attendees: localEvent.attendees.filter((p: any) => p.user_id !== id), waitlist: [...localEvent.waitlist, p]}); };
  const handleRemove = (id: string, type: 'main' | 'waitlist') => { if (type === 'main') setLocalEvent({ ...localEvent, attendees: localEvent.attendees.filter((u: any) => u.user_id !== id) }); else setLocalEvent({ ...localEvent, waitlist: localEvent.waitlist.filter((u: any) => u.user_id !== id) }); };

  const handleSave = async () => {
    try { setIsSaving(true); const baseDate = localEvent.rawDate?.split('T')[0] || new Date().toISOString().split('T')[0]; await api.updateEvent(localEvent.id, { title: localEvent.title, description: localEvent.description, type: localEvent.type, location_name: localEvent.location, start_time: new Date(`${baseDate}T${localEvent.startTime}:00`).toISOString(), end_time: new Date(`${baseDate}T${localEvent.endTime}:00`).toISOString(), price: parseInt(localEvent.price) || 0, max_players: parseInt(localEvent.slots) || 12, level_required: localEvent.level, revolut_tag: localEvent.revolutTag }); onUpdate(localEvent); onClose(); } catch (e) { alert("Failed!"); } finally { setIsSaving(false); }
  };

  const handleDelete = async () => { try { setIsDeleting(true); await api.deleteEvent(localEvent.id); onDelete(localEvent.id); onClose(); } catch (e) { alert("Failed!"); } finally { setIsDeleting(false); } };

  return (
    <BottomSheet isOpen={isOpen} onClose={() => { onClose(); setShowDeleteConfirm(false); }} title="Manage Event">
      <div className="space-y-6 pb-10 mt-2">
        <div><FieldLabel icon={Pencil} text="Title" /><input type="text" className={inputClass} value={localEvent.title} onChange={e => setLocalEvent({ ...localEvent, title: e.target.value })} /></div>
        
        <div className="space-y-4">
          <h4 className="text-[11px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest px-1">Attendees ({localEvent.attendees.length} / {localEvent.slots})</h4>
          <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-3xl divide-y divide-white/10 overflow-hidden">
            {localEvent.attendees.map((a: any) => {
              const isHost = a.user_id === user?.id || a.user_id === localEvent.host_id;
              return (
                <div key={a.user_id} className="flex items-center justify-between p-4">
                  <span className="text-sm font-bold text-gray-700 dark:text-zinc-200">{a.user?.first_name || a.name} {isHost ? "(Host)" : ""}</span>
                  {!isHost && (<div className="flex gap-2"><button onClick={() => handleDemote(a.user_id)} className="p-2 text-amber-500 bg-white dark:bg-zinc-700 rounded-xl shadow-sm"><ArrowDownCircle size={16} /></button><button onClick={() => handleRemove(a.user_id, 'main')} className="p-2 text-rose-500 bg-white dark:bg-zinc-700 rounded-xl shadow-sm"><UserMinus size={16} /></button></div>)}
                </div>
              );
            })}
          </div>
        </div>

        <form onSubmit={handleManualAddUser} className="flex gap-2 pt-2">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-600" />
            <input type="text" placeholder="Add manually..." className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl py-3 pl-9 pr-3 text-sm text-gray-900 dark:text-white font-medium outline-none transition-colors" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          <button type="submit" className="bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 text-white px-5 rounded-2xl text-xs font-bold active:scale-95 transition-all">Add</button>
        </form>

        <div className="pt-6 border-t border-gray-100 dark:border-zinc-800 space-y-3">
          {!showDeleteConfirm ? (
            <>
              <button onClick={handleSave} disabled={isSaving} className="w-full bg-blue-600 dark:bg-blue-500 text-white py-4 rounded-2xl font-black shadow-lg flex justify-center items-center gap-2 transition-all active:scale-95">{isSaving ? <Loader2 className="animate-spin" size={20} /> : "Save Changes"}</button>
              <button onClick={() => setShowDeleteConfirm(true)} className="w-full text-rose-500 font-bold text-sm py-4 bg-rose-50 dark:bg-rose-900/10 rounded-2xl transition-all active:scale-95 flex justify-center items-center gap-2"><Trash2 size={18} /> Delete Event</button>
            </>
          ) : (
            <div className="bg-rose-500 rounded-3xl p-6 text-white space-y-4 shadow-xl">
              <div className="flex items-center gap-3 font-black uppercase text-[11px] tracking-widest"><AlertTriangle size={18} /> Confirm Deletion</div>
              <div className="flex gap-3 pt-2">
                <button onClick={handleDelete} disabled={isDeleting} className="flex-1 bg-white text-rose-600 py-3.5 rounded-xl font-black text-xs transition-all active:scale-95">{isDeleting ? <Loader2 className="animate-spin" size={16} /> : "YES, DELETE"}</button>
                <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 bg-rose-700 text-white py-3.5 rounded-xl font-black text-xs transition-all active:scale-95">NO, KEEP IT</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </BottomSheet>
  );
}