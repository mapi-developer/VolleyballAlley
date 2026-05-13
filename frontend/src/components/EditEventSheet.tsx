"use client";

import React, { useState, useEffect } from 'react';
import { 
  Pencil, Calendar, MapPin, Clock, Banknote, Shield, 
  UserMinus, Trash2, AlertTriangle, Search, Loader2, 
  ArrowUpCircle, ArrowDownCircle, AlignLeft, Link as LinkIcon, Users, Map as MapIcon
} from 'lucide-react';
import BottomSheet from '@/components/BottomSheet';
import { api } from '@/lib/api';
import { useUser } from '@/context/UserContext';

interface EditEventSheetProps {
  isOpen: boolean; onClose: () => void; event: any;
  onUpdate: (updatedEvent: any) => void; onDelete: (eventId: string) => void;
}

const FieldLabel = ({ icon: Icon, text }: { icon: any, text: string }) => (
  <div className="flex items-center gap-1.5 text-[11px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest mb-1.5 px-1 transition-colors">
    <Icon size={14} /> {text}
  </div>
);

// BULLETPROOF TIME HELPER
const parseBackendDate = (utcString?: string) => {
    if (!utcString) return null;
    const safeString = utcString.endsWith('Z') || utcString.match(/[+-]\d{2}:\d{2}$/) 
        ? utcString 
        : `${utcString}Z`;
    const dateObj = new Date(safeString);
    return isNaN(dateObj.getTime()) ? null : dateObj;
};

export default function EditEventSheet({ isOpen, onClose, event, onUpdate, onDelete }: EditEventSheetProps) {
  const { user } = useUser(); 
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [localEvent, setLocalEvent] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const todayStr = new Date().toLocaleDateString('en-CA');

  useEffect(() => {
    if (isOpen && event) {
      let localDateStr = todayStr;
      let localStartStr = "18:00";
      let localEndStr = "20:00";

      const utcStart = event.start_time || event.rawDate;
      const utcEnd = event.end_time;

      const startDate = parseBackendDate(utcStart);
      if (startDate) {
          localDateStr = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}-${String(startDate.getDate()).padStart(2, '0')}`;
          localStartStr = startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
      }
      
      const endDate = parseBackendDate(utcEnd);
      if (endDate) {
          localEndStr = endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
      } else if (event.time && event.time.includes(' - ')) {
          localEndStr = event.time.split(' - ')[1].trim();
      }

      let parsedPrice = "0";
      if (event.price) {
        const digits = String(event.price).replace(/\D/g, '');
        if (digits) parsedPrice = digits;
      }

      setLocalEvent({ 
        ...event, 
        waitlist: event.waitlist || [], 
        description: event.description || "",
        level: event.level_required || event.level || "All", 
        type: event.type || "Indoor",
        location: event.location_name || event.location || "",
        slots: event.max_players || event.maxPlayers || 12, 
        date: localDateStr,             
        startTime: localStartStr,        
        endTime: localEndStr,            
        price: parsedPrice,            
        revolutTag: event.revolut_tag || event.revolutTag || ""
      });
    }
  }, [isOpen, event, todayStr]);

  if (!localEvent) return null;

  const isLocked = () => {
    const lockDate = parseBackendDate(event?.start_time || event?.rawDate);
    if (!lockDate) return false;
    return (lockDate.getTime() - Date.now()) < (6 * 60 * 60 * 1000);
  };

  const handleManualAddUser = (e: React.FormEvent) => { 
    e.preventDefault(); 
    if(!searchQuery.trim()) return; 
    setLocalEvent({...localEvent, attendees: [...localEvent.attendees, { user_id: `manual-${Date.now()}`, name: searchQuery, user: { first_name: searchQuery }, role: 'member' }]}); 
    setSearchQuery(""); 
  };
  
  const handlePromote = (id: string) => { 
    const player = localEvent.waitlist.find((p: any) => p.user_id === id); 
    if (player) setLocalEvent({ ...localEvent, waitlist: localEvent.waitlist.filter((p: any) => p.user_id !== id), attendees: [...localEvent.attendees, player]}); 
  };
  
  const handleDemote = (id: string) => { 
    const player = localEvent.attendees.find((p: any) => p.user_id === id); 
    if (player) setLocalEvent({ ...localEvent, attendees: localEvent.attendees.filter((p: any) => p.user_id !== id), waitlist: [...localEvent.waitlist, player]}); 
  };
  
  const handleRemove = (id: string, listType: 'main' | 'waitlist') => { 
    if (listType === 'main') setLocalEvent({ ...localEvent, attendees: localEvent.attendees.filter((u: any) => u.user_id !== id) }); 
    else setLocalEvent({ ...localEvent, waitlist: localEvent.waitlist.filter((u: any) => u.user_id !== id) }); 
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      // EXPLICIT NUMERIC PARSING: Prevents Browser Timezone String bugs
      const [year, month, day] = localEvent.date.split('-').map(Number);
      const [startHr, startMin] = localEvent.startTime.split(':').map(Number);
      const [endHr, endMin] = localEvent.endTime.split(':').map(Number);

      const startDateTime = new Date(year, month - 1, day, startHr, startMin);
      const endDateTime = new Date(year, month - 1, day, endHr, endMin);

      // Handle Cross-Midnight Events (e.g. 23:00 to 01:00 next day)
      if (endDateTime < startDateTime) {
          endDateTime.setDate(endDateTime.getDate() + 1);
      }

      const payload = {
        title: localEvent.title, 
        description: localEvent.description, 
        type: localEvent.type, // This will now save because of the models.py update!
        location_name: localEvent.location, 
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        price: parseInt(localEvent.price) || 0, 
        max_players: parseInt(localEvent.slots) || 12,
        level_required: localEvent.level, 
        revolut_tag: localEvent.revolutTag,
      };
      
      const updatedBackendEvent = await api.updateEvent(localEvent.id, payload);
      onUpdate(updatedBackendEvent); 
      onClose();
    } catch (error) { 
      alert("Failed to save changes."); 
    } finally { 
      setIsSaving(false); 
    }
  };

  const handleDelete = async () => {
    try {
      setShowDeleteConfirm(false)
      setIsDeleting(true); 
      await api.deleteEvent(localEvent.id); 
      onDelete(localEvent.id); 
      onClose();
    } catch (error) { 
      alert("Failed to delete event."); 
    } finally { 
      setIsDeleting(false); 
    }
  };

  const inputClass = "w-full bg-zinc-50 dark:bg-zinc-800 text-gray-900 dark:text-white rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors";

  return (
    <BottomSheet isOpen={isOpen} onClose={() => { onClose(); setShowDeleteConfirm(false); }} title="Manage Event">
      <div className="space-y-6 pb-10 mt-2">
        <div>
            <FieldLabel icon={Pencil} text="Event Title" />
            <input type="text" className={inputClass} value={localEvent.title} onChange={e => setLocalEvent({ ...localEvent, title: e.target.value })} />
        </div>
        <div>
          <FieldLabel icon={AlignLeft} text="Description" />
          <textarea rows={2} className={`${inputClass} font-medium resize-none`} value={localEvent.description} onChange={e => setLocalEvent({ ...localEvent, description: e.target.value })} />
        </div>
        
        {/* LEVEL & TYPE ROW */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <FieldLabel icon={Shield} text="Player Level" />
            <select className={`${inputClass} appearance-none`} value={localEvent.level} onChange={e => setLocalEvent({ ...localEvent, level: e.target.value })}>
              <option value="All">All Levels</option><option value="Beginner">Beginner</option><option value="Intermediate">Intermediate</option><option value="Advanced">Advanced</option>
            </select>
          </div>
          <div>
            <FieldLabel icon={MapIcon} text="Game Type" />
            <select className={`${inputClass} appearance-none`} value={localEvent.type} onChange={e => setLocalEvent({ ...localEvent, type: e.target.value })}>
              <option value="Indoor">Indoor</option><option value="Outdoor">Outdoor</option>
            </select>
          </div>
        </div>

        {/* DATE & MAX PLAYERS ROW */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <FieldLabel icon={Calendar} text="Date" />
            <input type="date" min={todayStr} disabled={isLocked()} className={`${inputClass} disabled:text-gray-400 dark:disabled:text-zinc-600`} value={localEvent.date} onChange={e => { const selectedDate = e.target.value; if (selectedDate >= todayStr) setLocalEvent({ ...localEvent, date: selectedDate }); }} />
          </div>
          <div>
            <FieldLabel icon={Users} text="Max Players" />
            <input type="number" min="2" max="50" className={inputClass} value={localEvent.slots} onChange={e => setLocalEvent({ ...localEvent, slots: e.target.value })} />
          </div>
        </div>

        <div>
          <FieldLabel icon={Clock} text="Time Slot" />
          <div className="flex items-center gap-3">
             <input type="time" className={inputClass} value={localEvent.startTime} onChange={e => setLocalEvent({ ...localEvent, startTime: e.target.value })} />
             <span className="text-sm font-bold text-gray-400 dark:text-zinc-600">to</span>
             <input type="time" className={inputClass} value={localEvent.endTime} onChange={e => setLocalEvent({ ...localEvent, endTime: e.target.value })} />
          </div>
        </div>

        <div>
          <FieldLabel icon={MapPin} text="Location & Map Link" />
          <input type="text" disabled={isLocked()} className={`${inputClass} disabled:text-gray-400 dark:disabled:text-zinc-600`} value={localEvent.location} onChange={e => setLocalEvent({ ...localEvent, location: e.target.value })} />
        </div>

        {/* FEE & REVOLUT ROW */}
        <div className="grid grid-cols-2 gap-3">
          <div>
             <FieldLabel icon={Banknote} text="Event Fee" />
             <input type="number" min="0" placeholder="0 (Free)" className={inputClass} value={localEvent.price} onChange={e => setLocalEvent({ ...localEvent, price: e.target.value })} />
          </div>
          <div>
             <FieldLabel icon={LinkIcon} text="Revolut Tag" />
             <input type="text" placeholder="@tag" className={inputClass} value={localEvent.revolutTag} onChange={e => setLocalEvent({ ...localEvent, revolutTag: e.target.value })} />
          </div>
        </div>
        <hr className="border-gray-100 dark:border-zinc-800" />
        
        {/* ATTENDEES & WAITLIST UI */}
        <div className="space-y-4">
          <div>
            <h4 className="text-[11px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest px-1 mb-2">Attendees ({localEvent.attendees?.length || 0} / {localEvent.slots})</h4>
            <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-3xl divide-y divide-white/50 dark:divide-white/10 overflow-hidden transition-colors">
              {localEvent.attendees?.map((a: any) => {
                const isHost = a.user_id === user?.id || a.user_id === localEvent.host_id;
                return (
                  <div key={a.user_id} className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-gray-700 dark:text-zinc-200">{a.user?.first_name || a.name} {isHost ? "(Host)" : ""}</span>
                      {isHost && <Shield size={12} className="text-blue-500 dark:text-blue-400" />}
                    </div>
                    {!isHost && (
                      <div className="flex gap-2">
                        <button onClick={() => handleDemote(a.user_id)} className="p-2 text-amber-500 bg-white dark:bg-zinc-700 rounded-xl shadow-sm transition-colors"><ArrowDownCircle size={16} /></button>
                        <button onClick={() => handleRemove(a.user_id, 'main')} className="p-2 text-rose-500 bg-white dark:bg-zinc-700 rounded-xl shadow-sm transition-colors"><UserMinus size={16} /></button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          {localEvent.waitlist && localEvent.waitlist.length > 0 && (
            <div>
              <h4 className="text-[11px] font-black text-amber-500 dark:text-amber-400 uppercase tracking-widest px-1 mb-2 flex justify-between">Waitlist <span>{localEvent.waitlist.length} waiting</span></h4>
              <div className="bg-amber-50 dark:bg-amber-900/10 rounded-3xl divide-y divide-white/50 dark:divide-white/10 overflow-hidden transition-colors">
                {localEvent.waitlist.map((a: any) => (
                  <div key={a.user_id} className="flex items-center justify-between p-4">
                    <span className="text-sm font-bold text-amber-900 dark:text-amber-400">{a.user?.first_name || a.name}</span>
                    <div className="flex gap-2">
                      <button onClick={() => handlePromote(a.user_id)} className="p-2 text-emerald-600 dark:text-emerald-400 bg-white dark:bg-zinc-700 rounded-xl shadow-sm transition-colors"><ArrowUpCircle size={16} /></button>
                      <button onClick={() => handleRemove(a.user_id, 'waitlist')} className="p-2 text-rose-500 bg-white dark:bg-zinc-700 rounded-xl shadow-sm transition-colors"><UserMinus size={16} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <form onSubmit={handleManualAddUser} className="flex gap-2 pt-2">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-600" />
              <input type="text" placeholder="Add player manually..." className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl py-3 pl-9 pr-3 text-sm text-gray-900 dark:text-white font-medium outline-none transition-colors" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <button type="submit" className="bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 text-white px-5 rounded-2xl text-xs font-bold active:scale-95 transition-all">Add</button>
          </form>
        </div>

        {/* SAVE & DELETE ACTIONS */}
        <div className="pt-6 border-t border-gray-100 dark:border-zinc-800 space-y-3">
          {!showDeleteConfirm && (
            <button onClick={handleSave} disabled={isSaving} className="w-full bg-blue-600 dark:bg-blue-500 text-white py-4 rounded-2xl font-black shadow-lg shadow-blue-200 dark:shadow-none active:scale-95 transition-all flex justify-center items-center gap-2">
              {isSaving ? <Loader2 className="animate-spin" size={20} /> : "Save Changes"}
            </button>
          )}
          {!showDeleteConfirm ? (
            <button onClick={() => setShowDeleteConfirm(true)} className="w-full flex items-center justify-center gap-2 text-rose-500 font-bold text-sm py-4 bg-rose-50 dark:bg-rose-900/10 rounded-2xl active:scale-95 transition-all">
              <Trash2 size={18} /> Cancel & Delete Event
            </button>
          ) : (
            <div className="bg-rose-500 rounded-3xl p-6 text-white space-y-4 animate-in zoom-in-95 duration-200 shadow-xl shadow-rose-200 dark:shadow-none">
              <div className="flex items-center gap-3 font-black uppercase text-[11px] tracking-widest"><AlertTriangle size={18} /> Confirm Deletion</div>
              <p className="text-sm font-medium">This action cannot be undone.</p>
              <div className="flex gap-3 pt-2">
                <button onClick={handleDelete} disabled={isDeleting} className="flex-1 bg-white text-rose-600 py-3.5 rounded-xl font-black text-xs active:scale-95 flex justify-center transition-colors">
                  {isDeleting ? <Loader2 className="animate-spin" size={16} /> : "YES, DELETE"}
                </button>
                <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 bg-rose-700 text-white py-3.5 rounded-xl font-black text-xs active:scale-95 transition-colors">NO, KEEP IT</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </BottomSheet>
  );
}