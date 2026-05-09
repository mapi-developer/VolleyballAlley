"use client";

import React, { useState, useEffect } from 'react';
import {
  Calendar, MapPin, Users, Info, Banknote, Loader2,
  Clock, XCircle, ExternalLink, Map as MapIcon
} from 'lucide-react';
import BottomSheet from '@/components/BottomSheet';
import { fetchWithAuth, mapRsvpToGame } from '@/lib/api';

export default function MyGamesPage() {
  const [upcomingGames, setUpcomingGames] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedGame, setSelectedGame] = useState<any>(null);

  const loadMyGames = async () => {
    try {
      setIsLoading(true);
      const data = await fetchWithAuth('/rsvps/my-games');
      const games = data.map((rsvp: any) => mapRsvpToGame(rsvp));
      setUpcomingGames(games);
    } catch (err) {
      console.error("Failed to load games:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMyGames();
  }, []);

  const handleCancelRSVP = async (gameId: string) => {
    try {
      await fetchWithAuth(`/rsvps/${gameId}`, { method: 'DELETE' });
      setUpcomingGames(prev => prev.filter(g => g.id !== gameId));
      setSelectedGame(null);
    } catch (err: any) {
      alert(err.message || "Cancellation failed. You might be within the lock period.");
    }
  };

  const stats = [
    { label: 'Upcoming', value: upcomingGames.length.toString() },
    { label: 'Total Games', value: '24' },
    { label: 'Hours Played', value: '48.5' },
  ];

  const isCancellable = (rawDate: string) => {
    const eventTime = new Date(rawDate).getTime();
    const now = new Date().getTime();
    return (eventTime - now) > (2 * 60 * 60 * 1000);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-blue-600">
        <Loader2 className="animate-spin mb-2" size={32} />
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Syncing Journey...</p>
      </div>
    );
  }

  return (
    <div className="py-4 space-y-6 animate-in fade-in duration-500">
      {/* Statistics Grid */}
      <div className="grid grid-cols-3 gap-3">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-[24px] p-4 shadow-sm border border-gray-100 flex flex-col items-center text-center justify-center">
            <p className="text-xl font-black text-blue-600 leading-none">{stat.value}</p>
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-tight mt-2 leading-tight">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Upcoming Schedule List */}
      <div className="space-y-4 pt-2">
        <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest px-1">Upcoming Schedule</h2>
        <div className="space-y-4">
          {upcomingGames.length > 0 ? upcomingGames.map((game) => (
            <div key={game.id} onClick={() => setSelectedGame(game)} className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 flex flex-col gap-5 active:scale-[0.98] transition-all cursor-pointer">
              {/* Event Card Content (Same as previous implementation) */}
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-lg font-extrabold text-gray-900 truncate">{game.title}</h3>
                <span className={`shrink-0 text-[10px] font-black uppercase px-2 py-1 rounded-lg ${game.status === 'Upcoming' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                  }`}>
                  {game.status}
                </span>
              </div>
              <div className="grid grid-cols-1 gap-2 text-sm text-gray-500 font-medium">
                <div className="flex items-center gap-2"><Calendar size={16} className="text-blue-500/80" /><span>{game.date} • {game.time}</span></div>
                <div className="flex items-center gap-2"><MapPin size={16} className="text-blue-500/80" /><span className="truncate">{game.location}</span></div>
                <div className="flex items-center gap-2"><Users size={16} className="text-blue-500/80" /><span>{game.filled} / {game.slots} Players Joined</span></div>
              </div>
            </div>
          )) : (
            <div className="bg-white rounded-[32px] p-12 text-center border border-dashed border-gray-200">
              <p className="text-gray-400 font-bold text-sm">No joined matches yet.</p>
            </div>
          )}
        </div>
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
                <p className="text-sm font-bold text-gray-900">{selectedGame.price} HUF</p>
              </div>
              <div className="bg-zinc-50 rounded-2xl p-4 space-y-1">
                <div className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 uppercase tracking-tight"><Users size={12} /> Capacity</div>
                <p className="text-sm font-bold text-gray-900">{selectedGame.filled}/{selectedGame.slots}</p>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-[11px] font-black text-gray-400 uppercase tracking-widest px-1"><Info size={14} /> Description</div>
              <div className="bg-zinc-50 rounded-2xl p-4 text-sm text-gray-700 leading-relaxed font-medium">{selectedGame.description}</div>
            </div>

            {/* Location & Maps Button */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-[11px] font-black text-gray-400 uppercase tracking-widest px-1"><MapPin size={14} /> Location</div>
              <a
                href={selectedGame.mapUrl}
                target="_blank"
                className="flex items-center justify-between w-full bg-zinc-100 text-gray-900 p-4 rounded-2xl active:scale-95 transition-all border border-gray-200"
              >
                <span className="font-bold text-sm truncate pr-4">{selectedGame.location}</span>
                <MapIcon size={18} className="text-blue-600 shrink-0" />
              </a>
            </div>

            {/* Revolut Payment */}
            {selectedGame.revolutTag && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-[11px] font-black text-gray-400 uppercase tracking-widest px-1"><ExternalLink size={14} /> Payment Link</div>
                <a href={`https://revolut.me/${selectedGame.revolutTag}`} target="_blank" className="flex items-center justify-between w-full bg-blue-600 text-white p-4 rounded-2xl active:scale-95 transition-all">
                  <span className="font-bold text-sm">Pay via Revolut</span>
                  <span className="text-xs opacity-80 font-medium">@{selectedGame.revolutTag}</span>
                </a>
              </div>
            )}

            {/* Cancellation Action */}
            <div className="pt-4 border-t border-gray-100 text-center">
                {isCancellable(selectedGame.rawDate) ? (
                  <button onClick={() => handleCancelRSVP(selectedGame.id)} className="w-full flex items-center justify-center gap-2 text-rose-500 font-bold text-sm py-4 bg-rose-50 rounded-2xl active:scale-95 transition-all">
                    <XCircle size={18} /> Cancel RSVP
                  </button>
                ) : (
                  <p className="text-[10px] text-gray-400 font-medium">Cancellation is locked 2h before the match.</p>
                )}
             </div>
          </div>
        )}
      </BottomSheet>
    </div>
  );
}