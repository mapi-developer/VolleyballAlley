"use client";

import React, { useState } from 'react';
import { 
  Calendar, MapPin, Users, Info, Banknote, 
  Clock, XCircle, ExternalLink, Map as MapIcon 
} from 'lucide-react';
import BottomSheet from '@/components/BottomSheet';

// Mock Data
const MOCK_UPCOMING_GAMES = [
  {
    id: "1",
    title: "Advanced Power Play",
    description: "High-intensity 6v6 for experienced players only. Competitive atmosphere. Please arrive 15 mins early for warmups.",
    rawDate: "2026-05-10T18:00:00",
    date: "Sat, May 10",
    time: "18:00 - 20:00",
    location: "Beach Arena Court 4",
    mapUrl: "https://maps.google.com/?q=Beach+Arena", // Added map link
    price: 2500,
    revolutTag: "alexvolleyball",
    slots: 12,
    filled: 8,
    status: "Upcoming"
  }
];

export default function MyGamesPage() {
  const [upcomingGames, setUpcomingGames] = useState(MOCK_UPCOMING_GAMES);
  const [selectedGame, setSelectedGame] = useState<any>(null);

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

  const handleCancelRSVP = (gameId: string) => {
    setUpcomingGames(prev => prev.filter(g => gameId !== g.id));
    setSelectedGame(null);
  };

  return (
    <div className="py-4 space-y-6 animate-in fade-in duration-500">
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
        <div className="space-y-4">
          {upcomingGames.map((game) => (
            <div key={game.id} onClick={() => setSelectedGame(game)} className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 flex flex-col gap-5 active:scale-[0.98] transition-all cursor-pointer">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-lg font-extrabold text-gray-900 truncate">{game.title}</h3>
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
            <div className="pt-4 border-t border-gray-100 space-y-3 text-center">
              {isCancellable(selectedGame.rawDate) ? (
                <button onClick={() => handleCancelRSVP(selectedGame.id)} className="w-full flex items-center justify-center gap-2 text-rose-500 font-bold text-sm py-4 bg-rose-50 rounded-2xl active:scale-95 transition-all">
                  <XCircle size={18} /> Cancel RSVP
                </button>
              ) : (
                <div className="space-y-2">
                  <div className="w-full flex items-center justify-center gap-2 text-gray-400 font-bold text-sm py-4 bg-gray-100 rounded-2xl cursor-not-allowed opacity-60">
                    <XCircle size={18} /> Cancellation Locked
                  </div>
                  <p className="text-[10px] text-gray-400 font-medium px-4 leading-relaxed">
                    Cancellation is locked 2h before the match starts.
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