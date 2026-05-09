"use client";

import { useUser } from "@/context/UserContext";
import { Plus, Calendar, MapPin, Users, Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// Import your new modular components
import CreateEventSheet from "@/components/CreateEventSheet";
import EditEventSheet from "@/components/EditEventSheet";

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
      { id: 'host', name: 'Alex M. (You)', role: 'Organizer' },
      { id: 'u2', name: 'Sarah J.', role: 'Player' }
    ],
    waitlist: [{ id: 'w1', name: 'Petr V.' }]
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
    attendees: [
      { id: 'host', name: 'Alex M. (You)', role: 'Organizer' },
      ...Array(11).fill(null).map((_, i) => ({ id: `s${i}`, name: `Player ${i + 1}`, role: 'Player' }))
    ],
    waitlist: []
  }
];

export default function HostPage() {
  const { role } = useUser();
  const router = useRouter();
  
  const [hostedEvents, setHostedEvents] = useState(MOCK_HOSTED_EVENTS);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any>(null);

  useEffect(() => {
    if (role === 'member') router.replace('/');
  }, [role, router]);

  if (role === 'member') return null;

  return (
    <div className="py-6 space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Organizer Dashboard</h1>
        <button onClick={() => setIsCreateOpen(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-2xl font-bold text-[13px] shadow-lg shadow-blue-200 active:scale-95 transition-all">
          <Plus size={18} strokeWidth={3} /> New Event
        </button>
      </div>

      {/* List */}
      <div className="space-y-4">
        {hostedEvents.map((event) => {
          const filled = event.attendees?.length || 0; 
          return (
            <div key={event.id} className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 flex flex-col gap-5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <h3 className="text-lg font-extrabold text-gray-900 truncate leading-none">{event.title}</h3>
                  <span className={`shrink-0 text-[10px] font-black uppercase px-2 py-1 rounded-lg ${event.status === 'Full' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
                    {event.status}
                  </span>
                </div>
                <button onClick={() => { setEditingEvent(event); setIsEditOpen(true); }} className="p-2.5 bg-zinc-50 rounded-xl text-gray-400 active:scale-90 shrink-0 border border-transparent active:border-zinc-100">
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

      {/* Modular Components */}
      <CreateEventSheet 
        isOpen={isCreateOpen} 
        onClose={() => setIsCreateOpen(false)} 
        onCreate={(newEvent) => {
          setHostedEvents([newEvent, ...hostedEvents]);
          setIsCreateOpen(false);
        }} 
      />

      <EditEventSheet 
        isOpen={isEditOpen} 
        onClose={() => setIsEditOpen(false)} 
        event={editingEvent}
        onUpdate={(updatedEvent) => {
          setEditingEvent(updatedEvent);
          setHostedEvents(prev => prev.map(e => e.id === updatedEvent.id ? updatedEvent : e));
        }}
        onDelete={(eventId) => setHostedEvents(prev => prev.filter(e => e.id !== eventId))}
      />
    </div>
  );
}