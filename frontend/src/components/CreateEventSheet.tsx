"use client";

import React, { useState } from 'react';
import { Pencil, AlignLeft, Calendar, Users, Clock, MapPin, Banknote, Shield, Link as LinkIcon } from 'lucide-react';
import BottomSheet from '@/components/BottomSheet';
import { FormField } from '@/components/FormField';
import { useUser } from '@/context/UserContext';
import { fetchWithAuth } from "@/lib/api";


interface CreateEventSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: () => void;
}

export default function CreateEventSheet({ isOpen, onClose, onCreate }: CreateEventSheetProps) {
  const { user } = useUser();
  const todayStr = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    title: "", description: "", date: "", startTime: "18:00", endTime: "20:00",
    location: "", price: "0", maxPlayers: "12", level: "All", revolutTag: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Construct the backend payload
    const payload = {
      title: formData.title,
      description: formData.description,
      type: "Indoor", // You can add a selector for this later
      level_required: formData.level,
      start_time: `${formData.date}T${formData.startTime}:00`,
      end_time: `${formData.date}T${formData.endTime}:00`,
      location_name: formData.location,
      price: parseInt(formData.price),
      revolut_tag: formData.revolutTag,
      max_players: parseInt(formData.maxPlayers)
    };

    try {
      await fetchWithAuth('/events', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      onCreate(); // Trigger refresh on parent
      onClose();
      // Reset form
      setFormData({
        title: "", description: "", date: "", startTime: "18:00", endTime: "20:00",
        location: "", price: "0", maxPlayers: "12", level: "All", revolutTag: ""
      });
    } catch (err: any) {
      alert(err.message || "Failed to create event");
    }
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Create New Event">
      <form onSubmit={handleSubmit} className="space-y-6 pb-4">
        <FormField label="Event Title" icon={Pencil}>
          <input type="text" placeholder="e.g. Advanced Power Play" required className="w-full bg-zinc-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
        </FormField>
        <FormField label="Description" icon={AlignLeft}>
          <textarea rows={3} placeholder="Tell players about the game style..." className="w-full bg-zinc-50 border-none rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
        </FormField>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Date" icon={Calendar}>
            <input type="date" min={todayStr} required className="w-full bg-zinc-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} />
          </FormField>
          <FormField label="Max Players" icon={Users}>
            <input type="number" className="w-full bg-zinc-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none" value={formData.maxPlayers} onChange={e => setFormData({ ...formData, maxPlayers: e.target.value })} />
          </FormField>
        </div>
        <FormField label="Time Slot" icon={Clock}>
          <div className="flex items-center gap-3">
            <input type="time" className="flex-1 bg-zinc-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none" value={formData.startTime} onChange={e => setFormData({ ...formData, startTime: e.target.value })} />
            <span className="font-black text-gray-300">to</span>
            <input type="time" className="flex-1 bg-zinc-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none" value={formData.endTime} onChange={e => setFormData({ ...formData, endTime: e.target.value })} />
          </div>
        </FormField>
        <FormField label="Location & Map Link" icon={MapPin}>
          <input type="text" placeholder="Google Maps URL or venue name..." className="w-full bg-zinc-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} />
        </FormField>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Court Fee (HUF)" icon={Banknote}>
            <input type="number" placeholder="0 for Free" className="w-full bg-zinc-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} />
          </FormField>
          <FormField label="Player Level" icon={Shield}>
            <select className="w-full bg-zinc-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none appearance-none" value={formData.level} onChange={e => setFormData({ ...formData, level: e.target.value })}>
              <option value="All">All Levels</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </FormField>
        </div>
        <FormField label="Revolut Tag" icon={LinkIcon}>
          <input type="text" placeholder="@username" className="w-full bg-zinc-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none" value={formData.revolutTag} onChange={e => setFormData({ ...formData, revolutTag: e.target.value })} />
        </FormField>
        <div className="pt-4 border-t border-gray-100 flex flex-col gap-4">
          <p className="text-[10px] text-center text-gray-400 italic">Host: <span className="font-bold text-gray-600">{user?.first_name || "You"}</span></p>
          <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-base shadow-xl shadow-blue-100 active:scale-95 transition-all">
            Confirm & Launch Event
          </button>
        </div>
      </form>
    </BottomSheet>
  );
}