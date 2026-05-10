"use client";

import React, { useState, useEffect } from 'react';
import { 
  Calendar, MapPin, Users, Info, Banknote, 
  Clock, XCircle, ExternalLink, Map as MapIcon, Loader2 
} from 'lucide-react';
import BottomSheet from '@/components/BottomSheet';
import { useUser } from '@/context/UserContext';
import { api } from '@/lib/api';

export default function MyGamesPage() {
  const { user } = useUser();
  const [upcomingGames, setUpcomingGames] = useState<any[]>([]);
  const [pastGames, setPastGames] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);
  const [selectedGame, setSelectedGame] = useState<any>(null);

  // Fetch user's registered games
  useEffect(() => {
    const fetchMyGames = async () => {
      if (!user?.id) return;
      try {
        setIsLoading(true);
        const data = await api.getMyGames();

        const mappedGames = data.map((item: any) => {
          // Fallback just in case backend returns an RSVP object instead of an Event object directly
          const dbEvent = item.event || item; 
          
          const dateObj = new Date(dbEvent.start_time);
          const endDate = new Date(dbEvent.end_time || dbEvent.start_time);
          
          const attendees = dbEvent.attendees || [];
          const confirmed = attendees.filter((a: any) => a.status === 'confirmed');
          const isHost = dbEvent.host_id === user.id;

          // Estimate duration in hours for stats (defaulting to 2 if end_time wasn't provided)
          const durationHours = (endDate.getTime() - dateObj.getTime()) / (1000 * 60 * 60) || 2;

          return {
            id: dbEvent.id,
            title: dbEvent.title,
            description: dbEvent.description,
            rawDate: dbEvent.start_time,
            date: dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
            time: `${dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })} - ${endDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}`,
            location: dbEvent.location_name,
            price: dbEvent.price,
            revolutTag: dbEvent.revolut_tag,
            slots: dbEvent.max_players,
            filled: confirmed.length,
            status: "Joined",
            isHost,
            durationHours
          };
        });

        const now = Date.now();
        // Separate upcoming vs past games based on current time + 2 hour buffer
        const upcoming = mappedGames.filter((g: any) => new Date(g.rawDate).getTime() + (2 * 60 * 60 * 1000) > now);
        const past = mappedGames.filter((g: any) => new Date(g.rawDate).getTime() + (2 * 60 * 60 * 1000) <= now);

        // Sort upcoming events so the closest ones appear first
        upcoming.sort((a: any, b: any) => new Date(a.rawDate).getTime() - new Date(b.rawDate).getTime());

        setUpcomingGames(upcoming);
        setPastGames(past);
      } catch (error) {
        console.error("Failed to fetch my games:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyGames();
  }, [user]);

  // Dynamic Statistics Calculations
  const totalHours = pastGames.reduce((acc, game) => acc + game.durationHours, 0);
  const stats = [
    { label: 'Upcoming', value: upcomingGames.length.toString() },
    { label: 'Total Games', value: (pastGames.length + upcomingGames.length).toString() },
    { label: 'Hours Played', value: totalHours.toFixed(1) },
  ];

  // Logic to prevent last-minute flaking
  const isCancellable = (rawDate: string) => {
    const eventTime = new Date(rawDate).getTime();
    return (eventTime - Date.now()) > (2 * 60 * 60 * 1000); // 2 hours in ms
  };

  const handleCancelRSVP = async (gameId: string) => {
    try {
        await api.leaveEvent(gameId);
        setUpcomingGames(prev => prev.filter(g => gameId !== g.id));
        setSelectedGame(null);
    } catch (error) {
        console.error("Failed to cancel RSVP:", error);
    }
};

  const handleMapClick = (location: string) => {
    window.open(`https://maps.google.com/?q=${encodeURIComponent(location)}`, '_blank');
  };

  return (
    <div className="py-4 space-y-6 animate-in fade-in duration-500 pb-24">
      {/* 1. Statistics Grid */}
      <div className="grid grid-cols-3 gap-3">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-[24px] p-4 shadow-sm border border-gray-100 flex flex-col items-center text-center justify-center">
            <p className="text-xl font-black text-blue-600 leading-none">{stat.value}</p>
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-tight mt-2 leading-tight">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* 2. Upcoming Schedule List */}
      <div className="space-y-4 pt-2">
        <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest px-1">Upcoming Schedule</h2>
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <Loader2 className="animate-spin mb-4 text-blue-500" size={32} />
            <p>Loading your games...</p>
          </div>
        ) : upcomingGames.length === 0 ? (
          <div className="bg-white rounded-[32px] p-10 shadow-sm border border-dashed border-gray-200 text-center">
            <Calendar className="mx-auto mb-3 text-gray-300" size={32} />
            <p className="text-sm font-bold text-gray-800">Your schedule is empty</p>
            <p className="text-xs text-gray-400 mt-1">Head to the Browse tab to find matches.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {upcomingGames.map((game) => (
              <div key={game.id} onClick={() => setSelectedGame(game)} className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 flex flex-col gap-5 active:scale-[0.98] transition-all cursor-pointer">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 truncate">
                    <h3 className="text-lg font-extrabold text-gray-900 truncate">{game.title}</h3>
                    {game.isHost && <span className="shrink-0 text-[10px] font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded-md">HOST</span>}
                  </div>
                  <span className="shrink-0 text-[10px] font-black uppercase px-2 py-1 rounded-lg bg-emerald-50 text-emerald-600">{game.status}</span>
                </div>
                <div className="grid grid-cols-1 gap-2 text-sm text-gray-500 font-medium">
                  <div className="flex items-center gap-2"><Calendar size={16} className="text-blue-500/80" /><span>{game.date} • {game.time}</span></div>
                  <div className="flex items-center gap-2"><MapPin size={16} className="text-blue-500/80" /><span className="truncate">{game.location}</span></div>
                  <div className="flex items-center gap-2"><Users size={16} className="text-blue-500/80" /><span>{game.filled} / {game.slots} Players Joined</span></div>
                </div>
                <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 transition-all duration-500" style={{ width: `${(game.filled / game.slots) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* GAME DETAILS POPUP */}
      <BottomSheet isOpen={!!selectedGame} onClose={() => setSelectedGame(null)} title="Game Details">
        {selectedGame && (
          <div className="space-y-8 pb-10">
            {/* Info Grid: Date, Time, Fee */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-zinc-50 rounded-2xl p-4 space-y-1">
                <div className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 uppercase tracking-tight"><Calendar size={12} /> Date</div>
                <p className="text-sm font-bold text-gray-900">{selectedGame.date}</p>
              </div>
              <div className="bg-zinc-50 rounded-2xl p-4 space-y-1">
                <div className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 uppercase tracking-tight"><Clock size={12} /> Time</div>
                <p className="text-sm font-bold text-gray-900">{selectedGame.time.split(' - ')[0]}</p>
              </div>
              <div className="bg-zinc-50 rounded-2xl p-4 space-y-1">
                <div className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 uppercase tracking-tight"><Banknote size={12} /> Court Fee</div>
                <p className="text-sm font-bold text-gray-900">{selectedGame.price === 0 ? "Free" : `${selectedGame.price} HUF`}</p>
              </div>
              <div className="bg-zinc-50 rounded-2xl p-4 space-y-1">
                <div className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 uppercase tracking-tight"><Users size={12} /> Capacity</div>
                <p className="text-sm font-bold text-gray-900">{selectedGame.filled}/{selectedGame.slots}</p>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-[11px] font-black text-gray-400 uppercase tracking-widest px-1"><Info size={14} /> Description</div>
              <div className="bg-zinc-50 rounded-2xl p-4 text-sm text-gray-700 leading-relaxed font-medium whitespace-pre-wrap">
                {selectedGame.description || "No description provided."}
              </div>
            </div>

            {/* Location & Maps Button */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-[11px] font-black text-gray-400 uppercase tracking-widest px-1"><MapPin size={14} /> Location</div>
              <button 
                onClick={() => handleMapClick(selectedGame.location)}
                className="flex items-center justify-between w-full bg-zinc-100 text-gray-900 p-4 rounded-2xl active:scale-95 transition-all border border-gray-200"
              >
                <span className="font-bold text-sm truncate pr-4">{selectedGame.location}</span>
                <MapIcon size={18} className="text-blue-600 shrink-0" />
              </button>
            </div>

            {/* Revolut Payment */}
            {selectedGame.revolutTag && selectedGame.price !== 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-[11px] font-black text-gray-400 uppercase tracking-widest px-1"><ExternalLink size={14} /> Payment Link</div>
                <a href={`https://revolut.me/${selectedGame.revolutTag.replace('@', '')}`} target="_blank" className="flex items-center justify-between w-full bg-blue-600 text-white p-4 rounded-2xl active:scale-95 transition-all">
                  <span className="font-bold text-sm">Pay via Revolut</span>
                  <span className="text-xs opacity-80 font-medium">@{selectedGame.revolutTag.replace('@', '')}</span>
                </a>
              </div>
            )}

            {/* Cancellation Action */}
            <div className="pt-4 border-t border-gray-100 space-y-3 text-center">
              {selectedGame.isHost ? (
                <div className="w-full flex items-center justify-center gap-2 text-gray-400 font-bold text-sm py-4 bg-gray-100 rounded-2xl cursor-not-allowed">
                  You're the Organizer
                </div>
              ) : isCancellable(selectedGame.rawDate) ? (
                <button 
                  onClick={() => handleCancelRSVP(selectedGame.id)} 
                  disabled={isCancelling}
                  className="w-full flex items-center justify-center gap-2 text-rose-500 font-bold text-sm py-4 bg-rose-50 rounded-2xl active:scale-95 transition-all disabled:opacity-50"
                >
                  {isCancelling ? <Loader2 className="animate-spin" size={18} /> : <XCircle size={18} />} 
                  {isCancelling ? 'Cancelling...' : 'Cancel RSVP'}
                </button>
              ) : (
                <div className="space-y-2">
                  <div className="w-full flex items-center justify-center gap-2 text-gray-400 font-bold text-sm py-4 bg-gray-100 rounded-2xl cursor-not-allowed opacity-60">
                    <XCircle size={18} /> Cancellation Locked
                  </div>
                  <p className="text-[10px] text-gray-400 font-medium px-4 leading-relaxed">
                    Cancellation is locked 2h before the match starts to prevent empty slots.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </BottomSheet>
    </div>
  );
}