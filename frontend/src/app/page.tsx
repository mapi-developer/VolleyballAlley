"use client";

import React, { useState, useEffect } from 'react';
import { useUser } from "@/context/UserContext";
import {
  ShieldCheck, Star, Play, ChevronRight,
  Calendar, MapPin, Users, Banknote, Clock,
  ExternalLink, Map as MapIcon, Info, XCircle, Loader2
} from "lucide-react";
import Link from "next/link";
import BottomSheet from '@/components/BottomSheet';
import GameCard, { Game } from '@/components/EventCard';
import { api } from '@/lib/api';

export default function HomePage() {
  const { user } = useUser();
  const [nextGame, setNextGame] = useState<Game | null>(null);
  const [featuredGames, setFeaturedGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  // Fetch Dashboard Data
  const loadDashboard = async () => {
    try {
      setIsLoading(true);

      // 1. Fetch User's Games (To find the "Next Up")
      const myGamesData = await api.getMyGames();
      const now = Date.now();

      const mappedMyGames = myGamesData.map((item: any) => {
        const dbEvent = item.event || item;
        const dateObj = new Date(dbEvent.start_time);
        const endDate = new Date(dbEvent.end_time || dbEvent.start_time);
        const attendees = dbEvent.attendees || [];
        const confirmed = attendees.filter((a: any) => a.status === 'confirmed');
        const isHost = dbEvent.host_id === user?.id;

        return {
          id: dbEvent.id,
          type: dbEvent.location_name.toLowerCase().includes('sand') ? 'Outdoor' : 'Indoor',
          level: dbEvent.level_required,
          title: dbEvent.title,
          description: dbEvent.description,
          rawDate: dbEvent.start_time,
          date: dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
          time: `${dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })} - ${endDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}`,
          currentPlayers: confirmed.length,
          maxPlayers: dbEvent.max_players,
          hostName: isHost ? "You" : "Organizer",
          hostRole: "Organizer",
          price: dbEvent.price === 0 ? "Free" : `${dbEvent.price} HUF`,
          location: dbEvent.location_name,
          revolutTag: dbEvent.revolut_tag,
          isJoined: true,
          isHost: isHost
        } as Game;
      });

      const upcoming = mappedMyGames.filter((g: Game) => new Date(g.rawDate).getTime() + (2 * 60 * 60 * 1000) > now);
      upcoming.sort((a: Game, b: Game) => new Date(a.rawDate).getTime() - new Date(b.rawDate).getTime());

      if (upcoming.length > 0) {
        setNextGame(upcoming[0]); // Set the closest game as "Next Up"
      } else {
        setNextGame(null);
      }

      // 2. Fetch All Events (To show "Featured / Open")
      const allEventsData = await api.getEvents();
      const mappedAllGames = allEventsData.map((dbEvent: any) => {
        const dateObj = new Date(dbEvent.start_time);
        const endDate = new Date(dbEvent.end_time || dbEvent.start_time);
        const attendees = dbEvent.attendees || [];
        const confirmed = attendees.filter((a: any) => a.status === 'confirmed');
        const isJoined = attendees.some((a: any) => a.user_id === user?.id && a.status === 'confirmed');
        const isHost = dbEvent.host_id === user?.id;

        return {
          id: dbEvent.id,
          type: dbEvent.location_name.toLowerCase().includes('sand') ? 'Outdoor' : 'Indoor',
          level: dbEvent.level_required,
          title: dbEvent.title,
          description: dbEvent.description,
          rawDate: dbEvent.start_time,
          date: dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
          time: `${dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })} - ${endDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}`,
          currentPlayers: confirmed.length,
          maxPlayers: dbEvent.max_players,
          hostName: isHost ? "You" : "Organizer",
          hostRole: "Organizer",
          price: dbEvent.price === 0 ? "Free" : `${dbEvent.price} HUF`,
          location: dbEvent.location_name,
          revolutTag: dbEvent.revolut_tag,
          isJoined: !!isJoined,
          isHost: isHost
        } as Game;
      });

      // Show top 3 open events that the user hasn't joined yet
      const openFeatured = mappedAllGames
        .filter((g: Game) => new Date(g.rawDate).getTime() > now && !g.isJoined)
        .sort((a: Game, b: Game) => new Date(a.rawDate).getTime() - new Date(b.rawDate).getTime())
        .slice(0, 3);

      setFeaturedGames(openFeatured);

    } catch (error) {
      console.error("Failed to load dashboard:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [user]);

  const handleMapClick = (location: string) => {
    window.open(`https://maps.google.com/?q=$${encodeURIComponent(location)}`, '_blank');
  };

  const handlePayClick = (tag: string) => {
    const cleanTag = tag.replace('@', '');
    window.open(`https://revolut.me/${cleanTag}`, '_blank');
  };

  const handleRsvp = async (gameId: string) => {
    try {
      await api.joinEvent(gameId);
      if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
      }
      loadDashboard();
      setSelectedGame(null);
    } catch (error) {
      console.error("RSVP failed:", error);
      alert("Could not RSVP to this match.");
    }
  };

  const handleCancelRsvp = async (gameId: string) => {
    try {
      setIsCancelling(true);
      await api.leaveEvent(gameId);
      if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
      }
      loadDashboard();
      setSelectedGame(null);
    } catch (error) {
      console.error("Cancel failed:", error);
      alert("Could not cancel RSVP.");
    } finally {
      setIsCancelling(false);
    }
  };

  const isCancellable = (rawDate: string) => {
    return (new Date(rawDate).getTime() - Date.now()) > (2 * 60 * 60 * 1000);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-400">
        <Loader2 className="animate-spin mb-4 text-blue-500" size={32} />
        <p className="text-sm font-medium">Loading Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="py-2 space-y-6 animate-in fade-in duration-500">

      {/* 1. Quick Stats Header */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mb-3">
            <ShieldCheck className="text-blue-600" size={20} />
          </div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Skill Level</p>
          <p className="text-base font-bold text-gray-900 mt-0.5">{user?.verified_level || 'Pending'}</p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
          <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center mb-3">
            <Star className="text-amber-500" size={20} />
          </div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Reliability</p>
          <div className="flex items-end justify-center gap-1 mt-0.5">
            <span className="text-base font-bold text-gray-900">{user?.reliability_score ? user.reliability_score.toFixed(1) : '5.0'}</span>
            <span className="text-xs font-bold text-gray-400 mb-[2px]">/5.0</span>
          </div>
        </div>
      </div>

      {/* 2. Next Up Widget */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
            <Play size={12} className="text-blue-500" /> Next Up
          </h2>
          {nextGame && (
            <Link href="/my-games" className="text-[11px] font-bold text-blue-600">See All</Link>
          )}
        </div>

        {nextGame ? (
          <div
            onClick={() => setSelectedGame(nextGame)}
            className="bg-zinc-900 rounded-[32px] p-1 relative overflow-hidden shadow-lg shadow-zinc-200 active:scale-[0.99] transition-all cursor-pointer"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
            <div className="bg-zinc-800/50 rounded-[28px] p-5 backdrop-blur-xl border border-white/5">
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-wider">
                  Upcoming Match
                </span>
                {nextGame.isHost && (
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-wider">
                    You're Hosting
                  </span>
                )}
              </div>
              <h3 className="text-white font-black text-xl mb-3 pr-8 leading-tight">{nextGame.title}</h3>
              <div className="flex items-center gap-4 text-sm text-gray-300 font-medium">
                <div className="flex items-center gap-1.5"><Calendar size={14} className="text-blue-400" />{nextGame.date}</div>
                <div className="flex items-center gap-1.5"><Clock size={14} className="text-blue-400" />{nextGame.time.split(' - ')[0]}</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-[32px] p-8 border border-dashed border-gray-200 text-center">
            <p className="text-sm font-bold text-gray-800">No upcoming matches</p>
            <p className="text-xs text-gray-400 mt-1">Join a game below to fill your schedule.</p>
          </div>
        )}
      </div>

      {/* 3. Featured Open Games */}
      {featuredGames.length > 0 && (
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Open Matches</h2>
            <Link href="/browse" className="text-[11px] font-bold text-blue-600 flex items-center">
              Browse All <ChevronRight size={14} />
            </Link>
          </div>

          <div className="space-y-4">
            {featuredGames.map(game => (
              <GameCard
                key={game.id}
                game={game}
                onClick={() => setSelectedGame(game)}
                onMapClick={handleMapClick}
                onPayClick={handlePayClick}
                onRsvpClick={() => handleRsvp(game.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* REUSABLE EVENT POPUP */}
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
                <div className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 uppercase tracking-tight"><Banknote size={12} /> Court Fee</div>
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
              <div className="bg-zinc-50 rounded-2xl p-4 text-sm text-gray-700 leading-relaxed font-medium whitespace-pre-wrap">
                {selectedGame.description || "No description provided."}
              </div>
            </div>

            {/* Maps Location */}
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
            {selectedGame.revolutTag && parseInt(selectedGame.price) !== 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-[11px] font-black text-gray-400 uppercase tracking-widest px-1"><ExternalLink size={14} /> Payment Link</div>
                <a href={`https://revolut.me/${selectedGame.revolutTag.replace('@', '')}`} target="_blank" className="flex items-center justify-between w-full bg-blue-600 text-white p-4 rounded-2xl active:scale-95 transition-all">
                  <span className="font-bold text-sm">Pay via Revolut</span>
                  <span className="text-xs opacity-80 font-medium">@{selectedGame.revolutTag.replace('@', '')}</span>
                </a>
              </div>
            )}

            {/* RSVP / Action Buttons */}
            <div className="pt-4 border-t border-gray-100 text-center">
              {selectedGame.isHost ? (
                <div className="w-full py-4 rounded-2xl font-black text-base shadow-none bg-zinc-100 text-gray-400 cursor-not-allowed">
                  You're the Host
                </div>
              ) : selectedGame.isJoined ? (
                isCancellable(selectedGame.rawDate) ? (
                  <button
                    onClick={() => handleCancelRsvp(selectedGame.id)}
                    disabled={isCancelling}
                    className="w-full py-4 rounded-2xl font-black text-base shadow-xl active:scale-95 transition-all bg-rose-50 text-rose-600 shadow-rose-100 flex justify-center gap-2 items-center disabled:opacity-50"
                  >
                    {isCancelling ? <Loader2 className="animate-spin" size={20} /> : "Cancel Registration"}
                  </button>
                ) : (
                  <div className="space-y-2 text-center">
                    <div className="w-full flex items-center justify-center gap-2 text-gray-400 font-bold text-sm py-4 bg-gray-100 rounded-2xl cursor-not-allowed opacity-60">
                      <XCircle size={18} /> Cancellation Locked
                    </div>
                    <p className="text-[10px] text-gray-400 font-medium px-4 leading-relaxed">
                      Cancellation is locked 2h before the match starts to prevent empty slots.
                    </p>
                  </div>
                )
              ) : (
                <button
                  onClick={() => handleRsvp(selectedGame.id)}
                  disabled={selectedGame.currentPlayers >= selectedGame.maxPlayers}
                  className={`w-full py-4 rounded-2xl font-black text-base shadow-xl active:scale-95 transition-all ${selectedGame.currentPlayers >= selectedGame.maxPlayers
                      ? 'bg-zinc-100 text-gray-400 cursor-not-allowed shadow-none'
                      : 'bg-blue-600 text-white shadow-blue-100'
                    }`}
                >
                  {selectedGame.currentPlayers >= selectedGame.maxPlayers ? 'Waitlist Full' : 'RSVP Now'}
                </button>
              )}
            </div>
          </div>
        )}
      </BottomSheet>
    </div>
  );
}