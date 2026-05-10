"use client";

import { useUser } from "@/context/UserContext";
import { Plus, Calendar, MapPin, Users, Pencil, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

import CreateEventSheet from "@/components/CreateEventSheet";
import EditEventSheet from "@/components/EditEventSheet";

// Helper to map backend format to the Host UI format
const mapBackendToHostEvent = (dbEvent: any) => {
  const dateObj = new Date(dbEvent.start_time);
  const attendees = dbEvent.attendees || [];
  
  // Filter confirmed players and waitlisted players
  const confirmed = attendees.filter((a: any) => a.status === 'confirmed');
  const waitlisted = attendees.filter((a: any) => a.status === 'waitlisted');

  const filled = confirmed.length;
  const isFull = filled >= dbEvent.max_players;

  return {
    id: dbEvent.id,
    title: dbEvent.title,
    description: dbEvent.description,
    rawDate: dbEvent.start_time,
    date: dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
    time: dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
    location: dbEvent.location_name,
    slots: dbEvent.max_players,
    price: dbEvent.price,
    level: dbEvent.level_required,
    status: isFull ? "Full" : "Upcoming",
    host_id: dbEvent.host_id, // Important for tracking the host
    attendees: confirmed,
    waitlist: waitlisted
  };
};

export default function HostPage() {
  const { user, role } = useUser();
  const router = useRouter();
  
  const [hostedEvents, setHostedEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any>(null);

  // Security & Data Fetching
  useEffect(() => {
    if (role === 'member') {
      router.replace('/');
      return;
    }

    const fetchMyHostedEvents = async () => {
      if (!user?.id) return;
      try {
        const allEvents = await api.getEvents();
        // Filter events where the logged-in user is the host
        const myEvents = allEvents.filter((e: any) => e.host_id === user.id);
        setHostedEvents(myEvents.map(mapBackendToHostEvent));
      } catch (error) {
        console.error("Failed to load hosted events:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyHostedEvents();
  }, [role, router, user]);

  if (role === 'member') return null;

  return (
    <div className="py-6 space-y-8 animate-in fade-in duration-500 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Organizer Dashboard</h1>
        <button onClick={() => setIsCreateOpen(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-2xl font-bold text-[13px] shadow-lg shadow-blue-200 active:scale-95 transition-all">
          <Plus size={18} strokeWidth={3} /> New Event
        </button>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
          <Loader2 className="animate-spin mb-4 text-blue-500" size={32} />
          <p>Loading your events...</p>
        </div>
      ) : hostedEvents.length === 0 ? (
        <div className="text-center py-12 text-gray-400 bg-white rounded-[32px] border border-gray-100 shadow-sm">
          <Calendar className="mx-auto mb-3 opacity-50" size={40} />
          <p>You haven't hosted any events yet.</p>
        </div>
      ) : (
        /* List */
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
      )}

      {/* Modular Components */}
      <CreateEventSheet 
        isOpen={isCreateOpen} 
        onClose={() => setIsCreateOpen(false)} 
        onCreate={(newBackendEvent) => {
          // Map the new event when CreateEventSheet successfully calls api.createEvent()
          setHostedEvents([mapBackendToHostEvent(newBackendEvent), ...hostedEvents]);
          setIsCreateOpen(false);
        }} 
      />

      <EditEventSheet 
        isOpen={isEditOpen} 
        onClose={() => setIsEditOpen(false)} 
        event={editingEvent}
        onUpdate={(updatedBackendEvent) => {
          const mapped = mapBackendToHostEvent(updatedBackendEvent);
          setEditingEvent(mapped);
          setHostedEvents(prev => prev.map(e => e.id === mapped.id ? mapped : e));
        }}
        onDelete={(eventId) => setHostedEvents(prev => prev.filter(e => e.id !== eventId))}
      />
    </div>
  );
}