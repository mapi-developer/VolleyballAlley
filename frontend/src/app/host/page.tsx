"use client";

import { useUser } from "@/context/UserContext";
import { Plus, Calendar, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import GameCard, { Game } from "@/components/EventCard";
import CreateEventSheet from "@/components/CreateEventSheet";
import EditEventSheet from "@/components/EditEventSheet";

const mapBackendToHostEvent = (dbEvent: any, userId: number | undefined): Game & { attendees: any[], waitlist: any[] } => {
  const dateObj = new Date(dbEvent.start_time);
  const endDate = new Date(dbEvent.end_time || dbEvent.start_time);
  const attendees = dbEvent.attendees || [];
  const confirmed = attendees.filter((a: any) => a.status === 'confirmed');
  
  // Safely check for location text
  const locName = dbEvent.location_name || "Location TBD";
  const isSand = locName.toLowerCase().includes('sand') || locName.toLowerCase().includes('beach');

  return {
    id: String(dbEvent.id), // FIX: Strictly convert to String
    title: dbEvent.title || "Untitled Match", 
    description: dbEvent.description,
    type: dbEvent.type || (isSand ? 'Outdoor' : 'Indoor'),
    level: dbEvent.level_required || 'All', 
    rawDate: dbEvent.start_time,
    date: dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
    time: `${dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })} - ${endDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}`,
    location: locName, 
    currentPlayers: confirmed.length, 
    maxPlayers: dbEvent.max_players,
    price: dbEvent.price === 0 ? "Free" : `${dbEvent.price} HUF`,
    hostName: "You", 
    isJoined: true, 
    isHost: true, 
    revolutTag: dbEvent.revolut_tag,
    
    // Additional data passed locally to populate the Edit Form
    attendees: confirmed, 
    waitlist: attendees.filter((a: any) => a.status === 'waitlisted')
  };
};

export default function HostPage() {
  const { user, role } = useUser();
  const router = useRouter();
  
  const [hostedEvents, setHostedEvents] = useState<(Game & { attendees: any[], waitlist: any[] })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any>(null);

  useEffect(() => {
    if (role === 'member') { router.replace('/'); return; }

    const fetchMyHostedEvents = async () => {
      if (!user?.id) return;
      try {
        const allEvents = await api.getEvents();
        const myEvents = allEvents.filter((e: any) => e.host_id === user.id);
        setHostedEvents(myEvents.map((e: any) => mapBackendToHostEvent(e, user.id)));
      } catch (error) { 
        console.error(error); 
      } finally { 
        setIsLoading(false); 
      }
    };
    fetchMyHostedEvents();
  }, [role, router, user]);

  if (role === 'member') return null;

  return (
    <div className="py-6 space-y-8 animate-in fade-in duration-500 pb-24">
      <div className="flex items-center justify-between px-1">
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Organizer Dashboard</h1>
        <button onClick={() => setIsCreateOpen(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-2xl font-bold text-[13px] shadow-lg shadow-blue-200 active:scale-95 transition-all">
          <Plus size={18} strokeWidth={3} /> New Event
        </button>
      </div>

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
        <div className="space-y-4">
          {hostedEvents.map((event) => (
            <GameCard 
              key={event.id} 
              game={event} 
              variant="host"
              onClick={() => { setEditingEvent(event); setIsEditOpen(true); }}
              onEditClick={(e) => { e.stopPropagation(); setEditingEvent(event); setIsEditOpen(true); }}
            />
          ))}
        </div>
      )}

      <CreateEventSheet 
        isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} 
        onCreate={(newBackendEvent) => { 
          setHostedEvents([mapBackendToHostEvent(newBackendEvent, user?.id), ...hostedEvents]); 
          setIsCreateOpen(false); 
        }} 
      />
      <EditEventSheet 
        isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} event={editingEvent}
        onUpdate={(updatedBackendEvent) => {
          const mapped = mapBackendToHostEvent(updatedBackendEvent, user?.id);
          setEditingEvent(mapped); 
          setHostedEvents(prev => prev.map(e => e.id === mapped.id ? mapped : e));
        }}
        onDelete={(eventId) => {
          // Because ID is strictly a string now, this filter works perfectly!
          setHostedEvents(prev => prev.filter(e => e.id !== eventId));
        }}
      />
    </div>
  );
}