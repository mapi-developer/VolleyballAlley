"use client";

import React, { useState } from 'react';
import { useUser } from "@/context/UserContext";
import { 
  ShieldCheck, Star, Play, ChevronRight, 
  Calendar, MapPin, Users, Banknote, Clock, 
  ExternalLink, Map as MapIcon, Info, XCircle
} from "lucide-react";
import Link from "next/link";
import GameCard, { Game } from '@/components/GameCard';
import BottomSheet from '@/components/BottomSheet';

// --- MOCK DATA ---
const NEXT_MATCH: Game = {
  id: "m1",
  type: "Indoor",
  level: "Advanced",
  title: "Advanced Power Play",
  description: "High-intensity 6v6 for experienced players only. Don't be late!",
  rawDate: "2026-05-10T18:00:00",
  date: "Sat, May 10",
  time: "18:00 - 20:00",
  currentPlayers: 8,
  maxPlayers: 12,
  hostName: "Alex",
  hostRole: "Organizer",
  price: "2500",
  location: "Beach Arena Court 4",
  revolutTag: "alexvolleyball",
  isJoined: true
};

const RECOMMENDED_GAMES: Game[] = [
  {
    id: "r1",
    type: "Indoor",
    level: "Intermediate",
    title: "Thursday Night Draft",
    description: "Friendly draft matches for intermediate players.",
    rawDate: "2026-05-14T19:00:00",
    date: "Thu, May 14",
    time: "19:00 - 21:00",
    currentPlayers: 11,
    maxPlayers: 14,
    hostName: "Sarah",
    hostRole: "Admin",
    price: "1500",
    location: "City Sports Center",
    revolutTag: "sarahvball",
    isJoined: false
  },
  {
    id: "r2",
    type: "Outdoor",
    level: "Advanced",
    title: "Weekend Beach Pro",
    description: "2v2 beach volleyball. High skill required.",
    rawDate: "2026-05-16T09:00:00",
    date: "Sat, May 16",
    time: "09:00 - 12:00",
    currentPlayers: 2,
    maxPlayers: 8,
    hostName: "Matvei",
    hostRole: "Organizer",
    price: "Free",
    location: "Margaret Island Sand",
    isJoined: false
  }
];

export default function HomePage() {
  const { user, level, rating } = useUser();
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);

  // External Links Logic
  const handleMapClick = (location: string) => {
    window.open(`https://www.google.com/maps/search/?api=1&query=$${encodeURIComponent(location)}`, '_blank');
  };

  const handlePayClick = (tag: string) => {
    window.open(`https://revolut.me/${tag.replace('@', '')}`, '_blank');
  };

  // Cancellation Logic (5 hours before match)
  const isCancellable = (rawDate: string) => {
    const eventTime = new Date(rawDate).getTime();
    const now = new Date().getTime();
    return (eventTime - now) > (5 * 60 * 60 * 1000);
  };

  return (
    <div className="py-2 space-y-6 animate-in fade-in duration-500">
      
      {/* 1. HERO SECTION: WEEKLY SNAPSHOT */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[32px] p-6 text-white shadow-lg shadow-blue-200 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-24 h-24 bg-black/10 rounded-full blur-xl pointer-events-none"></div>

        <div className="relative z-10">
          <h2 className="text-2xl font-black tracking-tight mb-1 leading-tight">
            Ready for the court, {user?.first_name || 'Player'}? 🏐
          </h2>
          <p className="text-blue-100 text-[13px] font-medium mb-6">
            You have 1 match coming up this week.
          </p>

          <button 
            onClick={() => setSelectedGame(NEXT_MATCH)}
            className="w-full bg-white text-blue-600 py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-black/10 active:scale-95 transition-transform"
          >
            <Play size={18} className="fill-blue-600" /> View Next Match
          </button>
        </div>
      </div>

      {/* 2. QUICK STATS BAR */}
      <div className="grid grid-cols-2 gap-3 px-1">
        <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
            <ShieldCheck size={20} strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest font-black text-gray-400">Level</p>
            <p className="text-[13px] font-bold text-gray-900 leading-tight">{level}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500 shrink-0">
            <Star size={20} strokeWidth={2.5} className="fill-amber-500" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest font-black text-gray-400">Behavior</p>
            <p className="text-[13px] font-bold text-gray-900 leading-tight">{rating} / 5.0</p>
          </div>
        </div>
      </div>

      {/* 3. DISCOVERY FEED */}
      <div className="space-y-4 pb-6 pt-2">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest">Recommended Matches</h2>
          <Link href="/browse" className="text-[11px] font-black text-blue-600 uppercase tracking-wider bg-blue-50 px-2.5 py-1.5 rounded-lg active:scale-95 transition-transform flex items-center gap-1">
            View All <ChevronRight size={12} strokeWidth={3} />
          </Link>
        </div>
        
        <div className="space-y-4">
          {RECOMMENDED_GAMES.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              onClick={() => setSelectedGame(game)}
              onMapClick={handleMapClick}
              onPayClick={handlePayClick}
              onRsvpClick={() => console.log("RSVP")}
              onCancelClick={() => console.log("Cancel")}
            />
          ))}
        </div>
      </div>

      {/* 4. GAME DETAILS POPUP (Shared logic) */}
      <BottomSheet isOpen={!!selectedGame} onClose={() => setSelectedGame(null)} title="Game Details">
        {selectedGame && (
          <div className="space-y-8 pb-10">
            {/* Info Grid */}
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
                <div className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 uppercase tracking-tight"><Banknote size={12} /> Fee</div>
                <p className="text-sm font-bold text-gray-900">{selectedGame.price}</p>
              </div>
              <div className="bg-zinc-50 rounded-2xl p-4 space-y-1">
                <div className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 uppercase tracking-tight"><Users size={12} /> Capacity</div>
                <p className="text-sm font-bold text-gray-900">{selectedGame.currentPlayers}/{selectedGame.maxPlayers}</p>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-[11px] font-black text-gray-400 uppercase tracking-widest px-1"><Info size={14} /> Description</div>
              <div className="bg-zinc-50 rounded-2xl p-4 text-sm text-gray-700 leading-relaxed font-medium">{selectedGame.description}</div>
            </div>

            {/* Maps Location */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-[11px] font-black text-gray-400 uppercase tracking-widest px-1"><MapPin size={14} /> Location</div>
              <button onClick={() => handleMapClick(selectedGame.location)} className="flex items-center justify-between w-full bg-zinc-100 text-gray-900 p-4 rounded-2xl active:scale-95 transition-all border border-gray-200">
                <span className="font-bold text-sm truncate pr-4">{selectedGame.location}</span>
                <MapIcon size={18} className="text-blue-600 shrink-0" />
              </button>
            </div>

            {/* Revolut Payment */}
            {selectedGame.revolutTag && selectedGame.price.toLowerCase() !== 'free' && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-[11px] font-black text-gray-400 uppercase tracking-widest px-1"><ExternalLink size={14} /> Payment Link</div>
                <button onClick={() => handlePayClick(selectedGame.revolutTag!)} className="flex items-center justify-between w-full bg-blue-600 text-white p-4 rounded-2xl active:scale-95 transition-all">
                  <span className="font-bold text-sm">Pay via Revolut</span>
                  <span className="text-xs opacity-80 font-medium">@{selectedGame.revolutTag.replace('@', '')}</span>
                </button>
              </div>
            )}

            {/* Primary RSVP Action */}
            <div className="pt-4 border-t border-gray-100 text-center space-y-3">
              {selectedGame.isJoined ? (
                isCancellable(selectedGame.rawDate) ? (
                  <button className="w-full flex justify-center items-center gap-2 py-4 rounded-2xl font-black text-base shadow-xl active:scale-95 transition-all bg-rose-50 text-rose-600 shadow-rose-100">
                    <XCircle size={18} /> Cancel Registration
                  </button>
                ) : (
                  <div className="space-y-2">
                    <div className="w-full flex items-center justify-center gap-2 text-gray-400 font-bold text-sm py-4 bg-gray-100 rounded-2xl cursor-not-allowed opacity-60">
                      <XCircle size={18} /> Cancellation Locked
                    </div>
                    <p className="text-[10px] text-gray-400 font-medium px-4 leading-relaxed">
                      Cancellation is locked 5h before the match starts.
                    </p>
                  </div>
                )
              ) : (
                <button className="w-full py-4 rounded-2xl font-black text-base shadow-xl active:scale-95 transition-all bg-blue-600 text-white shadow-blue-100">
                  RSVP Now
                </button>
              )}
            </div>
          </div>
        )}
      </BottomSheet>
    </div>
  );
}