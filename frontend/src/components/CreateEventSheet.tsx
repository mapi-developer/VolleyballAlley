"use client";

import React, { useState, useEffect } from 'react';
import { Pencil, AlignLeft, Calendar, Users, Clock, MapPin, Banknote, Shield, Link as LinkIcon, Loader2, Map as MapIcon } from 'lucide-react';
import BottomSheet from '@/components/BottomSheet';
import { FormField } from '@/components/FormField';
import { useUser } from '@/context/UserContext';
import { api } from '@/lib/api'; 

export default function CreateEventSheet({ isOpen, onClose, onCreate }: { isOpen: boolean; onClose: () => void; onCreate: (newEvent: any) => void; }) {
  const { user } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const todayStr = new Date().toLocaleDateString('en-CA');

  const [formData, setFormData] = useState({
    title: "", description: "", type: "Indoor", level: "All",
    date: todayStr, maxPlayers: "12", startTime: "18:00", endTime: "20:00",
    location: "", price: "0", revolutTag: ""
  });

  useEffect(() => {
    if (isOpen && user?.revolut_tag) {
      setFormData(prev => ({ ...prev, revolutTag: user.revolut_tag }));
    }
  }, [isOpen, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. Construct Local Date Objects
    const startDateTime = new Date(`${formData.date}T${formData.startTime}:00`);
    const endDateTime = new Date(`${formData.date}T${formData.endTime}:00`);
    
    if (startDateTime.getTime() < Date.now()) return alert("Cannot create an event in the past!");

    try {
      setIsSubmitting(true);
      const payload = {
        title: formData.title || "Untitled Match",
        description: formData.description,
        type: formData.type, 
        // 2. Convert to UTC before sending
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        location_name: formData.location || "Location TBD",
        max_players: parseInt(formData.maxPlayers) || 12,
        price: parseInt(formData.price) || 0,
        level_required: formData.level,
        revolut_tag: formData.revolutTag || null
      };

      const newEventFromBackend = await api.createEvent(payload);
      onCreate(newEventFromBackend);
      onClose();
    } catch (error: any) { alert("Failed to create event"); } finally { setIsSubmitting(false); }
  };

  const inputClass = "w-full bg-zinc-50 dark:bg-zinc-800 text-gray-900 dark:text-white border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-colors";

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Create New Event">
      <form onSubmit={handleSubmit} className="space-y-6 pb-4">
        <FormField label="Event Title" icon={Pencil}>
          <input type="text" placeholder="e.g. Advanced Power Play" required className={inputClass} value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
        </FormField>
        
        <FormField label="Description" icon={AlignLeft}>
          <textarea rows={2} placeholder="Description..." className={`${inputClass} font-medium resize-none`} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Player Level" icon={Shield}>
            <select className={`${inputClass} appearance-none`} value={formData.level} onChange={e => setFormData({ ...formData, level: e.target.value })}>
              <option value="All">All Levels</option><option value="Beginner">Beginner</option><option value="Intermediate">Intermediate</option><option value="Advanced">Advanced</option>
            </select>
          </FormField>
          <FormField label="Game Type" icon={MapIcon}>
            <select className={`${inputClass} appearance-none`} value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
              <option value="Indoor">Indoor</option><option value="Outdoor">Outdoor</option>
            </select>
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Date" icon={Calendar}>
            <input type="date" min={todayStr} required className={inputClass} value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} />
          </FormField>
          <FormField label="Max Players" icon={Users}>
            <input type="number" min="2" className={inputClass} value={formData.maxPlayers} onChange={e => setFormData({ ...formData, maxPlayers: e.target.value })} />
          </FormField>
        </div>

        <FormField label="Time Slot" icon={Clock}>
          <div className="flex items-center gap-3">
            <input type="time" className={inputClass} value={formData.startTime} onChange={e => setFormData({ ...formData, startTime: e.target.value })} />
            <span className="font-black text-gray-300 dark:text-zinc-700">to</span>
            <input type="time" className={inputClass} value={formData.endTime} onChange={e => setFormData({ ...formData, endTime: e.target.value })} />
          </div>
        </FormField>
        
        <FormField label="Location" icon={MapPin}>
          <input type="text" placeholder="Location..." className={inputClass} value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} />
        </FormField>
        
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Fee (HUF)" icon={Banknote}>
            <input type="number" placeholder="0" className={inputClass} value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} />
          </FormField>
          <FormField label="Revolut" icon={LinkIcon}>
            <input type="text" placeholder="@username" className={inputClass} value={formData.revolutTag} onChange={e => setFormData({ ...formData, revolutTag: e.target.value })} />
          </FormField>
        </div>

        <div className="pt-4 border-t border-gray-100 dark:border-zinc-800">
          <button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 dark:bg-blue-500 text-white py-4 rounded-2xl font-black text-base shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2">
            {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : "Confirm & Launch Event"}
          </button>
        </div>
      </form>
    </BottomSheet>
  );
}