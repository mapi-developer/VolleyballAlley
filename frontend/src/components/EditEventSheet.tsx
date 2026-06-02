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
  <div className="flex items-center gap-1.5 text-[11px] font-black text-app-text-secondary uppercase tracking-widest mb-1.5 px-1 transition-colors">
    <Icon size={14} /> {text}
  </div>
);

// BULLETPROOF TIME PARSER
const parseBackendDate = (utcString?: string) => {
    if (!utcString) return null;
    // Ensure the browser treats it as UTC by adding 'Z' if missing
    const safeString = utcString.endsWith('Z') || utcString.match(/[+-]\d{2}:\d{2}$/) 
        ? utcString 
        : `${utcString}Z`;
    const dateObj = new Date(safeString);
    return isNaN(dateObj.getTime()) ? null : dateObj;
};

const formatToInputTime = (date: Date | null) => {
  if (!date) return "20:00";
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
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
      // 3. APPLY UNIFIED LOGIC TO BOTH START AND END
      const startDate = parseBackendDate(event.start_time || event.rawDate);
      const endDate = parseBackendDate(event.end_time);

      // Default values
      let localDateStr = todayStr;
      let localStartStr = "18:00";
      let localEndStr = "20:00";

      if (startDate) {
          // Properly format the YYYY-MM-DD for the date input
          localDateStr = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}-${String(startDate.getDate()).padStart(2, '0')}`;
          localStartStr = formatToInputTime(startDate);
      }
      
      if (endDate) {
          // NO MORE SPLITTING STRINGS - Use the actual Date object
          localEndStr = formatToInputTime(endDate);
      } else if (event.time && event.time.includes(' - ')) {
          // Only use this as a absolute last resort if the backend literally sent no end_time
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
      
      // 1. Re-calculate the Local Dates to ensure they are valid objects
      const startDateTime = new Date(`${localEvent.date}T${localEvent.startTime}:00`);
      const endDateTime = new Date(`${localEvent.date}T${localEvent.endTime}:00`);

      // 2. THE MIDNIGHT FIX: Ensures 00:00 is saved as the next day
      if (endDateTime <= startDateTime) {
          endDateTime.setDate(endDateTime.getDate() + 1);
      }

      // 3. Construct Payload (matching backend EventUpdate schema exactly)
      const payload = {
        title: localEvent.title, 
        description: localEvent.description, 
        type: localEvent.type,
        location_name: localEvent.location, 
        start_time: startDateTime.toISOString(), // Correctly sends UTC string
        end_time: endDateTime.toISOString(),     // Correctly sends UTC string
        price: parseInt(localEvent.price) || 0, 
        max_players: parseInt(localEvent.slots) || 12,
        level_required: localEvent.level, 
        revolut_tag: localEvent.revolutTag,
      };
      
      // localEvent.id must be passed here
      const updatedBackendEvent = await api.updateEvent(localEvent.id, payload);
      onUpdate(updatedBackendEvent); 
      onClose();
    } catch (error: any) { 
        // 4. LOG THE SPECIFIC ERROR
        console.error("Save Error:", error.response?.data || error.message);
        alert("Failed to save changes. Check console for details."); 
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

  const inputClass = "w-full bg-app-inset text-app-text-primary rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-app-accent/20 transition-colors";

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
            <input type="date" min={todayStr} disabled={isLocked()} className={`${inputClass} disabled:opacity-50`} value={localEvent.date} onChange={e => { const selectedDate = e.target.value; if (selectedDate >= todayStr) setLocalEvent({ ...localEvent, date: selectedDate }); }} />
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
             <span className="text-sm font-bold text-app-text-secondary">to</span>
             <input type="time" className={inputClass} value={localEvent.endTime} onChange={e => setLocalEvent({ ...localEvent, endTime: e.target.value })} />
          </div>
        </div>

        <div>
          <FieldLabel icon={MapPin} text="Location & Map Link" />
          <input type="text" disabled={isLocked()} className={`${inputClass} disabled:opacity-50`} value={localEvent.location} onChange={e => setLocalEvent({ ...localEvent, location: e.target.value })} />
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
        <hr className="border-app-active" />
        
        {/* ATTENDEES & WAITLIST UI */}
        <div className="space-y-4">
          <div>
            <h4 className="text-[11px] font-black text-app-text-secondary uppercase tracking-widest px-1 mb-2">Attendees ({localEvent.attendees?.length || 0} / {localEvent.slots})</h4>
            <div className="bg-app-inset rounded-3xl divide-y divide-app-active overflow-hidden transition-colors">
              {localEvent.attendees?.map((a: any) => {
                const isHost = a.user_id === user?.id || a.user_id === localEvent.host_id;
                return (
                  <div key={a.user_id} className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-app-text-primary">{a.user?.first_name || a.name} {isHost ? "(Host)" : ""}</span>
                      {isHost && <Shield size={12} className="text-app-accent" />}
                    </div>
                    {!isHost && (
                      <div className="flex gap-2">
                        <button onClick={() => handleDemote(a.user_id)} className="p-2 text-app-warning bg-app-bg rounded-xl shadow-sm hover:bg-app-active transition-colors"><ArrowDownCircle size={16} /></button>
                        <button onClick={() => handleRemove(a.user_id, 'main')} className="p-2 text-app-error bg-app-bg rounded-xl shadow-sm hover:bg-app-error-bg transition-colors"><UserMinus size={16} /></button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          {localEvent.waitlist && localEvent.waitlist.length > 0 && (
            <div>
              <h4 className="text-[11px] font-black text-app-warning uppercase tracking-widest px-1 mb-2 flex justify-between">Waitlist <span>{localEvent.waitlist.length} waiting</span></h4>
              <div className="bg-app-warning-bg rounded-3xl divide-y divide-app-active overflow-hidden transition-colors">
                {localEvent.waitlist.map((a: any) => (
                  <div key={a.user_id} className="flex items-center justify-between p-4">
                    <span className="text-sm font-bold text-app-warning">{a.user?.first_name || a.name}</span>
                    <div className="flex gap-2">
                      <button onClick={() => handlePromote(a.user_id)} className="p-2 text-app-success bg-app-bg rounded-xl shadow-sm hover:bg-app-success-bg transition-colors"><ArrowUpCircle size={16} /></button>
                      <button onClick={() => handleRemove(a.user_id, 'waitlist')} className="p-2 text-app-error bg-app-bg rounded-xl shadow-sm hover:bg-app-error-bg transition-colors"><UserMinus size={16} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <form onSubmit={handleManualAddUser} className="flex gap-2 pt-2">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-app-text-secondary" />
              <input type="text" placeholder="Add player manually..." className="w-full bg-app-inset border-none rounded-2xl py-3 pl-9 pr-3 text-sm text-app-text-primary font-medium outline-none transition-colors" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <button type="submit" className="bg-app-inverted text-app-inverted-text px-5 rounded-2xl text-xs font-bold active:scale-95 transition-all">Add</button>
          </form>
        </div>

        {/* SAVE & DELETE ACTIONS */}
        <div className="pt-6 border-t border-app-active space-y-3">
          {!showDeleteConfirm && (
            <button onClick={handleSave} disabled={isSaving} className="w-full bg-app-accent text-white py-4 rounded-2xl font-black shadow-lg active:scale-95 transition-all flex justify-center items-center gap-2">
              {isSaving ? <Loader2 className="animate-spin" size={20} /> : "Save Changes"}
            </button>
          )}
          {!showDeleteConfirm ? (
            <button onClick={() => setShowDeleteConfirm(true)} className="w-full flex items-center justify-center gap-2 text-app-error font-bold text-sm py-4 bg-app-error-bg rounded-2xl active:scale-95 transition-all">
              <Trash2 size={18} /> Cancel & Delete Event
            </button>
          ) : (
            <div className="bg-app-error rounded-3xl p-6 text-white space-y-4 animate-in zoom-in-95 duration-200 shadow-xl shadow-app-error/20">
              <div className="flex items-center gap-3 font-black uppercase text-[11px] tracking-widest"><AlertTriangle size={18} /> Confirm Deletion</div>
              <p className="text-sm font-medium">This action cannot be undone.</p>
              <div className="flex gap-3 pt-2">
                <button onClick={handleDelete} disabled={isDeleting} className="flex-1 bg-white text-app-error py-3.5 rounded-xl font-black text-xs active:scale-95 flex justify-center transition-colors">
                  {isDeleting ? <Loader2 className="animate-spin" size={16} /> : "YES, DELETE"}
                </button>
                <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 bg-black/20 text-white py-3.5 rounded-xl font-black text-xs active:scale-95 transition-colors">NO, KEEP IT</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </BottomSheet>
  );
}