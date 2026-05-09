"use client";

import { useUser } from "@/context/UserContext";
import { 
  Plus, Calendar, MapPin, Users, Pencil, 
  Clock, AlignLeft, Banknote, Shield, Link as LinkIcon,
  UserMinus, UserPlus, Trash2, AlertTriangle
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import BottomSheet from "@/components/BottomSheet";

// Moved outside to prevent focus loss
const FormField = ({ label, icon: Icon, children, disabled }: any) => (
  <div className={`space-y-2 ${disabled ? 'opacity-50' : ''}`}>
    <label className="flex items-center gap-2 text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">
      <Icon size={14} />
      {label} {disabled && "(Locked < 24h)"}
    </label>
    {children}
  </div>
);

// Updated Mock Data
const MOCK_HOSTED_EVENTS = [
  {
    id: "1",
    title: "Advanced Power Play",
    description: "High-intensity 6v6 for experienced players only.",
    rawDate: "2026-05-10T18:00:00",
    date: "Sat, May 10",
    time: "18:00 - 20:00",
    location: "Beach Arena Court 4",
    slots: 12,
    price: 2500,
    level: "Advanced",
    status: "Upcoming",
    revolutTag: "alexvolleyball",
    attendees: [
      { id: 'u1', name: 'Alex M.', role: 'Player' },
      { id: 'u2', name: 'Sarah J.', role: 'Player' },
      { id: 'u3', name: 'David K.', role: 'Player' }
    ],
    waitlist: [
      { id: 'w1', name: 'Petr V.' },
      { id: 'w2', name: 'Elena R.' }
    ]
  },
  {
    id: "2",
    title: "Sunday Social Mix",
    description: "Casual games followed by drinks.",
    rawDate: "2026-05-11T10:00:00",
    date: "Sun, May 11",
    time: "10:00 - 12:00",
    location: "City Sports Center",
    slots: 12,
    price: 1800,
    level: "All",
    status: "Full",
    revolutTag: "socialvball",
    attendees: Array(12).fill(null).map((_, i) => ({ id: `s${i}`, name: `Player ${i + 1}`, role: 'Player' })),
    waitlist: [{ id: 'w3', name: 'Mark L.' }]
  }
];

export default function HostPage() {
  const { role, user } = useUser();
  const router = useRouter();
  
  const [hostedEvents, setHostedEvents] = useState(MOCK_HOSTED_EVENTS);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any>(null);

  // Default Create Form State
  const [formData, setFormData] = useState({
    title: "", description: "", date: "", startTime: "18:00", endTime: "20:00",
    location: "", price: "0", maxPlayers: "12", level: "All", revolutTag: ""
  });

  useEffect(() => {
    if (role === 'member') router.replace('/');
  }, [role, router]);

  if (role === 'member') return null;

  // --- Utility Functions ---
  const isLocked = (dateString: string) => {
    if (!dateString) return false;
    const eventTime = new Date(dateString).getTime();
    const now = new Date().getTime();
    return (eventTime - now) < (24 * 60 * 60 * 1000);
  };

  // Synchronize editingEvent changes directly to the main hostedEvents list
  const updateEventInList = (updatedEvent: any) => {
    setHostedEvents(prev => prev.map(e => e.id === updatedEvent.id ? updatedEvent : e));
  };

  // --- Handlers ---
  const handleEditClick = (event: any) => {
    setEditingEvent({ ...event });
    setIsEditOpen(true);
  };

  const handleKick = (userId: string) => {
    const updated = {
      ...editingEvent,
      attendees: editingEvent.attendees.filter((a: any) => a.id !== userId)
    };
    setEditingEvent(updated);
    updateEventInList(updated); // Live sync
  };

  const handlePromote = (userId: string) => {
    const promotedUser = editingEvent.waitlist.find((w: any) => w.id === userId);
    const updated = {
      ...editingEvent,
      waitlist: editingEvent.waitlist.filter((w: any) => w.id !== userId),
      attendees: [...editingEvent.attendees, { ...promotedUser, role: 'Player' }]
    };
    setEditingEvent(updated);
    updateEventInList(updated); // Live sync
  };

  const confirmDelete = () => {
    setHostedEvents(hostedEvents.filter(e => e.id !== editingEvent.id));
    setIsEditOpen(false);
    setShowDeleteConfirm(false);
  };

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    const newEvent = {
      id: Date.now().toString(),
      title: formData.title || "Untitled Match",
      description: formData.description,
      rawDate: `${formData.date}T${formData.startTime}:00`,
      date: formData.date ? new Date(formData.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : "TBD",
      time: `${formData.startTime} - ${formData.endTime}`,
      location: formData.location || "Location TBD",
      slots: parseInt(formData.maxPlayers) || 12,
      price: parseInt(formData.price) || 0,
      level: formData.level,
      status: "Upcoming",
      revolutTag: formData.revolutTag,
      attendees: [{ id: 'host', name: user?.first_name || 'You', role: 'Organizer' }], // Auto-add host
      waitlist: []
    };

    setHostedEvents([newEvent, ...hostedEvents]); // Prepend to top of list
    setIsCreateOpen(false);
    
    // Reset form
    setFormData({
      title: "", description: "", date: "", startTime: "18:00", endTime: "20:00",
      location: "", price: "0", maxPlayers: "12", level: "All", revolutTag: ""
    });
  };

  return (
    <div className="py-6 space-y-8 animate-in fade-in duration-500">
      {/* Dashboard Header */}
      <div className="flex items-center justify-between px-1">
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Organizer Dashboard</h1>
        <button onClick={() => setIsCreateOpen(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-2xl font-bold text-[13px] shadow-lg shadow-blue-200 active:scale-95 transition-all">
          <Plus size={18} strokeWidth={3} /> New Event
        </button>
      </div>

      {/* Events List */}
      <div className="space-y-4">
        {hostedEvents.map((event) => {
          const filled = event.attendees?.length || 0; // Fixed NaN issue
          
          return (
            <div key={event.id} className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 flex flex-col gap-5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <h3 className="text-lg font-extrabold text-gray-900 truncate leading-none">{event.title}</h3>
                  <span className={`shrink-0 text-[10px] font-black uppercase px-2 py-1 rounded-lg ${event.status === 'Full' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
                    {event.status}
                  </span>
                </div>
                <button onClick={() => handleEditClick(event)} className="p-2.5 bg-zinc-50 rounded-xl text-gray-400 active:scale-90 shrink-0 border border-transparent active:border-zinc-100">
                  <Pencil size={18} />
                </button>
              </div>
              <div className="grid grid-cols-1 gap-2 text-sm text-gray-500 font-medium">
                <div className="flex items-center gap-2"><Calendar size={16} className="text-blue-500/80" /><span>{event.date} • {event.time}</span></div>
                <div className="flex items-center gap-2"><MapPin size={16} className="text-blue-500/80" /><span className="truncate">{event.location}</span></div>
                <div className="flex items-center gap-2"><Users size={16} className="text-blue-500/80" /><span>{filled} / {event.slots} Players Joined</span></div>
              </div>
              <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                <div className={`h-full transition-all duration-500 ${event.status === 'Full' ? 'bg-amber-400' : 'bg-blue-600'}`} style={{ width: `${(filled / event.slots) * 100}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* EDIT EVENT POPUP */}
      <BottomSheet isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Manage Event">
        {editingEvent && (
          <div className="space-y-8 pb-10">
            {/* Editable Info Section */}
            <div className="space-y-6">
              <FormField label="Title" icon={Pencil}>
                <input 
                  type="text" 
                  className="w-full bg-zinc-50 border-none rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500" 
                  value={editingEvent.title} 
                  onChange={e => {
                    const updated = { ...editingEvent, title: e.target.value };
                    setEditingEvent(updated);
                    updateEventInList(updated);
                  }} 
                />
              </FormField>

              {/* 24-Hour Locked Fields */}
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Date" icon={Calendar} disabled={isLocked(editingEvent.rawDate)}>
                  <input 
                    type="date" 
                    disabled={isLocked(editingEvent.rawDate)} 
                    className="w-full bg-zinc-50 border-none rounded-2xl p-4 text-sm font-bold disabled:text-gray-400 outline-none focus:ring-2 focus:ring-blue-500" 
                    value={editingEvent.rawDate.split('T')[0]} 
                    onChange={e => {
                      const newRaw = `${e.target.value}T${editingEvent.rawDate.split('T')[1]}`;
                      const updated = { ...editingEvent, rawDate: newRaw, date: new Date(newRaw).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) };
                      setEditingEvent(updated);
                      updateEventInList(updated);
                    }}
                  />
                </FormField>
                <FormField label="Location" icon={MapPin} disabled={isLocked(editingEvent.rawDate)}>
                  <input 
                    type="text" 
                    disabled={isLocked(editingEvent.rawDate)} 
                    className="w-full bg-zinc-50 border-none rounded-2xl p-4 text-sm font-bold disabled:text-gray-400 outline-none focus:ring-2 focus:ring-blue-500" 
                    value={editingEvent.location} 
                    onChange={e => {
                      const updated = { ...editingEvent, location: e.target.value };
                      setEditingEvent(updated);
                      updateEventInList(updated);
                    }} 
                  />
                </FormField>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField label="Time (Start - End)" icon={Clock} disabled={isLocked(editingEvent.rawDate)}>
                  <input 
                    type="text" 
                    disabled={isLocked(editingEvent.rawDate)} 
                    className="w-full bg-zinc-50 border-none rounded-2xl p-4 text-sm font-bold disabled:text-gray-400 outline-none focus:ring-2 focus:ring-blue-500" 
                    value={editingEvent.time} 
                    onChange={e => {
                      const updated = { ...editingEvent, time: e.target.value };
                      setEditingEvent(updated);
                      updateEventInList(updated);
                    }} 
                  />
                </FormField>
                <FormField label="Court Fee (HUF)" icon={Banknote}>
                  <input 
                    type="number" 
                    className="w-full bg-zinc-50 border-none rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500" 
                    value={editingEvent.price} 
                    onChange={e => {
                      const updated = { ...editingEvent, price: e.target.value };
                      setEditingEvent(updated);
                      updateEventInList(updated);
                    }} 
                  />
                </FormField>
              </div>
            </div>

            {/* Roster Management Section */}
            <div className="space-y-4">
              <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">Attendees ({editingEvent.attendees.length} / {editingEvent.slots})</h4>
              <div className="bg-zinc-50 rounded-3xl divide-y divide-white/50 overflow-hidden">
                {editingEvent.attendees.map((a: any) => (
                  <div key={a.id} className="flex items-center justify-between p-4">
                    <span className="text-sm font-bold text-gray-700">{a.name}</span>
                    <button onClick={() => handleKick(a.id)} className="p-2 text-rose-500 bg-white rounded-xl shadow-sm active:scale-90"><UserMinus size={16} /></button>
                  </div>
                ))}
              </div>
            </div>

            {/* Waitlist Section */}
            {editingEvent.waitlist.length > 0 && (
              <div className="space-y-4">
                <h4 className="text-[11px] font-black text-amber-500 uppercase tracking-widest px-1 flex items-center gap-2">
                  <Clock size={12} /> Waitlist ({editingEvent.waitlist.length})
                </h4>
                <div className="bg-amber-50 rounded-3xl divide-y divide-white/50 overflow-hidden border border-amber-100">
                  {editingEvent.waitlist.map((w: any) => (
                    <div key={w.id} className="flex items-center justify-between p-4">
                      <span className="text-sm font-bold text-amber-900">{w.name}</span>
                      <button onClick={() => handlePromote(w.id)} className="p-2 text-emerald-600 bg-white rounded-xl shadow-sm active:scale-90"><UserPlus size={16} /></button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Dangerous Actions */}
            <div className="pt-6 border-t border-gray-100">
              {!showDeleteConfirm ? (
                <button 
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full flex items-center justify-center gap-2 text-rose-500 font-bold text-sm py-4 bg-rose-50 rounded-2xl active:scale-95 transition-all"
                >
                  <Trash2 size={18} /> Cancel & Delete Event
                </button>
              ) : (
                <div className="bg-rose-500 rounded-3xl p-6 text-white space-y-4 animate-in zoom-in-95 duration-200">
                  <div className="flex items-center gap-3 font-black uppercase text-[11px] tracking-widest">
                    <AlertTriangle size={18} /> Confirm Deletion
                  </div>
                  <p className="text-sm font-medium leading-relaxed">This action cannot be undone. All players will receive a notification that the event is cancelled.</p>
                  <div className="flex gap-3 pt-2">
                    <button onClick={confirmDelete} className="flex-1 bg-white text-rose-600 py-3 rounded-xl font-black text-xs active:scale-95 transition-transform">YES, DELETE</button>
                    <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 bg-rose-600 text-white py-3 rounded-xl font-black text-xs active:scale-95 transition-transform">NO, KEEP IT</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </BottomSheet>

      {/* CREATE EVENT POPUP */}
      <BottomSheet isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Create New Event">
        {/* Same create form logic applied here successfully */}
        <form onSubmit={handleCreateEvent} className="space-y-6 pb-4">
          <FormField label="Event Title" icon={Pencil}>
            <input 
              type="text" 
              placeholder="e.g. Advanced Power Play"
              className="w-full bg-zinc-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              required
            />
          </FormField>

          <FormField label="Description" icon={AlignLeft}>
            <textarea 
              rows={3}
              placeholder="Tell players about the game style..."
              className="w-full bg-zinc-50 border-none rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Date" icon={Calendar}>
              <input 
                type="date" 
                className="w-full bg-zinc-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                required
              />
            </FormField>
            <FormField label="Max Players" icon={Users}>
              <input 
                type="number" 
                className="w-full bg-zinc-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.maxPlayers}
                onChange={(e) => setFormData({...formData, maxPlayers: e.target.value})}
              />
            </FormField>
          </div>

          <FormField label="Time Slot" icon={Clock}>
            <div className="flex items-center gap-3">
              <input 
                type="time" 
                className="flex-1 bg-zinc-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.startTime}
                onChange={(e) => setFormData({...formData, startTime: e.target.value})}
              />
              <span className="font-black text-gray-300">to</span>
              <input 
                type="time" 
                className="flex-1 bg-zinc-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.endTime}
                onChange={(e) => setFormData({...formData, endTime: e.target.value})}
              />
            </div>
          </FormField>

          <FormField label="Location & Map Link" icon={MapPin}>
            <input 
              type="text" 
              placeholder="Google Maps URL or venue name..."
              className="w-full bg-zinc-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Court Fee (HUF)" icon={Banknote}>
              <input 
                type="number" 
                placeholder="0 for Free"
                className="w-full bg-zinc-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
              />
            </FormField>
            <FormField label="Player Level" icon={Shield}>
              <select 
                className="w-full bg-zinc-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                value={formData.level}
                onChange={(e) => setFormData({...formData, level: e.target.value})}
              >
                <option value="All">All Levels</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </FormField>
          </div>

          <FormField label="Revolut Tag" icon={LinkIcon}>
            <input 
              type="text" 
              placeholder="@username"
              className="w-full bg-zinc-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.revolutTag}
              onChange={(e) => setFormData({...formData, revolutTag: e.target.value})}
            />
          </FormField>

          <div className="pt-4 border-t border-gray-100 flex flex-col gap-4">
            <p className="text-[10px] text-center text-gray-400 italic">
              Host: <span className="font-bold text-gray-600">{user?.first_name || "You"}</span>
            </p>
            <button 
              type="submit"
              className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-base shadow-xl shadow-blue-100 active:scale-95 transition-all"
            >
              Confirm & Launch Event
            </button>
          </div>
        </form>
      </BottomSheet>
    </div>
  );
}